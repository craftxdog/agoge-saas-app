import { z } from "zod";

const optionalText = (schema: z.ZodString) =>
  z.union([schema, z.literal("")]).optional();

export const permissionSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  module: z
    .object({
      key: z.string(),
      name: z.string(),
      description: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
});

export const roleSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  isSystem: z.boolean(),
  isDefault: z.boolean(),
  permissions: z.array(permissionSchema),
  memberCount: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const memberRolesSchema = z.object({
  memberId: z.string(),
  organizationId: z.string(),
  userId: z.string(),
  status: z.string(),
  roles: z.array(roleSchema),
});

export const accessScreenSchema = z.object({
  key: z.string(),
  title: z.string(),
  path: z.string().nullable().optional(),
  type: z.string(),
  requiredPermissionKey: z.string().nullable().optional(),
  isVisible: z.boolean(),
});

export const accessModuleSchema = z.object({
  key: z.string(),
  name: z.string(),
  isEnabled: z.boolean(),
  permissions: z.array(permissionSchema),
  screens: z.array(accessScreenSchema),
});

export const accessMatrixSchema = z.object({
  organizationId: z.string(),
  modules: z.array(accessModuleSchema),
  roles: z.array(roleSchema),
});

export const createRoleSchema = z.object({
  key: z
    .string()
    .min(2, "Minimo 2 caracteres")
    .max(80)
    .regex(/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/, "Usa formato front-desk o module.role"),
  name: z.string().min(2, "Minimo 2 caracteres").max(120),
  description: optionalText(z.string().max(500)),
  isDefault: z.boolean().optional(),
  permissionKeys: z.array(z.string()).optional(),
});

export const updateRoleSchema = z.object({
  name: z.string().min(2, "Minimo 2 caracteres").max(120),
  description: optionalText(z.string().max(500)),
  isDefault: z.boolean().optional(),
});

export type Permission = z.infer<typeof permissionSchema>;
export type Role = z.infer<typeof roleSchema>;
export type MemberRoles = z.infer<typeof memberRolesSchema>;
export type AccessMatrix = z.infer<typeof accessMatrixSchema>;
export type AccessModule = z.infer<typeof accessModuleSchema>;
export type CreateRole = z.infer<typeof createRoleSchema>;
export type UpdateRole = z.infer<typeof updateRoleSchema>;

export type RbacRoleQuery = {
  search?: string;
  cursor?: string;
  limit?: number;
  sortBy?: "createdAt" | "name" | "key";
  sortDirection?: "asc" | "desc";
};

export type RbacPermissionQuery = {
  moduleKey?: string;
};

