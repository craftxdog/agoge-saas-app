export type CursorPaginationMeta = {
  strategy: "cursor";
  limit: number;
  count: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextCursor: string | null;
  previousCursor: string | null;
  sortBy: string;
  sortDirection: "asc" | "desc";
};

export type ApiResponse<T> = {
  success: boolean;
  statusCode?: number;
  message?: string;
  data: T;
  meta: {
    request?: {
      requestId: string;
      method: string;
      path: string;
      timestamp: string;
    };
    tenant?: {
      organizationId?: string;
      organizationSlug?: string;
      memberId?: string;
    };
    pagination?: CursorPaginationMeta;
    statusCode?: number;
    timestamp?: string;
    path?: string;
    requestId?: string;
  };
};

export type CursorQuery = {
  cursor?: string;
  limit?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
};
