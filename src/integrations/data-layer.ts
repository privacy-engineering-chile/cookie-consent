import type { ConsentRecord } from "../config";

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export function dispatchConsentUpdate(consent: ConsentRecord, eventName = "cookie_consent_cl_update"): void {
  window.dispatchEvent(new CustomEvent("cookie-consent-cl:update", { detail: consent }));

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({
      event: eventName,
      consent
    });
  }
}
