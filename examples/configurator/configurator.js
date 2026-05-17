/* global document, crypto, FormData, window, navigator */

const form = document.querySelector("#config-form");
const presetGrid = document.querySelector("#preset-grid");
const positionGrid = document.querySelector("#position-grid");
const categoryList = document.querySelector("#category-list");
const integrationCategory = document.querySelector("#integration-category");
const integrationList = document.querySelector("#integration-list");
const integrationCode = document.querySelector("#integration-code");
const installCode = document.querySelector("#install-code");
const warningList = document.querySelector("#warning-list");
const previewFrame = document.querySelector("#preview-frame");
const copyStatus = document.querySelector("#copy-status");

let previewReady = false;
let previewMode = "banner";
let activeCodeTab = "script";

const googleSignals = [
  "analytics_storage",
  "ad_storage",
  "ad_user_data",
  "ad_personalization",
  "functionality_storage",
  "personalization_storage",
  "security_storage"
];

const presets = [
  {
    id: "claro",
    label: "Claro",
    backgroundColor: "#ffffff",
    textColor: "#111827",
    primaryColor: "#2563eb"
  },
  {
    id: "neutral",
    label: "Neutral",
    backgroundColor: "#f8fafc",
    textColor: "#0f172a",
    primaryColor: "#334155"
  },
  {
    id: "ambar",
    label: "Ambar",
    backgroundColor: "#fffbeb",
    textColor: "#451a03",
    primaryColor: "#d97706"
  },
  {
    id: "nocturno",
    label: "Nocturno",
    backgroundColor: "#111827",
    textColor: "#f9fafb",
    primaryColor: "#38bdf8"
  },
  {
    id: "privacy-engineering",
    label: "Privacy Engineering",
    backgroundColor: "#f8fafc",
    textColor: "#172554",
    primaryColor: "#2563eb"
  }
];

const positions = [
  { id: "center", label: "Centro", previewClass: "pos-center" },
  { id: "bottom-left", label: "Abajo izquierda", previewClass: "pos-bottom-left" },
  { id: "bottom-right", label: "Abajo derecha", previewClass: "pos-bottom-right" },
  { id: "bottom", label: "Abajo centro", previewClass: "pos-bottom" }
];

const integrationLabels = {
  gtm: "Google Tag Manager",
  ga4: "Google Analytics 4",
  meta: "Meta Pixel",
  linkedin: "LinkedIn Insight Tag",
  hubspot: "HubSpot tracking",
  custom: "Custom script URL"
};

const state = {
  categories: [
    {
      id: "necessary",
      label: "Necesarias",
      description: "Permiten que el sitio funcione correctamente y no se pueden desactivar.",
      required: true,
      defaultValue: true,
      signals: ["security_storage"]
    },
    {
      id: "analytics",
      label: "Analitica",
      description: "Nos ayudan a entender como se usa el sitio para mejorar sus contenidos y servicios.",
      required: false,
      defaultValue: false,
      signals: ["analytics_storage"]
    },
    {
      id: "marketing",
      label: "Marketing",
      description: "Permiten medir campanas o mostrar contenido publicitario personalizado.",
      required: false,
      defaultValue: false,
      signals: ["ad_storage", "ad_user_data", "ad_personalization"]
    },
    {
      id: "preferences",
      label: "Preferencias",
      description: "Permiten recordar algunas elecciones del usuario para mejorar su experiencia.",
      required: false,
      defaultValue: false,
      signals: ["functionality_storage", "personalization_storage"]
    }
  ],
  integrations: [
    { id: crypto.randomUUID(), type: "gtm", category: "analytics", value: "GTM-XXXX" },
    { id: crypto.randomUUID(), type: "hubspot", category: "marketing", value: "12345678" }
  ]
};

function field(name) {
  return form.elements[name];
}

function value(name) {
  return new FormData(form).get(name)?.toString() || "";
}

function checked(name) {
  return Boolean(field(name)?.checked);
}

function setField(name, nextValue) {
  const control = field(name);
  if (control) control.value = nextValue;
}

function escapeHtml(raw) {
  return String(raw)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderPresets() {
  presetGrid.innerHTML = presets
    .map(
      (preset, index) => `
        <label class="preset-card">
          <input type="radio" name="preset" value="${preset.id}" ${index === 0 ? "checked" : ""}>
          <strong>${preset.label}</strong>
          <span class="swatches">
            <span style="background:${preset.backgroundColor}"></span>
            <span style="background:${preset.textColor}"></span>
            <span style="background:${preset.primaryColor}"></span>
          </span>
        </label>
      `
    )
    .join("");
}

function renderPositions() {
  positionGrid.innerHTML = positions
    .map(
      (position) => `
        <label class="position-card">
          <input type="radio" name="position" value="${position.id}" ${position.id === "bottom" ? "checked" : ""}>
          <strong>${position.label}</strong>
          <span class="position-preview ${position.previewClass}"></span>
        </label>
      `
    )
    .join("");
}

function renderCategories() {
  categoryList.innerHTML = state.categories
    .map(
      (category) => `
        <article class="category-card" data-category-id="${category.id}">
          <div class="category-card__header">
            <h3>${escapeHtml(category.label)}</h3>
            <button class="ghost-small" type="button" data-delete-category="${category.id}" ${category.id === "necessary" ? "disabled" : ""}>
              ${category.id === "necessary" ? "Requerida" : "Eliminar"}
            </button>
          </div>
          <div class="field-grid field-grid--two">
            <label>Identificador <input data-cat-field="id" value="${escapeHtml(category.id)}" ${category.id === "necessary" ? "disabled" : ""}></label>
            <label>Etiqueta <input data-cat-field="label" value="${escapeHtml(category.label)}"></label>
          </div>
          <label>Descripcion <textarea data-cat-field="description">${escapeHtml(category.description)}</textarea></label>
          <div class="field-grid field-grid--two">
            <label class="switch-row">
              <span><strong>Este consentimiento es requerido</strong></span>
              <input type="checkbox" data-cat-field="required" ${category.required ? "checked" : ""} ${category.id === "necessary" ? "disabled" : ""}>
            </label>
            <label class="switch-row">
              <span><strong>Activado por defecto</strong></span>
              <input type="checkbox" data-cat-field="defaultValue" ${category.defaultValue ? "checked" : ""} ${category.required ? "disabled" : ""}>
            </label>
          </div>
          <div>
            <p class="helper">Google Consent Mode signals</p>
            <div class="signal-grid">
              ${googleSignals
                .map(
                  (signal) => `
                    <label>
                      <input type="checkbox" data-signal="${signal}" ${category.signals.includes(signal) ? "checked" : ""}>
                      ${signal}
                    </label>
                  `
                )
                .join("")}
            </div>
          </div>
        </article>
      `
    )
    .join("");
  renderIntegrationCategoryOptions();
}

function renderIntegrationCategoryOptions() {
  const options = state.categories
    .filter((category) => !category.required)
    .map((category) => `<option value="${category.id}">${escapeHtml(category.label)}</option>`)
    .join("");
  integrationCategory.innerHTML = options || '<option value="necessary">Necesarias</option>';
}

function renderIntegrations() {
  integrationList.innerHTML = state.integrations.length
    ? state.integrations
        .map(
          (integration) => `
            <article class="integration-item">
              <div>
                <strong>${integrationLabels[integration.type]}</strong>
                <p>${escapeHtml(integration.category)} · ${escapeHtml(integration.value)}</p>
              </div>
              <button class="ghost-small" type="button" data-delete-integration="${integration.id}">Eliminar</button>
            </article>
          `
        )
        .join("")
    : '<p class="helper">Aun no agregas integraciones guiadas.</p>';
  integrationCode.textContent = buildIntegrationSnippets();
}

function syncConditionalSections() {
  document.querySelectorAll("[data-condition]").forEach((section) => {
    section.hidden = !checked(section.dataset.condition);
  });
}

function syncRangeLabels() {
  document.querySelector("#radius-value").textContent = `${value("borderRadius")}px`;
  document.querySelector("#opacity-value").textContent = Number(value("overlayOpacity")).toFixed(2);
  document.querySelector("#blur-value").textContent = `${value("overlayBlur")}px`;
}

function applyPreset() {
  const preset = presets.find((item) => item.id === value("preset")) || presets[0];
  setField("backgroundColor", preset.backgroundColor);
  setField("textColor", preset.textColor);
  setField("primaryColor", preset.primaryColor);
}

function slugify(raw) {
  return raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 32);
}

function buildConfig() {
  return {
    siteId: "demo-site",
    language: "es-CL",
    policyVersion: "2026-01-01",
    bannerVersion: "1.0.0",
    cookiePolicyUrl: "/politica-de-cookies",
    privacyPolicyUrl: "/politica-de-privacidad",
    ethicalMode: true,
    position: value("position"),
    theme: {
      primaryColor: value("primaryColor"),
      backgroundColor: value("backgroundColor"),
      textColor: value("textColor")
    },
    background: {
      enabled: checked("blockBackground"),
      opacity: Number(value("overlayOpacity")),
      blur: Number(value("overlayBlur"))
    },
    cookieIcon: {
      enabled: checked("cookieIconEnabled"),
      position: value("cookieIconPosition"),
      colorScheme: value("cookieIconColorScheme")
    },
    dataLayerEventName: value("dataLayerEventName") || "cookie_consent_cl_update",
    categories: state.categories.map((category) => ({
      id: category.id,
      label: category.label,
      description: category.description,
      required: category.required,
      defaultValue: category.required ? true : category.defaultValue,
      googleConsentMode: category.signals
    })),
    cookies: buildCookieDeclarations(),
    text: {
      bannerTitle: value("bannerTitle"),
      bannerDescription: value("bannerDescription"),
      acceptAll: value("acceptAll"),
      acceptAllAriaLabel: value("acceptAllAriaLabel"),
      rejectNonEssential: value("rejectNonEssential"),
      rejectNonEssentialAriaLabel: value("rejectNonEssentialAriaLabel"),
      configure: value("configure"),
      configureAriaLabel: value("configureAriaLabel"),
      savePreferences: value("savePreferences"),
      savePreferencesAriaLabel: value("savePreferencesAriaLabel"),
      close: value("close"),
      preferencesTitle: value("preferencesTitle"),
      preferencesDescription: value("preferencesDescription"),
      changePreferences: "Revisar preferencias"
    }
  };
}

function buildCookieDeclarations() {
  const cookies = [
    {
      name: "_ga",
      provider: "Google Analytics",
      category: "analytics",
      duration: "2 anos",
      purpose: "Distinguir usuarios para generar estadisticas de uso del sitio."
    },
    {
      name: "_fbp",
      provider: "Meta",
      category: "marketing",
      duration: "3 meses",
      purpose: "Medir campanas o atribuir conversiones publicitarias."
    },
    {
      name: "cc_preference",
      provider: "Sitio web",
      category: "preferences",
      duration: "6 meses",
      purpose: "Recordar preferencias de experiencia elegidas por la persona."
    }
  ];
  const categoryIds = new Set(state.categories.map((category) => category.id));
  return cookies.filter((cookie) => categoryIds.has(cookie.category));
}

function buildIntegrationSnippets() {
  if (!state.integrations.length) {
    return "// Agrega una integracion para generar snippets de carga condicionada.";
  }
  return state.integrations.map(integrationSnippet).join("\n\n");
}

function integrationSnippet(integration) {
  const category = integration.category;
  const raw = integration.value.trim();
  if (integration.type === "gtm") {
    return `<script type="text/plain" data-cookie-consent="${category}" data-src="https://www.googletagmanager.com/gtm.js?id=${raw}"></script>`;
  }
  if (integration.type === "ga4") {
    return `<script type="text/plain" data-cookie-consent="${category}" data-src="https://www.googletagmanager.com/gtag/js?id=${raw}"></script>`;
  }
  if (integration.type === "hubspot") {
    return `<script type="text/plain" data-cookie-consent="${category}" data-src="https://js.hs-scripts.com/${raw}.js"></script>`;
  }
  if (integration.type === "linkedin") {
    return `<script type="text/plain" data-cookie-consent="${category}">
  window._linkedin_partner_id = "${raw}";
  console.log("Inicializa LinkedIn Insight Tag despues del consentimiento");
</script>`;
  }
  if (integration.type === "meta") {
    return `<script type="text/plain" data-cookie-consent="${category}">
  console.log("Inicializa Meta Pixel ${raw} despues del consentimiento");
</script>`;
  }
  return `<script type="text/plain" data-cookie-consent="${category}" data-src="${raw}"></script>`;
}

function buildInstallCode() {
  const config = JSON.stringify(buildConfig(), null, 2);
  const radius = value("borderRadius");
  const snippets = buildIntegrationSnippets();
  const styleBlock = `<style>
  .cccl-banner,
  .cccl-modal,
  .cccl-preferences-notice,
  .cccl-cookie-icon {
    border-radius: ${radius}px;
  }
</style>`;

  if (activeCodeTab === "npm") {
    return `npm install cookie-consent-cl

import { CookieConsentCL } from "cookie-consent-cl";
import "cookie-consent-cl/dist/cookie-consent-cl.css";

CookieConsentCL.init(${config});`;
  }

  if (activeCodeTab === "wordpress") {
    return `<!-- Pega esto en el header o footer de tu tema/plugin de snippets. -->
<link rel="stylesheet" href="/dist/cookie-consent-cl.css" />
<script src="/dist/cookie-consent-cl.iife.js"></script>
${styleBlock}
<script>
  window.CookieConsentCL.init(${config});
</script>

<!-- Scripts condicionados opcionales -->
${snippets}`;
  }

  if (activeCodeTab === "gtm") {
    return `Notas para Google Tag Manager:

1. Mantén el banner cargado directamente en el sitio, no como tag de marketing.
2. Usa el evento dataLayer "${buildConfig().dataLayerEventName}" para disparar tags despues del consentimiento.
3. Para scripts fuera de GTM, usa data-cookie-consent:

${snippets}`;
  }

  return `<link rel="stylesheet" href="/dist/cookie-consent-cl.css" />
<script src="/dist/cookie-consent-cl.iife.js"></script>
${styleBlock}
<script>
  window.CookieConsentCL.init(${config});
</script>

<!-- Scripts condicionados opcionales -->
${snippets}`;
}

function hexToRgb(hex) {
  const normalized = hex.replace("#", "");
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16)
  };
}

function luminance({ r, g, b }) {
  return [r, g, b]
    .map((raw) => {
      const channel = raw / 255;
      return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
    })
    .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
}

function contrastRatio(a, b) {
  const light = Math.max(luminance(hexToRgb(a)), luminance(hexToRgb(b)));
  const dark = Math.min(luminance(hexToRgb(a)), luminance(hexToRgb(b)));
  return (light + 0.05) / (dark + 0.05);
}

function buildWarnings() {
  const warnings = [];
  const textContrast = contrastRatio(value("backgroundColor"), value("textColor"));
  const primaryContrast = contrastRatio(value("backgroundColor"), value("primaryColor"));
  const optionalDefaults = state.categories.filter((category) => !category.required && category.defaultValue);

  if (textContrast < 4.5 || primaryContrast < 3) {
    warnings.push({
      title: "Contraste bajo",
      body: "Este color puede dificultar la lectura para algunas personas. Prueba con mayor contraste.",
      type: "danger"
    });
  }
  if (!value("rejectNonEssential").trim()) {
    warnings.push({
      title: "Rechazo poco visible",
      body: "El boton para rechazar cookies no necesarias debe estar disponible y ser claro.",
      type: "danger"
    });
  }
  if (optionalDefaults.length) {
    warnings.push({
      title: "Categorias opcionales activadas por defecto",
      body: "Analitica, marketing o preferencias deberian partir desactivadas salvo que tengas una razon muy clara.",
      type: "warning"
    });
  }
  if (!checked("cookieIconEnabled")) {
    warnings.push({
      title: "Falta acceso para cambiar preferencias",
      body: "Activa el icono o agrega un enlace visible para que las personas puedan modificar su decision despues.",
      type: "warning"
    });
  }
  if (!warnings.length) {
    warnings.push({
      title: "Buenas practicas activas",
      body: "La configuracion mantiene rechazo visible, categorias opcionales desactivadas y acceso para revisar preferencias.",
      type: "success"
    });
  }
  return warnings;
}

function renderWarnings() {
  warningList.innerHTML = buildWarnings()
    .map(
      (warning) => `
        <article class="warning-card ${warning.type === "danger" ? "is-danger" : ""} ${warning.type === "success" ? "is-success" : ""}">
          <strong>${warning.title}</strong>
          <p>${warning.body}</p>
        </article>
      `
    )
    .join("");
}

function renderCode() {
  installCode.textContent = buildInstallCode();
}

function sendPreview({ restart = false, mode = previewMode } = {}) {
  if (!previewReady) return;
  previewFrame.contentWindow.postMessage(
    {
      type: "cccl-preview-config",
      config: buildConfig(),
      design: { borderRadius: Number(value("borderRadius")) },
      mode,
      restart
    },
    "*"
  );
}

function updateAll({ restart = false } = {}) {
  syncConditionalSections();
  syncRangeLabels();
  renderIntegrations();
  renderWarnings();
  renderCode();
  sendPreview({ restart });
}

function updateCategoryFromInput(input) {
  const card = input.closest("[data-category-id]");
  if (!card) return;
  const category = state.categories.find((item) => item.id === card.dataset.categoryId);
  if (!category) return;

  if (input.dataset.catField) {
    const key = input.dataset.catField;
    if (key === "required" || key === "defaultValue") {
      category[key] = input.checked;
      if (key === "required" && input.checked) category.defaultValue = true;
    } else if (key === "id") {
      category.id = slugify(input.value) || category.id;
      card.dataset.categoryId = category.id;
    } else {
      category[key] = input.value;
    }
  }

  if (input.dataset.signal) {
    category.signals = input.checked
      ? [...new Set([...category.signals, input.dataset.signal])]
      : category.signals.filter((signal) => signal !== input.dataset.signal);
  }
}

function addCategory() {
  const index = state.categories.length + 1;
  state.categories.push({
    id: `categoria-${index}`,
    label: `Categoria ${index}`,
    description: "Describe de forma clara para que se usa esta categoria de cookies.",
    required: false,
    defaultValue: false,
    signals: []
  });
  renderCategories();
  updateAll();
}

function addIntegration() {
  const raw = document.querySelector("#integration-value").value.trim();
  if (!raw) return;
  state.integrations.push({
    id: crypto.randomUUID(),
    type: document.querySelector("#integration-type").value,
    category: integrationCategory.value,
    value: raw
  });
  document.querySelector("#integration-value").value = "";
  updateAll();
}

function setPreviewMode(mode) {
  previewMode = mode;
  document.querySelectorAll(".preview-mode").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.previewMode === mode);
  });
  sendPreview({ mode, restart: mode === "banner" });
}

function setupEvents() {
  form.addEventListener("input", (event) => {
    if (event.target.name === "preset") applyPreset();
    if (event.target.closest("[data-category-id]")) {
      updateCategoryFromInput(event.target);
      renderIntegrationCategoryOptions();
    }
    updateAll();
  });

  form.addEventListener("change", (event) => {
    if (event.target.closest("[data-category-id]")) {
      updateCategoryFromInput(event.target);
      renderCategories();
    }
    updateAll();
  });

  form.addEventListener("click", (event) => {
    const deleteCategory = event.target.closest("[data-delete-category]");
    const deleteIntegration = event.target.closest("[data-delete-integration]");
    if (deleteCategory && deleteCategory.dataset.deleteCategory !== "necessary") {
      state.categories = state.categories.filter((category) => category.id !== deleteCategory.dataset.deleteCategory);
      state.integrations = state.integrations.filter((item) => item.category !== deleteCategory.dataset.deleteCategory);
      renderCategories();
      updateAll();
    }
    if (deleteIntegration) {
      state.integrations = state.integrations.filter((item) => item.id !== deleteIntegration.dataset.deleteIntegration);
      updateAll();
    }
  });

  document.querySelector("#add-category").addEventListener("click", addCategory);
  document.querySelector("#add-integration").addEventListener("click", addIntegration);
  document.querySelector("#restart-preview").addEventListener("click", () => sendPreview({ restart: true, mode: "banner" }));
  document.querySelector("#reset-config").addEventListener("click", () => window.location.reload());

  document.querySelectorAll(".preview-mode").forEach((button) => {
    button.addEventListener("click", () => setPreviewMode(button.dataset.previewMode));
  });

  document.querySelectorAll(".code-tab").forEach((button) => {
    button.addEventListener("click", () => {
      activeCodeTab = button.dataset.codeTab;
      document.querySelectorAll(".code-tab").forEach((tab) => tab.classList.toggle("is-active", tab === button));
      renderCode();
    });
  });

  document.querySelector("#copy-code").addEventListener("click", async () => {
    const copyText = installCode.textContent;
    let canUseAsyncClipboard = Boolean(navigator.clipboard?.writeText);
    if (canUseAsyncClipboard && navigator.permissions?.query) {
      try {
        const permission = await navigator.permissions.query({ name: "clipboard-write" });
        canUseAsyncClipboard = permission.state !== "denied";
      } catch {
        canUseAsyncClipboard = true;
      }
    }

    try {
      if (canUseAsyncClipboard) {
        await navigator.clipboard.writeText(copyText);
        copyStatus.textContent = "Codigo copiado";
        window.setTimeout(() => {
          copyStatus.textContent = "";
        }, 2200);
        return;
      }
    } catch {
      canUseAsyncClipboard = false;
    }

    if (!canUseAsyncClipboard) {
      const textarea = document.createElement("textarea");
      textarea.value = copyText;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.append(textarea);
      textarea.select();
      const copied = document.execCommand("copy");
      textarea.remove();
      copyStatus.textContent = copied ? "Codigo copiado" : "Selecciona el bloque para copiar";
    }
    window.setTimeout(() => {
      copyStatus.textContent = "";
    }, 2200);
  });

  window.addEventListener("message", (event) => {
    if (event.data?.type === "cccl-preview-ready") {
      previewReady = true;
      sendPreview({ restart: true, mode: previewMode });
    }
  });
}

renderPresets();
renderPositions();
applyPreset();
renderCategories();
renderIntegrations();
setupEvents();
updateAll({ restart: true });
