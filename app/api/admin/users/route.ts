import { NextRequest, NextResponse } from "next/server";
import { requireAdminSessionUser } from "@/lib/admin-session-auth";
import { handleAdminError } from "@/lib/admin-api";
import { getAdminUsersList } from "@/services/user-admin.service";
import type {
  AdminUserFilters,
  AdminUserRole,
  AdminUserStatus,
} from "@/features/admin-users/types/admin-user.interface";

const VALID_ROLES: AdminUserRole[] = ["ADMIN", "CUSTOMER"];
const VALID_STATUSES: AdminUserStatus[] = ["ACTIVE", "SUSPENDED", "DELETED"];

const MAX_SEARCH_LENGTH = 100;

export async function GET(req: NextRequest) {
  try {
    await requireAdminSessionUser(req);

    const params = req.nextUrl.searchParams;

    const pageParam = params.get("page");
    const limitParam = params.get("limit");
    const roleParam = params.get("role");
    const statusParam = params.get("status");
    const search = params.get("search")?.trim() ?? "";

    const page = pageParam === null ? 1 : Number(pageParam);
    const limit = limitParam === null ? 10 : Number(limitParam);

    if (
      !Number.isSafeInteger(page) ||
      page < 1 ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 50
    ) {
      return NextResponse.json(
        {
          error: "VALIDATION",
          message: "Los parámetros de paginación no son válidos.",
        },
        { status: 400 },
      );
    }

    if (roleParam && roleParam !== "ALL" && !VALID_ROLES.includes(roleParam as AdminUserRole)) {
      return NextResponse.json(
        {
          error: "VALIDATION",
          message: "El filtro de rol no es válido.",
        },
        { status: 400 },
      );
    }

    if (
      statusParam &&
      statusParam !== "ALL" &&
      !VALID_STATUSES.includes(statusParam as AdminUserStatus)
    ) {
      return NextResponse.json(
        {
          error: "VALIDATION",
          message: "El filtro de estado no es válido.",
        },
        { status: 400 },
      );
    }

    if (search.length > MAX_SEARCH_LENGTH) {
      return NextResponse.json(
        {
          error: "VALIDATION",
          message: "La búsqueda no puede superar los 100 caracteres.",
        },
        { status: 400 },
      );
    }

    const filters: AdminUserFilters = {
      page,
      limit,
      role: (roleParam as AdminUserRole | "ALL" | null) ?? "ALL",
      status: (statusParam as AdminUserStatus | "ALL" | null) ?? "ALL",
      search,
    };

    const result = await getAdminUsersList(filters);

    return NextResponse.json(result, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return handleAdminError(error, "GET /api/admin/users");
  }
}
