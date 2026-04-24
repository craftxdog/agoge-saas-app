import { z } from "zod";

const tenantSlugSchema = z
  .string()
  .min(3, "Minimo 3 caracteres")
  .max(80, "Maximo 80 caracteres")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Usa solo minusculas, numeros y guiones entre palabras",
  );

const strongPasswordSchema = z
  .string()
  .min(12, "Minimo 12 caracteres")
  .max(72, "Maximo 72 caracteres")
  .regex(/[a-z]/, "Debe tener una minuscula")
  .regex(/[A-Z]/, "Debe tener una mayuscula")
  .regex(/[0-9]/, "Debe tener un numero")
  .regex(/[^A-Za-z0-9]/, "Debe tener un simbolo");

const optionalSlugSchema = z
  .union([tenantSlugSchema, z.literal("")])
  .optional()
  .transform((value) => value || undefined);

const optionalUuidSchema = z
  .union([z.uuid("Organizacion invalida"), z.literal("")])
  .optional()
  .transform((value) => value || undefined);

const optionalUsernameSchema = z
  .union([
    z
      .string()
      .min(3, "Minimo 3 caracteres")
      .max(50, "Maximo 50 caracteres")
      .regex(/^[a-zA-Z0-9_]+$/, "Solo letras, numeros y guion bajo"),
    z.literal(""),
  ])
  .optional()
  .transform((value) => value || undefined);

const optionalStringSchema = (schema: z.ZodString) =>
  z
    .union([schema, z.literal("")])
    .optional()
    .transform((value) => value || undefined);

export const loginSchema = z.object({
  email: z.email("Email invalido").toLowerCase().trim(),
  password: z.string().min(1, "Ingresa tu password"),
  organizationSlug: optionalSlugSchema,
  organizationId: optionalUuidSchema,
  rememberMe: z.boolean().optional(),
});

export const registerOrganizationSchema = z
  .object({
    organizationName: z
      .string()
      .min(2, "Minimo 2 caracteres")
      .max(120, "Maximo 120 caracteres")
      .trim(),
    organizationSlug: optionalSlugSchema,
    timezone: z.string().default("America/Managua"),
    locale: z.string().default("es-NI"),
    currency: z
      .string()
      .length(3, "Usa codigo ISO de 3 letras")
      .transform((value) => value.toUpperCase())
      .default("USD"),
    email: z.email("Email invalido").toLowerCase().trim(),
    username: optionalUsernameSchema,
    firstName: z.string().min(1, "Ingresa tu nombre").max(80).trim(),
    lastName: z.string().min(1, "Ingresa tu apellido").max(80).trim(),
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, "Confirma tu password"),
    phone: optionalStringSchema(z.string().min(7).max(20)),
    documentId: optionalStringSchema(z.string().min(3).max(30)),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contrasenas no coinciden",
    path: ["confirmPassword"],
  });

export const authUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  username: z.string().nullable().optional(),
  firstName: z.string(),
  lastName: z.string(),
  platformRole: z.enum(["SUPER_ADMIN", "SUPPORT", "USER"]),
});

export const authOrganizationSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  timezone: z.string(),
  locale: z.string(),
  defaultCurrency: z.string(),
});

export const authMembershipSchema = z.object({
  id: z.string(),
  organization: authOrganizationSchema,
  roles: z.array(z.string()),
  permissions: z.array(z.string()),
  enabledModules: z.array(z.string()),
});

export const authSessionSchema = z.object({
  user: authUserSchema,
  activeMembership: authMembershipSchema.nullable().optional(),
  memberships: z.array(authMembershipSchema),
  tokens: z.object({
    accessToken: z.string(),
    refreshToken: z.string().optional(),
    tokenType: z.literal("Bearer"),
    expiresInSeconds: z.number(),
  }),
});

export const meSessionSchema = authSessionSchema.omit({ tokens: true });

export type LoginSchema = z.infer<typeof loginSchema>;
export type LoginFormValues = z.input<typeof loginSchema>;
export type RegisterOrganizationSchema = z.infer<typeof registerOrganizationSchema>;
export type RegisterOrganizationFormValues = z.input<
  typeof registerOrganizationSchema
>;
export type RegisterOrganizationPayload = Omit<
  RegisterOrganizationSchema,
  "confirmPassword"
>;
export type AuthUser = z.infer<typeof authUserSchema>;
export type AuthOrganization = z.infer<typeof authOrganizationSchema>;
export type AuthMembership = z.infer<typeof authMembershipSchema>;
export type AuthSession = z.infer<typeof authSessionSchema>;
export type MeSession = z.infer<typeof meSessionSchema>;
