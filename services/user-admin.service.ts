import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import type {
  AdminUser,
  AdminUserFilters,
  AdminUserRole,
  AdminUserStatus,
  AdminUsersListResponse,
  SuspendAdminUserDto,
  UpdateAdminUserRoleDto,
} from "@/features/admin-users/types/admin-user.interface";

// ─── Errores de dominio ──────────────────────────────────────────────────────

export type UserAdminErrorCode = "VALIDATION" | "NOT_FOUND" | "CONFLICT" | "FORBIDDEN";

export class UserAdminError extends Error {
  constructor(
    public readonly code: UserAdminErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "UserAdminError";
  }
}

export const USER_ADMIN_STATUS: Record<UserAdminErrorCode, number> = {
  VALIDATION: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
  FORBIDDEN: 403,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getUserStatus(user: {
  suspended_until: Date | null;
  deleted_at: Date | null;
}): AdminUserStatus {
  if (user.deleted_at) return "DELETED";

  if (user.suspended_until && user.suspended_until > new Date()) {
    return "SUSPENDED";
  }

  return "ACTIVE";
}

function serializeAdminUser(user: {
  id: string;
  name: string;
  last_name: string;
  email: string;
  phone: string;
  role: AdminUserRole;
  email_verified: boolean;
  created_at: Date;
  suspended_until: Date | null;
  deleted_at: Date | null;
  _count: { orders: number };
}): AdminUser {
  return {
    id: user.id,
    name: user.name,
    last_name: user.last_name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    email_verified: user.email_verified,
    created_at: user.created_at.toISOString(),
    suspended_until: user.suspended_until?.toISOString() ?? null,
    deleted_at: user.deleted_at?.toISOString() ?? null,
    status: getUserStatus(user),
    orders_count: user._count.orders,
  };
}

// ─── Listado de usuarios ─────────────────────────────────────────────────────

export async function getAdminUsersList(
  filters: AdminUserFilters,
): Promise<AdminUsersListResponse> {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(50, Math.max(1, filters.limit ?? 10));
  const skip = (page - 1) * limit;
  const now = new Date();

  const where: Prisma.UsersWhereInput = {};

  if (filters.role && filters.role !== "ALL") {
    where.role = filters.role;
  }

  if (filters.status === "DELETED") {
    where.deleted_at = { not: null };
  } else if (filters.status === "SUSPENDED") {
    where.deleted_at = null;
    where.suspended_until = { gt: now };
  } else if (filters.status === "ACTIVE") {
    where.deleted_at = null;
    where.OR = [{ suspended_until: null }, { suspended_until: { lte: now } }];
  }

  const query = filters.search?.trim();

  if (query) {
    const searchConditions: Prisma.UsersWhereInput[] = [
      { name: { contains: query, mode: "insensitive" } },
      { last_name: { contains: query, mode: "insensitive" } },
      { email: { contains: query, mode: "insensitive" } },
      { phone: { contains: query, mode: "insensitive" } },
    ];

    where.AND = [...(where.AND ? [where.AND].flat() : []), { OR: searchConditions }];
  }

  const [users, total] = await Promise.all([
    prisma.users.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        name: true,
        last_name: true,
        email: true,
        phone: true,
        role: true,
        email_verified: true,
        created_at: true,
        suspended_until: true,
        deleted_at: true,
        _count: {
          select: { orders: true },
        },
      },
    }),
    prisma.users.count({ where }),
  ]);

  return {
    data: users.map(serializeAdminUser),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ─── Detalle e historial de usuario ──────────────────────────────────────────

export async function getAdminUserDetail(id: string): Promise<
  AdminUser & {
    suspensions: {
      id: string;
      reason: string;
      created_at: string;
      suspended_until: string;
      reactivated_at: string | null;
      user: {
        id: string;
        name: string;
        last_name: string;
        email: string;
      };
      admin: {
        id: string;
        name: string;
        last_name: string;
        email: string;
      };
      reactivated_by: {
        id: string;
        name: string;
        last_name: string;
        email: string;
      } | null;
    }[];
  }
> {
  if (!id.trim()) {
    throw new UserAdminError("VALIDATION", "El ID del usuario es obligatorio.");
  }

  const user = await prisma.users.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      last_name: true,
      email: true,
      phone: true,
      role: true,
      email_verified: true,
      created_at: true,
      suspended_until: true,
      deleted_at: true,
      _count: {
        select: { orders: true },
      },
      suspensionsReceived: {
        orderBy: { created_at: "desc" },
        select: {
          id: true,
          reason: true,
          created_at: true,
          suspended_until: true,
          reactivated_at: true,
          user: {
            select: {
              id: true,
              name: true,
              last_name: true,
              email: true,
            },
          },
          admin: {
            select: {
              id: true,
              name: true,
              last_name: true,
              email: true,
            },
          },
          reactivatedBy: {
            select: {
              id: true,
              name: true,
              last_name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new UserAdminError("NOT_FOUND", "No se encontró el usuario.");
  }

  return {
    ...serializeAdminUser(user),
    suspensions: user.suspensionsReceived.map((suspension) => ({
      id: suspension.id,
      reason: suspension.reason,
      created_at: suspension.created_at.toISOString(),
      suspended_until: suspension.suspended_until.toISOString(),
      reactivated_at: suspension.reactivated_at?.toISOString() ?? null,
      user: suspension.user,
      admin: suspension.admin,
      reactivated_by: suspension.reactivatedBy,
    })),
  };
}

// ─── Actualización de privilegios ────────────────────────────────────────────

export async function updateAdminUserRole(
  id: string,
  dto: UpdateAdminUserRoleDto,
  adminId: string,
): Promise<AdminUser> {
  if (!id.trim() || !adminId.trim()) {
    throw new UserAdminError(
      "VALIDATION",
      "El ID del usuario y del administrador son obligatorios.",
    );
  }

  if (dto.role !== "ADMIN" && dto.role !== "CUSTOMER") {
    throw new UserAdminError("VALIDATION", "El rol indicado no es válido.");
  }

  if (id === adminId && dto.role !== "ADMIN") {
    throw new UserAdminError(
      "FORBIDDEN",
      "No podés quitarte tus propios privilegios de administrador.",
    );
  }

  try {
    return await prisma.$transaction(
      async (tx) => {
        const now = new Date();

        const admin = await tx.users.findUnique({
          where: { id: adminId },
          select: {
            role: true,
            deleted_at: true,
            suspended_until: true,
          },
        });

        if (
          !admin ||
          admin.role !== "ADMIN" ||
          admin.deleted_at ||
          (admin.suspended_until && admin.suspended_until > now)
        ) {
          throw new UserAdminError("FORBIDDEN", "La sesión administrativa ya no está habilitada.");
        }

        const user = await tx.users.findUnique({
          where: { id },
          select: {
            id: true,
            role: true,
            deleted_at: true,
            suspended_until: true,
          },
        });

        if (!user || user.deleted_at) {
          throw new UserAdminError("NOT_FOUND", "El usuario no existe o fue eliminado.");
        }

        if (user.role === dto.role) {
          throw new UserAdminError("CONFLICT", "El usuario ya tiene ese rol.");
        }

        const isActiveAdmin =
          user.role === "ADMIN" && (!user.suspended_until || user.suspended_until <= now);

        if (isActiveAdmin && dto.role !== "ADMIN") {
          const activeAdmins = await tx.users.count({
            where: {
              role: "ADMIN",
              deleted_at: null,
              OR: [{ suspended_until: null }, { suspended_until: { lte: now } }],
            },
          });

          if (activeAdmins <= 1) {
            throw new UserAdminError(
              "FORBIDDEN",
              "No se puede quitar el rol al último administrador activo.",
            );
          }
        }

        const updated = await tx.users.update({
          where: { id },
          data: { role: dto.role },
          select: {
            id: true,
            name: true,
            last_name: true,
            email: true,
            phone: true,
            role: true,
            email_verified: true,
            created_at: true,
            suspended_until: true,
            deleted_at: true,
            _count: {
              select: { orders: true },
            },
          },
        });

        return serializeAdminUser(updated);
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  } catch (error) {
    if (error instanceof UserAdminError) {
      throw error;
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
      throw new UserAdminError(
        "CONFLICT",
        "La operación entró en conflicto con otro cambio. Intentá nuevamente.",
      );
    }

    throw error;
  }
}

// ─── Suspensión de usuarios ─────────────────────────────────────────────────

export async function suspendAdminUser(
  id: string,
  dto: SuspendAdminUserDto,
  adminId: string,
): Promise<AdminUser> {
  if (!id.trim() || !adminId.trim()) {
    throw new UserAdminError(
      "VALIDATION",
      "El ID del usuario y del administrador son obligatorios.",
    );
  }

  if (id === adminId) {
    throw new UserAdminError("FORBIDDEN", "No podés suspender tu propia cuenta.");
  }

  const reason = dto.reason?.trim();

  if (!reason || reason.length < 3 || reason.length > 2000) {
    throw new UserAdminError("VALIDATION", "El motivo debe tener entre 3 y 2000 caracteres.");
  }

  const hasDuration = dto.duration_days !== undefined;
  const hasCustomDate = dto.suspended_until !== undefined;

  if (hasDuration === hasCustomDate) {
    throw new UserAdminError(
      "VALIDATION",
      "Indicá una duración o una fecha personalizada, pero no ambas.",
    );
  }

  let suspendedUntil: Date;

  if (hasDuration) {
    const validDurations = [1, 7, 15, 30];

    if (!validDurations.includes(dto.duration_days!)) {
      throw new UserAdminError("VALIDATION", "La duración debe ser de 1, 7, 15 o 30 días.");
    }

    suspendedUntil = new Date();
    suspendedUntil.setDate(suspendedUntil.getDate() + dto.duration_days!);
  } else {
    suspendedUntil = new Date(dto.suspended_until!);

    if (Number.isNaN(suspendedUntil.getTime())) {
      throw new UserAdminError("VALIDATION", "La fecha de suspensión no es válida.");
    }
  }

  if (suspendedUntil <= new Date()) {
    throw new UserAdminError("VALIDATION", "La fecha de finalización debe ser futura.");
  }

  return prisma.$transaction(
    async (tx) => {
      const now = new Date();

      const admin = await tx.users.findUnique({
        where: { id: adminId },
        select: {
          role: true,
          deleted_at: true,
          suspended_until: true,
        },
      });

      if (
        !admin ||
        admin.role !== "ADMIN" ||
        admin.deleted_at ||
        (admin.suspended_until && admin.suspended_until > now)
      ) {
        throw new UserAdminError("FORBIDDEN", "La sesión administrativa ya no está habilitada.");
      }

      const user = await tx.users.findUnique({
        where: { id },
        select: {
          id: true,
          role: true,
          deleted_at: true,
          suspended_until: true,
        },
      });

      if (!user || user.deleted_at) {
        throw new UserAdminError("NOT_FOUND", "El usuario no existe o fue eliminado.");
      }

      if (user.suspended_until && user.suspended_until > now) {
        throw new UserAdminError("CONFLICT", "El usuario ya tiene una suspensión activa.");
      }

      const isActiveAdmin =
        user.role === "ADMIN" && (!user.suspended_until || user.suspended_until <= now);

      if (isActiveAdmin) {
        const activeAdmins = await tx.users.count({
          where: {
            role: "ADMIN",
            deleted_at: null,
            OR: [{ suspended_until: null }, { suspended_until: { lte: now } }],
          },
        });

        if (activeAdmins <= 1) {
          throw new UserAdminError(
            "FORBIDDEN",
            "No se puede suspender al último administrador activo.",
          );
        }
      }

      await tx.userSuspension.create({
        data: {
          user_id: id,
          admin_id: adminId,
          reason,
          suspended_until: suspendedUntil,
        },
      });

      const updated = await tx.users.update({
        where: { id },
        data: {
          suspended_until: suspendedUntil,
        },
        select: {
          id: true,
          name: true,
          last_name: true,
          email: true,
          phone: true,
          role: true,
          email_verified: true,
          created_at: true,
          suspended_until: true,
          deleted_at: true,
          _count: {
            select: { orders: true },
          },
        },
      });

      return serializeAdminUser(updated);
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );
}

// ─── Reactivación de usuarios ────────────────────────────────────────────────

export async function reactivateAdminUser(id: string, adminId: string): Promise<AdminUser> {
  if (!id.trim() || !adminId.trim()) {
    throw new UserAdminError(
      "VALIDATION",
      "El ID del usuario y del administrador son obligatorios.",
    );
  }

  return prisma.$transaction(
    async (tx) => {
      const now = new Date();

      const admin = await tx.users.findUnique({
        where: { id: adminId },
        select: {
          role: true,
          deleted_at: true,
          suspended_until: true,
        },
      });

      if (
        !admin ||
        admin.role !== "ADMIN" ||
        admin.deleted_at ||
        (admin.suspended_until && admin.suspended_until > now)
      ) {
        throw new UserAdminError("FORBIDDEN", "La sesión administrativa ya no está habilitada.");
      }

      const user = await tx.users.findUnique({
        where: { id },
        select: {
          id: true,
          deleted_at: true,
          suspended_until: true,
        },
      });

      if (!user || user.deleted_at) {
        throw new UserAdminError("NOT_FOUND", "El usuario no existe o fue eliminado.");
      }

      if (!user.suspended_until || user.suspended_until <= now) {
        throw new UserAdminError("CONFLICT", "El usuario no tiene una suspensión activa.");
      }

      const suspension = await tx.userSuspension.findFirst({
        where: {
          user_id: id,
          reactivated_at: null,
          suspended_until: { gt: now },
        },
        orderBy: { created_at: "desc" },
      });

      if (!suspension) {
        throw new UserAdminError("CONFLICT", "No se encontró el registro de la suspensión activa.");
      }

      await tx.userSuspension.update({
        where: { id: suspension.id },
        data: {
          reactivated_at: now,
          reactivated_by: adminId,
        },
      });

      const updated = await tx.users.update({
        where: { id },
        data: {
          suspended_until: null,
        },
        select: {
          id: true,
          name: true,
          last_name: true,
          email: true,
          phone: true,
          role: true,
          email_verified: true,
          created_at: true,
          suspended_until: true,
          deleted_at: true,
          _count: {
            select: { orders: true },
          },
        },
      });

      return serializeAdminUser(updated);
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );
}

// ─── Eliminación lógica de usuarios ─────────────────────────────────────────

export async function deleteAdminUser(id: string, adminId: string): Promise<AdminUser> {
  if (!id.trim() || !adminId.trim()) {
    throw new UserAdminError(
      "VALIDATION",
      "El ID del usuario y del administrador son obligatorios.",
    );
  }

  if (id === adminId) {
    throw new UserAdminError("FORBIDDEN", "No podés eliminar tu propia cuenta.");
  }

  return prisma.$transaction(
    async (tx) => {
      const now = new Date();

      const admin = await tx.users.findUnique({
        where: { id: adminId },
        select: {
          role: true,
          deleted_at: true,
          suspended_until: true,
        },
      });

      if (
        !admin ||
        admin.role !== "ADMIN" ||
        admin.deleted_at ||
        (admin.suspended_until && admin.suspended_until > now)
      ) {
        throw new UserAdminError("FORBIDDEN", "La sesión administrativa ya no está habilitada.");
      }

      const user = await tx.users.findUnique({
        where: { id },
        select: {
          id: true,
          role: true,
          deleted_at: true,
        },
      });

      if (!user || user.deleted_at) {
        throw new UserAdminError("NOT_FOUND", "El usuario no existe o ya fue eliminado.");
      }

      if (user.role === "ADMIN") {
        const activeAdmins = await tx.users.count({
          where: {
            role: "ADMIN",
            deleted_at: null,
            OR: [{ suspended_until: null }, { suspended_until: { lte: now } }],
          },
        });

        if (activeAdmins <= 1) {
          throw new UserAdminError(
            "FORBIDDEN",
            "No se puede eliminar al último administrador activo.",
          );
        }
      }

      const updated = await tx.users.update({
        where: { id },
        data: {
          deleted_at: now,
          suspended_until: null,
        },
        select: {
          id: true,
          name: true,
          last_name: true,
          email: true,
          phone: true,
          role: true,
          email_verified: true,
          created_at: true,
          suspended_until: true,
          deleted_at: true,
          _count: {
            select: { orders: true },
          },
        },
      });

      return serializeAdminUser(updated);
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );
}
