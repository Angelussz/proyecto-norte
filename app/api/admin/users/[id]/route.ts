import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSessionUser } from "@/lib/admin-session-auth";
import { handleAdminError } from "@/lib/admin-api";
import {
  getAdminUserDetail,
  updateAdminUserRole,
  deleteAdminUser,
} from "@/services/user-admin.service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const updateRoleSchema = z
  .object({
    role: z.enum(["ADMIN", "CUSTOMER"]),
  })
  .strict();

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    await requireAdminSessionUser(req);

    const { id } = await params;
    const user = await getAdminUserDetail(id);

    return NextResponse.json(user, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return handleAdminError(error, "GET /api/admin/users/[id]");
  }
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const admin = await requireAdminSessionUser(req);
    const { id } = await params;

    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          error: "VALIDATION",
          message: "El cuerpo de la solicitud debe ser JSON válido.",
        },
        { status: 400 },
      );
    }

    const validation = updateRoleSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "VALIDATION",
          message: "El rol enviado no es válido.",
        },
        { status: 400 },
      );
    }

    const updatedUser = await updateAdminUserRole(id, validation.data, admin.id);

    return NextResponse.json(updatedUser, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return handleAdminError(error, "PATCH /api/admin/users/[id]");
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const admin = await requireAdminSessionUser(req);
    const { id } = await params;

    const deletedUser = await deleteAdminUser(id, admin.id);

    return NextResponse.json(deletedUser, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return handleAdminError(error, "DELETE /api/admin/users/[id]");
  }
}
