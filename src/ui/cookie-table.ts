import type { CookieDeclaration, NormalizedCookieConsentConfig } from "../config";

export function renderCookieTable(config: NormalizedCookieConsentConfig, selector: string): void {
  const target = document.querySelector(selector);
  if (!target) {
    throw new Error(`CookieConsentCL no encontro el selector ${selector}.`);
  }

  const cookies = config.cookies;
  if (!cookies.length) {
    target.innerHTML = '<p class="cccl-empty">No hay cookies declaradas para este sitio.</p>';
    return;
  }

  target.innerHTML = `
    <table class="cccl-cookie-table">
      <thead>
        <tr>
          <th>Cookie</th>
          <th>Proveedor</th>
          <th>Categoria</th>
          <th>Duracion</th>
          <th>Finalidad</th>
        </tr>
      </thead>
      <tbody>
        ${cookies.map(renderRow).join("")}
      </tbody>
    </table>
  `;
}

function renderRow(cookie: CookieDeclaration): string {
  return `
    <tr>
      <td>${escapeHtml(cookie.name)}</td>
      <td>${escapeHtml(cookie.provider)}</td>
      <td>${escapeHtml(cookie.category)}</td>
      <td>${escapeHtml(cookie.duration)}</td>
      <td>${escapeHtml(cookie.purpose)}</td>
    </tr>
  `;
}

function escapeHtml(value: string): string {
  const element = document.createElement("div");
  element.textContent = value;
  return element.innerHTML;
}
