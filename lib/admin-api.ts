import { NextResponse } from "next/server";
import { AdminAuthError } from "@/lib/admin-auth";
import { PRODUCT_ADMIN_STATUS, ProductAdminError } from "@/services/product-admin.service";
import { ORDER_ADMIN_STATUS, OrderAdminError } from "@/services/order-admin.service";
import { PAYMENT_ADMIN_STATUS, PaymentAdminError } from "@/services/payment-admin.service";
import { SETTINGS_ADMIN_STATUS, SettingsAdminError } from "@/services/settings-admin.service";

export function handleAdminError(error: unknown, scope: string) {
  if (error instanceof AdminAuthError) {
    console.warn(scope, error.message);
    return NextResponse.json({ error: "UNAUTHORIZED", message: error.message }, { status: 401 });
  }

  if (error instanceof ProductAdminError) {
    return NextResponse.json(
      { error: error.code, message: error.message },
      { status: PRODUCT_ADMIN_STATUS[error.code] },
    );
  }

  if (error instanceof OrderAdminError) {
    return NextResponse.json(
      { error: error.code, message: error.message },
      { status: ORDER_ADMIN_STATUS[error.code] },
    );
  }

  if (error instanceof PaymentAdminError) {
    return NextResponse.json(
      { error: error.code, message: error.message },
      { status: PAYMENT_ADMIN_STATUS[error.code] },
    );
  }

  if (error instanceof SettingsAdminError) {
    return NextResponse.json(
      { error: error.code, message: error.message },
      { status: SETTINGS_ADMIN_STATUS[error.code] },
    );
  }

  console.error(scope, error);
  return NextResponse.json(
    { error: "INTERNAL", message: "Error interno del servidor" },
    { status: 500 },
  );
}
