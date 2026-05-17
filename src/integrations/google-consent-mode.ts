import type { ConsentRecord, GoogleConsentSignal, NormalizedCookieConsentConfig } from "../config";

export const googleConsentSignals: GoogleConsentSignal[] = [
  "analytics_storage",
  "ad_storage",
  "ad_user_data",
  "ad_personalization",
  "functionality_storage",
  "personalization_storage",
  "security_storage"
];

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function buildGoogleConsentState(
  config: NormalizedCookieConsentConfig,
  consent?: ConsentRecord | null
): Record<GoogleConsentSignal, "granted" | "denied"> {
  const state = Object.fromEntries(googleConsentSignals.map((signal) => [signal, "denied"])) as Record<
    GoogleConsentSignal,
    "granted" | "denied"
  >;

  config.categories.forEach((category) => {
    category.googleConsentMode?.forEach((signal) => {
      state[signal] = category.required || consent?.categories[category.id] ? "granted" : "denied";
    });
  });

  return state;
}

export function defaultGoogleConsent(config: NormalizedCookieConsentConfig, consent?: ConsentRecord | null): void {
  if (typeof window.gtag === "function") {
    window.gtag("consent", "default", buildGoogleConsentState(config, consent));
  }
}

export function updateGoogleConsent(config: NormalizedCookieConsentConfig, consent: ConsentRecord): void {
  if (typeof window.gtag === "function") {
    window.gtag("consent", "update", buildGoogleConsentState(config, consent));
  }
}
