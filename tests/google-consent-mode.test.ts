import { describe, expect, it } from "vitest";
import { normalizeConfig } from "../src/config";
import { buildGoogleConsentState } from "../src/integrations/google-consent-mode";

describe("Google Consent Mode mapping", () => {
  it("maps categories to denied by default", () => {
    const config = normalizeConfig({ siteId: "demo", policyVersion: "2026-01-01", bannerVersion: "1.0.0" });

    expect(buildGoogleConsentState(config)).toMatchObject({
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      security_storage: "granted"
    });
  });

  it("grants mapped signals when category has consent", () => {
    const config = normalizeConfig({ siteId: "demo", policyVersion: "2026-01-01", bannerVersion: "1.0.0" });

    expect(
      buildGoogleConsentState(config, {
        consentId: "id",
        siteId: "demo",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
        language: "es-CL",
        policyVersion: "2026-01-01",
        bannerVersion: "1.0.0",
        categories: { necessary: true, analytics: true, marketing: false, preferences: false },
        status: "custom"
      })
    ).toMatchObject({ analytics_storage: "granted", ad_storage: "denied" });
  });
});
