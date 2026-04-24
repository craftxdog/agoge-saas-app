import {
  KeyRound,
  LockKeyhole,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  UsersRound,
} from "lucide-react";
import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { CursorPagination } from "@/shared/components/CursorPagination";
import { ScrollPanel } from "@/shared/components/ScrollPanel";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { useCursorPagination } from "@/shared/hooks/useCursorPagination";
import { useMembers } from "@/modules/users/hooks/useUsers";
import type { CreatePermission, Permission, Role } from "../schemas/rbac.schema";
import {
  useCreateRbacPermission,
  useCreateRbacRole,
  useDeleteRbacRole,
  useMemberRoles,
  useRbacAccessMatrix,
  useRbacPermissions,
  useRbacRoles,
  useReplaceMemberRoles,
  useReplaceRolePermissions,
  useUpdateRbacRole,
} from "../hooks/useRbac";

const roleDefaults = {
  key: "",
  name: "",
  description: "",
  isDefault: false,
};

const permissionDefaults = {
  key: "",
  name: "",
  description: "",
  moduleKey: "",
};

const withoutEmptyStrings = <T extends Record<string, unknown>>(payload: T) =>
  Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== ""),
  ) as Partial<T>;

export default function RbacPage() {
  const [activeTab, setActiveTab] = useState("roles");
  const [roleSearch, setRoleSearch] = useState("");
  const [roleModuleFilter, setRoleModuleFilter] = useState("");
  const [permissionModuleFilter, setPermissionModuleFilter] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [roleForm, setRoleForm] = useState(roleDefaults);
  const [permissionForm, setPermissionForm] = useState(permissionDefaults);
  const [selectedPermissionKeys, setSelectedPermissionKeys] = useState<string[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [memberRoleKeys, setMemberRoleKeys] = useState<string[]>([]);
  const rolesPagination = useCursorPagination(20);
  const debouncedRoleSearch = useDebouncedValue(roleSearch, 350);

  const roles = useRbacRoles({
    search: debouncedRoleSearch || undefined,
    cursor: rolesPagination.cursor,
    limit: rolesPagination.limit,
    sortBy: "name",
    sortDirection: "asc",
  }, {
    enabled: activeTab === "roles" || activeTab === "members",
  });
  const rolePermissions = useRbacPermissions({
    moduleKey: roleModuleFilter || undefined,
  }, {
    enabled: activeTab === "roles",
  });
  const permissionCatalog = useRbacPermissions({
    moduleKey: permissionModuleFilter || undefined,
  }, {
    enabled: activeTab === "permissions",
  });
  const matrix = useRbacAccessMatrix({
    enabled:
      activeTab === "roles" ||
      activeTab === "permissions" ||
      activeTab === "matrix",
  });
  const members = useMembers({
    limit: 80,
    status: "ACTIVE",
    sortBy: "createdAt",
    sortDirection: "desc",
  }, {
    enabled: activeTab === "members",
  });
  const memberRoles = useMemberRoles(selectedMemberId || undefined, {
    enabled: activeTab === "members",
  });
  const createPermission = useCreateRbacPermission();
  const createRole = useCreateRbacRole();
  const updateRole = useUpdateRbacRole();
  const replacePermissions = useReplaceRolePermissions();
  const deleteRole = useDeleteRbacRole();
  const replaceMemberRoles = useReplaceMemberRoles();

  const roleCatalog = matrix.data?.roles ?? roles.data?.items ?? [];
  const listedRoles = roles.data?.items ?? roleCatalog;
  const availableRolePermissions = rolePermissions.data ?? [];
  const availableCatalogPermissions = permissionCatalog.data ?? [];
  const isProtectedRole = Boolean(selectedRole?.isSystem);
  const moduleOptions = Array.from(
    new Map(
      (matrix.data?.modules ?? []).map((module) => [module.key, module]),
    ).values(),
  );

  const rolePermissionGroups = groupPermissionsByModule(availableRolePermissions);
  const catalogPermissionGroups =
    groupPermissionsByModule(availableCatalogPermissions);

  return (
    <section className="grid gap-8">
      <div className="rounded-[2rem] border bg-[linear-gradient(135deg,_rgba(79,143,131,0.16),_rgba(111,145,184,0.12))] p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
          Seguridad y acceso
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">
          Roles, permisos y matriz RBAC
        </h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Crea roles del tenant, asigna permisos por modulo y actualiza los roles
          de cada miembro sin escribir claves manualmente.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-6">
        <TabsList className="flex h-auto w-full flex-wrap justify-start rounded-2xl bg-muted/70 p-1">
          <TabsTrigger value="roles" className="rounded-xl px-4 py-2">
            Roles
          </TabsTrigger>
          <TabsTrigger value="permissions" className="rounded-xl px-4 py-2">
            Permisos
          </TabsTrigger>
          <TabsTrigger value="members" className="rounded-xl px-4 py-2">
            Roles por miembro
          </TabsTrigger>
          <TabsTrigger value="matrix" className="rounded-xl px-4 py-2">
            Matriz
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles">
          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <Card className="rounded-[1.75rem]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="size-5 text-primary" />
                  Crear o editar rol
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  className="grid gap-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const payload = {
                      ...withoutEmptyStrings(roleForm),
                      isDefault: roleForm.isDefault,
                    };

                    if (selectedRole) {
                      if (selectedRole.isSystem) return;

                      updateRole.mutate({
                        roleId: selectedRole.id,
                        data: {
                          name: roleForm.name,
                          description: roleForm.description,
                          isDefault: roleForm.isDefault,
                        },
                      });
                      replacePermissions.mutate({
                        roleId: selectedRole.id,
                        permissionKeys: selectedPermissionKeys,
                      });
                      return;
                    }

                    createRole.mutate({
                      key: roleForm.key,
                      name: roleForm.name,
                      description: payload.description as string | undefined,
                      isDefault: roleForm.isDefault,
                      permissionKeys: selectedPermissionKeys,
                    });
                  }}
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label>Key del rol</Label>
                      <Input
                        disabled={Boolean(selectedRole)}
                        className="h-11 rounded-2xl bg-white/70"
                        placeholder="front-desk"
                        value={roleForm.key}
                        onChange={(event) =>
                          setRoleForm((current) => ({
                            ...current,
                            key: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Nombre</Label>
                      <Input
                        disabled={isProtectedRole}
                        className="h-11 rounded-2xl bg-white/70"
                        placeholder="Front Desk"
                        value={roleForm.name}
                        onChange={(event) =>
                          setRoleForm((current) => ({
                            ...current,
                            name: event.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Descripcion</Label>
                    <Textarea
                      disabled={isProtectedRole}
                      className="min-h-24 rounded-2xl bg-white/70"
                      placeholder="Que puede hacer este rol..."
                      value={roleForm.description}
                      onChange={(event) =>
                        setRoleForm((current) => ({
                          ...current,
                          description: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <label className="flex items-center gap-3 rounded-2xl border bg-white/60 p-3 text-sm">
                    <input
                      type="checkbox"
                      checked={roleForm.isDefault}
                      disabled={isProtectedRole}
                      onChange={(event) =>
                        setRoleForm((current) => ({
                          ...current,
                          isDefault: event.target.checked,
                        }))
                      }
                    />
                    Usar como rol default para nuevos miembros
                  </label>

                  <PermissionPicker
                    moduleFilter={roleModuleFilter}
                    moduleOptions={moduleOptions}
                    groups={rolePermissionGroups}
                    selectedPermissionKeys={selectedPermissionKeys}
                    disabled={isProtectedRole}
                    onModuleFilterChange={setRoleModuleFilter}
                    onTogglePermission={(permissionKey) =>
                      setSelectedPermissionKeys((current) =>
                        current.includes(permissionKey)
                          ? current.filter((key) => key !== permissionKey)
                          : [...current, permissionKey],
                      )
                    }
                  />

                  {isProtectedRole && (
                    <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50/90 p-4 text-sm text-amber-900">
                      Este rol es de sistema y la API lo protege. Puedes revisarlo,
                      pero no editar su nombre, permisos ni eliminarlo.
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="submit"
                      className="rounded-full"
                      disabled={
                        isProtectedRole ||
                        createRole.isPending ||
                        updateRole.isPending ||
                        replacePermissions.isPending
                      }
                    >
                      {selectedRole
                        ? isProtectedRole
                          ? "Rol protegido"
                          : "Guardar rol"
                        : "Crear rol"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => {
                        setSelectedRole(null);
                        setRoleForm(roleDefaults);
                        setSelectedPermissionKeys([]);
                      }}
                    >
                      Nuevo
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="rounded-[1.75rem]">
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <KeyRound className="size-5 text-primary" />
                      Roles del tenant
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {roles.data?.pagination?.count ?? 0} roles disponibles
                    </p>
                  </div>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="h-11 rounded-full bg-white/70 pl-9"
                      placeholder="Buscar rol..."
                      value={roleSearch}
                      onChange={(event) => {
                        setRoleSearch(event.target.value);
                        rolesPagination.reset();
                      }}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3">
                <ScrollPanel>
                {roles.isLoading
                  ? Array.from({ length: 5 }).map((_, index) => (
                      <RoleCardSkeleton key={index} />
                    ))
                  : listedRoles.map((role) => (
                      <div key={role.id} className="rounded-2xl border bg-white/60 p-4">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold">{role.name}</h3>
                              <Badge variant="outline" className="rounded-full">
                                {role.key}
                              </Badge>
                              {role.isSystem && (
                                <Badge className="rounded-full">Sistema</Badge>
                              )}
                              {role.isDefault && (
                                <Badge variant="secondary" className="rounded-full">
                                  Default
                                </Badge>
                              )}
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">
                              {role.description ?? "Sin descripcion"} · {role.memberCount} miembros
                            </p>
                            <div className="mt-3 flex flex-wrap gap-1">
                              {role.permissions.slice(0, 8).map((permission) => (
                                <Badge
                                  key={permission.key}
                                  variant="outline"
                                  className="rounded-full"
                                >
                                  {permission.key}
                                </Badge>
                              ))}
                              {role.permissions.length > 8 && (
                                <Badge variant="outline" className="rounded-full">
                                  +{role.permissions.length - 8}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-full"
                              onClick={() => {
                                setSelectedRole(role);
                                setRoleForm({
                                  key: role.key,
                                  name: role.name,
                                  description: role.description ?? "",
                                  isDefault: role.isDefault,
                                });
                                setSelectedPermissionKeys(
                                  role.permissions.map((permission) => permission.key),
                                );
                              }}
                            >
                              {role.isSystem ? "Ver" : "Editar"}
                            </Button>
                            {!role.isSystem && (
                              <Button
                                size="sm"
                                variant="destructive"
                                className="rounded-full"
                                disabled={deleteRole.isPending || role.memberCount > 0}
                                onClick={() => deleteRole.mutate(role.id)}
                              >
                                Eliminar
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </ScrollPanel>

                <CursorPagination
                  meta={roles.data?.pagination}
                  limit={rolesPagination.limit}
                  itemLabel="roles"
                  hasPreviousCursor={rolesPagination.hasPreviousCursor}
                  onPrevious={rolesPagination.goPrevious}
                  onNext={() => rolesPagination.goNext(roles.data?.pagination?.nextCursor)}
                  onLimitChange={rolesPagination.updateLimit}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="permissions">
          <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
            <Card className="rounded-[1.75rem]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="size-5 text-primary" />
                  Crear permiso global
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  className="grid gap-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    createPermission.mutate(
                      withoutEmptyStrings(permissionForm) as CreatePermission,
                      {
                        onSuccess: () => setPermissionForm(permissionDefaults),
                      },
                    );
                  }}
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label>Key del permiso</Label>
                      <Input
                        className="h-11 rounded-2xl bg-white/70"
                        placeholder="schedules.write"
                        value={permissionForm.key}
                        onChange={(event) =>
                          setPermissionForm((current) => ({
                            ...current,
                            key: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Nombre</Label>
                      <Input
                        className="h-11 rounded-2xl bg-white/70"
                        placeholder="Write schedules"
                        value={permissionForm.name}
                        onChange={(event) =>
                          setPermissionForm((current) => ({
                            ...current,
                            name: event.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label>Modulo</Label>
                    <select
                      className="h-11 rounded-2xl border bg-white/70 px-3 text-sm"
                      value={permissionForm.moduleKey}
                      onChange={(event) =>
                        setPermissionForm((current) => ({
                          ...current,
                          moduleKey: event.target.value,
                        }))
                      }
                    >
                      <option value="">Sin modulo</option>
                      {moduleOptions.map((module) => (
                        <option key={module.key} value={module.key}>
                          {module.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-2">
                    <Label>Descripcion</Label>
                    <Textarea
                      className="min-h-24 rounded-2xl bg-white/70"
                      placeholder="Describe que habilita este permiso..."
                      value={permissionForm.description}
                      onChange={(event) =>
                        setPermissionForm((current) => ({
                          ...current,
                          description: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50/80 p-4 text-sm text-emerald-900">
                    La API registra el permiso en el catalogo global y lo replica
                    al rol admin de sistema para mantener acceso total del tenant.
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="submit"
                      className="rounded-full"
                      disabled={createPermission.isPending}
                    >
                      Crear permiso
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => setPermissionForm(permissionDefaults)}
                    >
                      Limpiar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="rounded-[1.75rem]">
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <KeyRound className="size-5 text-primary" />
                      Catalogo de permisos
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {availableCatalogPermissions.length} permisos en esta vista
                    </p>
                  </div>
                  <select
                    className="h-11 rounded-full border bg-white/70 px-4 text-sm"
                    value={permissionModuleFilter}
                    onChange={(event) => setPermissionModuleFilter(event.target.value)}
                  >
                    <option value="">Todos los modulos</option>
                    {moduleOptions.map((module) => (
                      <option key={module.key} value={module.key}>
                        {module.name}
                      </option>
                    ))}
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollPanel>
                  <div className="grid gap-4">
                    {permissionCatalog.isLoading
                      ? Array.from({ length: 5 }).map((_, index) => (
                          <RoleCardSkeleton key={index} />
                        ))
                      : Object.entries(catalogPermissionGroups).map(
                          ([moduleKey, permissions]) => (
                            <div
                              key={moduleKey}
                              className="rounded-2xl border bg-white/60 p-4"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                    {permissions[0]?.module?.name ?? moduleKey}
                                  </p>
                                  <p className="mt-1 text-sm text-muted-foreground">
                                    {permissions.length} permisos
                                  </p>
                                </div>
                                <Badge variant="outline" className="rounded-full">
                                  {moduleKey}
                                </Badge>
                              </div>

                              <div className="mt-4 grid gap-3">
                                {permissions.map((permission) => (
                                  <div
                                    key={permission.id}
                                    className="rounded-2xl border bg-background/80 p-4"
                                  >
                                    <div className="flex flex-wrap items-center gap-2">
                                      <p className="font-semibold">{permission.name}</p>
                                      <Badge variant="outline" className="rounded-full">
                                        {permission.key}
                                      </Badge>
                                    </div>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                      {permission.description ?? "Sin descripcion"}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ),
                        )}

                    {!permissionCatalog.isLoading &&
                      availableCatalogPermissions.length === 0 && (
                        <p className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
                          No hay permisos para este filtro.
                        </p>
                      )}
                  </div>
                </ScrollPanel>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="members">
          <Card className="rounded-[1.75rem]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UsersRound className="size-5 text-primary" />
                Asignar roles a miembros
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5">
              <div className="grid gap-2">
                <Label>Miembro</Label>
                <select
                  className="h-11 rounded-2xl border bg-white/70 px-3 text-sm"
                  value={selectedMemberId}
                  onChange={(event) => {
                    const nextMemberId = event.target.value;
                    const nextMember = (members.data?.items ?? []).find(
                      (member) => member.id === nextMemberId,
                    );
                    setSelectedMemberId(nextMemberId);
                    setMemberRoleKeys(
                      nextMember?.roles.map((role) => role.key) ?? [],
                    );
                  }}
                >
                  <option value="">Selecciona un miembro</option>
                  {(members.data?.items ?? []).map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.user.firstName} {member.user.lastName} · {member.user.email}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-fit rounded-full"
                disabled={!memberRoles.data}
                onClick={() =>
                  setMemberRoleKeys(
                    memberRoles.data?.roles.map((role) => role.key) ?? [],
                  )
                }
              >
                Cargar roles actuales desde API
              </Button>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {roleCatalog.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    className={`rounded-2xl border p-4 text-left transition ${
                      memberRoleKeys.includes(role.key)
                        ? "border-primary bg-primary/10"
                        : "bg-white/60 hover:bg-muted/70"
                    }`}
                    onClick={() =>
                      setMemberRoleKeys((current) =>
                        current.includes(role.key)
                          ? current.filter((key) => key !== role.key)
                          : [...current, role.key],
                      )
                    }
                  >
                    <p className="font-semibold">{role.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{role.key}</p>
                  </button>
                ))}
              </div>

              <Button
                className="w-fit rounded-full"
                disabled={!selectedMemberId || memberRoleKeys.length === 0 || replaceMemberRoles.isPending}
                onClick={() =>
                  replaceMemberRoles.mutate({
                    memberId: selectedMemberId,
                    roleKeys: memberRoleKeys,
                  })
                }
              >
                Guardar roles del miembro
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matrix">
          <div className="grid gap-4">
            {matrix.isLoading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-36 rounded-2xl" />
                ))
              : (matrix.data?.modules ?? []).map((module) => (
                  <Card key={module.key} className="rounded-[1.5rem]">
                    <CardContent className="p-5">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <LockKeyhole className="size-5 text-primary" />
                            <h3 className="font-semibold">{module.name}</h3>
                            <Badge
                              variant={module.isEnabled ? "default" : "outline"}
                              className="rounded-full"
                            >
                              {module.isEnabled ? "Activo" : "Inactivo"}
                            </Badge>
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {module.permissions.length} permisos · {module.screens.length} pantallas
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1 md:max-w-xl md:justify-end">
                          {module.permissions.map((permission) => (
                            <Badge
                              key={permission.key}
                              variant="outline"
                              className="rounded-full"
                            >
                              {permission.key}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}

function groupPermissionsByModule(permissions: Permission[]) {
  return permissions.reduce<Record<string, Permission[]>>((groups, permission) => {
    const moduleKey = permission.module?.key ?? "general";
    groups[moduleKey] = [...(groups[moduleKey] ?? []), permission];
    return groups;
  }, {});
}

function RoleCardSkeleton() {
  return (
    <div className="rounded-2xl border bg-white/60 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-5 w-40 rounded-full" />
          <Skeleton className="h-4 w-72 max-w-full rounded-full" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-7 w-24 rounded-full" />
            <Skeleton className="h-7 w-20 rounded-full" />
            <Skeleton className="h-7 w-28 rounded-full" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
}

type PermissionPickerProps = {
  moduleFilter: string;
  moduleOptions: { key: string; name: string }[];
  groups: Record<
    string,
    {
      key: string;
      name: string;
      description?: string | null;
      module?: { key: string; name: string } | null;
    }[]
  >;
  selectedPermissionKeys: string[];
  disabled?: boolean;
  onModuleFilterChange: (moduleKey: string) => void;
  onTogglePermission: (permissionKey: string) => void;
};

function PermissionPicker({
  moduleFilter,
  moduleOptions,
  groups,
  selectedPermissionKeys,
  disabled = false,
  onModuleFilterChange,
  onTogglePermission,
}: PermissionPickerProps) {
  return (
    <div className="rounded-3xl border bg-white/50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="flex items-center gap-2 font-semibold">
            <SlidersHorizontal className="size-4 text-primary" />
            Permisos
          </p>
          <p className="text-sm text-muted-foreground">
            Selecciona permisos desde el catalogo real de la API.
          </p>
        </div>
        <select
          disabled={disabled}
          className="h-10 rounded-full border bg-background px-3 text-sm"
          value={moduleFilter}
          onChange={(event) => onModuleFilterChange(event.target.value)}
        >
          <option value="">Todos los modulos</option>
          {moduleOptions.map((module) => (
            <option key={module.key} value={module.key}>
              {module.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 grid gap-4">
        {Object.entries(groups).map(([moduleKey, permissions]) => (
          <div key={moduleKey}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {permissions[0]?.module?.name ?? moduleKey}
            </p>
            <div className="flex flex-wrap gap-2">
              {permissions.map((permission) => {
                const selected = selectedPermissionKeys.includes(permission.key);
                return (
                  <button
                    key={permission.key}
                    type="button"
                    disabled={disabled}
                    className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "bg-background hover:bg-muted"
                    }`}
                    onClick={() => onTogglePermission(permission.key)}
                    title={permission.description ?? permission.name}
                  >
                    {permission.key}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
