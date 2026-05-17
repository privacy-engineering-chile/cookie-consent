import { ConsentManager } from "./consent-manager";
import type { CookieConsentConfig, ConsentRecord } from "./config";

const manager = new ConsentManager();

export const CookieConsentCL = {
  init: (config: CookieConsentConfig) => manager.init(config),
  openPreferences: () => manager.openPreferences(),
  getConsent: (): ConsentRecord | null => manager.getConsent(),
  hasConsentFor: (categoryId: string): boolean => manager.hasConsentFor(categoryId),
  acceptAll: (): ConsentRecord => manager.acceptAll(),
  rejectNonEssential: (): ConsentRecord => manager.rejectNonEssential(),
  updatePreferences: (categories: Record<string, boolean>): ConsentRecord => manager.updatePreferences(categories),
  resetConsent: (): void => manager.resetConsent(),
  onConsentChange: (callback: (consent: ConsentRecord) => void): (() => void) => manager.onConsentChange(callback),
  renderCookieTable: (selector: string): void => manager.renderCookieTable(selector)
};

export type { CookieConsentConfig, ConsentRecord };
export default CookieConsentCL;

declare global {
  interface Window {
    CookieConsentCL: typeof CookieConsentCL;
  }
}

if (typeof window !== "undefined") {
  window.CookieConsentCL = CookieConsentCL;
}
