/// <reference types="vite/client" />

declare module 'react-dom/client';

interface ImportMetaEnv {
  // Vite built-in
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;

  // API Configuration
  readonly VITE_API_URL: string;
  readonly VITE_API_TIMEOUT: string;

  // Company Information
  readonly VITE_COMPANY_NAME: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;

  // External Links
  readonly VITE_LINK_AVILA_SOLUCOES: string;
  readonly VITE_LINK_AVILA_DEVELOPMENT: string;
  readonly VITE_LINK_DOCUMENTACAO: string;
  readonly VITE_LINK_LINKEDIN: string;
  readonly VITE_LINK_SUPORTE: string;

  // Google Services
  readonly VITE_GOOGLE_MAPS_API_KEY: string;
  readonly VITE_GOOGLE_MAPS_ID: string;

  // Feature Flags
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_ENABLE_SENTRY: string;
  readonly VITE_ENABLE_DARK_MODE: string;

  // Development Settings
  readonly VITE_DEBUG_MODE: string;
  readonly VITE_LOG_LEVEL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
