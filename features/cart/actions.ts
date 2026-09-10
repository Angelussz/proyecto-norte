'use server'

import { revalidatePath } from 'next/cache'

export async function actualizarCantidadCarrito(
  _itemId: string,
  _cantidad: number
) {
  // TODO: Integrar con base de datos / sesión
  revalidatePath('/cart')
}

export async function eliminarDelCarrito(_itemId: string) {
  // TODO: Integrar con base de datos / sesión
  revalidatePath('/cart')
}
