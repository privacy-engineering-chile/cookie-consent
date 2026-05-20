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

  it("hides the banner while configuring and keeps preferences open until a decision is saved", () => {
    const manager = createManager();

    expect(document.querySelector("#cccl-banner")).not.toBeNull();

    manager.openPreferences();

    expect(document.querySelector("#cccl-banner")).toBeNull();
    expect(document.querySelector('[data-action="close"]')).toBeNull();
    expect(document.querySelector("#cccl-modal-root")).not.toBeNull();
    expect(document.querySelector(".cccl-modal-summary")?.textContent).toContain("Elige que categorias autorizar");
  });

  it("renders policy links and cookie detail link when declarations exist", () => {
    const manager = new ConsentManager();
    manager.init({
      siteId: "demo-policy-links",
      policyVersion: "2026-01-01",
      bannerVersion: "1.0.0",
      cookiePolicyUrl: "/cookies",
      privacyPolicyUrl: "/privacidad",
      cookies: [
        {
          name: "_ga",
          provider: "Google Analytics",
          category: "analytics",
          duration: "2 anos",
          purpose: "Estadisticas"
        }
      ]
    });

    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>(".cccl-links a")).map((link) => ({
      href: link.getAttribute("href"),
      text: link.textContent
    }));

    expect(links).toContainEqual({ href: "/cookies", text: "Politica de cookies" });
    expect(links).toContainEqual({ href: "/privacidad", text: "Politica de privacidad" });
    expect(links).toContainEqual({ href: "/cookies#cookie-table", text: "Ver detalle de cookies" });
    expect(document.querySelector(".cccl-banner__hint")?.textContent).toContain("Puedes cambiar esto despues");
  });

  it("does not render policy links when urls are not configured", () => {
    const manager = new ConsentManager();
    manager.init({
      siteId: "demo-no-policy-links",
      policyVersion: "2026-01-01",
      bannerVersion: "1.0.0",
      cookies: [
        {
          name: "_ga",
          provider: "Google Analytics",
          category: "analytics",
          duration: "2 anos",
          purpose: "Estadisticas"
        }
      ]
    });

    expect(document.querySelector(".cccl-links")).toBeNull();
  });

  it("renders only the configured policy link", () => {
    const manager = new ConsentManager();
    manager.init({
      siteId: "demo-one-policy-link",
      policyVersion: "2026-01-01",
      bannerVersion: "1.0.0",
      privacyPolicyUrl: "/privacidad"
    });

    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>(".cccl-links a")).map((link) => ({
      href: link.getAttribute("href"),
      text: link.textContent
    }));

    expect(links).toEqual([{ href: "/privacidad", text: "Politica de privacidad" }]);
  });

  it("hides the banner and shows a lightweight toast after saving preferences from the modal", () => {
    vi.useFakeTimers();
    const manager = createManager();

    manager.openPreferences();
    document.querySelector<HTMLFormElement>(".cccl-form")?.requestSubmit();

    expect(document.querySelector("#cccl-banner")).toBeNull();
    expect(document.querySelector("#cccl-modal-root")).toBeNull();
    expect(document.querySelector("#cccl-cookie-comet")).not.toBeNull();

    vi.advanceTimersByTime(700);

    expect(document.querySelector("#cccl-preferences-notice")?.textContent).toContain("Preferencias guardadas");
    expect(document.querySelector("#cccl-preferences-notice button")).toBeNull();
    expect(document.querySelector("#cccl-cookie-icon")).not.toBeNull();
    expect(manager.getConsent()?.status).toBe("custom");
    vi.useRealTimers();
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
    vi.useFakeTimers();
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
    vi.advanceTimersByTime(700);
    expect(document.querySelector("#cccl-cookie-icon")).not.toBeNull();
    expect(document.querySelector(".cccl-cookie-icon__button")?.getAttribute("aria-label")).toBe(
      "Abrir preferencias de cookies"
    );
    expect(document.querySelector(".cccl-cookie-icon__glyph")).not.toBeNull();
    expect(document.querySelector("#cccl-cookie-icon svg")).toBeNull();
    vi.useRealTimers();
  });

  it("allows hiding the persistent cookie icon without resetting consent", () => {
    vi.useFakeTimers();
    const manager = createManager();

    manager.acceptAll();
    vi.advanceTimersByTime(700);

    document.querySelector<HTMLButtonElement>(".cccl-cookie-icon__dismiss")?.click();

    expect(document.querySelector("#cccl-cookie-icon")).toBeNull();
    expect(manager.getConsent()?.status).toBe("accepted_all");
    vi.useRealTimers();
  });
});
