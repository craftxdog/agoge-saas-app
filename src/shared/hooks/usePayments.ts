import { useQuery } from "@tanstack/react-query";
import { http } from "../api/http";

export const usePayments = () => {
  return useQuery({
    queryKey: ["payments"],
    queryFn: () => http.get("/payments/me"),
  });
};
