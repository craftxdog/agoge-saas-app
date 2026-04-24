import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

export const useAppQuery = <T>(
  key: unknown[],
  fn: () => Promise<T>,
  options?: Partial<UseQueryOptions<T>>
) => {
  return useQuery({
    queryKey: key,
    queryFn: fn,
    ...options,
  });
};
