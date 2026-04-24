import { z } from "zod";

const optionalText = (schema: z.ZodString) =>
  z.union([schema, z.literal("")]).optional();

const hexColorSchema = z
  .string()
  .regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/, "Usa un color HEX valido");

export const organizationBrandingSchema = z.object({
  id: z.string().optional(),
  logoUrl: z.string().nullable().optional(),
  iconUrl: z.string().nullable().optional(),
  primaryColor: z.string().nullable().optional(),
  secondaryColor: z.string().nullable().optional(),
  accentColor: z.string().nullable().optional(),
  theme: z.unknown().optional(),
});

export const organizationProfileSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  legalName: z.string().nullable().optional(),
  taxId: z.string().nullable().optional(),
  status: z.string(),
  timezone: z.string(),
  locale: z.string(),
  defaultCurrency: z.string(),
  branding: organizationBrandingSchema.nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const updateOrganizationProfileSchema = z.object({
  name: z.string().min(2, "Minimo 2 caracteres").max(160),
  legalName: optionalText(z.string().max(200)),
  taxId: optionalText(z.string().max(60)),
  timezone: z.string().max(80),
  locale: z.string().max(10),
  defaultCurrency: z
    .string()
    .length(3, "Usa codigo ISO de 3 letras"),
});

export const updateOrganizationBrandingSchema = z.object({
  primaryColor: hexColorSchema,
  secondaryColor: hexColorSchema,
  accentColor: hexColorSchema,
});

export const organizationSettingSchema = z.object({
  id: z.string(),
  namespace: z.string(),
  key: z.string(),
  value: z.unknown(),
  updatedAt: z.string(),
});

export const organizationSettingInputSchema = z.object({
  namespace: z.string().min(1).max(80),
  key: z.string().min(1).max(120),
  value: z.unknown(),
});

export const organizationModuleSchema = z.object({
  id: z.string(),
  module: z.object({
    key: z.string(),
    name: z.string(),
    description: z.string().nullable().optional(),
    status: z.string(),
  }),
  isEnabled: z.boolean(),
  config: z.unknown().optional(),
  sortOrder: z.number(),
  updatedAt: z.string(),
});

export const updateOrganizationModuleSchema = z.object({
  isEnabled: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  config: z.record(z.string(), z.unknown()).optional(),
});

export const organizationScreenSchema = z.object({
  id: z.string(),
  key: z.string(),
  title: z.string(),
  path: z.string().nullable().optional(),
  type: z.string(),
  moduleKey: z.string().nullable().optional(),
  requiredPermissionKey: z.string().nullable().optional(),
  config: z.unknown().optional(),
  sortOrder: z.number(),
  isVisible: z.boolean(),
  updatedAt: z.string(),
});

export const createOrganizationScreenSchema = z.object({
  key: z
    .string()
    .min(2, "Minimo 2 caracteres")
    .max(120)
    .regex(/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/, "Usa formato custom.reports"),
  title: z.string().min(2, "Minimo 2 caracteres").max(160),
  path: optionalText(z.string().max(300)),
  type: z.enum(["CUSTOM_PAGE", "EXTERNAL_LINK", "FORM", "EMBED"]),
  moduleKey: optionalText(z.string().max(80)),
  requiredPermissionKey: optionalText(z.string().max(120)),
  sortOrder: z.coerce.number().int().optional(),
  isVisible: z.boolean().optional(),
});

export const updateOrganizationScreenSchema =
  createOrganizationScreenSchema.partial();

export type OrganizationProfile = z.infer<typeof organizationProfileSchema>;
export type UpdateOrganizationProfile = z.infer<
  typeof updateOrganizationProfileSchema
>;
export type UpdateOrganizationBranding = z.infer<
  typeof updateOrganizationBrandingSchema
>;
export type OrganizationModule = z.infer<typeof organizationModuleSchema>;
export type OrganizationSetting = z.infer<typeof organizationSettingSchema>;
export type OrganizationSettingInput = z.infer<typeof organizationSettingInputSchema>;
export type UpdateOrganizationModule = z.infer<typeof updateOrganizationModuleSchema>;
export type OrganizationScreen = z.infer<typeof organizationScreenSchema>;
export type CreateOrganizationScreenForm = z.input<
  typeof createOrganizationScreenSchema
>;
export type CreateOrganizationScreen = z.infer<typeof createOrganizationScreenSchema>;
export type UpdateOrganizationScreen = z.infer<typeof updateOrganizationScreenSchema>;
