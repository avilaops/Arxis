/**
 * Environment Configuration
 * Centralized access to environment variables
 */

interface EnvConfig {
  // API Configuration
  apiUrl: string;
  apiTimeout: number;

  // Company Information
  companyName: string;
  appName: string;
  appVersion: string;

  // External Links
  links: {
    avilasolucoes: string;
    aviladevelopment: string;
    documentacao: string;
    linkedin: string;
    suporte: string;
  };

  // Google Services
  google: {
    mapsApiKey: string;
    mapsId: string;
  };

  // Feature Flags
  features: {
    analytics: boolean;
    sentry: boolean;
    darkMode: boolean;
  };

  // Development Settings
  dev: {
    debugMode: boolean;
    logLevel: string;
  };
}

const normalizeUrl = (value: string) => value.replace(/\/$/, '');

const resolveDefaultApiUrl = () => {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return '';
};

const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim();
const apiUrl = rawApiUrl !== '' ? normalizeUrl(rawApiUrl) : resolveDefaultApiUrl();

const env: EnvConfig = {
  apiUrl,
  apiTimeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,

  companyName: import.meta.env.VITE_COMPANY_NAME || 'Avila Soluções Empresariais',
  appName: import.meta.env.VITE_APP_NAME || 'ARXIS',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',

  links: {
    avilasolucoes: import.meta.env.VITE_LINK_AVILA_SOLUCOES || 'https://avila.inc',
    aviladevelopment: import.meta.env.VITE_LINK_AVILA_DEVELOPMENT || 'https://avilaops.com',
    documentacao: import.meta.env.VITE_LINK_DOCUMENTACAO || 'https://docs.avila.inc',
    linkedin: import.meta.env.VITE_LINK_LINKEDIN || 'https://linkedin.com/company/avila-devops',
    suporte: import.meta.env.VITE_LINK_SUPORTE || 'https://support.avila.inc',
  },

  google: {
    mapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    mapsId: import.meta.env.VITE_GOOGLE_MAPS_ID || '',
  },

  features: {
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    sentry: import.meta.env.VITE_ENABLE_SENTRY === 'true',
    darkMode: import.meta.env.VITE_ENABLE_DARK_MODE !== 'false',
  },

  dev: {
    debugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
    logLevel: import.meta.env.VITE_LOG_LEVEL || 'info',
  },
};

// Validation in development
if (import.meta.env.DEV) {
  console.log('🔧 Environment Configuration:', {
    apiUrl: env.apiUrl,
    appName: env.appName,
    appVersion: env.appVersion,
    features: env.features,
  });
}

export default env;
