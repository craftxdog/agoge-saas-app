import { http } from "@/shared/api/http";
import type { ApiResponse } from "@/shared/api/types";
import type {
  AcceptInvitation,
  AcceptInvitationResponse,
  CreateInvitation,
  CreateMemberPayload,
  CreatedInvitation,
  Invitation,
  InvitationQuery,
  Member,
  MemberQuery,
  MemberStatus,
  UpdateMember,
} from "../schemas/users.schema";

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

export const usersService = {
  listMembers: (query?: MemberQuery) =>
    http.get<ApiResponse<Member[]>>(withQuery("/users/members", query)),

  createMember: (data: CreateMemberPayload) =>
    http.post<ApiResponse<Member>, CreateMemberPayload>("/users/members", data),

  getMember: (memberId: string) =>
    http.get<ApiResponse<Member>>(`/users/members/${memberId}`),

  updateMember: (memberId: string, data: UpdateMember) =>
    http.patch<ApiResponse<Member>, UpdateMember>(`/users/members/${memberId}`, data),

  updateMemberStatus: (memberId: string, status: MemberStatus) =>
    http.patch<ApiResponse<Member>, { status: MemberStatus }>(
      `/users/members/${memberId}/status`,
      { status },
    ),

  removeMember: (memberId: string) =>
    http.delete<ApiResponse<Member>>(`/users/members/${memberId}`),

  listInvitations: (query?: InvitationQuery) =>
    http.get<ApiResponse<Invitation[]>>(withQuery("/users/invitations", query)),

  createInvitation: (data: CreateInvitation) =>
    http.post<ApiResponse<CreatedInvitation>, CreateInvitation>(
      "/users/invitations",
      data,
    ),

  revokeInvitation: (invitationId: string) =>
    http.post<ApiResponse<Invitation>>(
      `/users/invitations/${invitationId}/revoke`,
    ),

  acceptInvitation: (data: AcceptInvitation) =>
    http.post<ApiResponse<AcceptInvitationResponse>, AcceptInvitation>(
      "/users/invitations/accept",
      data,
    ),
};
