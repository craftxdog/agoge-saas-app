import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  accessMatrixSchema,
  type CreatePermission,
  memberRolesSchema,
  permissionSchema,
  roleSchema,
  type CreateRole,
  type RbacPermissionQuery,
  type RbacRoleQuery,
  type UpdateRole,
} from "../schemas/rbac.schema";
import { rbacService } from "../services/rbac.service";

export const rbacKeys = {
  all: ["rbac"] as const,
  permissions: (query?: RbacPermissionQuery) =>
    [...rbacKeys.all, "permissions", query] as const,
  roles: (query?: RbacRoleQuery) => [...rbacKeys.all, "roles", query] as const,
  role: (roleId?: string) => [...rbacKeys.all, "role", roleId] as const,
  memberRoles: (memberId?: string) =>
    [...rbacKeys.all, "member-roles", memberId] as const,
  matrix: () => [...rbacKeys.all, "matrix"] as const,
};

export const useRbacPermissions = (
  query?: RbacPermissionQuery,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: rbacKeys.permissions(query),
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      const res = await rbacService.listPermissions(query);
      return permissionSchema.array().parse(res.data);
    },
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

export const useRbacRoles = (
  query?: RbacRoleQuery,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: rbacKeys.roles(query),
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      const res = await rbacService.listRoles(query);
      return {
        items: roleSchema.array().parse(res.data),
        pagination: res.meta.pagination,
      };
    },
    staleTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

export const useRbacRole = (roleId?: string) =>
  useQuery({
    queryKey: rbacKeys.role(roleId),
    enabled: Boolean(roleId),
    queryFn: async () => {
      const res = await rbacService.getRole(roleId!);
      return roleSchema.parse(res.data);
    },
  });

export const useMemberRoles = (memberId?: string, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: rbacKeys.memberRoles(memberId),
    enabled: Boolean(memberId) && (options?.enabled ?? true),
    queryFn: async () => {
      const res = await rbacService.getMemberRoles(memberId!);
      return memberRolesSchema.parse(res.data);
    },
    refetchOnWindowFocus: false,
  });

export const useRbacAccessMatrix = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: rbacKeys.matrix(),
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      const res = await rbacService.getAccessMatrix();
      return accessMatrixSchema.parse(res.data);
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

export const useCreateRbacRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRole) => rbacService.createRole(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: rbacKeys.all });
      toast.success("Rol creado.");
    },
    onError: () => toast.error("No pudimos crear el rol."),
  });
};

export const useCreateRbacPermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePermission) => rbacService.createPermission(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: rbacKeys.all });
      toast.success("Permiso creado.");
    },
    onError: () => toast.error("No pudimos crear el permiso."),
  });
};

export const useUpdateRbacRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, data }: { roleId: string; data: UpdateRole }) =>
      rbacService.updateRole(roleId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: rbacKeys.all });
      toast.success("Rol actualizado.");
    },
    onError: () => toast.error("No pudimos actualizar el rol."),
  });
};

export const useReplaceRolePermissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roleId,
      permissionKeys,
    }: {
      roleId: string;
      permissionKeys: string[];
    }) => rbacService.replaceRolePermissions(roleId, permissionKeys),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: rbacKeys.all });
      toast.success("Permisos del rol actualizados.");
    },
    onError: () => toast.error("No pudimos actualizar los permisos."),
  });
};

export const useDeleteRbacRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roleId: string) => rbacService.deleteRole(roleId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: rbacKeys.all });
      toast.success("Rol eliminado.");
    },
    onError: () => toast.error("No pudimos eliminar el rol."),
  });
};

export const useReplaceMemberRoles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, roleKeys }: { memberId: string; roleKeys: string[] }) =>
      rbacService.replaceMemberRoles(memberId, roleKeys),
    onSuccess: async (_, vars) => {
      await queryClient.invalidateQueries({ queryKey: rbacKeys.all });
      await queryClient.invalidateQueries({
        queryKey: rbacKeys.memberRoles(vars.memberId),
      });
      toast.success("Roles del miembro actualizados.");
    },
    onError: () => toast.error("No pudimos actualizar los roles del miembro."),
  });
};
