import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSessionUser } from "@/lib/admin-session-auth";
import { handleAdminError } from "@/lib/admin-api";
import { suspendAdminUser, reactivateAdminUser } from "@/services/user-admin.service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const suspendUserSchema = z
  .object({
    reason: z.string().trim().min(3).max(2000),
    duration_days: z.union([z.literal(1), z.literal(7), z.literal(15), z.literal(30)]).optional(),
    suspended_until: z.string().datetime().optional(),
  })
  .strict()
  .refine((data) => (data.duration_days !== undefined) !== (data.suspended_until !== undefined), {
    message: "Indicá una duración o una fecha personalizada, pero no ambas.",
  });

export async function POST(req: NextRequest, { params }: RouteContext) {
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

    const validation = suspendUserSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "VALIDATION",
          message: "Los datos de suspensión no son válidos.",
          details: validation.error.flatten(),
        },
        { status: 400 },
      );
    }

    const suspendedUser = await suspendAdminUser(id, validation.data, admin.id);

    return NextResponse.json(suspendedUser, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return handleAdminError(error, "POST /api/admin/users/[id]/suspension");
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const admin = await requireAdminSessionUser(req);
    const { id } = await params;

    const reactivatedUser = await reactivateAdminUser(id, admin.id);

    return NextResponse.json(reactivatedUser, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return handleAdminError(error, "DELETE /api/admin/users/[id]/suspension");
  }
}
