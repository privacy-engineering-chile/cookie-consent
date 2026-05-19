import type { NormalizedCookieConsentConfig } from "../config";
import { removeElement, setThemeVariables } from "../utils/dom";

export interface PreferencesHandlers {
  onSave: (categories: Record<string, boolean>) => void;
  onRejectNonEssential: () => void;
}

export function renderPreferencesModal(
  config: NormalizedCookieConsentConfig,
  selectedCategories: Record<string, boolean>,
  handlers: PreferencesHandlers
): void {
  removeElement("#cccl-modal-root");

  const root = document.createElement("div");
  root.id = "cccl-modal-root";
  root.className = "cccl-modal-root";
  setThemeVariables(root, config.theme);

  const categoryMarkup = config.categories
    .map((category) => {
      const checked = category.required || selectedCategories[category.id] ? "checked" : "";
      const disabled = category.required ? "disabled" : "";
      return `
        <div class="cccl-category">
          <div>
            <h3 class="cccl-category__title">${category.label}</h3>
            <p class="cccl-category__description">${category.description}</p>
          </div>
          <label class="cccl-switch">
            <span class="cccl-switch__label">${category.required ? "Siempre activa" : "Autorizar"}</span>
            <input type="checkbox" name="${category.id}" ${checked} ${disabled} aria-label="${category.label}">
            <span class="cccl-switch__track" aria-hidden="true"></span>
          </label>
        </div>
      `;
    })
    .join("");

  root.innerHTML = `
    <div class="cccl-backdrop"></div>
    <section class="cccl-modal" role="dialog" aria-modal="true" aria-labelledby="cccl-modal-title" tabindex="-1">
      <h2 id="cccl-modal-title" class="cccl-title">${config.text.preferencesTitle}</h2>
      <p class="cccl-description">${config.text.preferencesDescription}</p>
      <div class="cccl-modal-summary" aria-label="Resumen de preferencias">
        <span>Elige que categorias autorizar.</span>
        <span>Las necesarias siempre estan activas.</span>
      </div>
      <form class="cccl-form">
        <div class="cccl-categories">${categoryMarkup}</div>
        <div class="cccl-actions cccl-actions--modal">
          <button type="button" class="cccl-button cccl-button--secondary" data-action="reject">${config.text.rejectNonEssential}</button>
          <button type="submit" class="cccl-button cccl-button--primary" aria-label="${config.text.savePreferencesAriaLabel}">${config.text.savePreferences}</button>
        </div>
      </form>
    </section>
  `;

  root
    .querySelector<HTMLButtonElement>('[data-action="reject"]')
    ?.addEventListener("click", handlers.onRejectNonEssential);
  root.querySelector<HTMLFormElement>(".cccl-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const categories = Object.fromEntries(
      config.categories.map((category) => {
        const input = form.elements.namedItem(category.id) as HTMLInputElement | null;
        return [category.id, Boolean(category.required || input?.checked)];
      })
    );
    handlers.onSave(categories);
  });

  document.body.append(root);
  root.querySelector<HTMLElement>(".cccl-modal")?.focus();
}

export function hidePreferencesModal(): void {
  removeElement("#cccl-modal-root");
}
