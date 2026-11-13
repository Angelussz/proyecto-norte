import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin-auth";
import { handleAdminError } from "@/lib/admin-api";
import {
  getAdminSettings,
  updateAdminSettings,
  SettingsAdminError,
} from "@/services/settings-admin.service";

export async function GET(req: NextRequest) {
  try {
    await requireAdminUser(req);

    const response = await getAdminSettings();

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleAdminError(error, "[admin/settings][GET]");
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdminUser(req);

    let body: unknown;

    try {
      body = await req.json();
    } catch {
      throw new SettingsAdminError("VALIDATION", "Cuerpo JSON inválido.");
    }

    const response = await updateAdminSettings(body);

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleAdminError(error, "[admin/settings][PATCH]");
  }
}
