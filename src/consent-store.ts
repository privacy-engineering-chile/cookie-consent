import type { ConsentRecord, NormalizedCookieConsentConfig } from "./config";

export const storageKeyPrefix = "cookie-consent-cl";

export class ConsentStore {
  private readonly key: string;
  private memoryConsent: ConsentRecord | null = null;

  constructor(private readonly config: NormalizedCookieConsentConfig) {
    this.key = `${storageKeyPrefix}:${config.siteId}`;
  }

  get(): ConsentRecord | null {
    try {
      const storage = this.getStorage();
      if (!storage) {
        return this.getMemoryConsent();
      }

      const raw = storage.getItem(this.key);
      if (!raw) return null;

      const parsed = JSON.parse(raw) as ConsentRecord;
      if (!this.isCurrentVersion(parsed)) {
        return null;
      }

      return parsed;
    } catch {
      return this.getMemoryConsent();
    }
  }

  set(consent: ConsentRecord): ConsentRecord {
    this.memoryConsent = consent;
    this.getStorage()?.setItem(this.key, JSON.stringify(consent));
    return consent;
  }

  clear(): void {
    this.memoryConsent = null;
    this.getStorage()?.removeItem(this.key);
  }

  isCurrentVersion(consent: ConsentRecord): boolean {
    return (
      consent.siteId === this.config.siteId &&
      consent.policyVersion === this.config.policyVersion &&
      consent.bannerVersion === this.config.bannerVersion
    );
  }

  private getStorage(): Storage | null {
    try {
      if (typeof window === "undefined" || !window.localStorage) {
        return null;
      }
      return window.localStorage;
    } catch {
      return null;
    }
  }

  private getMemoryConsent(): ConsentRecord | null {
    return this.memoryConsent && this.isCurrentVersion(this.memoryConsent) ? this.memoryConsent : null;
  }
}
