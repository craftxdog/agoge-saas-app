const directTranslations: Record<string, string> = {
  active: "Activo",
  admin: "Administrador",
  analytics: "Analitica",
  audit: "Auditoria",
  billing: "Cobros",
  cancelled: "Cancelado",
  coach: "Entrenador",
  collected: "Cobrado",
  connected: "Conectado",
  coverage: "Cobertura",
  create: "Crear",
  current: "Actual",
  customer: "Cliente",
  delete: "Eliminar",
  disconnected: "Desconectado",
  enabled: "Habilitado",
  failed: "Fallido",
  invited: "Invitado",
  inactive: "Inactivo",
  invoiced: "Facturado",
  locations: "Sedes",
  manage: "Gestion",
  manager: "Gerente",
  members: "Miembros",
  module: "Modulo",
  operations: "Operaciones",
  outstanding: "Pendiente",
  overdue: "Vencido",
  owner: "Propietario",
  paid: "Pagado",
  pending: "Pendiente",
  portal: "Portal",
  profile: "Perfil",
  read: "Lectura",
  refunded: "Reintegrado",
  remove: "Remover",
  revenue: "Ingresos",
  roles: "Roles",
  schedules: "Horarios",
  security: "Seguridad",
  settings: "Configuracion",
  succeeded: "Exitoso",
  suspended: "Suspendido",
  tenant: "Organizacion",
  update: "Actualizar",
  users: "Miembros",
  write: "Edicion",
};

const capitalize = (value: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : value;

export const formatSystemLabel = (value?: string | null): string => {
  if (!value) {
    return "Sin definir";
  }

  const normalized = value.trim();

  if (!normalized) {
    return "Sin definir";
  }

  if (normalized.includes(".")) {
    return normalized
      .split(".")
      .filter(Boolean)
      .map((token) => formatSystemLabel(token))
      .join(" · ");
  }

  return normalized
    .replace(/[_-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => {
      const translated = directTranslations[token.toLowerCase()];
      return translated ?? capitalize(token.toLowerCase());
    })
    .join(" ");
};
