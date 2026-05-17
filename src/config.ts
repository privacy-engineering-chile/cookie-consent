export type GoogleConsentSignal =
  | "analytics_storage"
  | "ad_storage"
  | "ad_user_data"
  | "ad_personalization"
  | "functionality_storage"
  | "personalization_storage"
  | "security_storage";

export type ConsentStatus = "accepted_all" | "rejected_non_essential" | "custom";

export interface CookieCategory {
  id: string;
  label: string;
  description: string;
  required?: boolean;
  defaultValue?: boolean;
  googleConsentMode?: GoogleConsentSignal[];
}

export interface CookieDeclaration {
  name: string;
  provider: string;
  category: string;
  duration: string;
  purpose: string;
}

export interface ConsentRecord {
  consentId: string;
  siteId: string;
  createdAt: string;
  updatedAt: string;
  language: string;
  policyVersion: string;
  bannerVersion: string;
  categories: Record<string, boolean>;
  status: ConsentStatus;
}

export interface ConsentTheme {
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
}

export interface ConsentBackground {
  enabled?: boolean;
  opacity?: number;
  blur?: number;
}

export interface ConsentCookieIcon {
  enabled?: boolean;
  position?: "bottom-left" | "bottom-right";
  colorScheme?:
    | "primary-on-background"
    | "background-on-primary"
    | "background-on-text"
    | "text-on-background";
}

export interface ConsentText {
  bannerTitle?: string;
  bannerDescription?: string;
  acceptAll?: string;
  acceptAllAriaLabel?: string;
  rejectNonEssential?: string;
  rejectNonEssentialAriaLabel?: string;
  configure?: string;
  configureAriaLabel?: string;
  savePreferences?: string;
  savePreferencesAriaLabel?: string;
  close?: string;
  preferencesTitle?: string;
  preferencesDescription?: string;
  preferencesSavedTitle?: string;
  preferencesSavedDescription?: string;
  changePreferences?: string;
}

export interface CookieConsentConfig {
  siteId: string;
  language?: string;
  policyVersion: string;
  bannerVersion: string;
  cookiePolicyUrl?: string;
  privacyPolicyUrl?: string;
  ethicalMode?: boolean;
  position?: "center" | "bottom" | "top" | "bottom-left" | "bottom-right";
  theme?: ConsentTheme;
  background?: ConsentBackground;
  cookieIcon?: ConsentCookieIcon;
  dataLayerEventName?: string;
  categories?: CookieCategory[];
  text?: ConsentText;
  cookies?: CookieDeclaration[];
  onConsentChange?: (consent: ConsentRecord) => void;
}

export type NormalizedCookieConsentConfig = Required<
  Omit<CookieConsentConfig, "cookiePolicyUrl" | "privacyPolicyUrl" | "onConsentChange">
> & {
  cookiePolicyUrl?: string;
  privacyPolicyUrl?: string;
  onConsentChange?: (consent: ConsentRecord) => void;
};

export const defaultCategories: CookieCategory[] = [
  {
    id: "necessary",
    label: "Necesarias",
    description: "Permiten que el sitio funcione correctamente y no se pueden desactivar.",
    required: true,
    defaultValue: true,
    googleConsentMode: ["security_storage"]
  },
  {
    id: "analytics",
    label: "Analitica",
    description: "Nos ayudan a entender como se usa el sitio para mejorar sus contenidos y servicios.",
    required: false,
    defaultValue: false,
    googleConsentMode: ["analytics_storage"]
  },
  {
    id: "marketing",
    label: "Marketing",
    description: "Permiten medir campanas o mostrar contenido publicitario personalizado.",
    required: false,
    defaultValue: false,
    googleConsentMode: ["ad_storage", "ad_user_data", "ad_personalization"]
  },
  {
    id: "preferences",
    label: "Preferencias",
    description: "Permiten recordar algunas elecciones del usuario para mejorar su experiencia.",
    required: false,
    defaultValue: false,
    googleConsentMode: ["functionality_storage", "personalization_storage"]
  }
];

export const defaultText: Required<ConsentText> = {
  bannerTitle: "Preferencias de cookies",
  bannerDescription:
    "Usamos cookies necesarias para que este sitio funcione. Con tu autorizacion, tambien podemos usar cookies de analitica, marketing o preferencias para mejorar nuestros servicios.",
  acceptAll: "Aceptar todas",
  acceptAllAriaLabel: "Aceptar todas las cookies",
  rejectNonEssential: "Rechazar no necesarias",
  rejectNonEssentialAriaLabel: "Rechazar todas las cookies no necesarias",
  configure: "Configurar",
  configureAriaLabel: "Configurar preferencias de cookies",
  savePreferences: "Guardar preferencias",
  savePreferencesAriaLabel: "Guardar preferencias de cookies",
  close: "Cerrar",
  preferencesTitle: "Configura tus preferencias",
  preferencesDescription:
    "Puedes elegir que categorias de cookies autorizar. Las cookies necesarias se mantienen activas porque permiten el funcionamiento basico del sitio.",
  preferencesSavedTitle: "Preferencias de cookies guardadas",
  preferencesSavedDescription:
    "Puedes cambiar tu decision mas adelante desde el enlace o boton de preferencias de cookies del sitio.",
  changePreferences: "Revisar preferencias"
};

export function normalizeConfig(config: CookieConsentConfig): NormalizedCookieConsentConfig {
  if (!config.siteId) {
    throw new Error("CookieConsentCL requiere siteId.");
  }

  if (!config.policyVersion || !config.bannerVersion) {
    throw new Error("CookieConsentCL requiere policyVersion y bannerVersion.");
  }

  const ethicalMode = config.ethicalMode ?? true;
  const categories = (config.categories?.length ? config.categories : defaultCategories).map((category) => ({
    ...category,
    required: category.required ?? false,
    defaultValue: category.required ? true : ethicalMode ? false : category.defaultValue ?? false
  }));

  return {
    siteId: config.siteId,
    language: config.language ?? "es-CL",
    policyVersion: config.policyVersion,
    bannerVersion: config.bannerVersion,
    cookiePolicyUrl: config.cookiePolicyUrl,
    privacyPolicyUrl: config.privacyPolicyUrl,
    ethicalMode,
    position: config.position ?? "bottom",
    theme: {
      primaryColor: config.theme?.primaryColor ?? "#111827",
      backgroundColor: config.theme?.backgroundColor ?? "#ffffff",
      textColor: config.theme?.textColor ?? "#111827"
    },
    background: {
      enabled: config.background?.enabled ?? false,
      opacity: config.background?.opacity ?? 0.46,
      blur: config.background?.blur ?? 0
    },
    cookieIcon: {
      enabled: config.cookieIcon?.enabled ?? false,
      position: config.cookieIcon?.position ?? "bottom-left",
      colorScheme: config.cookieIcon?.colorScheme ?? "background-on-primary"
    },
    dataLayerEventName: config.dataLayerEventName ?? "cookie_consent_cl_update",
    categories,
    text: {
      ...defaultText,
      ...config.text
    },
    cookies: config.cookies ?? [],
    onConsentChange: config.onConsentChange
  };
}

export function getDefaultCategoryValues(config: NormalizedCookieConsentConfig): Record<string, boolean> {
  return Object.fromEntries(
    config.categories.map((category) => [category.id, Boolean(category.required || category.defaultValue)])
  );
}
