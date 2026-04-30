import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  CheckCircle2,
  ImagePlus,
  Loader2,
  Palette,
  PanelsTopLeft,
  Settings2,
  UploadCloud,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import type { UseFormRegisterReturn } from "react-hook-form";
import { FormError } from "@/components/atoms/form-error";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollPanel } from "@/shared/components/ScrollPanel";
import { useAuth } from "@/shared/hooks/useAuth";
import { BrandAssetEditor } from "../components/BrandAssetEditor";
import {
  useCreateOrganizationScreen,
  useDeleteOrganizationScreen,
  useOrganizationModules,
  useOrganizationPreferences,
  useOrganizationProfile,
  useOrganizationScreens,
  useUpdateOrganizationModule,
  useUpdateOrganizationBranding,
  useUpdateOrganizationProfile,
  useUpdateOrganizationScreen,
  useUpsertOrganizationPreferences,
  useUploadBrandingIcon,
  useUploadBrandingLogo,
} from "../hooks/useOrganizationSettings";
import {
  createOrganizationScreenSchema,
  updateOrganizationBrandingSchema,
  updateOrganizationProfileSchema,
  type CreateOrganizationScreenForm,
  type CreateOrganizationScreen,
  type UpdateOrganizationBranding,
  type UpdateOrganizationProfile,
} from "../schemas/settings.schema";
import {
  getStoredBrandAssetVersion,
  resolveBrandAssetUrl,
} from "../utils/tenant-branding";
import { formatSystemLabel } from "@/shared/utils/labels";

const defaultBranding = {
  primaryColor: "#4f8f83",
  secondaryColor: "#6f91b8",
  accentColor: "#d99a5f",
};

const preferenceNamespaces = ["billing", "security", "notifications", "operations"];

type PreferencePreset = {
  key: string;
  label: string;
  description: string;
  kind: "text" | "number" | "boolean" | "select";
  defaultValue: string;
  options?: { label: string; value: string }[];
};

export default function CompanySettingsPage() {
  const { activeMembership } = useAuth();
  const organization = useOrganizationProfile();
  const modules = useOrganizationModules();
  const screens = useOrganizationScreens();
  const [preferencesNamespace, setPreferencesNamespace] = useState("billing");
  const preferences = useOrganizationPreferences(preferencesNamespace);
  const profileMutation = useUpdateOrganizationProfile();
  const brandingMutation = useUpdateOrganizationBranding();
  const logoUploadMutation = useUploadBrandingLogo();
  const iconUploadMutation = useUploadBrandingIcon();
  const moduleMutation = useUpdateOrganizationModule();
  const createScreenMutation = useCreateOrganizationScreen();
  const updateScreenMutation = useUpdateOrganizationScreen();
  const deleteScreenMutation = useDeleteOrganizationScreen();
  const upsertPreferencesMutation =
    useUpsertOrganizationPreferences(preferencesNamespace);

  const profileForm = useForm<UpdateOrganizationProfile>({
    resolver: zodResolver(updateOrganizationProfileSchema),
    defaultValues: {
      name: "",
      legalName: "",
      taxId: "",
      timezone: "America/Managua",
      locale: "es-NI",
      defaultCurrency: "USD",
    },
  });

  const brandingForm = useForm<UpdateOrganizationBranding>({
    resolver: zodResolver(updateOrganizationBrandingSchema),
    defaultValues: defaultBranding,
  });
  const primaryColorPreview =
    useWatch({
      control: brandingForm.control,
      name: "primaryColor",
    }) ?? defaultBranding.primaryColor;
  const screenForm = useForm<
    CreateOrganizationScreenForm,
    unknown,
    CreateOrganizationScreen
  >({
    resolver: zodResolver(createOrganizationScreenSchema),
    defaultValues: {
      key: "",
      title: "",
      path: "",
      type: "CUSTOM_PAGE",
      moduleKey: "settings",
      requiredPermissionKey: "settings.read",
      sortOrder: 100,
      isVisible: true,
    },
  });
  const [preferenceKey, setPreferenceKey] = useState("invoicePrefix");
  const [preferenceValue, setPreferenceValue] = useState("AGO");
  const [assetDraft, setAssetDraft] = useState<{
    kind: "logo" | "icon";
    file: File;
  } | null>(null);

  useEffect(() => {
    if (!organization.data) return;

    profileForm.reset({
      name: organization.data.name,
      legalName: organization.data.legalName ?? "",
      taxId: organization.data.taxId ?? "",
      timezone: organization.data.timezone,
      locale: organization.data.locale,
      defaultCurrency: organization.data.defaultCurrency,
    });

    brandingForm.reset({
      primaryColor:
        organization.data.branding?.primaryColor ??
        defaultBranding.primaryColor,
      secondaryColor:
        organization.data.branding?.secondaryColor ??
        defaultBranding.secondaryColor,
      accentColor:
        organization.data.branding?.accentColor ?? defaultBranding.accentColor,
    });
  }, [brandingForm, organization.data, profileForm]);

  if (organization.isLoading) return <SettingsSkeleton />;

  if (organization.isError || !organization.data) {
    return (
      <Card className="rounded-[2rem]">
        <CardContent className="p-8">
          <h1 className="text-2xl font-semibold">No pudimos cargar la empresa</h1>
          <p className="mt-2 text-muted-foreground">
            Verifica que el modulo settings este habilitado y que tengas
            `settings.read`.
          </p>
        </CardContent>
      </Card>
    );
  }

  const tenant = organization.data;
  const logoVersion = getStoredBrandAssetVersion(activeMembership?.organization.id, "logo");
  const iconVersion = getStoredBrandAssetVersion(activeMembership?.organization.id, "icon");
  const logoPreviewUrl = resolveBrandAssetUrl(tenant.branding?.logoUrl, logoVersion);
  const iconPreviewUrl = resolveBrandAssetUrl(tenant.branding?.iconUrl, iconVersion);
  const preferencePresetGroups = buildPreferencePresets({
    currency: tenant.defaultCurrency,
    modules: modules.data ?? [],
    screens: screens.data ?? [],
  });
  const activePreferencePresets =
    preferencePresetGroups[preferencesNamespace] ?? preferencePresetGroups.billing;
  const selectedPreference =
    activePreferencePresets.find((preset) => preset.key === preferenceKey) ??
    activePreferencePresets[0];

  return (
    <section className="grid gap-8">
      <div className="rounded-[2rem] border bg-[linear-gradient(135deg,_rgba(79,143,131,0.16),_rgba(217,154,95,0.12))] p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
              Configuracion del tenant
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">
              {tenant.name}
            </h1>
            <p className="mt-3 text-muted-foreground">
              Slug: <span className="font-medium text-foreground">{tenant.slug}</span> ·
              Estado: <span className="font-medium text-foreground">{formatSystemLabel(tenant.status)}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge className="rounded-full">{tenant.defaultCurrency}</Badge>
            <Badge variant="outline" className="rounded-full">
              {tenant.locale}
            </Badge>
            <Badge variant="outline" className="rounded-full">
              {tenant.timezone}
            </Badge>
          </div>
        </div>
      </div>

      <Tabs defaultValue="company" className="gap-6">
        <TabsList className="flex h-auto w-full flex-wrap justify-start rounded-2xl bg-muted/70 p-1">
          <TabsTrigger value="company" className="rounded-xl px-4 py-2">
            Empresa
          </TabsTrigger>
          <TabsTrigger value="branding" className="rounded-xl px-4 py-2">
            Branding
          </TabsTrigger>
          <TabsTrigger value="modules" className="rounded-xl px-4 py-2">
            Modulos
          </TabsTrigger>
          <TabsTrigger value="screens" className="rounded-xl px-4 py-2">
            Pantallas
          </TabsTrigger>
          <TabsTrigger value="preferences" className="rounded-xl px-4 py-2">
            Preferencias
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company">
        <Card className="rounded-[1.75rem]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-5 text-primary" />
              Perfil de empresa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-5"
              onSubmit={profileForm.handleSubmit((data) =>
                profileMutation.mutate({
                  ...data,
                  defaultCurrency: data.defaultCurrency.toUpperCase(),
                }),
              )}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  id="name"
                  label="Nombre comercial"
                  register={profileForm.register("name")}
                  error={profileForm.formState.errors.name?.message}
                />
                <Field
                  id="legalName"
                  label="Razon social"
                  register={profileForm.register("legalName")}
                  error={profileForm.formState.errors.legalName?.message}
                />
                <Field
                  id="taxId"
                  label="Identificacion fiscal"
                  register={profileForm.register("taxId")}
                  error={profileForm.formState.errors.taxId?.message}
                />
                <Field
                  id="defaultCurrency"
                  label="Moneda"
                  register={profileForm.register("defaultCurrency")}
                  error={profileForm.formState.errors.defaultCurrency?.message}
                />
                <Field
                  id="timezone"
                  label="Zona horaria"
                  register={profileForm.register("timezone")}
                  error={profileForm.formState.errors.timezone?.message}
                />
                <Field
                  id="locale"
                  label="Locale"
                  register={profileForm.register("locale")}
                  error={profileForm.formState.errors.locale?.message}
                />
              </div>

              <Button
                type="submit"
                disabled={profileMutation.isPending}
                className="w-fit rounded-full"
              >
                {profileMutation.isPending && <Loader2 className="animate-spin" />}
                Guardar perfil
              </Button>
            </form>
          </CardContent>
        </Card>
        </TabsContent>

        <TabsContent value="branding">
        <Card className="rounded-[1.75rem]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="size-5 text-primary" />
              Branding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-5"
              onSubmit={brandingForm.handleSubmit((data) =>
                brandingMutation.mutate(data),
              )}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <AssetUploadCard
                  id="logoFile"
                  kind="logo"
                  label="Logo"
                  description="Imagen principal de la empresa. Recomendado: 1200 x 400 px."
                  imageUrl={logoPreviewUrl}
                  isPending={logoUploadMutation.isPending}
                  onFileSelected={(file) => setAssetDraft({ kind: "logo", file })}
                />
                <AssetUploadCard
                  id="iconFile"
                  kind="icon"
                  label="Icono"
                  description="Icono compacto para marca y accesos. Recomendado: 512 x 512 px."
                  imageUrl={iconPreviewUrl}
                  isPending={iconUploadMutation.isPending}
                  onFileSelected={(file) => setAssetDraft({ kind: "icon", file })}
                />
              </div>

              {assetDraft ? (
                <BrandAssetEditor
                  key={`${assetDraft.kind}-${assetDraft.file.name}-${assetDraft.file.lastModified}`}
                  kind={assetDraft.kind}
                  file={assetDraft.file}
                  isPending={
                    assetDraft.kind === "logo"
                      ? logoUploadMutation.isPending
                      : iconUploadMutation.isPending
                  }
                  onCancel={() => setAssetDraft(null)}
                  onConfirm={(file) => {
                    if (assetDraft.kind === "logo") {
                      logoUploadMutation.mutate(file, {
                        onSuccess: () => setAssetDraft(null),
                      });
                      return;
                    }

                    iconUploadMutation.mutate(file, {
                      onSuccess: () => setAssetDraft(null),
                    });
                  }}
                />
              ) : null}

              <div className="grid gap-4 sm:grid-cols-3">
                <ColorField
                  id="primaryColor"
                  label="Primario"
                  register={brandingForm.register("primaryColor")}
                  error={brandingForm.formState.errors.primaryColor?.message}
                />
                <ColorField
                  id="secondaryColor"
                  label="Secundario"
                  register={brandingForm.register("secondaryColor")}
                  error={brandingForm.formState.errors.secondaryColor?.message}
                />
                <ColorField
                  id="accentColor"
                  label="Acento"
                  register={brandingForm.register("accentColor")}
                  error={brandingForm.formState.errors.accentColor?.message}
                />
              </div>

              <div className="rounded-3xl border p-5">
                <p className="text-sm font-medium text-muted-foreground">
                  Vista previa
                </p>
                <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="rounded-[1.6rem] border bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(246,248,245,0.94))] p-5">
                    <div className="rounded-[1.4rem] border bg-[radial-gradient(circle_at_center,rgba(79,143,131,0.14),rgba(255,255,255,0.98)_58%)] p-4">
                      <div className="flex h-20 items-center justify-center">
                        {logoPreviewUrl ? (
                          <img
                            src={logoPreviewUrl}
                            alt={tenant.name}
                            className="h-full w-full object-contain object-center"
                          />
                        ) : (
                          <p className="font-display text-3xl font-semibold tracking-tight">
                            {tenant.name}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-lg font-semibold tracking-tight">{tenant.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Logo principal para sidebar, cabecera y experiencias del tenant.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[1.6rem] border bg-white/80 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                      Icono compacto
                    </p>
                    <div className="mt-4 flex items-center gap-4">
                      <span
                        className="grid size-16 place-items-center overflow-hidden rounded-[1.6rem] text-white shadow-sm"
                        style={{
                          backgroundColor: primaryColorPreview,
                        }}
                      >
                        {iconPreviewUrl ? (
                          <img
                            src={iconPreviewUrl}
                            alt={tenant.name}
                            className="h-full w-full object-contain p-1.5"
                          />
                        ) : (
                          "A"
                        )}
                      </span>
                      <div>
                        <p className="font-semibold">Icono de navegacion</p>
                        <p className="text-sm text-muted-foreground">
                          Usado en favicon, chips, header y vista compacta.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={brandingMutation.isPending}
                className="w-fit rounded-full"
              >
                {brandingMutation.isPending && <Loader2 className="animate-spin" />}
                Guardar branding
              </Button>
            </form>
          </CardContent>
        </Card>
        </TabsContent>

        <TabsContent value="modules">
      <Card className="rounded-[1.75rem]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PanelsTopLeft className="size-5 text-primary" />
            Modulos del tenant
          </CardTitle>
        </CardHeader>
        <CardContent>
          {modules.isLoading ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-28 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {(modules.data ?? []).map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border bg-white/60 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">{item.module.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.module.description ?? item.module.key}
                      </p>
                    </div>
                    <Badge
                      variant={item.isEnabled ? "default" : "outline"}
                      className="rounded-full"
                    >
                      {item.isEnabled ? (
                        <CheckCircle2 className="size-3" />
                      ) : (
                        <Settings2 className="size-3" />
                      )}
                      {item.isEnabled ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Orden {item.sortOrder} · {item.module.status}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      variant={item.isEnabled ? "outline" : "default"}
                      className="rounded-full"
                      disabled={moduleMutation.isPending || item.module.key === "settings"}
                      onClick={() =>
                        moduleMutation.mutate({
                          moduleKey: item.module.key,
                          data: { isEnabled: !item.isEnabled },
                        })
                      }
                    >
                      {item.isEnabled ? "Desactivar" : "Activar"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-full"
                      disabled={moduleMutation.isPending}
                      onClick={() =>
                        moduleMutation.mutate({
                          moduleKey: item.module.key,
                          data: { sortOrder: item.sortOrder + 10 },
                        })
                      }
                    >
                      Mover
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="screens">
          <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
            <Card className="rounded-[1.75rem]">
              <CardHeader>
                <CardTitle>Nueva pantalla</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  className="grid gap-4"
                  onSubmit={screenForm.handleSubmit((data) => {
                    createScreenMutation.mutate(data, {
                      onSuccess: () => screenForm.reset(),
                    });
                  })}
                >
                  <Field
                    id="screenKey"
                    label="Key"
                    register={screenForm.register("key")}
                    error={screenForm.formState.errors.key?.message}
                  />
                  <Field
                    id="screenTitle"
                    label="Titulo"
                    register={screenForm.register("title")}
                    error={screenForm.formState.errors.title?.message}
                  />
                  <Field
                    id="screenPath"
                    label="Ruta"
                    register={screenForm.register("path")}
                    error={screenForm.formState.errors.path?.message}
                  />
                  <div className="grid gap-2">
                    <Label htmlFor="screenType">Tipo</Label>
                    <select
                      id="screenType"
                      className="h-11 rounded-2xl border bg-white/70 px-3 text-sm"
                      {...screenForm.register("type")}
                    >
                      <option value="CUSTOM_PAGE">Custom page</option>
                      <option value="EXTERNAL_LINK">External link</option>
                      <option value="FORM">Form</option>
                      <option value="EMBED">Embed</option>
                    </select>
                  </div>
                  <Field
                    id="screenModule"
                    label="Modulo"
                    register={screenForm.register("moduleKey")}
                    error={screenForm.formState.errors.moduleKey?.message}
                  />
                  <Field
                    id="screenPermission"
                    label="Permiso requerido"
                    register={screenForm.register("requiredPermissionKey")}
                    error={screenForm.formState.errors.requiredPermissionKey?.message}
                  />
                  <Button
                    type="submit"
                    className="w-fit rounded-full"
                    disabled={createScreenMutation.isPending}
                  >
                    {createScreenMutation.isPending && (
                      <Loader2 className="animate-spin" />
                    )}
                    Crear pantalla
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="rounded-[1.75rem]">
              <CardHeader>
                <CardTitle>Pantallas configuradas</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollPanel heightClassName="max-h-[56vh]">
                {(screens.data ?? []).map((screen) => (
                  <div key={screen.id} className="rounded-2xl border bg-white/60 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">{screen.title}</h3>
                          <Badge variant="outline" className="rounded-full">
                            {screen.type}
                          </Badge>
                          <Badge
                            variant={screen.isVisible ? "default" : "outline"}
                            className="rounded-full"
                          >
                            {screen.isVisible ? "Visible" : "Oculta"}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {screen.key} · {screen.path ?? "Sin ruta"}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Modulo: {screen.moduleKey ?? "ninguno"} · Permiso:{" "}
                          {screen.requiredPermissionKey ?? "ninguno"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full"
                          disabled={updateScreenMutation.isPending}
                          onClick={() =>
                            updateScreenMutation.mutate({
                              screenId: screen.id,
                              data: { isVisible: !screen.isVisible },
                            })
                          }
                        >
                          {screen.isVisible ? "Ocultar" : "Mostrar"}
                        </Button>
                        {screen.type !== "SYSTEM" && (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="rounded-full"
                            disabled={deleteScreenMutation.isPending}
                            onClick={() => deleteScreenMutation.mutate(screen.id)}
                          >
                            Eliminar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                </ScrollPanel>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preferences">
          <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
            <Card className="rounded-[1.75rem]">
              <CardHeader>
                <CardTitle>Preferencia guiada</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  className="grid gap-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const value = parsePresetValue(
                      selectedPreference.kind,
                      preferenceValue || selectedPreference.defaultValue,
                    );
                    upsertPreferencesMutation.mutate(
                      [
                        {
                          namespace: preferencesNamespace,
                          key: selectedPreference.key,
                          value,
                        },
                      ],
                    );
                  }}
                >
                  <div className="grid gap-2">
                    <Label>Namespace</Label>
                    <div className="flex flex-wrap gap-2">
                      {preferenceNamespaces.map((namespace) => (
                        <Button
                          key={namespace}
                          type="button"
                          size="sm"
                          variant={
                            preferencesNamespace === namespace ? "default" : "outline"
                          }
                          className="rounded-full"
                          onClick={() => {
                            const nextPreset =
                              preferencePresetGroups[namespace]?.[0] ??
                              preferencePresetGroups.billing[0];
                            setPreferencesNamespace(namespace);
                            setPreferenceKey(nextPreset.key);
                            setPreferenceValue(nextPreset.defaultValue);
                          }}
                        >
                          {namespace}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Preferencia</Label>
                    <select
                      className="h-11 rounded-2xl border bg-white/70 px-3 text-sm"
                      value={selectedPreference.key}
                      onChange={(event) => {
                        const nextPreset =
                          activePreferencePresets.find(
                            (preset) => preset.key === event.target.value,
                          ) ?? activePreferencePresets[0];
                        setPreferenceKey(nextPreset.key);
                        setPreferenceValue(nextPreset.defaultValue);
                      }}
                    >
                      {activePreferencePresets.map((preset) => (
                        <option key={preset.key} value={preset.key}>
                          {preset.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-sm text-muted-foreground">
                      {selectedPreference.description}
                    </p>
                  </div>
                  <PreferenceValueControl
                    preset={selectedPreference}
                    value={preferenceValue || selectedPreference.defaultValue}
                    onChange={setPreferenceValue}
                  />
                  <Button
                    type="submit"
                    className="w-fit rounded-full"
                    disabled={upsertPreferencesMutation.isPending}
                  >
                    {upsertPreferencesMutation.isPending && (
                      <Loader2 className="animate-spin" />
                    )}
                    Guardar preferencia
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="rounded-[1.75rem]">
              <CardHeader>
                <CardTitle>Preferencias guardadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex flex-wrap gap-2">
                  {preferenceNamespaces.map((namespace) => (
                    <Button
                      key={namespace}
                      size="sm"
                      variant={
                        preferencesNamespace === namespace ? "default" : "outline"
                      }
                      className="rounded-full"
                      onClick={() => {
                        const nextPreset =
                          preferencePresetGroups[namespace]?.[0] ??
                          preferencePresetGroups.billing[0];
                        setPreferencesNamespace(namespace);
                        setPreferenceKey(nextPreset.key);
                        setPreferenceValue(nextPreset.defaultValue);
                      }}
                    >
                      {namespace}
                    </Button>
                  ))}
                </div>
                <ScrollPanel heightClassName="max-h-[56vh]">
                  {(preferences.data ?? []).map((setting) => (
                    <div key={setting.id} className="rounded-2xl border bg-white/60 p-4">
                      <p className="font-semibold">
                        {setting.namespace}.{setting.key}
                      </p>
                      <p className="mt-2 rounded-xl bg-muted px-3 py-2 text-sm">
                        {formatPreferenceValue(setting.value)}
                      </p>
                    </div>
                  ))}
                  {!preferences.isLoading && !preferences.data?.length && (
                    <p className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
                      No hay preferencias en este namespace.
                    </p>
                  )}
                </ScrollPanel>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}

function buildPreferencePresets({
  currency,
  modules,
  screens,
}: {
  currency: string;
  modules: { module: { key: string; name: string }; isEnabled: boolean }[];
  screens: { key: string; title: string; isVisible: boolean }[];
}): Record<string, PreferencePreset[]> {
  const enabledModuleOptions = modules
    .filter((item) => item.isEnabled)
    .map((item) => ({
      label: item.module.name,
      value: item.module.key,
    }));
  const visibleScreenOptions = screens
    .filter((screen) => screen.isVisible)
    .map((screen) => ({
      label: screen.title,
      value: screen.key,
    }));

  return {
    billing: [
      {
        key: "invoicePrefix",
        label: "Prefijo de factura",
        description: "Texto inicial para folios manuales de cobro.",
        kind: "text",
        defaultValue: "AGO",
      },
      {
        key: "defaultCurrency",
        label: "Moneda default",
        description: "Moneda sugerida en nuevos conceptos y cobros.",
        kind: "select",
        defaultValue: currency,
        options: ["NIO", "USD", currency].map((value) => ({
          label: value,
          value,
        })),
      },
      {
        key: "graceDays",
        label: "Dias de gracia",
        description: "Dias posteriores al vencimiento antes de marcar alerta.",
        kind: "number",
        defaultValue: "5",
      },
      {
        key: "autoMarkOverdue",
        label: "Marcar vencidos automaticamente",
        description: "Activa reglas operativas para cobros vencidos.",
        kind: "boolean",
        defaultValue: "true",
      },
    ],
    security: [
      {
        key: "requireStrongPasswords",
        label: "Contrasenas fuertes",
        description: "Exige contrasenas robustas para usuarios de la organizacion.",
        kind: "boolean",
        defaultValue: "true",
      },
      {
        key: "sessionTimeoutMinutes",
        label: "Tiempo de sesion",
        description: "Minutos sugeridos antes de renovar o cerrar sesion.",
        kind: "number",
        defaultValue: "60",
      },
    ],
    notifications: [
      {
        key: "paymentReminders",
        label: "Recordatorios de pago",
        description: "Habilita avisos operativos para cobros pendientes.",
        kind: "boolean",
        defaultValue: "true",
      },
      {
        key: "scheduleDigest",
        label: "Resumen de horarios",
        description: "Envia o muestra resumen de operaciones del dia.",
        kind: "boolean",
        defaultValue: "true",
      },
    ],
    operations: [
      {
        key: "defaultModule",
        label: "Modulo inicial",
        description: "Modulo preferido para abrir operaciones internas.",
        kind: "select",
        defaultValue: enabledModuleOptions[0]?.value ?? "users",
        options: enabledModuleOptions,
      },
      {
        key: "homeScreen",
        label: "Pantalla de inicio",
        description: "Pantalla visible del tenant usada como acceso principal.",
        kind: "select",
        defaultValue: visibleScreenOptions[0]?.value ?? "dashboard",
        options: visibleScreenOptions,
      },
    ],
  };
}

function parsePresetValue(kind: PreferencePreset["kind"], value: string) {
  if (kind === "boolean") return value === "true";
  if (kind === "number") return Number(value);
  return value;
}

function formatPreferenceValue(value: unknown) {
  if (typeof value === "boolean") return value ? "Activo" : "Inactivo";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

function PreferenceValueControl({
  preset,
  value,
  onChange,
}: {
  preset: PreferencePreset;
  value: string;
  onChange: (value: string) => void;
}) {
  if (preset.kind === "boolean") {
    return (
      <div className="grid gap-2">
        <Label>Valor</Label>
        <div className="flex gap-2">
          {[
            { label: "Activo", value: "true" },
            { label: "Inactivo", value: "false" },
          ].map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={value === option.value ? "default" : "outline"}
              className="rounded-full"
              onClick={() => onChange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  if (preset.kind === "select") {
    return (
      <div className="grid gap-2">
        <Label>Valor</Label>
        <select
          className="h-11 rounded-2xl border bg-white/70 px-3 text-sm"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {(preset.options ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <TextPreferenceField
      label="Valor"
      type={preset.kind === "number" ? "number" : "text"}
      value={value}
      onChange={onChange}
    />
  );
}

function TextPreferenceField({
  label,
  value,
  onChange,
  type,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type: string;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <Input
        type={type}
        className="h-11 rounded-2xl bg-white/70"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

type FieldProps = {
  id: string;
  label: string;
  register: UseFormRegisterReturn;
  error?: string;
};

function Field({ id, label, register, error }: FieldProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} className="h-11 rounded-2xl bg-white/70" {...register} />
      <FormError message={error} />
    </div>
  );
}

function ColorField({ id, label, register, error }: FieldProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="color"
        className="h-11 rounded-2xl bg-white/70 p-1"
        {...register}
      />
      <FormError message={error} />
    </div>
  );
}

type AssetUploadCardProps = {
  id: string;
  kind: "logo" | "icon";
  label: string;
  description: string;
  imageUrl?: string | null;
  isPending: boolean;
  onFileSelected: (file: File) => void;
};

function AssetUploadCard({
  id,
  kind,
  label,
  description,
  imageUrl,
  isPending,
  onFileSelected,
}: AssetUploadCardProps) {
  return (
    <div className="rounded-3xl border bg-white/60 p-4">
      <div className="flex items-center gap-3">
        <div
          className={
            "grid place-items-center overflow-hidden rounded-2xl bg-muted" +
            (kind === "logo" ? " h-16 w-24" : " size-16")
          }
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={label}
              className="h-full w-full object-contain p-1.5"
            />
          ) : (
            <ImagePlus className="size-6 text-muted-foreground" />
          )}
        </div>
        <div>
          <p className="font-semibold">{label}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      <Label
        htmlFor={id}
        className="mt-4 flex h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed bg-background/70 text-sm font-semibold transition-colors hover:bg-muted"
      >
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}
        {isPending ? "Subiendo..." : "Seleccionar y editar"}
      </Label>
      <Input
        id={id}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="sr-only"
        disabled={isPending}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFileSelected(file);
          event.target.value = "";
        }}
      />
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <section className="grid gap-6">
      <Skeleton className="h-48 rounded-[2rem]" />
      <div className="grid gap-6 xl:grid-cols-2">
        <Skeleton className="h-[520px] rounded-[1.75rem]" />
        <Skeleton className="h-[520px] rounded-[1.75rem]" />
      </div>
    </section>
  );
}
