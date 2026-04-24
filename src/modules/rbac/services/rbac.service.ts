import { http } from "@/shared/api/http";
import type { ApiResponse } from "@/shared/api/types";
import type {
  AccessMatrix,
  CreatePermission,
  CreateRole,
  MemberRoles,
  Permission,
  RbacPermissionQuery,
  RbacRoleQuery,
  Role,
  UpdateRole,
} from "../schemas/rbac.schema";

const toSearchParams = (query?: Record<string, string | number | undefined>) => {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  }

  return params.toString();
};

const withQuery = (path: string, query?: Record<string, string | number | undefined>) => {
  const params = toSearchParams(query);
  return params ? `${path}?${params}` : path;
};

export const rbacService = {
  listPermissions: (query?: RbacPermissionQuery) =>
    http.get<ApiResponse<Permission[]>>(withQuery("/rbac/permissions", query)),

  createPermission: (data: CreatePermission) =>
    http.post<ApiResponse<Permission>, CreatePermission>("/rbac/permissions", data),

  listRoles: (query?: RbacRoleQuery) =>
    http.get<ApiResponse<Role[]>>(withQuery("/rbac/roles", query)),

  createRole: (data: CreateRole) =>
    http.post<ApiResponse<Role>, CreateRole>("/rbac/roles", data),

  getRole: (roleId: string) =>
    http.get<ApiResponse<Role>>(`/rbac/roles/${roleId}`),

  updateRole: (roleId: string, data: UpdateRole) =>
    http.patch<ApiResponse<Role>, UpdateRole>(`/rbac/roles/${roleId}`, data),

  replaceRolePermissions: (roleId: string, permissionKeys: string[]) =>
    http.put<ApiResponse<Role>, { permissionKeys: string[] }>(
      `/rbac/roles/${roleId}/permissions`,
      { permissionKeys },
    ),

  deleteRole: (roleId: string) =>
    http.delete<ApiResponse<Role>>(`/rbac/roles/${roleId}`),

  getMemberRoles: (memberId: string) =>
    http.get<ApiResponse<MemberRoles>>(`/rbac/members/${memberId}/roles`),

  replaceMemberRoles: (memberId: string, roleKeys: string[]) =>
    http.put<ApiResponse<MemberRoles>, { roleKeys: string[] }>(
      `/rbac/members/${memberId}/roles`,
      { roleKeys },
    ),

  getAccessMatrix: () =>
    http.get<ApiResponse<AccessMatrix>>("/rbac/access-matrix"),
};
