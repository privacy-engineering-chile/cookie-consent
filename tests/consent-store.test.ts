import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { normalizeConfig } from "../src/config";
import { ConsentStore } from "../src/consent-store";

describe("ConsentStore", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("stores and reads consent", () => {
    const config = normalizeConfig({ siteId: "demo", policyVersion: "2026-01-01", bannerVersion: "1.0.0" });
    const store = new ConsentStore(config);

    store.set({
      consentId: "id",
      siteId: "demo",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      language: "es-CL",
      policyVersion: "2026-01-01",
      bannerVersion: "1.0.0",
      categories: { necessary: true, analytics: false },
      status: "rejected_non_essential"
    });

    expect(store.get()?.status).toBe("rejected_non_essential");
  });

  it("invalidates consent when versions change", () => {
    const config = normalizeConfig({ siteId: "demo", policyVersion: "2026-01-01", bannerVersion: "1.0.0" });
    const store = new ConsentStore(config);
    store.set({
      consentId: "id",
      siteId: "demo",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      language: "es-CL",
      policyVersion: "2026-01-01",
      bannerVersion: "1.0.0",
      categories: { necessary: true },
      status: "custom"
    });

    const changedConfig = normalizeConfig({ siteId: "demo", policyVersion: "2026-02-01", bannerVersion: "1.0.0" });
    expect(new ConsentStore(changedConfig).get()).toBeNull();
  });

  it("keeps consent in memory when localStorage is unavailable", () => {
    vi.spyOn(window, "localStorage", "get").mockImplementation(() => {
      throw new Error("storage unavailable");
    });
    const config = normalizeConfig({ siteId: "demo", policyVersion: "2026-01-01", bannerVersion: "1.0.0" });
    const store = new ConsentStore(config);

    store.set({
      consentId: "id",
      siteId: "demo",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      language: "es-CL",
      policyVersion: "2026-01-01",
      bannerVersion: "1.0.0",
      categories: { necessary: true, marketing: true },
      status: "custom"
    });

    expect(store.get()?.categories.marketing).toBe(true);
  });
});
