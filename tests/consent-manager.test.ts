import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConsentManager } from "../src/consent-manager";

function createManager(): ConsentManager {
  const manager = new ConsentManager();
  manager.init({
    siteId: "demo",
    policyVersion: "2026-01-01",
    bannerVersion: "1.0.0"
  });
  return manager;
}

describe("ConsentManager", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    localStorage.clear();
    document.cookie.split(";").forEach((cookie) => {
      const name = cookie.split("=")[0]?.trim();
      if (name) document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    });
    window.dataLayer = [];
    window.gtag = vi.fn();
  });

  it("accepts all categories", () => {
    const manager = createManager();
    const consent = manager.acceptAll();

    expect(consent.status).toBe("accepted_all");
    expect(consent.categories.analytics).toBe(true);
    expect(manager.hasConsentFor("marketing")).toBe(true);
  });

  it("rejects non-essential categories", () => {
    const manager = createManager();
    const consent = manager.rejectNonEssential();

    expect(consent.status).toBe("rejected_non_essential");
    expect(consent.categories.necessary).toBe(true);
    expect(consent.categories.analytics).toBe(false);
  });

  it("stores custom preferences", () => {
    const manager = createManager();
    const consent = manager.updatePreferences({ analytics: true, marketing: false, preferences: false });

    expect(consent.status).toBe("custom");
    expect(consent.categories.necessary).toBe(true);
    expect(consent.categories.analytics).toBe(true);
    expect(consent.categories.marketing).toBe(false);
  });

  it("hides the banner while configuring and restores it when no decision is saved", () => {
    const manager = createManager();

    expect(document.querySelector("#cccl-banner")).not.toBeNull();

    manager.openPreferences();

    expect(document.querySelector("#cccl-banner")).toBeNull();
    document.querySelector<HTMLButtonElement>('[data-action="close"]')?.click();

    expect(document.querySelector("#cccl-banner")).not.toBeNull();
  });

  it("hides the banner after saving preferences from the modal", () => {
    const manager = createManager();

    manager.openPreferences();
    document.querySelector<HTMLFormElement>(".cccl-form")?.requestSubmit();

    expect(document.querySelector("#cccl-banner")).toBeNull();
    expect(document.querySelector("#cccl-modal-root")).toBeNull();
    expect(document.querySelector("#cccl-preferences-notice")).not.toBeNull();
    expect(manager.getConsent()?.status).toBe("custom");
  });

  it("allows rejecting non-essential cookies from the preferences modal", () => {
    const manager = createManager();

    manager.openPreferences();
    document.querySelector<HTMLButtonElement>('[data-action="reject"]')?.click();

    expect(manager.getConsent()?.status).toBe("rejected_non_essential");
    expect(manager.getConsent()?.categories.analytics).toBe(false);
    expect(document.querySelector("#cccl-modal-root")).toBeNull();
  });

  it("deletes declared cookies when their category is rejected", () => {
    const manager = new ConsentManager();
    manager.init({
      siteId: "demo-cookies",
      policyVersion: "2026-01-01",
      bannerVersion: "1.0.0",
      cookies: [
        {
          name: "cccl_test_analytics",
          provider: "Demo",
          category: "analytics",
          duration: "Sesion",
          purpose: "Test"
        }
      ],
      onConsentChange(consent) {
        if (consent.categories.analytics) {
          document.cookie = "cccl_test_analytics=accepted; path=/; SameSite=Lax";
        }
      }
    });

    manager.updatePreferences({ analytics: true });
    expect(document.cookie).toContain("cccl_test_analytics=accepted");

    manager.rejectNonEssential();
    expect(document.cookie).not.toContain("cccl_test_analytics=accepted");
  });

  it("notifies callbacks and browser integrations", () => {
    const callback = vi.fn();
    const manager = createManager();
    manager.onConsentChange(callback);

    manager.acceptAll();

    expect(callback).toHaveBeenCalledOnce();
    expect(window.gtag).toHaveBeenCalledWith(
      "consent",
      "update",
      expect.objectContaining({ analytics_storage: "granted" })
    );
    expect(window.dataLayer?.[window.dataLayer.length - 1]).toMatchObject({ event: "cookie_consent_cl_update" });
  });

  it("uses custom dataLayer event names and renders the optional cookie icon", () => {
    const manager = new ConsentManager();
    manager.init({
      siteId: "demo-custom-event",
      policyVersion: "2026-01-01",
      bannerVersion: "1.0.0",
      dataLayerEventName: "demo_custom_consent",
      cookieIcon: { enabled: true, position: "bottom-right" }
    });

    manager.acceptAll();

    expect(window.dataLayer?.[window.dataLayer.length - 1]).toMatchObject({ event: "demo_custom_consent" });
    expect(document.querySelector("#cccl-cookie-icon")).not.toBeNull();
  });
});
