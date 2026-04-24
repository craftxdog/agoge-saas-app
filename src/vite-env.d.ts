/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_SOCKET_URL?: string;
  readonly VITE_SOCKET_PATH?: string;
  readonly VITE_SOCKET_ENABLED?: "true" | "false";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
