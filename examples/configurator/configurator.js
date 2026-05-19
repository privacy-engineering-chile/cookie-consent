/* global document, crypto, FormData, window, navigator */

const form = document.querySelector("#config-form");
const presetGrid = document.querySelector("#preset-grid");
const positionGrid = document.querySelector("#position-grid");
const categoryList = document.querySelector("#category-list");
const integrationList = document.querySelector("#integration-list");
const integrationCode = document.querySelector("#integration-code");
const installCode = document.querySelector("#install-code");
const installCodeWrap = document.querySelector("#install-code-wrap");
const previewFrame = document.querySelector("#preview-frame");
const copyStatus = document.querySelector("#copy-status");
const toggleCodeButton = document.querySelector("#toggle-code");
const cdnVersion = "0.1.0";
const cdnBaseUrl = `https://cdn.jsdelivr.net/npm/cookie-consent-cl@${cdnVersion}/dist`;

if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}
document.documentElement.scrollTop = 0;
document.body.scrollTop = 0;

let previewReady = false;
let previewMode = "banner";
let codeExpanded = false;

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
    label: "Clasico",
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

const suggestedIntegrations = {
  necessary: ["custom"],
  analytics: ["ga4", "gtm", "hotjar", "clarity", "custom"],
  marketing: ["meta", "linkedin", "tiktok", "hubspot", "gtm", "custom"],
  preferences: ["youtube", "maps", "calendly", "typeform", "customIframe", "custom"]
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
  integrations: []
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
}

function syncRangeLabels() {
  document.querySelector("#radius-value").textContent = `${value("borderRadius")}px`;
  document.querySelector("#opacity-value").textContent = Number(value("overlayOpacity")).toFixed(2);
  document.querySelector("#blur-value").textContent = `${value("overlayBlur")}px`;
}

function syncColorLabels() {
  ["backgroundColor", "textColor", "primaryColor"].forEach((name) => {
    const output = document.querySelector(`[data-color-value="${name}"]`);
    if (output) output.textContent = value(name).toUpperCase();
  });
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
  const cookiePolicyUrl = value("cookiePolicyUrl").trim();
  const privacyPolicyUrl = value("privacyPolicyUrl").trim();
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
  const styleBlock = `<style>
  .cccl-banner,
  .cccl-modal,
  .cccl-preferences-notice,
  .cccl-cookie-icon {
    border-radius: ${radius}px;
  }
</style>`;

  return `<link rel="stylesheet" href="${cdnBaseUrl}/cookie-consent-cl.css" />
<script src="${cdnBaseUrl}/cookie-consent-cl.iife.js"></script>
${styleBlock}

<!-- Scripts bloqueados por consentimiento -->
${snippets}

<script>
  window.CookieConsentCL.init(${config});
</script>`;
}

function renderCode() {
  installCode.textContent = buildInstallCode();
  syncCodeExpansion();
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
  renderIntegrations();
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

function resetPreview() {
  previewMode = "banner";
  sendPreview({ restart: true, mode: "banner" });
}

function setupEvents() {
  form.addEventListener("input", (event) => {
    if (event.target.name === "preset") applyPreset();
    if (event.target.dataset.catField || event.target.dataset.signal) {
      updateCategoryFromInput(event.target);
    }
    updateAll();
  });

  form.addEventListener("change", (event) => {
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
  });

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

renderPresets();
renderPositions();
applyPreset();
renderCategories();
renderIntegrations();
setupEvents();
updateAll({ restart: true });
schedulePreviewSync({ restart: true });
