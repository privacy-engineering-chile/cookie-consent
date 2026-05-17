import { describe, expect, it } from "vitest";
import { normalizeConfig } from "../src/config";

describe("normalizeConfig", () => {
  it("uses Chilean defaults and disables optional categories in ethical mode", () => {
    const config = normalizeConfig({
      siteId: "demo",
      policyVersion: "2026-01-01",
      bannerVersion: "1.0.0"
    });

    expect(config.language).toBe("es-CL");
    expect(config.ethicalMode).toBe(true);
    expect(config.categories.find((category) => category.id === "necessary")?.defaultValue).toBe(true);
    expect(config.categories.find((category) => category.id === "analytics")?.defaultValue).toBe(false);
  });

  it("requires site and version metadata", () => {
    expect(() =>
      normalizeConfig({
        siteId: "",
        policyVersion: "2026-01-01",
        bannerVersion: "1.0.0"
      })
    ).toThrow();
  });

  it("normalizes background, cookie icon, center position and dataLayer event name", () => {
    const config = normalizeConfig({
      siteId: "demo",
      policyVersion: "2026-01-01",
      bannerVersion: "1.0.0",
      position: "center",
      background: { enabled: true, opacity: 0.5, blur: 4 },
      cookieIcon: { enabled: true, position: "bottom-right", colorScheme: "primary-on-background" },
      dataLayerEventName: "demo_consent_update"
    });

    expect(config.position).toBe("center");
    expect(config.background).toMatchObject({ enabled: true, opacity: 0.5, blur: 4 });
    expect(config.cookieIcon).toMatchObject({
      enabled: true,
      position: "bottom-right",
      colorScheme: "primary-on-background"
    });
    expect(config.dataLayerEventName).toBe("demo_consent_update");
  });
});
