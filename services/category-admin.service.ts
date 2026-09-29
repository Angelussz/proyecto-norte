import { prisma } from "@/lib/prisma"
import { deleteImage, MediaError, replaceImage, uploadImage } from "@/services/media.service"
import type { Prisma } from "@/generated/prisma/client"
import type { CategoryImageResponse, StoredImage } from "@/interfaces/media.interface"

export type CategoryAdminErrorCode =
  | 'VALIDATION'
  | 'PARENT_NOT_FOUND'
  | 'NOT_FOUND'
  | 'SLUG_NOT_UNIQUE'
  | 'IN_USE'
  | 'MISSING_FILE'
  | 'INVALID_FORMAT'
  | 'FILE_TOO_LARGE'
  | 'NOT_CONFIGURED'
  | 'UPLOAD_FAILED'
  | 'DELETE_FAILED'

export class CategoryAdminError extends Error {
  constructor(
    public readonly code: CategoryAdminErrorCode,
    message: string,
  ) {
    super(message)
    this.name = 'CategoryAdminError'
  }
}

/** Código HTTP por error de dominio. */
export const CATEGORY_ADMIN_STATUS: Record<CategoryAdminErrorCode, number> = {
  VALIDATION: 400,
  PARENT_NOT_FOUND: 400,
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
function toDto(category: any) {
  return {
    id: category.id,
    parent_category_id: category.parent_category_id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    image_url: category.image_url,
    image_url_id: category.image_url_id,
  }
}

function mediaCategoryError(
  error: unknown,
  fallbackCode: 'UPLOAD_FAILED' | 'DELETE_FAILED',
): CategoryAdminError {
  if (error instanceof MediaError) {
    return new CategoryAdminError(error.code, error.message)
  }
  return new CategoryAdminError(
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
    throw mediaCategoryError(error, 'UPLOAD_FAILED')
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
    console.warn(`[category-admin] ${context} ${publicId}:`, cause)
  }
}

function imageDto(category: {
  image_url: string | null
  image_url_id: string | null
}): CategoryImageResponse {
  return {
    image_url: category.image_url,
    image_url_id: category.image_url_id,
  }
}

async function findCategoryImage(id: string) {
  return prisma.categories.findUnique({
    where: { id },
    select: { id: true, image_url: true, image_url_id: true },
  })
}

async function assertParent(parentId: string) {
  const parent = await prisma.categories.findUnique({ where: { id: parentId }, select: { id: true } })
  if (!parent) throw new CategoryAdminError('PARENT_NOT_FOUND', `No existe la categoría padre ${parentId}`)
}

/** Crea una categoría. Campos de FormData: name*, parent_category_id?, slug?, description?, image? (File) */
export async function createCategory(form: FormData) {
  const name = field(form, 'name')
  if (!name) throw new CategoryAdminError('VALIDATION', 'name es obligatorio')

  const parentId = field(form, 'parent_category_id')
  if (parentId) await assertParent(parentId)
  const image = await imageFromForm(form)
  const data: Prisma.CategoriesCreateInput = {
    name,
    slug: field(form, 'slug') ?? slugify(name),
    description: field(form, 'description'),
    image_url: image?.secureUrl ?? null,
    image_url_id: image?.publicId ?? null,
    ...(parentId && { parent: { connect: { id: parentId } } }),
  }

  try {
    const category = await prisma.categories.create({ data })
    return toDto(category)
  } catch (error) {
    if (image) await purgeImage(image.publicId, 'No se pudo persistir la imagen nueva; se purga')
    if (prismaErrorCode(error) === 'P2002') {
      throw new CategoryAdminError('SLUG_NOT_UNIQUE', `El slug "${data.slug}" ya está en uso`)
    }
    throw error
  }
}
/**
 * Reemplaza campos de una categoría. Si `image` viene en el FormData, reemplaza
 * el recurso existente usando su mismo public_id.
 */
export async function updateCategory(id: string, form: FormData) {
  const existing = await findCategoryImage(id)
  if (!existing) throw new CategoryAdminError('NOT_FOUND', `No existe la categoría ${id}`)

  const data: Prisma.CategoriesUpdateInput = {}
  const name = field(form, 'name')
  const slug = field(form, 'slug')
  const parentId = field(form, 'parent_category_id')
  const description = field(form, 'description')

  if (name !== null) data.name = name
  if (slug !== null) data.slug = slug
  if (description !== null) data.description = description
  if (parentId !== null) {
    await assertParent(parentId)
    data.parent = { connect: { id: parentId } }
  }

  const image = await imageFromForm(form, existing.image_url_id)
  if (image) {
    data.image_url = image.secureUrl
    data.image_url_id = image.publicId
  }

  try {
    const category = await prisma.categories.update({ where: { id }, data })
    return toDto(category)
  } catch (error) {
    if (image && !existing.image_url_id) {
      await purgeImage(image.publicId, 'No se pudo persistir la imagen nueva; se purga')
    }
    const code = prismaErrorCode(error)
    if (code === 'P2025') throw new CategoryAdminError('NOT_FOUND', `No existe la categoría ${id}`)
    if (code === 'P2002') throw new CategoryAdminError('SLUG_NOT_UNIQUE', 'Ese slug ya está en uso')
    if (code === 'P2003') throw new CategoryAdminError('PARENT_NOT_FOUND', 'La categoría padre referenciada no existe')
    throw error
  }
}

/** Reemplaza o agrega la imagen principal de una categoría. */
export async function replaceCategoryImage(id: string, file: File): Promise<CategoryImageResponse> {
  const form = new FormData()
  form.set('image', file)
  return imageDto(await updateCategory(id, form))
}

/** Elimina la imagen principal de la categoría y limpia sus columnas. */
export async function deleteCategoryImage(id: string): Promise<CategoryImageResponse> {
  const existing = await findCategoryImage(id)
  if (!existing) throw new CategoryAdminError('NOT_FOUND', `No existe la categoría ${id}`)

  if (existing.image_url_id) {
    try {
      await deleteImage(existing.image_url_id)
    } catch (error) {
      throw mediaCategoryError(error, 'DELETE_FAILED')
    }
  }

  try {
    const category = await prisma.categories.update({
      where: { id },
      data: { image_url: null, image_url_id: null },
    })
    return imageDto(category)
  } catch (error) {
    if (prismaErrorCode(error) === 'P2025') {
      throw new CategoryAdminError('NOT_FOUND', `No existe la categoría ${id}`)
    }
    throw error
  }
}

/** Elimina la categoría (hijas quedan huérfanas) y purga su imagen de Cloudinary. */
export async function deleteCategory(id: string) {
  const existing = await prisma.categories.findUnique({
    where: { id },
    select: { image_url_id: true },
  })
  if (!existing) throw new CategoryAdminError('NOT_FOUND', `No existe la categoría ${id}`)

  try {
    await prisma.categories.delete({ where: { id } })
  } catch (error) {
    const code = prismaErrorCode(error)
    if (code === 'P2003') {
      throw new CategoryAdminError('IN_USE', 'La categoría tiene productos asociados')
    }
    if (code === 'P2025') throw new CategoryAdminError('NOT_FOUND', `No existe la categoría ${id}`)
    throw error
  }

  if (existing.image_url_id) {
    // La fila ya no existe: un fallo aquí deja un huérfano inofensivo en Cloudinary.
    await purgeImage(existing.image_url_id, 'No se pudo purgar la imagen huérfana')
  }
  return { deleted: true }
}
