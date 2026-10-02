// Contrato backend puro para imágenes almacenadas en Cloudinary.
// No importar SDK ni lógica de aquí en clientes.

export interface StoredImage {
  secureUrl: string
  publicId: string
}

export type MediaErrorCode =
  | 'MISSING_FILE'
  | 'INVALID_FORMAT'
  | 'FILE_TOO_LARGE'
  | 'NOT_CONFIGURED'
  | 'UPLOAD_FAILED'
  | 'DELETE_FAILED'

export interface ProductImageResponse {
  image_url: string | null
  image_url_id: string | null
}
