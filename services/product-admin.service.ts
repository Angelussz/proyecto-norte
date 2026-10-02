import { prisma } from "@/lib/prisma"
import { deleteImage, MediaError, replaceImage, uploadImage } from "@/services/media.service"
import type { Prisma } from "@/generated/prisma/client"
import type { ProductImageResponse, StoredImage } from "@/interfaces/media.interface"

export type ProductAdminErrorCode =
  | 'VALIDATION'
  | 'CATEGORY_NOT_FOUND'
  | 'NOT_FOUND'
  | 'SLUG_NOT_UNIQUE'
  | 'IN_USE'
  | 'MISSING_FILE'
  | 'INVALID_FORMAT'
  | 'FILE_TOO_LARGE'
  | 'NOT_CONFIGURED'
  | 'UPLOAD_FAILED'
  | 'DELETE_FAILED'

export class ProductAdminError extends Error {
  constructor(
    public readonly code: ProductAdminErrorCode,
    message: string,
  ) {
    super(message)
    this.name = 'ProductAdminError'
  }
}

/** Código HTTP por error de dominio. */
export const PRODUCT_ADMIN_STATUS: Record<ProductAdminErrorCode, number> = {
  VALIDATION: 400,
  CATEGORY_NOT_FOUND: 400,
  NOT_FOUND: 404,
  SLUG_NOT_UNIQUE: 409,
  IN_USE: 409,
  MISSING_FILE: 400,
  INVALID_FORMAT: 415,
  FILE_TOO_LARGE: 413,
  NOT_CONFIGURED: 500,
  UPLOAD_FAILED: 502,
  DELETE_FAILED: 502,
}

function field(form: FormData, key: string): string | null {
  const value = form.get(key)
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null
}

function fileField(form: FormData, key: string): File | null {
  const value = form.get(key)
  return value instanceof File ? value : null
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function parsePrice(raw: string): number {
  const price = Number(raw)
  if (!Number.isFinite(price) || price <= 0 || price >= 100_000_000) {
    throw new ProductAdminError('VALIDATION', 'base_price debe ser un número > 0')
  }
  return Math.round(price * 100) / 100
}

function parseActive(raw: string | null): boolean {
  if (raw === null) return true
  if (raw === 'true') return true
  if (raw === 'false') return false
  throw new ProductAdminError('VALIDATION', 'active debe ser "true" o "false"')
}

function prismaErrorCode(error: unknown): string | null {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const candidate = error as { code?: unknown; name?: unknown }
    if (typeof candidate.code === 'string' && String(candidate.name).startsWith('PrismaClient')) {
      return candidate.code
    }
  }
  return null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toDto(product: any) {
  return {
    id: product.id,
    category_id: product.category_id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    material: product.material,
    base_price: Number(product.base_price),
    active: product.active,
    image_url: product.image_url,
    image_url_id: product.image_url_id,
    created_at: product.created_at instanceof Date ? product.created_at.toISOString() : product.created_at,
  }
}

function mediaProductError(
  error: unknown,
  fallbackCode: 'UPLOAD_FAILED' | 'DELETE_FAILED',
): ProductAdminError {
  if (error instanceof MediaError) {
    return new ProductAdminError(error.code, error.message)
  }
  return new ProductAdminError(
    fallbackCode,
    error instanceof Error ? error.message : String(error),
  )
}

async function storeImage(file: File, currentPublicId: string | null = null): Promise<StoredImage> {
  try {
    return currentPublicId !== null
      ? await replaceImage(file, currentPublicId)
      : await uploadImage(file)
  } catch (error) {
    throw mediaProductError(error, 'UPLOAD_FAILED')
  }
}

async function imageFromForm(
  form: FormData,
  currentPublicId: string | null = null,
): Promise<StoredImage | null> {
  const file = fileField(form, 'image')
  return file ? storeImage(file, currentPublicId) : null
}

async function purgeImage(publicId: string, context: string): Promise<void> {
  try {
    await deleteImage(publicId)
  } catch (cause) {
    console.warn(`[product-admin] ${context} ${publicId}:`, cause)
  }
}

function imageDto(product: {
  image_url: string | null
  image_url_id: string | null
}): ProductImageResponse {
  return {
    image_url: product.image_url,
    image_url_id: product.image_url_id,
  }
}

async function findProductImage(id: string) {
  return prisma.products.findUnique({
    where: { id },
    select: { id: true, image_url: true, image_url_id: true },
  })
}

async function assertCategory(categoryId: string) {
  const category = await prisma.categories.findUnique({ where: { id: categoryId }, select: { id: true } })
  if (!category) throw new ProductAdminError('CATEGORY_NOT_FOUND', `No existe la categoría ${categoryId}`)
}

/** Crea un producto. Campos de FormData: name*, category_id*, material*, base_price*, slug?, description?, active?, image? (File) */
export async function createProduct(form: FormData) {
  const name = field(form, 'name')
  const categoryId = field(form, 'category_id')
  const material = field(form, 'material')
  const rawPrice = field(form, 'base_price')
  if (!name) throw new ProductAdminError('VALIDATION', 'name es obligatorio')
  if (!categoryId) throw new ProductAdminError('VALIDATION', 'category_id es obligatorio')
  if (!material) throw new ProductAdminError('VALIDATION', 'material es obligatorio')
  if (!rawPrice) throw new ProductAdminError('VALIDATION', 'base_price es obligatorio')

  const basePrice = parsePrice(rawPrice)
  const active = parseActive(field(form, 'active'))
  await assertCategory(categoryId)
  const image = await imageFromForm(form)
  const data: Prisma.ProductsCreateInput = {
    name,
    slug: field(form, 'slug') ?? slugify(name),
    description: field(form, 'description'),
    material,
    base_price: basePrice,
    active,
    image_url: image?.secureUrl ?? null,
    image_url_id: image?.publicId ?? null,
    category: { connect: { id: categoryId } },
  }

  try {
    const product = await prisma.products.create({ data })
    return toDto(product)
  } catch (error) {
    if (image) await purgeImage(image.publicId, 'No se pudo persistir la imagen nueva; se purga')
    if (prismaErrorCode(error) === 'P2002') {
      throw new ProductAdminError('SLUG_NOT_UNIQUE', `El slug "${data.slug}" ya está en uso`)
    }
    throw error
  }
}

/**
 * Crea o actualiza según el `id` opcional del FormData.
 * Un id existente entra por el mismo flujo de reemplazo de `updateProduct`.
 */
export async function upsertProduct(form: FormData) {
  const id = field(form, 'id')
  if (id && await findProductImage(id)) {
    return { product: await updateProduct(id, form), created: false }
  }

  return { product: await createProduct(form), created: true }
}

/**
 * Reemplaza campos de un producto. Si `image` viene en el FormData, reemplaza
 * el recurso existente usando su mismo public_id.
 */
export async function updateProduct(id: string, form: FormData) {
  const existing = await findProductImage(id)
  if (!existing) throw new ProductAdminError('NOT_FOUND', `No existe el producto ${id}`)

  const data: Prisma.ProductsUpdateInput = {}
  const name = field(form, 'name')
  const material = field(form, 'material')
  const rawPrice = field(form, 'base_price')
  const slug = field(form, 'slug')
  const categoryId = field(form, 'category_id')
  const description = field(form, 'description')
  const active = field(form, 'active')

  if (name !== null) data.name = name
  if (material !== null) data.material = material
  if (rawPrice !== null) data.base_price = parsePrice(rawPrice)
  if (slug !== null) data.slug = slug
  if (description !== null) data.description = description
  if (active !== null) data.active = parseActive(active)
  if (categoryId !== null) {
    await assertCategory(categoryId)
    data.category = { connect: { id: categoryId } }
  }

  const image = await imageFromForm(form, existing.image_url_id)
  if (image) {
    data.image_url = image.secureUrl
    data.image_url_id = image.publicId
  }

  try {
    const product = await prisma.products.update({ where: { id }, data })
    return toDto(product)
  } catch (error) {
    if (image && !existing.image_url_id) {
      await purgeImage(image.publicId, 'No se pudo persistir la imagen nueva; se purga')
    }
    const code = prismaErrorCode(error)
    if (code === 'P2025') throw new ProductAdminError('NOT_FOUND', `No existe el producto ${id}`)
    if (code === 'P2002') throw new ProductAdminError('SLUG_NOT_UNIQUE', 'Ese slug ya está en uso')
    if (code === 'P2003') throw new ProductAdminError('CATEGORY_NOT_FOUND', 'La categoría referenciada no existe')
    throw error
  }
}

/** Reemplaza o agrega la imagen principal de un producto. */
export async function replaceProductImage(id: string, file: File): Promise<ProductImageResponse> {
  const form = new FormData()
  form.set('image', file)
  return imageDto(await updateProduct(id, form))
}

/** Elimina la imagen principal del producto y limpia sus columnas. */
export async function deleteProductImage(id: string): Promise<ProductImageResponse> {
  const existing = await findProductImage(id)
  if (!existing) throw new ProductAdminError('NOT_FOUND', `No existe el producto ${id}`)

  if (existing.image_url_id) {
    try {
      await deleteImage(existing.image_url_id)
    } catch (error) {
      throw mediaProductError(error, 'DELETE_FAILED')
    }
  }

  try {
    const product = await prisma.products.update({
      where: { id },
      data: { image_url: null, image_url_id: null },
    })
    return imageDto(product)
  } catch (error) {
    if (prismaErrorCode(error) === 'P2025') {
      throw new ProductAdminError('NOT_FOUND', `No existe el producto ${id}`)
    }
    throw error
  }
}

/** Elimina el producto (cascada en variantes) y purga su imagen de Cloudinary. */
export async function deleteProduct(id: string) {
  const existing = await prisma.products.findUnique({
    where: { id },
    select: { image_url_id: true },
  })
  if (!existing) throw new ProductAdminError('NOT_FOUND', `No existe el producto ${id}`)

  try {
    await prisma.products.delete({ where: { id } })
  } catch (error) {
    const code = prismaErrorCode(error)
    if (code === 'P2003') {
      throw new ProductAdminError('IN_USE', 'El producto tiene variantes con ventas asociadas; usá active=false')
    }
    if (code === 'P2025') throw new ProductAdminError('NOT_FOUND', `No existe el producto ${id}`)
    throw error
  }

  if (existing.image_url_id) {
    // La fila ya no existe: un fallo aquí deja un huérfano inofensivo en Cloudinary.
    await purgeImage(existing.image_url_id, 'No se pudo purgar la imagen huérfana')
  }
  return { deleted: true }
}
