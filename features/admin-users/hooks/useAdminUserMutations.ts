"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  updateAdminUser,
  suspendAdminUser,
  reactivateAdminUser,
  deleteAdminUser,
  AdminUsersApiError,
} from "@/features/admin-users/services/admin-users.service";

import { adminUsersKeys } from "@/features/admin-users/hooks/admin-users.keys";

import type {
  AdminUser,
  SuspendAdminUserDto,
  UpdateAdminUserRoleDto,
} from "@/features/admin-users/types/admin-user.interface";

interface UserMutationVariables {
  id: string;
}

interface UpdateRoleVariables extends UserMutationVariables {
  dto: UpdateAdminUserRoleDto;
}

interface SuspendUserVariables extends UserMutationVariables {
  dto: SuspendAdminUserDto;
}

export function useAdminUserMutations() {
  const queryClient = useQueryClient();

  const invalidateUserQueries = async (id: string) => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: adminUsersKeys.all,
      }),
      queryClient.invalidateQueries({
        queryKey: adminUsersKeys.detail(id),
      }),
    ]);
  };

  const updateRole = useMutation<AdminUser, AdminUsersApiError | Error, UpdateRoleVariables>({
    mutationFn: ({ id, dto }) => updateAdminUser(id, dto),
    onSettled: (_data, _error, variables) => invalidateUserQueries(variables.id),
  });

  const suspend = useMutation<AdminUser, AdminUsersApiError | Error, SuspendUserVariables>({
    mutationFn: ({ id, dto }) => suspendAdminUser(id, dto),
    onSettled: (_data, _error, variables) => invalidateUserQueries(variables.id),
  });

  const reactivate = useMutation<AdminUser, AdminUsersApiError | Error, UserMutationVariables>({
    mutationFn: ({ id }) => reactivateAdminUser(id),
    onSettled: (_data, _error, variables) => invalidateUserQueries(variables.id),
  });

  const remove = useMutation<AdminUser, AdminUsersApiError | Error, UserMutationVariables>({
    mutationFn: ({ id }) => deleteAdminUser(id),
    onSettled: (_data, _error, variables) => invalidateUserQueries(variables.id),
  });

  return {
    updateRole,
    suspend,
    reactivate,
    remove,
  };
}
