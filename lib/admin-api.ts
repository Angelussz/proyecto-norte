import { NextResponse } from "next/server"
import { AdminAuthError } from "@/lib/admin-auth"
import {
  PRODUCT_ADMIN_STATUS,
  ProductAdminError,
} from "@/services/product-admin.service"

export function handleAdminError(error: unknown, scope: string) {
  if (error instanceof AdminAuthError) {
    console.warn(scope, error.message)
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 })
  }
  if (error instanceof ProductAdminError) {
    return NextResponse.json(
      { error: error.code, message: error.message },
      { status: PRODUCT_ADMIN_STATUS[error.code] },
    )
  }
  console.error(scope, error)
  return NextResponse.json({ error: "INTERNAL" }, { status: 500 })
}
