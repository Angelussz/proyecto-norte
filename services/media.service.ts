import { v2 as cloudinary } from 'cloudinary'
import type { UploadApiOptions } from 'cloudinary'
import { env } from '@/lib/env'
import type { MediaErrorCode, StoredImage } from '@/interfaces/media.interface'

export class MediaError extends Error {
  constructor(
    public readonly code: MediaErrorCode,
    message: string,
  ) {
    super(message)
    this.name = 'MediaError'
  }
}

const UPLOAD_FOLDER = 'proyecto-norte/products'
const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp'])

let configured = false

function client(): typeof cloudinary {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = env
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new MediaError('NOT_CONFIGURED', 'Faltan credenciales de Cloudinary en .env')
  }
  if (!configured) {
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
      secure: true,
    })
    configured = true
  }
  return cloudinary
}

// Verifica los magic bytes reales del archivo; el `file.type` del navegador
// se puede falsificar, el contenido no.
function detectMime(buf: Buffer): string | null {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg'
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png'
  if (buf.length > 12 && buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP') return 'image/webp'
  return null
}

async function validate(file: File): Promise<Buffer> {
  if (file.size === 0) throw new MediaError('MISSING_FILE', 'El archivo está vacío')
  if (file.size > MAX_BYTES) throw new MediaError('FILE_TOO_LARGE', 'La imagen supera el máximo de 5 MB')
  const buf = Buffer.from(await file.arrayBuffer())
  const detected = detectMime(buf)
  if (!detected || !ALLOWED_MIME.has(detected)) {
    throw new MediaError('INVALID_FORMAT', 'Formato no soportado: solo JPG, PNG o WEBP')
  }
  return buf
}

function uploadBuffer(buf: Buffer, publicId?: string): Promise<StoredImage> {
  const replacing = publicId !== undefined
  if (replacing && !publicId.trim()) {
    throw new MediaError('UPLOAD_FAILED', 'El public_id de reemplazo es obligatorio')
  }

  const options: UploadApiOptions = {
    resource_type: 'image',
    timeout: 60_000,
  }

  if (replacing) {
    // `public_id` ya contiene la ruta completa; no volver a anteponer folder.
    options.public_id = publicId
    options.overwrite = true
    options.invalidate = true
  } else {
    options.folder = UPLOAD_FOLDER
  }

  return new Promise<StoredImage>((resolve, reject) => {
    const stream = client().uploader.upload_stream(options, (error, result) => {
      if (error || !result) {
        reject(new MediaError('UPLOAD_FAILED', error?.message ?? 'Cloudinary no devolvió resultado'))
        return
      }
      resolve({ secureUrl: result.secure_url, publicId: result.public_id })
    })

    stream.once('error', (cause) => {
      reject(new MediaError('UPLOAD_FAILED', cause instanceof Error ? cause.message : String(cause)))
    })
    stream.end(buf)
  })
}

/** Sube una imagen nueva (public_id autogenerado bajo UPLOAD_FOLDER). */
export async function uploadImage(file: File): Promise<StoredImage> {
  return uploadBuffer(await validate(file))
}

/** Reemplaza la imagen sobreescribiendo el mismo public_id. */
export async function replaceImage(file: File, publicId: string): Promise<StoredImage> {
  return uploadBuffer(await validate(file), publicId)
}

/** Elimina un recurso por public_id. */
export async function deleteImage(publicId: string): Promise<void> {
  if (!publicId.trim()) {
    throw new MediaError('DELETE_FAILED', 'El public_id a eliminar es obligatorio')
  }

  try {
    const result = await client().uploader.destroy(publicId, {
      resource_type: 'image',
      type: 'upload',
      invalidate: true,
    })
    const resultValue = result as { result?: string }
    if (resultValue?.result !== 'ok' && resultValue?.result !== 'not found') {
      throw new MediaError('DELETE_FAILED', `No se pudo eliminar ${publicId}: ${resultValue?.result}`)
    }
  } catch (error) {
    if (error instanceof MediaError) throw error
    throw new MediaError(
      'DELETE_FAILED',
      error instanceof Error ? error.message : String(error),
    )
  }
}
