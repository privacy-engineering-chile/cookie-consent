import { describe, expect, it } from "vitest";
import { activateConsentedAssets } from "../src/script-blocking/activate-scripts";
import type { ConsentRecord } from "../src/config";

function consent(categories: Record<string, boolean>): ConsentRecord {
  return {
    consentId: "id",
    siteId: "demo",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    language: "es-CL",
    policyVersion: "2026-01-01",
    bannerVersion: "1.0.0",
    categories,
    status: "custom"
  };
}

describe("activateConsentedAssets", () => {
  it("activates inline scripts for consented categories", () => {
    document.body.innerHTML = '<script type="text/plain" data-cookie-consent="analytics">window.loaded = true;</script>';

    activateConsentedAssets(consent({ analytics: true }));

    expect(document.querySelectorAll('script[type="text/javascript"]').length).toBe(1);
  });

  it("does not activate scripts without category consent", () => {
    document.body.innerHTML = '<script type="text/plain" data-cookie-consent="analytics">window.loaded = true;</script>';

    activateConsentedAssets(consent({ analytics: false }));

    expect(document.querySelectorAll('script[type="text/javascript"]').length).toBe(0);
  });

  it("sets iframe src after consent", () => {
    document.body.innerHTML = '<iframe data-cookie-consent="marketing" data-src="https://example.com"></iframe>';

    activateConsentedAssets(consent({ marketing: true }));

    expect(document.querySelector("iframe")?.src).toBe("https://example.com/");
  });

  it("removes iframe src when consent is revoked", () => {
    document.body.innerHTML =
      '<iframe data-cookie-consent="marketing" data-src="https://example.com" src="https://example.com" data-cookie-consent-activated="true"></iframe>';

    activateConsentedAssets(consent({ marketing: false }));

    expect(document.querySelector("iframe")?.getAttribute("src")).toBeNull();
    expect(document.querySelector("iframe")?.dataset.cookieConsentActivated).toBe("false");
  });
});
