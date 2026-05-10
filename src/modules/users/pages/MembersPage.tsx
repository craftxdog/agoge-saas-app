import { zodResolver } from "@hookform/resolvers/zod";
import {
  MailPlus,
  Search,
  ShieldCheck,
  UserPlus,
  UsersRound,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { UseFormRegisterReturn } from "react-hook-form";
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
import { CursorPagination } from "@/shared/components/CursorPagination";
import { ScrollPanel } from "@/shared/components/ScrollPanel";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { useCursorPagination } from "@/shared/hooks/useCursorPagination";
import { usersPermissionPolicy } from "@/shared/auth/permission-policy";
import { useEndpointAccess } from "@/shared/hooks/useEndpointAccess";
import { useRbacRoles } from "@/modules/rbac/hooks/useRbac";
import {
  createInvitationSchema,
  createMemberSchema,
  type CreateInvitation,
  type CreateInvitationForm,
  type CreateMemberForm,
  type CreateMemberPayload,
  type InvitationStatus,
  type Member,
  type MemberStatus,
  type UpdateMember,
} from "../schemas/users.schema";
import {
  useCreateInvitation,
  useCreateMember,
  useMember,
  useInvitations,
  useMembers,
  useRemoveMember,
  useRevokeInvitation,
  useUpdateMember,
  useUpdateMemberStatus,
} from "../hooks/useUsers";

const memberStatuses = ["ACTIVE", "INVITED", "SUSPENDED", "REMOVED"] as const;
const invitationStatuses = ["PENDING", "ACCEPTED", "EXPIRED", "REVOKED"] as const;

const withoutEmptyStrings = <T extends Record<string, unknown>>(payload: T) =>
  Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== ""),
  ) as Partial<T>;

export default function MembersPage() {
  const endpointAccess = useEndpointAccess();
  const canCreateMember = endpointAccess.can({
    method: "POST",
    path: "/users/members",
    fallbackPermissions: usersPermissionPolicy.createMember,
  });
  const canUpdateMember = endpointAccess.can({
    method: "PATCH",
    path: "/users/members/:memberId",
    fallbackPermissions: usersPermissionPolicy.updateMember,
  });
  const canChangeMemberStatus = endpointAccess.can({
    method: "PATCH",
    path: "/users/members/:memberId/status",
    fallbackPermissions: usersPermissionPolicy.changeStatus,
  });
  const canRemoveMember = endpointAccess.can({
    method: "DELETE",
    path: "/users/members/:memberId",
    fallbackPermissions: usersPermissionPolicy.removeMember,
  });
  const canCreateInvitation = endpointAccess.can({
    method: "POST",
    path: "/users/invitations",
    fallbackPermissions: usersPermissionPolicy.createInvitation,
  });
  const canRevokeInvitation = endpointAccess.can({
    method: "POST",
    path: "/users/invitations/:invitationId/revoke",
    fallbackPermissions: usersPermissionPolicy.revokeInvitation,
  });
  const [activeTab, setActiveTab] = useState("members");
  const visibleActiveTab =
    activeTab === "create" && !canCreateMember ? "members" : activeTab;
  const [memberSearch, setMemberSearch] = useState("");
  const [memberStatus, setMemberStatus] = useState<MemberStatus | undefined>();
  const [invitationStatus, setInvitationStatus] = useState<
    InvitationStatus | undefined
  >();
  const [lastInvitationToken, setLastInvitationToken] = useState<string | null>(
    null,
  );
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedCreateRoleKeys, setSelectedCreateRoleKeys] = useState<string[]>([
    "customer",
  ]);
  const membersPagination = useCursorPagination(20);
  const invitationsPagination = useCursorPagination(20);
  const debouncedMemberSearch = useDebouncedValue(memberSearch, 350);

  const members = useMembers({
    search: debouncedMemberSearch || undefined,
    status: memberStatus,
    cursor: membersPagination.cursor,
    limit: membersPagination.limit,
    sortBy: "createdAt",
    sortDirection: "desc",
  }, {
    enabled: visibleActiveTab === "members",
  });
  const invitations = useInvitations({
    status: invitationStatus,
    cursor: invitationsPagination.cursor,
    limit: invitationsPagination.limit,
    sortDirection: "desc",
  }, {
    enabled: visibleActiveTab === "invitations",
  });
  const roles = useRbacRoles({
    limit: 100,
    sortBy: "name",
    sortDirection: "asc",
  }, {
    enabled: canCreateMember && visibleActiveTab === "create",
  });
  const createMember = useCreateMember();
  const updateMember = useUpdateMember();
  const updateStatus = useUpdateMemberStatus();
  const removeMember = useRemoveMember();
  const createInvitation = useCreateInvitation();
  const revokeInvitation = useRevokeInvitation();
  const memberDetail = useMember(selectedMember?.id, {
    enabled: Boolean(selectedMember),
  });
  const availableRoles = roles.data?.items ?? [];
  const suggestedRole =
    availableRoles.find((role) => role.key === "customer") ??
    availableRoles.find((role) => role.isDefault) ??
    null;

  const memberForm = useForm<CreateMemberForm>({
    resolver: zodResolver(createMemberSchema),
    defaultValues: {
      email: "",
      username: "",
      firstName: "",
      lastName: "",
      password: "",
      phone: "",
      documentId: "",
      address: "",
      roleKeysText: "customer",
    },
  });

  const invitationForm = useForm<CreateInvitationForm, unknown, CreateInvitation>({
    resolver: zodResolver(createInvitationSchema),
    defaultValues: {
      email: "",
      expiresInDays: 7,
    },
  });

  const updateMemberForm = useForm<UpdateMember>({
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      documentId: "",
      address: "",
    },
  });

  return (
    <section className="grid gap-8">
      <div className="rounded-[2rem] border bg-[linear-gradient(135deg,_rgba(79,143,131,0.16),_rgba(217,154,95,0.12))] p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
          Directorio del tenant
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">
          Miembros e invitaciones
        </h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Administra usuarios, perfiles de membresia, roles iniciales e
          invitaciones usando los endpoints reales de la API.
        </p>
      </div>

      <Tabs value={visibleActiveTab} onValueChange={setActiveTab} className="gap-6">
        <TabsList className="flex h-auto w-full flex-wrap justify-start rounded-2xl bg-muted/70 p-1">
          <TabsTrigger value="members" className="rounded-xl px-4 py-2">
            Miembros
          </TabsTrigger>
          {canCreateMember ? (
            <TabsTrigger value="create" className="rounded-xl px-4 py-2">
              Crear miembro
            </TabsTrigger>
          ) : null}
          <TabsTrigger value="invitations" className="rounded-xl px-4 py-2">
            Invitaciones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <Card className="rounded-[1.75rem]">
            <CardHeader>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <UsersRound className="size-5 text-primary" />
                    Miembros
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {members.data?.pagination?.count ?? 0} activos encontrados
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="h-11 rounded-full bg-white/70 pl-9"
                      placeholder="Buscar miembro..."
                      value={memberSearch}
                      onChange={(event) => {
                        setMemberSearch(event.target.value);
                        membersPagination.reset();
                      }}
                    />
                  </div>
                  <select
                    className="h-11 rounded-full border bg-white/70 px-4 text-sm"
                    value={memberStatus ?? ""}
                    onChange={(event) =>
                      {
                        setMemberStatus(
                          event.target.value
                            ? (event.target.value as MemberStatus)
                            : undefined,
                        );
                        membersPagination.reset();
                      }
                    }
                  >
                    <option value="">Todos</option>
                    {memberStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3">
              {selectedMember && canUpdateMember && (
                <div className="mb-3 rounded-[1.5rem] border bg-muted/45 p-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-primary">
                        Editando miembro
                      </p>
                      <h3 className="text-lg font-semibold">
                        {(memberDetail.data ?? selectedMember).user.email}
                      </h3>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-fit rounded-full"
                      onClick={() => setSelectedMember(null)}
                    >
                      Cancelar
                    </Button>
                  </div>
                  <form
                    className="mt-5 grid gap-4 md:grid-cols-2"
                    onSubmit={updateMemberForm.handleSubmit((data) => {
                      const sanitizedPayload: UpdateMember = {
                        firstName: data.firstName,
                        lastName: data.lastName,
                        ...withoutEmptyStrings({
                          phone: data.phone,
                          documentId: data.documentId,
                          address: data.address,
                        }),
                      };

                      updateMember.mutate(
                        {
                          memberId: selectedMember.id,
                          data: sanitizedPayload,
                        },
                        { onSuccess: () => setSelectedMember(null) },
                      );
                    })}
                  >
                    {memberDetail.isLoading && (
                      <div className="md:col-span-2">
                        <Skeleton className="h-16 rounded-2xl" />
                      </div>
                    )}
                    <MemberField
                      label="Nombre"
                      register={updateMemberForm.register("firstName")}
                    />
                    <MemberField
                      label="Apellido"
                      register={updateMemberForm.register("lastName")}
                    />
                    <MemberField
                      label="Telefono"
                      register={updateMemberForm.register("phone")}
                    />
                    <MemberField
                      label="Documento"
                      register={updateMemberForm.register("documentId")}
                    />
                    <div className="md:col-span-2">
                      <MemberField
                        label="Direccion"
                        register={updateMemberForm.register("address")}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-fit rounded-full md:col-span-2"
                      disabled={updateMember.isPending}
                    >
                      Guardar cambios
                    </Button>
                  </form>
                </div>
              )}

              <ScrollPanel>
                {members.isLoading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <MemberCardSkeleton key={index} />
                  ))
                ) : (
                  <>
                    {(members.data?.items ?? []).map((member) => (
                      <div key={member.id} className="rounded-2xl border bg-white/60 p-4">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold">
                                {member.user.firstName} {member.user.lastName}
                              </h3>
                              <Badge className="rounded-full">{member.status}</Badge>
                              {member.roles.map((role) => (
                                <Badge
                                  key={role.key}
                                  variant="outline"
                                  className="rounded-full"
                                >
                                  {role.name}
                                </Badge>
                              ))}
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {member.user.email} · {member.phone ?? "Sin telefono"} ·{" "}
                              {member.documentId ?? "Sin documento"}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Joined:{" "}
                              {member.joinedAt
                                ? new Intl.DateTimeFormat("es-NI", {
                                    dateStyle: "medium",
                                  }).format(new Date(member.joinedAt))
                                : "Sin fecha"}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {canUpdateMember ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-full"
                                onClick={() => {
                                  setSelectedMember(member);
                                  updateMemberForm.reset({
                                    firstName: member.user.firstName,
                                    lastName: member.user.lastName,
                                    phone: member.phone ?? "",
                                    documentId: member.documentId ?? "",
                                    address: member.address ?? "",
                                  });
                                }}
                              >
                                Editar
                              </Button>
                            ) : null}
                            {canChangeMemberStatus && member.status === "ACTIVE" ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-full"
                                disabled={updateStatus.isPending}
                                onClick={() =>
                                  updateStatus.mutate({
                                    memberId: member.id,
                                    status: "SUSPENDED",
                                  })
                                }
                              >
                                Suspender
                              </Button>
                            ) : null}
                            {canChangeMemberStatus && member.status !== "ACTIVE" ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-full"
                                disabled={updateStatus.isPending}
                                onClick={() =>
                                  updateStatus.mutate({
                                    memberId: member.id,
                                    status: "ACTIVE",
                                  })
                                }
                              >
                                Activar
                              </Button>
                            ) : null}
                            {canRemoveMember ? (
                              <Button
                                size="sm"
                                variant="destructive"
                                className="rounded-full"
                                disabled={removeMember.isPending}
                                onClick={() =>
                                  removeMember.mutate(member.id, {
                                    onSuccess: () => {
                                      if (selectedMember?.id === member.id) {
                                        setSelectedMember(null);
                                      }
                                    },
                                  })
                                }
                              >
                                Remover
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ))}
                    {!members.data?.items.length && (
                      <EmptyState text="No hay miembros con esos filtros." />
                    )}
                  </>
                )}
              </ScrollPanel>

              <CursorPagination
                meta={members.data?.pagination}
                limit={membersPagination.limit}
                itemLabel="miembros"
                hasPreviousCursor={membersPagination.hasPreviousCursor}
                onPrevious={membersPagination.goPrevious}
                onNext={() =>
                  membersPagination.goNext(members.data?.pagination?.nextCursor)
                }
                onLimitChange={membersPagination.updateLimit}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create">
          <Card className="rounded-[1.75rem]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="size-5 text-primary" />
                Crear o agregar miembro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="grid gap-4 md:grid-cols-2"
                onSubmit={memberForm.handleSubmit((data) => {
                  const { roleKeysText, ...payload } = data;
                  void roleKeysText;
                  const sanitizedPayload: CreateMemberPayload = {
                    ...(withoutEmptyStrings(payload) as Omit<
                      CreateMemberForm,
                      "roleKeysText"
                    >),
                    ...(selectedCreateRoleKeys.length
                      ? { roleKeys: selectedCreateRoleKeys }
                      : {}),
                  };
                  createMember.mutate(
                    sanitizedPayload,
                    {
                      onSuccess: () => {
                        memberForm.reset();
                        setSelectedCreateRoleKeys(
                          suggestedRole ? [suggestedRole.key] : ["customer"],
                        );
                      },
                    },
                  );
                })}
              >
                <MemberField label="Correo electronico" register={memberForm.register("email")} />
                <MemberField
                  label="Usuario"
                  register={memberForm.register("username")}
                />
                <MemberField
                  label="Nombre"
                  register={memberForm.register("firstName")}
                />
                <MemberField
                  label="Apellido"
                  register={memberForm.register("lastName")}
                />
                <MemberField
                  label="Contrasena"
                  type="password"
                  register={memberForm.register("password")}
                />
                <MemberField label="Telefono" register={memberForm.register("phone")} />
                <MemberField
                  label="Documento"
                  register={memberForm.register("documentId")}
                />
                <MemberField label="Direccion" register={memberForm.register("address")} />
                <div className="grid gap-2 md:col-span-2">
                  <Label>Roles iniciales</Label>
                  {roles.isLoading ? (
                    <div className="grid gap-2 md:grid-cols-2">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <Skeleton key={index} className="h-20 rounded-2xl" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid gap-3 md:grid-cols-2">
                      {availableRoles.map((role) => {
                        const isSelected = selectedCreateRoleKeys.includes(role.key);

                        return (
                          <button
                            key={role.id}
                            type="button"
                            className={`rounded-[1.25rem] border p-4 text-left transition ${
                              isSelected
                                ? "border-primary bg-primary/10"
                                : "bg-white/60 hover:bg-muted/70"
                            }`}
                            onClick={() =>
                              setSelectedCreateRoleKeys((current) =>
                                current.includes(role.key)
                                  ? current.filter((key) => key !== role.key)
                                  : [...current, role.key],
                              )
                            }
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold">{role.name}</p>
                              {role.isDefault && (
                                <Badge variant="secondary" className="rounded-full">
                                  Default
                                </Badge>
                              )}
                              {role.isSystem && (
                                <Badge variant="outline" className="rounded-full">
                                  Sistema
                                </Badge>
                              )}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {role.key}
                            </p>
                            <p className="mt-2 text-sm text-muted-foreground">
                              {role.description ?? "Sin descripcion"}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Selecciona uno o varios roles. Si no eliges ninguno, la API puede
                    usar el rol default del tenant.
                  </p>
                </div>
                <div className="md:col-span-2">
                  <Button
                    type="submit"
                    className="rounded-full"
                    disabled={createMember.isPending}
                  >
                    <ShieldCheck className="size-4" />
                    Crear miembro
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invitations">
          <div className={canCreateInvitation ? "grid gap-6 xl:grid-cols-[0.75fr_1.25fr]" : "grid gap-6"}>
            {canCreateInvitation ? (
              <Card className="rounded-[1.75rem]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MailPlus className="size-5 text-primary" />
                    Nueva invitacion
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form
                    className="grid gap-4"
                    onSubmit={invitationForm.handleSubmit((data) =>
                      createInvitation.mutate(data, {
                        onSuccess: (res) => {
                          setLastInvitationToken(res.data.token);
                          invitationForm.reset();
                        },
                      }),
                    )}
                  >
                    <MemberField
                      label="Email"
                      register={invitationForm.register("email")}
                    />
                    <MemberField
                      label="Expira en dias"
                      type="number"
                      register={invitationForm.register("expiresInDays")}
                    />
                    <Button
                      type="submit"
                      className="w-fit rounded-full"
                      disabled={createInvitation.isPending}
                    >
                      Crear invitacion
                    </Button>
                  </form>
                  {lastInvitationToken && (
                    <div className="mt-5 rounded-2xl border bg-muted/60 p-4">
                      <p className="text-sm font-semibold">Token generado</p>
                      <p className="mt-2 break-all rounded-xl bg-background p-3 text-xs">
                        {lastInvitationToken}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : null}

            <Card className="rounded-[1.75rem]">
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <CardTitle>Invitaciones</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {invitations.data?.pagination?.count ?? 0} registradas
                    </p>
                  </div>
                  <select
                    className="h-11 rounded-full border bg-white/70 px-4 text-sm"
                    value={invitationStatus ?? ""}
                    onChange={(event) =>
                      {
                        setInvitationStatus(
                          event.target.value
                            ? (event.target.value as InvitationStatus)
                            : undefined,
                        );
                        invitationsPagination.reset();
                      }
                    }
                  >
                    <option value="">Todas</option>
                    {invitationStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3">
                <ScrollPanel heightClassName="max-h-[48vh]">
                  {invitations.isLoading
                    ? Array.from({ length: 4 }).map((_, index) => (
                        <InvitationCardSkeleton key={index} />
                      ))
                    : null}
                  {(invitations.isLoading ? [] : invitations.data?.items ?? []).map((invitation) => (
                    <div key={invitation.id} className="rounded-2xl border bg-white/60 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{invitation.email}</p>
                            <Badge variant="outline" className="rounded-full">
                              {invitation.status}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Expira:{" "}
                            {new Intl.DateTimeFormat("es-NI", {
                              dateStyle: "medium",
                            }).format(new Date(invitation.expiresAt))}
                          </p>
                        </div>
                        {canRevokeInvitation && invitation.status === "PENDING" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full"
                            disabled={revokeInvitation.isPending}
                            onClick={() => revokeInvitation.mutate(invitation.id)}
                          >
                            Revocar
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {!invitations.isLoading && !invitations.data?.items.length && (
                    <EmptyState text="No hay invitaciones con esos filtros." />
                  )}
                </ScrollPanel>

                <CursorPagination
                  meta={invitations.data?.pagination}
                  limit={invitationsPagination.limit}
                  itemLabel="invitaciones"
                  hasPreviousCursor={invitationsPagination.hasPreviousCursor}
                  onPrevious={invitationsPagination.goPrevious}
                  onNext={() =>
                    invitationsPagination.goNext(
                      invitations.data?.pagination?.nextCursor,
                    )
                  }
                  onLimitChange={invitationsPagination.updateLimit}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}

function MemberField({
  label,
  register,
  type = "text",
}: {
  label: string;
  register: UseFormRegisterReturn;
  type?: string;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <Input type={type} className="h-11 rounded-2xl bg-white/70" {...register} />
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}

function MemberCardSkeleton() {
  return (
    <div className="rounded-2xl border bg-white/60 p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-5 w-48 rounded-full" />
          <Skeleton className="h-4 w-80 max-w-full rounded-full" />
          <Skeleton className="h-4 w-32 rounded-full" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-9 w-20 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
}

function InvitationCardSkeleton() {
  return (
    <div className="rounded-2xl border bg-white/60 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-5 w-56 rounded-full" />
          <Skeleton className="h-4 w-36 rounded-full" />
        </div>
        <Skeleton className="h-9 w-24 rounded-full" />
      </div>
    </div>
  );
}
