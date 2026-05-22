/* global document, crypto, FormData, window, navigator */

const form = document.querySelector("#config-form");
const siteTypeGrid = document.querySelector("#site-type-grid");
const presetGrid = document.querySelector("#preset-grid");
const fontPresetGrid = document.querySelector("#font-preset-grid");
const positionGrid = document.querySelector("#position-grid");
const toolMap = document.querySelector("#tool-map");
const categoryList = document.querySelector("#category-list");
const integrationList = document.querySelector("#integration-list");
const integrationCode = document.querySelector("#integration-code");
const installCode = document.querySelector("#install-code");
const installCodeWrap = document.querySelector("#install-code-wrap");
const previewFrame = document.querySelector("#preview-frame");
const previewShell = document.querySelector(".preview-shell");
const copyStatus = document.querySelector("#copy-status");
const toggleCodeButton = document.querySelector("#toggle-code");
const installStepAssets = document.querySelector("#install-step-assets");
const policyUrlFields = document.querySelector("#policy-url-fields");
const policyEmptyNote = document.querySelector("#policy-empty-note");
const ethicsReview = document.querySelector("#ethics-review");
const auditSummary = document.querySelector("#audit-summary");
const summaryCopyStatus = document.querySelector("#summary-copy-status");
const cdnVersion = "0.2.0";
const cdnBaseUrl = `https://cdn.jsdelivr.net/npm/cookie-consent-cl@${cdnVersion}/dist`;
const selfHostBaseUrl = "/dist";
const defaultFontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}
document.documentElement.scrollTop = 0;
document.body.scrollTop = 0;

let previewReady = false;
let previewMode = "banner";
let previewViewport = "desktop";
let codeExpanded = false;
let installMethod = "cdn";

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
    label: "Clásico",
    backgroundColor: "#ffffff",
    textColor: "#4b494b",
    primaryColor: "#533be2"
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
    label: "Ámbar",
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
  }
];

const fontPresets = [
  {
    id: "system",
    label: "Sistema",
    sample: "Clara y familiar",
    fontFamily: defaultFontFamily
  },
  {
    id: "serif",
    label: "Serif editorial",
    sample: "Más editorial",
    fontFamily: 'Georgia, "Times New Roman", serif'
  },
  {
    id: "mono",
    label: "Mono técnica",
    sample: "Precisa y técnica",
    fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", monospace'
  },
  {
    id: "rounded",
    label: "Redondeada",
    sample: "Amable y simple",
    fontFamily: '"Nunito", "Aptos Rounded", "Arial Rounded MT Bold", system-ui, sans-serif'
  }
];

const positions = [
  { id: "center", label: "Centro", previewClass: "pos-center" },
  { id: "bottom-left", label: "Abajo izquierda", previewClass: "pos-bottom-left" },
  { id: "bottom-right", label: "Abajo derecha", previewClass: "pos-bottom-right" },
  { id: "bottom", label: "Abajo centro", previewClass: "pos-bottom" }
];

const siteProfiles = [
  {
    id: "informativo",
    label: "Sitio informativo",
    description: "Para páginas simples con contenido, formulario de contacto y medición básica.",
    recommendedTools: ["ga4", "maps"],
    bannerDescription:
      "Usamos cookies necesarias para que este sitio funcione. Con tu autorización, podemos usar analítica para mejorar contenidos y servicios.",
    preferencesDescription:
      "Elige qué categorías autorizar. Las cookies necesarias se mantienen activas porque permiten el funcionamiento básico del sitio."
  },
  {
    id: "pyme",
    label: "PYME / servicios",
    description: "Para negocios que usan formularios, mapas, WhatsApp o campañas puntuales.",
    recommendedTools: ["ga4", "meta", "maps"],
    bannerDescription:
      "Usamos cookies necesarias para operar el sitio. Con tu autorización, podemos medir visitas, mejorar servicios y cargar herramientas externas.",
    preferencesDescription:
      "Puedes autorizar analítica, marketing o preferencias. Las necesarias siguen activas para que el sitio funcione correctamente."
  },
  {
    id: "ecommerce",
    label: "Ecommerce simple",
    description: "Para tiendas que miden conversiones o usan herramientas de marketing.",
    recommendedTools: ["ga4", "gtm", "meta", "hubspot"],
    bannerDescription:
      "Usamos cookies necesarias para navegación y funcionamiento del sitio. Con tu autorización, podemos medir compras, campañas y preferencias.",
    preferencesDescription:
      "Configura qué herramientas pueden activarse. Las cookies necesarias se mantienen porque sostienen funciones básicas del sitio."
  },
  {
    id: "ong",
    label: "ONG / comunidad",
    description: "Para organizaciones que priorizan claridad, bajo seguimiento y contenido embebido.",
    recommendedTools: ["youtube", "maps", "customIframe"],
    bannerDescription:
      "Usamos cookies necesarias para que el sitio funcione. Algunos contenidos externos o preferencias solo se cargarán si los autorizas.",
    preferencesDescription:
      "Puedes elegir si autorizas contenidos externos o preferencias. Las cookies necesarias permiten el funcionamiento básico del sitio."
  },
  {
    id: "medio",
    label: "Medio o blog",
    description: "Para publicaciones con analítica, videos embebidos o newsletter.",
    recommendedTools: ["ga4", "youtube", "typeform"],
    bannerDescription:
      "Usamos cookies necesarias para entregar el sitio. Con tu autorización, podemos usar analítica y cargar contenidos externos.",
    preferencesDescription:
      "Elige qué categorías autorizar. Puedes cambiar tu decisión después desde el icono de preferencias."
  }
];

const integrationLabels = {
  gtm: "Google Tag Manager",
  ga4: "Google Analytics 4",
  hotjar: "Hotjar",
  clarity: "Microsoft Clarity",
  meta: "Meta Pixel",
  linkedin: "LinkedIn Insight Tag",
  tiktok: "TikTok Pixel",
  hubspot: "HubSpot tracking",
  youtube: "YouTube embed",
  maps: "Google Maps",
  calendly: "Calendly",
  typeform: "Typeform",
  custom: "Script personalizado",
  customIframe: "Iframe/embed personalizado"
};

const integrationMeta = {
  gtm: {
    label: "Google Tag Manager",
    placeholder: "GTM-XXXXXXX",
    defaultCategory: "analytics",
    requiredLabel: "Container ID"
  },
  ga4: {
    label: "Google Analytics 4",
    placeholder: "G-XXXXXXXXXX",
    defaultCategory: "analytics",
    requiredLabel: "Measurement ID"
  },
  hotjar: {
    label: "Hotjar",
    placeholder: "1234567",
    defaultCategory: "analytics",
    requiredLabel: "Site ID"
  },
  clarity: {
    label: "Microsoft Clarity",
    placeholder: "abcdef1234",
    defaultCategory: "analytics",
    requiredLabel: "Project ID"
  },
  meta: {
    label: "Meta Pixel",
    placeholder: "1234567890",
    defaultCategory: "marketing",
    requiredLabel: "Pixel ID"
  },
  linkedin: {
    label: "LinkedIn Insight Tag",
    placeholder: "123456",
    defaultCategory: "marketing",
    requiredLabel: "Partner ID"
  },
  tiktok: {
    label: "TikTok Pixel",
    placeholder: "CXXXXXXXXXXXX",
    defaultCategory: "marketing",
    requiredLabel: "Pixel ID"
  },
  hubspot: {
    label: "HubSpot tracking",
    placeholder: "1234567",
    defaultCategory: "marketing",
    requiredLabel: "Hub ID"
  },
  youtube: {
    label: "YouTube embed",
    placeholder: "VIDEO_ID",
    defaultCategory: "preferences",
    requiredLabel: "Video ID"
  },
  maps: {
    label: "Google Maps",
    placeholder: "https://www.google.com/maps/embed?...",
    defaultCategory: "preferences",
    requiredLabel: "URL embed"
  },
  calendly: {
    label: "Calendly",
    placeholder: "https://calendly.com/tu-equipo/demo",
    defaultCategory: "preferences",
    requiredLabel: "URL Calendly"
  },
  typeform: {
    label: "Typeform",
    placeholder: "https://form.typeform.com/to/XXXX",
    defaultCategory: "preferences",
    requiredLabel: "URL Typeform"
  },
  custom: {
    label: "Script personalizado",
    placeholder: "https://example.com/script.js",
    defaultCategory: "analytics",
    requiredLabel: "Script URL"
  },
  customIframe: {
    label: "Iframe/embed personalizado",
    placeholder: "https://example.com/embed",
    defaultCategory: "preferences",
    requiredLabel: "URL embed"
  }
};

const toolCatalog = [
  {
    type: "ga4",
    title: "Google Analytics",
    helper: "Medición de visitas y comportamiento agregado.",
    consent: "analytics",
    reason: "Debe cargarse solo cuando la persona autorice Analítica."
  },
  {
    type: "gtm",
    title: "Google Tag Manager",
    helper: "Puede activar otras etiquetas desde un contenedor.",
    consent: "analytics",
    reason: "Úsalo con cuidado: GTM puede disparar analítica o marketing."
  },
  {
    type: "meta",
    title: "Meta Pixel",
    helper: "Medición de campañas y atribución publicitaria.",
    consent: "marketing",
    reason: "Normalmente corresponde a Marketing."
  },
  {
    type: "youtube",
    title: "YouTube",
    helper: "Videos embebidos o contenido de terceros.",
    consent: "preferences",
    reason: "Cárgalo después de autorización o interacción clara."
  },
  {
    type: "maps",
    title: "Google Maps",
    helper: "Mapas embebidos para dirección o puntos de atención.",
    consent: "preferences",
    reason: "Puede implicar solicitudes a terceros."
  },
  {
    type: "hubspot",
    title: "HubSpot",
    helper: "CRM, formularios o tracking comercial.",
    consent: "marketing",
    reason: "Asócialo a Marketing salvo que tu caso sea estrictamente funcional."
  },
  {
    type: "custom",
    title: "Otro script",
    helper: "Script externo o integración propia.",
    consent: "analytics",
    reason: "Revisa qué hace antes de publicarlo."
  }
];

const suggestedIntegrations = {
  necessary: ["custom"],
  analytics: ["ga4", "gtm", "hotjar", "clarity", "custom"],
  marketing: ["meta", "linkedin", "tiktok", "hubspot", "gtm", "custom"],
  preferences: ["youtube", "maps", "calendly", "typeform", "customIframe", "custom"]
};

const state = {
  siteProfile: "pyme",
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
  integrations: [],
  cookieDeclarations: []
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
        <label class="preset-card" style="--preset-bg:${preset.backgroundColor}; --preset-text:${preset.textColor}; --preset-primary:${preset.primaryColor};">
          <input type="radio" name="preset" value="${preset.id}" ${index === 0 ? "checked" : ""}>
          <span class="preset-card__preview">
            <strong>${preset.label}</strong>
            <span class="preset-wave"></span>
          </span>
        </label>
      `
    )
    .join("");
}

function renderFontPresets() {
  fontPresetGrid.innerHTML = fontPresets
    .map(
      (preset, index) => `
        <label class="font-preset-card" style="--font-preview-family:${preset.fontFamily || defaultFontFamily};">
          <input type="radio" name="fontPreset" value="${preset.id}" ${index === 0 ? "checked" : ""}>
          <span>
            <strong>${preset.label}</strong>
            <em>${preset.sample}</em>
          </span>
        </label>
      `
    )
    .join("");
}

function renderSiteProfiles() {
  siteTypeGrid.innerHTML = siteProfiles
    .map(
      (profile) => `
        <label class="site-type-card">
          <input type="radio" name="siteProfile" value="${profile.id}" ${profile.id === state.siteProfile ? "checked" : ""}>
          <span>
            <strong>${profile.label}</strong>
            <small>${profile.description}</small>
          </span>
          <em>${profile.recommendedTools.map((type) => integrationLabels[type]).join(", ")}</em>
        </label>
      `
    )
    .join("");
}

function applySiteProfile(profileId) {
  const profile = siteProfiles.find((item) => item.id === profileId);
  if (!profile) return;
  state.siteProfile = profile.id;
  setField("bannerDescription", profile.bannerDescription);
  setField("preferencesDescription", profile.preferencesDescription);
}

function renderPositions() {
  positionGrid.innerHTML = positions
    .map(
      (position) => `
        <label class="position-card">
          <input type="radio" name="position" value="${position.id}" ${position.id === "bottom" ? "checked" : ""}>
          <span class="position-preview ${position.previewClass}"></span>
          <span class="position-card__label">${position.label}</span>
        </label>
      `
    )
    .join("");
}

function renderToolMap() {
  const activeProfile = siteProfiles.find((profile) => profile.id === state.siteProfile) || siteProfiles[1];
  const recommended = new Set(activeProfile.recommendedTools);
  toolMap.innerHTML = toolCatalog
    .map((tool) => {
      const meta = integrationMeta[tool.type];
      const addedIntegrations = state.integrations.filter((integration) => integration.type === tool.type);
      const categoryExists = state.categories.some((category) => category.id === tool.consent);
      const targetCategory = categoryExists ? tool.consent : state.categories.find((category) => !category.required)?.id || "preferences";
      return `
        <article class="tool-card ${recommended.has(tool.type) ? "tool-card--recommended" : ""}" data-tool-type="${tool.type}">
          <div class="tool-card__header">
            <div>
              <h3>${tool.title}</h3>
              <p>${tool.helper}</p>
            </div>
            ${recommended.has(tool.type) ? '<span class="category-badge">Sugerida</span>' : ""}
          </div>
          <p class="tool-card__reason">${tool.reason}</p>
          ${
            addedIntegrations.length
              ? `<div class="tool-card__added" aria-live="polite">
                  <strong>${addedIntegrations.length === 1 ? "Integración agregada" : "Integraciones agregadas"}</strong>
                  ${addedIntegrations
                    .map((integration) => {
                      const category = state.categories.find((item) => item.id === integration.category);
                      return `<span>${escapeHtml(integration.value)} · ${escapeHtml(category?.label || integration.category)}</span>`;
                    })
                    .join("")}
                </div>`
              : ""
          }
          <div class="tool-card__form">
            <label>
              Categoría
              <select data-tool-category>
                ${state.categories
                  .filter((category) => !category.required || tool.type === "custom")
                  .map(
                    (category) =>
                      `<option value="${category.id}" ${category.id === targetCategory ? "selected" : ""}>${escapeHtml(category.label)}</option>`
                  )
                  .join("")}
              </select>
            </label>
            <label>
              ${meta.requiredLabel}
              <input data-tool-value placeholder="${meta.placeholder}" />
            </label>
            <button class="button button--secondary" type="button" data-add-tool="${tool.type}">Agregar</button>
          </div>
          <p class="form-error" data-tool-error role="alert" aria-live="polite"></p>
        </article>
      `;
    })
    .join("");
}

function renderCategories() {
  categoryList.innerHTML = state.categories
    .map(
      (category) => `
        <article class="category-card" data-category-id="${category.id}">
          <div class="category-card__header">
            <div>
              <h3>${escapeHtml(category.label)}</h3>
              <p>${category.required ? "Esta categoria es necesaria para el funcionamiento basico del sitio y no se puede desactivar." : "Esta categoria se activara solo si la persona la autoriza."}</p>
            </div>
            ${
              category.id === "necessary"
                ? '<span class="category-badge">Requerida</span>'
                : `<button class="ghost-small" type="button" data-delete-category="${category.id}" aria-label="Eliminar ${escapeHtml(category.label)}">Eliminar</button>`
            }
          </div>
          <div class="field-grid field-grid--two">
            <label>Identificador <input data-cat-field="id" value="${escapeHtml(category.id)}" ${category.id === "necessary" ? "disabled" : ""}></label>
            <label>Etiqueta <input data-cat-field="label" value="${escapeHtml(category.label)}"></label>
          </div>
          <label>Descripcion <textarea data-cat-field="description">${escapeHtml(category.description)}</textarea></label>
          <section class="category-section">
            <div class="category-section__header">
              <div>
                <h4>Integraciones</h4>
                <p>${category.required ? "Evita asociar herramientas de analitica o marketing a Necesarias. Usa esta categoria solo para elementos indispensables." : "Estas herramientas se cargaran solo si la persona autoriza esta categoria."}</p>
              </div>
            </div>
            ${renderCategoryIntegrations(category)}
          </section>
          <details class="advanced-card">
            <summary>Avanzado</summary>
            <div class="advanced-card__body">
              <p class="helper">Configura senales tecnicas para Google Consent Mode, Google Tag Manager u otras integraciones.</p>
              <p class="helper">Cuando esta categoria sea autorizada, las senales seleccionadas se enviaran como granted. Si no es autorizada, se mantendran como denied.</p>
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
          </details>
        </article>
      `
    )
    .join("");
}

function renderCategoryIntegrations(category) {
  const integrations = state.integrations.filter((integration) => integration.category === category.id);
  const types = integrationTypesForCategory(category);
  return `
    <div class="category-integration-list">
      ${
        integrations.length
          ? integrations
              .map(
                (integration) => `
                  <article class="integration-item integration-item--inline">
                    <div>
                      <strong>${integrationLabels[integration.type]}</strong>
                      <p>${escapeHtml(integration.value)}</p>
                    </div>
                    <button class="ghost-small" type="button" data-delete-integration="${integration.id}" aria-label="Eliminar ${integrationLabels[integration.type]}">Eliminar</button>
                  </article>
                `
              )
              .join("")
          : '<p class="helper">Aun no hay integraciones asociadas a esta categoria.</p>'
      }
    </div>
    <div class="category-integration-form">
      <label>
        Integracion
        <select data-integration-type>
          ${types.map((type) => `<option value="${type}">${integrationLabels[type]}</option>`).join("")}
        </select>
      </label>
      <label>
        ID o URL
        <input data-integration-value placeholder="${integrationMeta[types[0]].placeholder}" />
      </label>
      <button class="button button--primary" type="button" data-add-category-integration="${category.id}">Agregar integracion</button>
    </div>
    <p class="form-error" data-integration-error role="alert" aria-live="polite"></p>
    <pre class="snippet snippet--small"><code>${escapeHtml(buildIntegrationSnippets(category.id))}</code></pre>
  `;
}

function integrationTypesForCategory(category) {
  if (category.id in suggestedIntegrations) return suggestedIntegrations[category.id];
  if (category.required) return suggestedIntegrations.necessary;
  return ["custom", "customIframe"];
}

function renderIntegrations() {
  if (!state.integrations.length) {
    integrationList.innerHTML = '<p class="helper">Agrega integraciones desde cada tipo de consentimiento.</p>';
    integrationCode.textContent = buildIntegrationSnippets();
    return;
  }

  integrationList.innerHTML = state.categories
    .map((category) => {
      const integrations = state.integrations.filter((integration) => integration.category === category.id);
      if (!integrations.length) return "";
      return `
        <article class="integration-summary-group">
          <h3>${escapeHtml(category.label)}</h3>
          ${integrations
            .map(
              (integration) => `
                <div class="integration-item">
                  <div>
                    <strong>${integrationLabels[integration.type]}</strong>
                    <p>${escapeHtml(integration.value)}</p>
                  </div>
                  <span class="category-badge">${escapeHtml(category.id)}</span>
                </div>
              `
            )
            .join("")}
        </article>
      `;
    })
    .join("");
  integrationCode.textContent = buildIntegrationSnippets();
}

function syncConditionalSections() {
  document.querySelectorAll("[data-condition]").forEach((section) => {
    section.hidden = !checked(section.dataset.condition);
  });
  const hasPolicyLinks = value("policyLinksMode") === "custom";
  if (policyUrlFields) policyUrlFields.hidden = !hasPolicyLinks;
  if (policyEmptyNote) policyEmptyNote.hidden = hasPolicyLinks;
}

function syncRangeLabels() {
  document.querySelector("#opacity-value").textContent = Number(value("overlayOpacity")).toFixed(2);
  document.querySelector("#blur-value").textContent = `${value("overlayBlur")}px`;
}

function syncColorLabels() {
  ["backgroundColor", "textColor", "primaryColor"].forEach((name) => {
    const output = document.querySelector(`[data-color-value="${name}"]`);
    if (output) output.textContent = value(name).toUpperCase();
  });
  form.style.setProperty("--cc-preview-bg", value("backgroundColor"));
  form.style.setProperty("--cc-preview-text", value("textColor"));
  form.style.setProperty("--cc-preview-primary", value("primaryColor"));
  form.style.setProperty("--cc-preview-font", selectedFontFamily());
}

function applyPreset() {
  const preset = presets.find((item) => item.id === value("preset")) || presets[0];
  setField("backgroundColor", preset.backgroundColor);
  setField("textColor", preset.textColor);
  setField("primaryColor", preset.primaryColor);
}

function selectedFontFamily() {
  const selectedPreset = fontPresets.find((item) => item.id === value("fontPreset")) || fontPresets[0];
  return selectedPreset.fontFamily;
}

function isCustomFontSelected() {
  return selectedFontFamily() !== defaultFontFamily;
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
  const hasPolicyLinks = value("policyLinksMode") === "custom";
  const cookiePolicyUrl = hasPolicyLinks ? value("cookiePolicyUrl").trim() : "";
  const privacyPolicyUrl = hasPolicyLinks ? value("privacyPolicyUrl").trim() : "";
  return {
    siteId: "demo-site",
    language: "es-CL",
    policyVersion: "2026-01-01",
    bannerVersion: "1.0.0",
    ...(cookiePolicyUrl ? { cookiePolicyUrl } : {}),
    ...(privacyPolicyUrl ? { privacyPolicyUrl } : {}),
    ethicalMode: true,
    position: value("position"),
    theme: {
      primaryColor: value("primaryColor"),
      backgroundColor: value("backgroundColor"),
      textColor: value("textColor"),
      ...(isCustomFontSelected() ? { fontFamily: selectedFontFamily() } : {})
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
    animation: {
      enabled: true,
      type: "cookie-comet"
    },
    dataLayerEventName: value("dataLayerEventName") || "cookie_consent_cl_update",
    categories: state.categories.map((category) => ({
      id: category.id,
      label: category.label,
      description: category.description,
      required: category.required,
      defaultValue: category.required ? true : false,
      googleConsentMode: category.signals
    })),
    cookies: buildCookieDeclarations(),
    text: {
      bannerTitle: value("bannerTitle"),
      bannerDescription: value("bannerDescription"),
      acceptAll: value("acceptAll"),
      acceptAllAriaLabel: "Aceptar todas las cookies",
      rejectNonEssential: value("rejectNonEssential"),
      rejectNonEssentialAriaLabel: "Rechazar todas las cookies no necesarias",
      configure: value("configure"),
      configureAriaLabel: "Abrir configuracion de cookies",
      savePreferences: value("savePreferences"),
      savePreferencesAriaLabel: "Guardar preferencias de cookies",
      preferencesTitle: value("preferencesTitle"),
      preferencesDescription: value("preferencesDescription"),
      changePreferences: "Revisar preferencias"
    }
  };
}

function buildCookieDeclarations() {
  const categoryIds = new Set(state.categories.map((category) => category.id));
  return state.cookieDeclarations.filter((cookie) => categoryIds.has(cookie.category));
}

function buildIntegrationSnippets(categoryId = null) {
  const integrations = categoryId
    ? state.integrations.filter((integration) => integration.category === categoryId)
    : state.integrations;
  if (!integrations.length) {
    return "<!-- Agrega una integracion para generar snippets de carga condicionada. -->";
  }

  if (categoryId) return integrations.map(integrationSnippet).join("\n\n");

  return state.categories
    .map((category) => {
      const categoryIntegrations = integrations.filter((integration) => integration.category === category.id);
      if (!categoryIntegrations.length) return "";
      return `<!-- ${category.label}: se carga solo si la persona autoriza esta categoria -->\n${categoryIntegrations
        .map(integrationSnippet)
        .join("\n\n")}`;
    })
    .filter(Boolean)
    .join("\n\n");
}

function integrationSnippet(integration) {
  const category = integration.category;
  const raw = integration.value.trim();
  if (integration.type === "gtm") {
    return `<script
  type="text/plain"
  data-cookie-consent="${category}"
  data-src="https://www.googletagmanager.com/gtm.js?id=${raw}">
</script>`;
  }
  if (integration.type === "ga4") {
    return `<script
  type="text/plain"
  data-cookie-consent="${category}"
  data-src="https://www.googletagmanager.com/gtag/js?id=${raw}">
</script>
<script type="text/plain" data-cookie-consent="${category}">
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag("js", new Date());
  gtag("config", "${raw}");
</script>`;
  }
  if (integration.type === "hubspot") {
    return `<script
  type="text/plain"
  data-cookie-consent="${category}"
  data-src="https://js.hs-scripts.com/${raw}.js">
</script>`;
  }
  if (integration.type === "hotjar") {
    return `<script type="text/plain" data-cookie-consent="${category}">
  // Hotjar placeholder.
  // Reemplaza este bloque por el snippet oficial en produccion.
  window.hotjarSiteId = "${raw}";
</script>`;
  }
  if (integration.type === "clarity") {
    return `<script type="text/plain" data-cookie-consent="${category}">
  // Microsoft Clarity placeholder.
  // Reemplaza este bloque por el snippet oficial en produccion.
  window.clarityProjectId = "${raw}";
</script>`;
  }
  if (integration.type === "tiktok") {
    return `<script type="text/plain" data-cookie-consent="${category}">
  // TikTok Pixel placeholder.
  // Reemplaza este bloque por el snippet oficial en produccion.
  window.tiktokPixelId = "${raw}";
</script>`;
  }
  if (integration.type === "youtube") {
    return `<iframe
  data-cookie-consent="${category}"
  data-src="https://www.youtube.com/embed/${raw}"
  title="Video"
  loading="lazy">
</iframe>`;
  }
  if (integration.type === "maps" || integration.type === "calendly" || integration.type === "typeform" || integration.type === "customIframe") {
    return `<iframe
  data-cookie-consent="${category}"
  data-src="${raw}"
  title="Contenido externo"
  loading="lazy">
</iframe>`;
  }
  if (integration.type === "linkedin") {
    return `<script type="text/plain" data-cookie-consent="${category}">
  // LinkedIn Insight Tag placeholder.
  // Reemplaza este bloque por el snippet oficial en produccion.
  window._linkedin_partner_id = "${raw}";
</script>`;
  }
  if (integration.type === "meta") {
    return `<script type="text/plain" data-cookie-consent="${category}">
  // Meta Pixel placeholder.
  // Reemplaza este bloque por el snippet oficial en produccion.
  window.metaPixelId = "${raw}";
</script>`;
  }
  return `<script
  type="text/plain"
  data-cookie-consent="${category}"
  data-src="${raw}">
</script>`;
}

function buildInstallCode() {
  const config = JSON.stringify(buildConfig(), null, 2);
  const radius = value("borderRadius");
  const snippets = buildIntegrationSnippets();
  const assetBaseUrl = installMethod === "self-host" ? selfHostBaseUrl : cdnBaseUrl;
  const styleBlock = `<style>
  .cccl-banner,
  .cccl-modal,
  .cccl-preferences-notice,
  .cccl-cookie-icon {
    border-radius: ${radius}px;
  }
</style>`;

  return `<link rel="stylesheet" href="${assetBaseUrl}/cookie-consent-cl.css" />
<script src="${assetBaseUrl}/cookie-consent-cl.iife.js"></script>
${styleBlock}

<!-- Scripts bloqueados por consentimiento -->
${snippets}

<script>
  window.CookieConsentCL.init(${config});
</script>`;
}

function renderCode() {
  renderInstallMethod();
  installCode.textContent = buildInstallCode();
  syncCodeExpansion();
}

function renderEthicsReview() {
  const config = buildConfig();
  const hasPolicyMode = value("policyLinksMode") === "custom";
  const optionalDefaultOn = config.categories.some((category) => !category.required && category.defaultValue);
  const hasBlockedSnippets = state.integrations.length > 0;
  const checks = [
    {
      ok: true,
      label: "Aceptar y rechazar tienen el mismo peso visual",
      note: "El banner evita priorizar la aceptación por diseño."
    },
    {
      ok: !optionalDefaultOn,
      label: "Opcionales apagadas por defecto",
      note: optionalDefaultOn ? "Revisa categorías opcionales heredadas." : "La persona decide antes de activar analítica, marketing o preferencias."
    },
    {
      ok: config.cookieIcon.enabled,
      label: "Preferencias siempre reabribles",
      note: config.cookieIcon.enabled ? "El icono persistente permite cambiar la decisión." : "Activa el icono o agrega un enlace equivalente."
    },
    {
      ok: hasBlockedSnippets,
      label: "Scripts no esenciales usan data-cookie-consent",
      note: hasBlockedSnippets ? "Las integraciones agregadas quedan bloqueadas hasta autorización." : "Agrega herramientas si tu sitio usa analítica, marketing o embeds."
    },
    {
      ok: true,
      label: "No se usan textos manipulativos",
      note: "Los botones mantienen lenguaje directo y reversible."
    },
    {
      ok: hasPolicyMode ? Boolean(config.cookiePolicyUrl || config.privacyPolicyUrl) : true,
      label: "Políticas enlazadas o marcadas como pendientes",
      note: hasPolicyMode
        ? "Incluye al menos una URL si ya tienes políticas publicadas."
        : "El configurador no genera enlaces falsos si aún no tienes políticas."
    }
  ];

  ethicsReview.innerHTML = checks
    .map(
      (check) => `
        <article class="review-item ${check.ok ? "is-ok" : "is-pending"}">
          <span aria-hidden="true">${check.ok ? "✓" : "!"}</span>
          <div>
            <strong>${check.label}</strong>
            <p>${check.note}</p>
          </div>
        </article>
      `
    )
    .join("");
}

function buildAuditSummaryText() {
  const config = buildConfig();
  const categories = config.categories
    .map((category) => `- ${category.label} (${category.id}): ${category.required ? "requerida" : "opcional, desactivada por defecto"}`)
    .join("\n");
  const integrations = state.integrations.length
    ? state.integrations
        .map((integration) => {
          const category = state.categories.find((item) => item.id === integration.category);
          return `- ${integrationLabels[integration.type]}: ${category?.label || integration.category} (${integration.value})`;
        })
        .join("\n")
    : "- Sin integraciones configuradas en el asistente.";
  const cookies = buildCookieDeclarations()
    .map((cookie) => `- ${cookie.name}: ${cookie.provider}, ${cookie.category}, ${cookie.duration}`)
    .join("\n");
  const policies = [
    config.cookiePolicyUrl ? `- Política de cookies: ${config.cookiePolicyUrl}` : "- Política de cookies: pendiente o no configurada",
    config.privacyPolicyUrl ? `- Política de privacidad: ${config.privacyPolicyUrl}` : "- Política de privacidad: pendiente o no configurada"
  ].join("\n");

  return `Resumen de configuración cookie-consent-cl

Sitio: ${config.siteId}
Idioma: ${config.language}
Versión de política: ${config.policyVersion}
Versión del banner: ${config.bannerVersion}
Tipo de sitio sugerido: ${siteProfiles.find((profile) => profile.id === state.siteProfile)?.label || "Manual"}

Categorías:
${categories}

Integraciones bloqueadas por consentimiento:
${integrations}

Cookies declaradas:
${cookies || "- Sin cookies declaradas."}

Políticas:
${policies}

Nota: Este resumen es una bitácora técnica. No constituye asesoría legal ni garantiza cumplimiento normativo por sí solo.`;
}

function renderAuditSummary() {
  auditSummary.innerHTML = `<pre>${escapeHtml(buildAuditSummaryText())}</pre>`;
}

function renderInstallMethod() {
  document.querySelectorAll(".install-method").forEach((label) => {
    const input = label.querySelector("input");
    label.classList.toggle("is-selected", input?.value === installMethod);
  });

  if (installStepAssets) {
    installStepAssets.innerHTML =
      installMethod === "self-host"
        ? 'Sube <code>dist/cookie-consent-cl.css</code> y <code>dist/cookie-consent-cl.iife.js</code> a tu servidor, y ajusta las rutas si usas otra carpeta.'
        : 'Usa las URLs versionadas de jsDelivr para cargar <code>cookie-consent-cl.css</code> y <code>cookie-consent-cl.iife.js</code>.';
  }
}

function syncCodeExpansion() {
  installCodeWrap.classList.toggle("is-expanded", codeExpanded);
  toggleCodeButton.setAttribute("aria-expanded", String(codeExpanded));
  toggleCodeButton.textContent = codeExpanded ? "Ocultar código" : "Ver código completo";
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

function schedulePreviewSync({ restart = false, attempts = 4 } = {}) {
  previewReady = true;
  Array.from({ length: attempts }).forEach((_, index) => {
    window.setTimeout(() => sendPreview({ restart: index === 0 ? restart : false, mode: previewMode }), 150 + index * 300);
  });
}

async function copyToClipboard(copyText) {
  try {
    await navigator.clipboard.writeText(copyText);
    return true;
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = copyText;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.append(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();
    return copied;
  }
}

function updateAll({ restart = false } = {}) {
  syncConditionalSections();
  syncRangeLabels();
  syncColorLabels();
  renderToolMap();
  renderIntegrations();
  renderCode();
  renderEthicsReview();
  renderAuditSummary();
  sendPreview({ restart });
}

function updateCategoryFromInput(input) {
  const card = input.closest("[data-category-id]");
  if (!card) return;
  const category = state.categories.find((item) => item.id === card.dataset.categoryId);
  if (!category) return;

  if (input.dataset.catField) {
    const key = input.dataset.catField;
    if (key === "id") {
      const previousId = category.id;
      category.id = slugify(input.value) || category.id;
      card.dataset.categoryId = category.id;
      state.integrations = state.integrations.map((integration) =>
        integration.category === previousId ? { ...integration, category: category.id } : integration
      );
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

function addIntegration(categoryCard) {
  const typeControl = categoryCard.querySelector("[data-integration-type]");
  const valueControl = categoryCard.querySelector("[data-integration-value]");
  const error = categoryCard.querySelector("[data-integration-error]");
  const categoryId = categoryCard.dataset.categoryId;
  const type = typeControl.value;
  const raw = valueControl.value.trim();
  const meta = integrationMeta[type];
  error.textContent = "";
  if (!raw) {
    error.textContent = `Ingresa un ${meta.requiredLabel} para agregar ${meta.label}.`;
    return;
  }
  if (["custom", "customIframe", "maps", "calendly", "typeform"].includes(type) && !/^https?:\/\//i.test(raw)) {
    error.textContent = "La URL debe comenzar con http:// o https://.";
    return;
  }
  state.integrations.push({
    id: crypto.randomUUID(),
    type,
    category: categoryId,
    value: raw
  });
  valueControl.value = "";
  renderCategories();
  updateAll();
}

function addToolIntegration(toolCard) {
  const type = toolCard.dataset.toolType;
  const category = toolCard.querySelector("[data-tool-category]")?.value;
  const valueControl = toolCard.querySelector("[data-tool-value]");
  const error = toolCard.querySelector("[data-tool-error]");
  const raw = valueControl.value.trim();
  const meta = integrationMeta[type];
  error.textContent = "";

  if (!raw) {
    error.textContent = `Ingresa un ${meta.requiredLabel} para agregar ${meta.label}.`;
    return;
  }
  if (["custom", "customIframe", "maps", "calendly", "typeform"].includes(type) && !/^https?:\/\//i.test(raw)) {
    error.textContent = "La URL debe comenzar con http:// o https://.";
    return;
  }

  state.integrations.push({
    id: crypto.randomUUID(),
    type,
    category,
    value: raw
  });
  valueControl.value = "";
  renderCategories();
  updateAll();
}

function resetPreview() {
  previewMode = "banner";
  sendPreview({ restart: true, mode: "banner" });
}

function renderPreviewViewport() {
  previewShell.dataset.previewViewport = previewViewport;
  document.querySelectorAll(".preview-device-toggle__button[data-preview-viewport]").forEach((button) => {
    const isSelected = button.dataset.previewViewport === previewViewport;
    button.classList.toggle("is-active", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });
}

function setupEvents() {
  form.addEventListener("input", (event) => {
    if (event.target.closest("#tool-map")) return;
    if (event.target.name === "preset") applyPreset();
    if (event.target.dataset.catField || event.target.dataset.signal) {
      updateCategoryFromInput(event.target);
    }
    updateAll();
  });

  form.addEventListener("change", (event) => {
    if (event.target.name === "siteProfile") {
      applySiteProfile(event.target.value);
      renderSiteProfiles();
      updateAll();
      return;
    }
    if (event.target.closest("#tool-map")) return;
    if (event.target.name === "installMethod") {
      installMethod = event.target.value;
      renderCode();
      return;
    }
    if (event.target.dataset.catField || event.target.dataset.signal) {
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

    const addCategoryIntegration = event.target.closest("[data-add-category-integration]");
    if (addCategoryIntegration) {
      addIntegration(addCategoryIntegration.closest("[data-category-id]"));
    }
    const addTool = event.target.closest("[data-add-tool]");
    if (addTool) {
      addToolIntegration(addTool.closest("[data-tool-type]"));
    }
  });

  document.querySelectorAll(".preview-device-toggle__button[data-preview-viewport]").forEach((button) => {
    button.addEventListener("click", () => {
      previewViewport = button.dataset.previewViewport;
      renderPreviewViewport();
    });
  });

  document.querySelector("#preview-restart-control").addEventListener("click", resetPreview);

  document.querySelector("#add-category").addEventListener("click", addCategory);

  form.addEventListener("change", (event) => {
    const typeControl = event.target.closest("[data-integration-type]");
    if (!typeControl) return;
    const card = typeControl.closest("[data-category-id]");
    const valueControl = card?.querySelector("[data-integration-value]");
    if (valueControl) valueControl.placeholder = integrationMeta[typeControl.value].placeholder;
  });

  document.querySelector("#copy-code").addEventListener("click", async () => {
    const copyText = installCode.textContent;
    const copied = await copyToClipboard(copyText);
    copyStatus.textContent = copied ? "Codigo copiado" : "Selecciona el bloque para copiar";
    window.setTimeout(() => {
      copyStatus.textContent = "";
    }, 2200);
  });

  toggleCodeButton.addEventListener("click", () => {
    codeExpanded = !codeExpanded;
    syncCodeExpansion();
  });

  document.querySelector("#copy-summary").addEventListener("click", async () => {
    const copied = await copyToClipboard(buildAuditSummaryText());
    summaryCopyStatus.textContent = copied ? "Resumen copiado" : "Selecciona el resumen para copiar";
    window.setTimeout(() => {
      summaryCopyStatus.textContent = "";
    }, 2200);
  });

  window.addEventListener("message", (event) => {
    if (event.data?.type === "cccl-preview-ready") {
      previewReady = true;
      sendPreview({ restart: true, mode: previewMode });
    }
    if (event.data?.type === "cccl-preview-mode") {
      previewMode = event.data.mode;
    }
    if (event.data?.type === "cccl-preview-restart") {
      resetPreview();
    }
  });

  previewFrame.addEventListener("load", () => {
    schedulePreviewSync({ restart: true });
  });
}

renderSiteProfiles();
renderPresets();
renderFontPresets();
renderPositions();
applySiteProfile(state.siteProfile);
applyPreset();
renderCategories();
renderIntegrations();
renderPreviewViewport();
setupEvents();
updateAll({ restart: true });
schedulePreviewSync({ restart: true });
