import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  acceptInvitationResponseSchema,
  createdInvitationSchema,
  invitationSchema,
  memberSchema,
  type AcceptInvitation,
  type CreateInvitation,
  type CreateMemberPayload,
  type InvitationQuery,
  type MemberQuery,
  type MemberStatus,
  type UpdateMember,
} from "../schemas/users.schema";
import { usersService } from "../services/users.service";

export const usersKeys = {
  all: ["users"] as const,
  members: (query?: MemberQuery) => [...usersKeys.all, "members", query] as const,
  member: (memberId?: string) => [...usersKeys.all, "member", memberId] as const,
  invitations: (query?: InvitationQuery) =>
    [...usersKeys.all, "invitations", query] as const,
};

const invalidateUserRelatedQueries = async (
  queryClient: ReturnType<typeof useQueryClient>,
) => {
  await queryClient.invalidateQueries({ queryKey: usersKeys.all });
  await queryClient.invalidateQueries({ queryKey: ["analytics"] });
};

export const useMembers = (
  query?: MemberQuery,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: usersKeys.members(query),
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      const res = await usersService.listMembers(query);
      return {
        items: memberSchema.array().parse(res.data),
        pagination: res.meta.pagination,
      };
    },
    staleTime: 1000 * 60 * 3,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

export const useInvitations = (
  query?: InvitationQuery,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: usersKeys.invitations(query),
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      const res = await usersService.listInvitations(query);
      return {
        items: invitationSchema.array().parse(res.data),
        pagination: res.meta.pagination,
      };
    },
    staleTime: 1000 * 60 * 3,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

export const useMember = (memberId?: string, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: usersKeys.member(memberId),
    enabled: Boolean(memberId) && (options?.enabled ?? true),
    queryFn: async () => {
      const res = await usersService.getMember(memberId!);
      return memberSchema.parse(res.data);
    },
    refetchOnWindowFocus: false,
  });

export const useCreateMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMemberPayload) => usersService.createMember(data),
    onSuccess: async () => {
      await invalidateUserRelatedQueries(queryClient);
      toast.success("Miembro creado.");
    },
    onError: () => {
      toast.error("No pudimos crear el miembro.");
    },
  });
};

export const useUpdateMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, data }: { memberId: string; data: UpdateMember }) =>
      usersService.updateMember(memberId, data),
    onSuccess: async () => {
      await invalidateUserRelatedQueries(queryClient);
      toast.success("Miembro actualizado.");
    },
    onError: () => {
      toast.error("No pudimos actualizar el miembro.");
    },
  });
};

export const useUpdateMemberStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      memberId,
      status,
    }: {
      memberId: string;
      status: MemberStatus;
    }) => usersService.updateMemberStatus(memberId, status),
    onSuccess: async () => {
      await invalidateUserRelatedQueries(queryClient);
      toast.success("Estado actualizado.");
    },
    onError: () => {
      toast.error("No pudimos actualizar el estado.");
    },
  });
};

export const useRemoveMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => usersService.removeMember(memberId),
    onSuccess: async () => {
      await invalidateUserRelatedQueries(queryClient);
      toast.success("Miembro removido.");
    },
    onError: () => {
      toast.error("No pudimos remover el miembro.");
    },
  });
};

export const useCreateInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInvitation) => usersService.createInvitation(data),
    onSuccess: async (res) => {
      createdInvitationSchema.parse(res.data);
      await invalidateUserRelatedQueries(queryClient);
      toast.success("Invitacion creada. Copia el token si necesitas compartirlo.");
    },
    onError: () => {
      toast.error("No pudimos crear la invitacion.");
    },
  });
};

export const useRevokeInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) => usersService.revokeInvitation(invitationId),
    onSuccess: async () => {
      await invalidateUserRelatedQueries(queryClient);
      toast.success("Invitacion revocada.");
    },
    onError: () => {
      toast.error("No pudimos revocar la invitacion.");
    },
  });
};

export const useAcceptInvitation = () =>
  useMutation({
    mutationFn: (data: AcceptInvitation) => usersService.acceptInvitation(data),
    onSuccess: (res) => {
      acceptInvitationResponseSchema.parse(res.data);
      toast.success("Invitacion aceptada.");
    },
    onError: () => {
      toast.error("No pudimos aceptar la invitacion.");
    },
  });
