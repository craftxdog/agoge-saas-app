import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .min(3, "Mínimo 3 caracteres")
    .max(20, "Máximo 20 caracteres")
    .regex(/^[a-zA-Z0-9_]+$/, "Solo letras, números y guiones bajos"),

  password: z
    .string()
    .min(6, "Mínimo 6 caracteres")
    .max(50, "Máximo 50 caracteres"),
});

export const registerSchema = z.object({
  email: z
    .email("Email inválido")
    .toLowerCase()
    .trim(),

  password: z
    .string()
    .min(6, "Mínimo 6 caracteres")
    .max(50)
    .regex(/[A-Z]/, "Debe tener una mayúscula")
    .regex(/[0-9]/, "Debe tener un número"),

  confirmPassword: z.string(),

  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/),

  firstName: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Solo letras"),

  lastName: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/),

  phone: z
    .string()
    .regex(/^[0-9]{7,15}$/, "Número inválido")
    .optional(),

  address: z.string().max(100).optional(),

  documentId: z
    .string()
    .min(5)
    .max(30)
    .optional(),
})
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });


export type RegisterSchema = z.infer<typeof registerSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
