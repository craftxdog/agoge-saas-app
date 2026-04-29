import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authSessionSchema } from "@/modules/auth/schemas/auth.schema";
import { authService } from "@/modules/auth/services/auth.service";
import type { LoginSchema } from "@/modules/auth/schemas/auth.schema";
import { setToken } from "@/shared/api/auth-token";
import { getApiErrorMessage } from "@/shared/api/error-utils";
import { useAuth } from "@/shared/hooks/useAuth";

type LoginField = keyof Pick<LoginSchema, "email" | "password" | "organizationSlug">;

type UseLoginOptions = {
  onFieldError?: (field: LoginField, message: string) => void;
};

const resolveLoginError = (
  error: unknown,
  organizationSlug?: string,
): {
  toastMessage: string;
  field?: LoginField;
  fieldMessage?: string;
} => {
  const { status, message, isNetworkError } = getApiErrorMessage(error);
  const normalizedMessage = message.toLowerCase();

  if (isNetworkError) {
    return {
      toastMessage: "No pudimos conectar con la API. Verifica que el backend este encendido.",
    };
  }

  if (
    normalizedMessage.includes("slug") ||
    normalizedMessage.includes("organization not found") ||
    normalizedMessage.includes("tenant not found") ||
    normalizedMessage.includes("organiz") && normalizedMessage.includes("no")
  ) {
    return {
      toastMessage: "El slug de la organizacion no es valido o no existe.",
      field: "organizationSlug",
      fieldMessage: "Revisa el slug de la organizacion.",
    };
  }

  if (
    normalizedMessage.includes("password") ||
    normalizedMessage.includes("contras") ||
    normalizedMessage.includes("invalid password")
  ) {
    return {
      toastMessage: "La contrasena no coincide con la cuenta indicada.",
      field: "password",
      fieldMessage: "La contrasena no es correcta.",
    };
  }

  if (
    normalizedMessage.includes("email") ||
    normalizedMessage.includes("user not found") ||
    normalizedMessage.includes("usuario no encontrado") ||
    normalizedMessage.includes("correo")
  ) {
    return {
      toastMessage: "No encontramos una cuenta con ese correo.",
      field: "email",
      fieldMessage: "Revisa el correo ingresado.",
    };
  }

  if (
    normalizedMessage.includes("credential") ||
    normalizedMessage.includes("credencial") ||
    status === 401
  ) {
    return {
      toastMessage: organizationSlug
        ? "El acceso fue rechazado. Revisa el correo y la contrasena de esta organizacion."
        : "El acceso fue rechazado. Revisa el correo y la contrasena.",
      field: "password",
      fieldMessage: "No pudimos validar tus credenciales.",
    };
  }

  return {
    toastMessage: "No pudimos iniciar sesion. Revisa tus datos e intenta nuevamente.",
  };
};

export const useLogin = (options?: UseLoginOptions) => {
  const { login } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authService.login,
    retry: false,
    onSuccess: (res) => {
      const session = authSessionSchema.parse(res.data);

      setToken(session.tokens.accessToken);
      login(session);

      if (!session.activeMembership && session.memberships.length > 1) {
        toast("Elige tu organizacion para continuar.");
      }

      navigate("/app");
    },
    onError: (error, variables) => {
      const resolved = resolveLoginError(error, variables.organizationSlug);

      if (resolved.field && resolved.fieldMessage) {
        options?.onFieldError?.(resolved.field, resolved.fieldMessage);
      }

      toast.error(resolved.toastMessage);
    },
  });
};
