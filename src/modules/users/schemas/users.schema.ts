import { z } from "zod";

const optionalText = (schema: z.ZodString) =>
  z.union([schema, z.literal("")]).optional();

export const memberStatusSchema = z.enum(["ACTIVE", "INVITED", "SUSPENDED", "REMOVED"]);
export const invitationStatusSchema = z.enum([
  "PENDING",
  "ACCEPTED",
  "EXPIRED",
  "REVOKED",
]);

export const userAccountSchema = z.object({
  id: z.string(),
  email: z.string(),
  username: z.string().nullable().optional(),
  firstName: z.string(),
  lastName: z.string(),
  platformRole: z.string(),
  status: z.string(),
});

export const memberRoleSchema = z.object({
  key: z.string(),
  name: z.string(),
  isSystem: z.boolean(),
});

export const memberSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  user: userAccountSchema,
  status: z.string(),
  phone: z.string().nullable().optional(),
  documentId: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  joinedAt: z.string().nullable().optional(),
  roles: z.array(memberRoleSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const invitationSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  email: z.string(),
  status: z.string(),
  invitedByMemberId: z.string().nullable().optional(),
  expiresAt: z.string(),
  acceptedAt: z.string().nullable().optional(),
  revokedAt: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createdInvitationSchema = invitationSchema.extend({
  token: z.string(),
});

export const acceptInvitationResponseSchema = z.object({
  member: memberSchema,
  invitation: invitationSchema,
});

export const createMemberSchema = z.object({
  email: z.email("Correo electronico invalido").toLowerCase().trim(),
  username: optionalText(
    z
      .string()
      .min(3, "Minimo 3 caracteres")
      .max(40)
      .regex(/^[a-zA-Z0-9._-]+$/, "Usa letras, numeros, punto, guion o underscore"),
  ),
  firstName: z.string().min(2, "Minimo 2 caracteres").max(80),
  lastName: z.string().min(2, "Minimo 2 caracteres").max(80),
  password: optionalText(z.string().min(8, "Minimo 8 caracteres").max(128)),
  phone: optionalText(z.string().max(20)),
  documentId: optionalText(z.string().max(30)),
  address: optionalText(z.string().max(255)),
  roleKeysText: z.string().optional(),
});

export const updateMemberSchema = z.object({
  firstName: z.string().min(2).max(80),
  lastName: z.string().min(2).max(80),
  phone: optionalText(z.string().max(20)),
  documentId: optionalText(z.string().max(30)),
  address: optionalText(z.string().max(255)),
});

export const createInvitationSchema = z.object({
  email: z.email("Correo electronico invalido").toLowerCase().trim(),
  expiresInDays: z.coerce.number().int().min(1).max(30).default(7),
});

export const acceptInvitationSchema = z.object({
  token: z.string().min(1, "Token requerido"),
  firstName: z.string().min(2, "Minimo 2 caracteres").max(80),
  lastName: z.string().min(2, "Minimo 2 caracteres").max(80),
  password: z.string().min(8, "Minimo 8 caracteres").max(128),
  username: optionalText(
    z
      .string()
      .min(3, "Minimo 3 caracteres")
      .max(40)
      .regex(/^[a-zA-Z0-9._-]+$/, "Usa letras, numeros, punto, guion o underscore"),
  ),
  phone: optionalText(z.string().max(20)),
  documentId: optionalText(z.string().max(30)),
  address: optionalText(z.string().max(255)),
});

export type Member = z.infer<typeof memberSchema>;
export type Invitation = z.infer<typeof invitationSchema>;
export type CreatedInvitation = z.infer<typeof createdInvitationSchema>;
export type AcceptInvitationResponse = z.infer<
  typeof acceptInvitationResponseSchema
>;
export type CreateMemberForm = z.infer<typeof createMemberSchema>;
export type UpdateMember = z.infer<typeof updateMemberSchema>;
export type CreateInvitationForm = z.input<typeof createInvitationSchema>;
export type CreateInvitation = z.infer<typeof createInvitationSchema>;
export type AcceptInvitation = z.infer<typeof acceptInvitationSchema>;
export type MemberStatus = z.infer<typeof memberStatusSchema>;
export type InvitationStatus = z.infer<typeof invitationStatusSchema>;

export type CreateMemberPayload = Omit<CreateMemberForm, "roleKeysText"> & {
  roleKeys?: string[];
};

export type MemberQuery = {
  search?: string;
  status?: MemberStatus;
  cursor?: string;
  limit?: number;
  sortBy?: "createdAt" | "joinedAt" | "status";
  sortDirection?: "asc" | "desc";
};

export type InvitationQuery = {
  search?: string;
  status?: InvitationStatus;
  cursor?: string;
  limit?: number;
  sortDirection?: "asc" | "desc";
};
