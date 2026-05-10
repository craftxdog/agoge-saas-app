export type PermissionChecker = (permission: string) => boolean;

export const hasAnyPermission = (
  hasPermission: PermissionChecker,
  permissions: readonly string[],
) => permissions.some((permission) => hasPermission(permission));

export const billingPermissionPolicy = {
  read: ["billing.read"],
  createPayment: [
    "billing.write",
    "billing.stable",
    "billing.cobros",
    "billing.create",
    "billing.payment.create",
    "billing.payments.create",
  ],
  recordTransaction: [
    "billing.write",
    "billing.stable",
    "billing.cobros",
    "billing.collect",
    "billing.transaction.create",
    "billing.transactions.create",
  ],
  updatePayment: [
    "billing.write",
    "billing.cobros",
    "billing.payment.update",
    "billing.payments.update",
  ],
  manageCatalog: [
    "billing.write",
    "billing.catalog.manage",
    "billing.settings.write",
    "billing.payment-types.write",
    "billing.payment-methods.write",
  ],
  cancelPayment: [
    "billing.write",
    "billing.cancel",
    "billing.override",
    "billing.payment.cancel",
  ],
} as const;

export const usersPermissionPolicy = {
  read: ["users.read"],
  createMember: ["users.write", "users.create", "member.create", "members.create"],
  updateMember: ["users.write", "users.update", "member.update", "members.update"],
  changeStatus: [
    "users.write",
    "users.status.write",
    "member.status.write",
    "members.status.write",
  ],
  removeMember: ["users.write", "users.delete", "member.delete", "members.delete"],
  createInvitation: [
    "users.write",
    "users.invite",
    "invitation.create",
    "invitations.create",
  ],
  revokeInvitation: [
    "users.write",
    "users.invitation.revoke",
    "invitation.revoke",
    "invitations.revoke",
  ],
} as const;
