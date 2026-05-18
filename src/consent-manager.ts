import {
  type ConsentRecord,
  type ConsentStatus,
  type CookieConsentConfig,
  type NormalizedCookieConsentConfig,
  getDefaultCategoryValues,
  normalizeConfig
} from "./config";
import { ConsentStore } from "./consent-store";
import { deleteCookiesWithoutConsent } from "./integrations/cookie-cleanup";
import { updateGoogleConsent, defaultGoogleConsent } from "./integrations/google-consent-mode";
import { dispatchConsentUpdate } from "./integrations/data-layer";
import { activateConsentedAssets } from "./script-blocking/activate-scripts";
import {
  hideBanner,
  hideCookieIcon,
  hidePreferenceNotice,
  renderBanner,
  renderCookieIcon,
  renderPreferenceNotice
} from "./ui/banner";
import { renderCookieTable } from "./ui/cookie-table";
import { hidePreferencesModal, renderPreferencesModal } from "./ui/preferences-modal";
import { createUuid } from "./utils/uuid";

export type ConsentChangeCallback = (consent: ConsentRecord) => void;

export class ConsentManager {
  private config?: NormalizedCookieConsentConfig;
  private store?: ConsentStore;
  private callbacks = new Set<ConsentChangeCallback>();

  init(config: CookieConsentConfig): void {
    this.config = normalizeConfig(config);
    this.store = new ConsentStore(this.config);
    this.callbacks.clear();

    if (this.config.onConsentChange) {
      this.callbacks.add(this.config.onConsentChange);
    }

    const existingConsent = this.store.get();
    defaultGoogleConsent(this.config, existingConsent);

    if (existingConsent) {
      deleteCookiesWithoutConsent(this.config, existingConsent);
      activateConsentedAssets(existingConsent);
      dispatchConsentUpdate(existingConsent, this.config.dataLayerEventName);
      renderCookieIcon(this.config, () => this.openPreferences());
      return;
    }

    renderBanner(this.config, {
      onAcceptAll: () => this.acceptAll(),
      onRejectNonEssential: () => this.rejectNonEssential(),
      onConfigure: () => this.openPreferences()
    });
  }

  openPreferences(): void {
    const config = this.requireConfig();
    const consent = this.getConsent();
    hideBanner();
    hidePreferenceNotice();
    hideCookieIcon();
    renderPreferencesModal(config, consent?.categories ?? getDefaultCategoryValues(config), {
      onSave: (categories) => this.updatePreferences(categories),
      onRejectNonEssential: () => this.rejectNonEssential(),
      onClose: () => {
        hidePreferencesModal();
        if (!this.getConsent()) {
          this.showBanner();
        }
      }
    });
  }

  getConsent(): ConsentRecord | null {
    return this.store?.get() ?? null;
  }

  hasConsentFor(categoryId: string): boolean {
    return Boolean(this.getConsent()?.categories[categoryId]);
  }

  acceptAll(): ConsentRecord {
    const config = this.requireConfig();
    const categories = Object.fromEntries(config.categories.map((category) => [category.id, true]));
    return this.persist(categories, "accepted_all");
  }

  rejectNonEssential(): ConsentRecord {
    const config = this.requireConfig();
    const categories = Object.fromEntries(config.categories.map((category) => [category.id, Boolean(category.required)]));
    return this.persist(categories, "rejected_non_essential");
  }

  updatePreferences(categories: Record<string, boolean>): ConsentRecord {
    const config = this.requireConfig();
    const normalizedCategories = Object.fromEntries(
      config.categories.map((category) => [category.id, Boolean(category.required || categories[category.id])])
    );
    return this.persist(normalizedCategories, "custom");
  }

  resetConsent(): void {
    this.store?.clear();
    hideCookieIcon();
    hidePreferenceNotice();
    this.showBanner();
  }

  private showBanner(): void {
    const config = this.requireConfig();
    renderBanner(config, {
      onAcceptAll: () => this.acceptAll(),
      onRejectNonEssential: () => this.rejectNonEssential(),
      onConfigure: () => this.openPreferences()
    });
  }

  onConsentChange(callback: ConsentChangeCallback): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  renderCookieTable(selector: string): void {
    renderCookieTable(this.requireConfig(), selector);
  }

  private persist(categories: Record<string, boolean>, status: ConsentStatus): ConsentRecord {
    const config = this.requireConfig();
    const store = this.requireStore();
    const previous = store.get();
    const now = new Date().toISOString();
    const consent: ConsentRecord = {
      consentId: previous?.consentId ?? createUuid(),
      siteId: config.siteId,
      createdAt: previous?.createdAt ?? now,
      updatedAt: now,
      language: config.language,
      policyVersion: config.policyVersion,
      bannerVersion: config.bannerVersion,
      categories,
      status
    };

    store.set(consent);
    hideBanner();
    hidePreferencesModal();
    deleteCookiesWithoutConsent(config, consent);
    updateGoogleConsent(config, consent);
    activateConsentedAssets(consent);
    dispatchConsentUpdate(consent, config.dataLayerEventName);
    renderPreferenceNotice(config);
    renderCookieIcon(config, () => this.openPreferences());
    this.callbacks.forEach((callback) => callback(consent));
    return consent;
  }

  private requireConfig(): NormalizedCookieConsentConfig {
    if (!this.config) {
      throw new Error("CookieConsentCL.init debe ejecutarse antes de usar este metodo.");
    }
    return this.config;
  }

  private requireStore(): ConsentStore {
    if (!this.store) {
      throw new Error("CookieConsentCL.init debe ejecutarse antes de usar este metodo.");
    }
    return this.store;
  }
}
