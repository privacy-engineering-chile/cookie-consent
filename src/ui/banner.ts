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
      <button type="button" class="cccl-button cccl-button--primary" data-action="accept" aria-label="${config.text.acceptAllAriaLabel}">${config.text.acceptAll}</button>
      <button type="button" class="cccl-button cccl-button--secondary" data-action="reject" aria-label="${config.text.rejectNonEssentialAriaLabel}">${config.text.rejectNonEssential}</button>
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
  notice.className = "cccl-preferences-notice";
  notice.setAttribute("role", "status");
  notice.setAttribute("aria-live", "polite");
  setThemeVariables(notice, config.theme);

  notice.innerHTML = `
    <span class="cccl-notice__check" aria-hidden="true">✓</span>
    <span class="cccl-notice__title">${config.text.preferencesSavedTitle}</span>
  `;

  document.body.append(notice);
  window.setTimeout(() => hidePreferenceNotice(), 2500);
}

export function hidePreferenceNotice(): void {
  removeElement("#cccl-preferences-notice");
}

export function renderCookieIcon(config: NormalizedCookieConsentConfig, onOpenPreferences: () => void): void {
  removeElement("#cccl-cookie-icon");

  if (!config.cookieIcon.enabled) return;

  const button = document.createElement("button");
  button.id = "cccl-cookie-icon";
  button.className = `cccl-cookie-icon cccl-cookie-icon--${config.cookieIcon.position} cccl-cookie-icon--${config.cookieIcon.colorScheme}`;
  button.type = "button";
  button.setAttribute("aria-label", "Abrir preferencias de cookies");
  button.innerHTML =
    '<svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none"><circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.18"/><path d="M12 3a9 9 0 1 0 9 9 4 4 0 0 1-4-4 4 4 0 0 1-5-5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="9" cy="10" r="1.2" fill="currentColor"/><circle cx="13" cy="15" r="1.2" fill="currentColor"/><circle cx="15" cy="9" r="1" fill="currentColor"/></svg>';
  setThemeVariables(button, config.theme);
  button.addEventListener("click", onOpenPreferences);
  document.body.append(button);
}

export function hideCookieIcon(): void {
  removeElement("#cccl-cookie-icon");
}
