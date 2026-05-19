import type { NormalizedCookieConsentConfig } from "../config";
import { removeElement, setThemeVariables } from "../utils/dom";

export interface BannerHandlers {
  onAcceptAll: () => void;
  onRejectNonEssential: () => void;
  onConfigure: () => void;
}

export function renderBanner(config: NormalizedCookieConsentConfig, handlers: BannerHandlers): void {
  removeElement("#cccl-banner");
  removeElement("#cccl-banner-backdrop");

  if (config.background.enabled) {
    const backdrop = document.createElement("div");
    backdrop.id = "cccl-banner-backdrop";
    backdrop.className = "cccl-banner-backdrop";
    backdrop.style.setProperty("--cccl-backdrop-opacity", String(config.background.opacity));
    backdrop.style.setProperty("--cccl-backdrop-blur", `${config.background.blur}px`);
    document.body.append(backdrop);
  }

  const wrapper = document.createElement("section");
  wrapper.id = "cccl-banner";
  wrapper.className = `cccl-banner cccl-banner--${config.position}`;
  wrapper.setAttribute("role", "dialog");
  wrapper.setAttribute("aria-live", "polite");
  wrapper.setAttribute("aria-labelledby", "cccl-banner-title");
  setThemeVariables(wrapper, config.theme);

  const links = [
    config.cookiePolicyUrl
      ? `<a href="${config.cookiePolicyUrl}" class="cccl-link">Politica de cookies</a>`
      : "",
    config.privacyPolicyUrl
      ? `<a href="${config.privacyPolicyUrl}" class="cccl-link">Politica de privacidad</a>`
      : ""
  ]
    .filter(Boolean)
    .join(" · ");

  wrapper.innerHTML = `
    <div class="cccl-banner__content">
      <h2 id="cccl-banner-title" class="cccl-title">${config.text.bannerTitle}</h2>
      <p class="cccl-description">${config.text.bannerDescription}</p>
      ${links ? `<p class="cccl-links">${links}</p>` : ""}
    </div>
    <div class="cccl-actions" aria-label="Opciones de consentimiento">
      <button type="button" class="cccl-button cccl-button--choice" data-action="accept" aria-label="${config.text.acceptAllAriaLabel}">${config.text.acceptAll}</button>
      <button type="button" class="cccl-button cccl-button--choice" data-action="reject" aria-label="${config.text.rejectNonEssentialAriaLabel}">${config.text.rejectNonEssential}</button>
      <button type="button" class="cccl-button cccl-button--ghost" data-action="configure" aria-label="${config.text.configureAriaLabel}">${config.text.configure}</button>
    </div>
  `;

  wrapper.querySelector<HTMLButtonElement>('[data-action="accept"]')?.addEventListener("click", handlers.onAcceptAll);
  wrapper
    .querySelector<HTMLButtonElement>('[data-action="reject"]')
    ?.addEventListener("click", handlers.onRejectNonEssential);
  wrapper.querySelector<HTMLButtonElement>('[data-action="configure"]')?.addEventListener("click", handlers.onConfigure);

  document.body.append(wrapper);
}

export function hideBanner(): void {
  removeElement("#cccl-banner");
  removeElement("#cccl-banner-backdrop");
}

export function renderPreferenceNotice(config: NormalizedCookieConsentConfig): void {
  removeElement("#cccl-preferences-notice");

  const notice = document.createElement("section");
  notice.id = "cccl-preferences-notice";
  notice.className = "cccl-preferences-notice cccl-toast cccl-toast--saved";
  notice.setAttribute("role", "status");
  notice.setAttribute("aria-live", "polite");
  setThemeVariables(notice, config.theme);

  notice.innerHTML = `
    <span class="cccl-notice__check" aria-hidden="true">✓</span>
    <span class="cccl-notice__title">${config.text.preferencesSavedTitle}</span>
  `;

  document.body.append(notice);
  window.setTimeout(() => hidePreferenceNotice(), 1800);
}

export function hidePreferenceNotice(): void {
  removeElement("#cccl-preferences-notice");
}

export function renderCookieIcon(
  config: NormalizedCookieConsentConfig,
  onOpenPreferences: () => void,
  options: { revealing?: boolean } = {}
): void {
  removeElement("#cccl-cookie-icon");

  if (!config.cookieIcon.enabled) return;

  const icon = document.createElement("div");
  icon.id = "cccl-cookie-icon";
  icon.className = `cccl-cookie-icon cccl-cookie-icon--${config.cookieIcon.position} cccl-cookie-icon--${config.cookieIcon.colorScheme}`;
  if (options.revealing) {
    icon.classList.add("cccl-cookie-icon--revealing");
  }
  icon.innerHTML = `
    <button type="button" class="cccl-cookie-icon__button" aria-label="Abrir preferencias de cookies">
      <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none"><circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.18"/><path d="M12 3a9 9 0 1 0 9 9 4 4 0 0 1-4-4 4 4 0 0 1-5-5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="9" cy="10" r="1.2" fill="currentColor"/><circle cx="13" cy="15" r="1.2" fill="currentColor"/><circle cx="15" cy="9" r="1" fill="currentColor"/></svg>
    </button>
    <button type="button" class="cccl-cookie-icon__dismiss" aria-label="Ocultar icono de preferencias de cookies">×</button>
  `;
  setThemeVariables(icon, config.theme);
  icon.querySelector<HTMLButtonElement>(".cccl-cookie-icon__button")?.addEventListener("click", onOpenPreferences);
  icon.querySelector<HTMLButtonElement>(".cccl-cookie-icon__dismiss")?.addEventListener("click", (event) => {
    event.stopPropagation();
    hideCookieIcon();
  });
  document.body.append(icon);
}

export function hideCookieIcon(): void {
  removeElement("#cccl-cookie-icon");
}

export function runCookieCometTransition(
  config: NormalizedCookieConsentConfig,
  onOpenPreferences: () => void,
  options: { source?: Element | null } = {}
): void {
  const source =
    options.source ??
    document.querySelector("#cccl-modal-root .cccl-modal") ??
    document.querySelector("#cccl-banner");
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

  removeElement("#cccl-cookie-comet");
  removeElement("#cccl-cookie-comet-trail");

  if (!source || !config.animation.enabled || config.animation.type !== "cookie-comet" || reducedMotion) {
    hideBanner();
    removeElement("#cccl-modal-root");
    renderCookieIcon(config, onOpenPreferences);
    renderPreferenceNotice(config);
    return;
  }

  const sourceRect = source.getBoundingClientRect();
  const target = config.cookieIcon.enabled
    ? getCookieIconTarget(config)
    : { x: sourceRect.left + sourceRect.width / 2, y: sourceRect.top + sourceRect.height / 2 };
  const sourceCenter = {
    x: sourceRect.left + sourceRect.width / 2,
    y: sourceRect.top + sourceRect.height / 2
  };
  const dx = target.x - sourceCenter.x;
  const dy = target.y - sourceCenter.y;

  const comet = document.createElement("div");
  comet.id = "cccl-cookie-comet";
  comet.className = "cccl-cookie-comet";
  comet.style.setProperty("--cccl-comet-left", `${sourceRect.left}px`);
  comet.style.setProperty("--cccl-comet-top", `${sourceRect.top}px`);
  comet.style.setProperty("--cccl-comet-width", `${sourceRect.width}px`);
  comet.style.setProperty("--cccl-comet-height", `${sourceRect.height}px`);
  comet.style.setProperty("--cccl-comet-dx", `${dx}px`);
  comet.style.setProperty("--cccl-comet-dy", `${dy}px`);
  setThemeVariables(comet, config.theme);

  const chip = document.createElement("div");
  chip.className = "cccl-cookie-comet__chip";
  chip.innerHTML =
    '<svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none"><circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.18"/><path d="M12 3a9 9 0 1 0 9 9 4 4 0 0 1-4-4 4 4 0 0 1-5-5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="9" cy="10" r="1.2" fill="currentColor"/><circle cx="13" cy="15" r="1.2" fill="currentColor"/><circle cx="15" cy="9" r="1" fill="currentColor"/></svg>';
  comet.append(chip);

  const trail = config.cookieIcon.enabled ? document.createElement("div") : null;
  if (trail) {
    trail.id = "cccl-cookie-comet-trail";
    trail.className = `cccl-cookie-comet__trail cccl-cookie-comet__trail--${config.cookieIcon.position}`;
    trail.style.setProperty("--cccl-trail-x", `${target.x}px`);
    trail.style.setProperty("--cccl-trail-y", `${target.y}px`);
    setThemeVariables(trail, config.theme);
    trail.innerHTML = `
      <span class="cccl-cookie-comet__spark"></span>
      <span class="cccl-cookie-comet__spark"></span>
      <span class="cccl-cookie-comet__spark"></span>
    `;
  }

  if (trail) {
    document.body.append(trail);
  }
  document.body.append(comet);
  hideBanner();
  removeElement("#cccl-modal-root");

  window.setTimeout(() => {
    comet.remove();
    trail?.remove();
    renderCookieIcon(config, onOpenPreferences, { revealing: true });
    renderPreferenceNotice(config);
  }, 680);
}

function getCookieIconTarget(config: NormalizedCookieConsentConfig): { x: number; y: number } {
  const iconSize = 48;
  const offset = 16;
  const x =
    config.cookieIcon.enabled && config.cookieIcon.position === "bottom-left"
      ? offset + iconSize / 2
      : window.innerWidth - offset - iconSize / 2;
  return {
    x,
    y: window.innerHeight - offset - iconSize / 2
  };
}
