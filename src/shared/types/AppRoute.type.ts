import type { Icon } from "@tabler/icons-react";
import type { AuthUser } from "@/modules/auth/schemas/auth.schema";

export type AppRoute = {
  label: string;
  path: string;
  icon?: Icon;
  customerLabel?: string;

  module?: string;
  permissions?: string[];
  platformRoles?: AuthUser["platformRole"][];
  allowCustomerPortal?: boolean;

  showInSidebar?: boolean;
  showInMobile?: boolean;

  children?: AppRoute[];

  badge?: string | number;
};
