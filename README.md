# cookie-consent-cl

Gestor open source de consentimiento de cookies para sitios web chilenos.

**Este proyecto no constituye asesoria legal ni garantiza cumplimiento normativo por si solo. Es una herramienta tecnica para facilitar una implementacion mas clara, especifica y auditable del consentimiento de cookies.**

## ¿Que es cookie-consent-cl?

`cookie-consent-cl` es una libreria ligera en TypeScript para mostrar un banner de consentimiento, permitir preferencias por categoria, guardar la decision en `localStorage`, activar scripts solo despues del consentimiento y emitir senales compatibles con Google Consent Mode v2.

## ¿Por que otro gestor de consentimiento?

Muchas soluciones son SaaS pesados, requieren cuenta, incluyen tracking propio o usan interfaces confusas. Este proyecto busca ser un bloque tecnico pequeno, auditable, sin backend y con defaults pensados para Chile.

## Contexto chileno y Ley 21.719

La Ley 21.719 refuerza la importancia de tratar datos personales con bases claras, informacion comprensible y control para las personas. Esta libreria no reemplaza analisis legal, pero ayuda a implementar mejores practicas de privacidad desde el frontend.

## Que hace esta herramienta

- Banner de cookies accesible y responsive.
- Modal de preferencias por categoria.
- Botones para aceptar todo, rechazar no esenciales y configurar.
- Boton para rechazar no esenciales tambien dentro del panel de configuracion.
- Persistencia local con version de politica y banner.
- Aviso temporal despues de guardar preferencias, con acceso para cambiarlas.
- Activacion guiada de scripts e iframes.
- Eliminacion de cookies declaradas cuando se revoca su categoria.
- Google Consent Mode v2.
- Tabla declarativa de cookies para paginas de politica.

## Que no hace esta herramienta

- No garantiza cumplimiento legal.
- No reemplaza asesoria juridica.
- No descubre cookies automaticamente.
- No entrega dashboard, cuenta, backend ni log probatorio remoto.
- No instala Google Analytics, Tag Manager ni servicios de terceros.

## Instalacion con CDN

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/cookie-consent-cl@0.2.0/dist/cookie-consent-cl.css"
/>
<script src="https://cdn.jsdelivr.net/npm/cookie-consent-cl@0.2.0/dist/cookie-consent-cl.iife.js"></script>
<script>
  window.CookieConsentCL.init({
    siteId: "demo-site",
    policyVersion: "2026-01-01",
    bannerVersion: "1.0.0"
  });
</script>
```

Usa una version fija en produccion. No recomendamos depender de `@latest` para sitios reales.

## Instalacion self-host

Tambien puedes descargar el bundle, subirlo a tu propio servidor y usar rutas locales:

```html
<link rel="stylesheet" href="/dist/cookie-consent-cl.css" />
<script src="/dist/cookie-consent-cl.iife.js"></script>
```

## Instalacion con npm

```bash
npm install cookie-consent-cl
```

```js
import { CookieConsentCL } from "cookie-consent-cl";
import "cookie-consent-cl/dist/cookie-consent-cl.css";
```

## Uso basico

```js
window.CookieConsentCL.init({
  siteId: "demo-site",
  language: "es-CL",
  policyVersion: "2026-01-01",
  bannerVersion: "1.0.0",
  cookiePolicyUrl: "/politica-de-cookies",
  privacyPolicyUrl: "/politica-de-privacidad",
  ethicalMode: true,
  position: "bottom",
  onConsentChange(consent) {
    console.log("Consent updated", consent);
  }
});
```

## Instalacion y uso en desarrollo local

Clona el repositorio e instala dependencias:

```bash
git clone https://github.com/privacy-engineering-chile/cookie-consent-cl.git
cd cookie-consent-cl
npm install
```

Levanta el servidor local de Vite:

```bash
npm run dev
```

Luego abre alguno de los ejemplos:

- `http://127.0.0.1:5173/examples/vanilla-html/`
- `http://127.0.0.1:5173/examples/script-blocking/`
- `http://127.0.0.1:5173/examples/google-consent-mode/`
- `http://127.0.0.1:5173/examples/cookie-policy-page/`
- `http://127.0.0.1:5173/examples/configurator/`

Comandos utiles:

```bash
npm run typecheck
npm test
npm run lint
npm run build
```

El build genera:

- `dist/cookie-consent-cl.es.js`
- `dist/cookie-consent-cl.iife.js`
- `dist/cookie-consent-cl.css`
- declaraciones TypeScript en `dist/`

## Configuracion

La configuracion principal acepta `siteId`, `language`, `policyVersion`, `bannerVersion`, enlaces de politica, tema, textos, categorias y cookies declaradas.

Las categorias tienen esta forma:

```js
{
  id: "analytics",
  label: "Analitica",
  description: "Nos ayudan a entender como se usa el sitio.",
  required: false,
  defaultValue: false,
  googleConsentMode: ["analytics_storage"]
}
```

## Modo etico y sin dark patterns

`ethicalMode` viene activo por defecto:

- No preselecciona categorias opcionales.
- Muestra aceptar, rechazar y configurar con visibilidad similar.
- No interpreta cerrar como consentimiento.
- Despues de una decision muestra un toast temporal y liviano.
- El sitio debe ofrecer un enlace o boton propio para reabrir preferencias mas adelante usando `CookieConsentCL.openPreferences()`.

## Categorias de cookies

Defaults incluidos:

- Necesarias
- Analitica
- Marketing
- Preferencias

Puedes reemplazarlas completamente con `categories`.

## Bloqueo de scripts

Script externo:

```html
<script
  type="text/plain"
  data-cookie-consent="analytics"
  data-src="https://www.googletagmanager.com/gtag/js?id=G-XXXX"
></script>
```

Script inline:

```html
<script type="text/plain" data-cookie-consent="analytics">
  console.log("Analytics code goes here");
</script>
```

Iframe:

```html
<iframe data-cookie-consent="marketing" data-src="https://www.youtube.com/embed/XXXX"></iframe>
```

Si una persona revoca una categoria despues de haberla autorizado, los iframes asociados se descargan quitando su `src`. Los scripts ya ejecutados no se pueden revertir de forma confiable desde el navegador; para esos casos escucha `cookie-consent-cl:update` u `onConsentChange` y limpia el estado propio de tu integracion si corresponde.

## Google Consent Mode v2

La libreria envia valores `denied` por defecto para senales opcionales y actualiza a `granted` cuando la categoria asociada es autorizada.

Senales soportadas: `analytics_storage`, `ad_storage`, `ad_user_data`, `ad_personalization`, `functionality_storage`, `personalization_storage`, `security_storage`.

## Renderizar una tabla de cookies

```js
CookieConsentCL.init({
  siteId: "demo-site",
  policyVersion: "2026-01-01",
  bannerVersion: "1.0.0",
  cookies: [
    {
      name: "_ga",
      provider: "Google Analytics",
      category: "analytics",
      duration: "2 anos",
      purpose: "Distinguir usuarios para generar estadisticas de uso del sitio."
    }
  ]
});

CookieConsentCL.renderCookieTable("#cookie-table");
```

## Reabrir preferencias

```js
CookieConsentCL.openPreferences();
```

Para que la persona pueda cambiar su decision mas adelante, agrega un enlace o boton en tu sitio:

```html
<button type="button" onclick="CookieConsentCL.openPreferences()">Cambiar preferencias de cookies</button>
```

Despues de guardar una decision, la libreria muestra un toast temporal con el texto "Preferencias de cookies guardadas". Si el icono de preferencias esta habilitado, queda disponible para reabrir el panel sin mostrar un segundo banner.

## Eliminacion de cookies declaradas

Si declaras cookies en `cookies`, la libreria intentara eliminarlas cuando la categoria asociada no tenga consentimiento:

```js
CookieConsentCL.init({
  siteId: "demo-site",
  policyVersion: "2026-01-01",
  bannerVersion: "1.0.0",
  cookies: [
    {
      name: "cccl_demo_analytics",
      provider: "Demo local",
      category: "analytics",
      duration: "Sesion",
      purpose: "Cookie de ejemplo para analitica."
    }
  ]
});
```

Importante: una cookie solo puede eliminarse desde el navegador si el nombre, dominio y path son compatibles con la cookie original. Para cookies de terceros o cookies creadas con un dominio/path distinto, puede ser necesario limpiar desde la integracion que las crea.

## Referencia de API

- `CookieConsentCL.init(config)`
- `CookieConsentCL.openPreferences()`
- `CookieConsentCL.getConsent()`
- `CookieConsentCL.hasConsentFor(categoryId)`
- `CookieConsentCL.acceptAll()`
- `CookieConsentCL.rejectNonEssential()`
- `CookieConsentCL.updatePreferences(categories)`
- `CookieConsentCL.resetConsent()`
- `CookieConsentCL.onConsentChange(callback)`
- `CookieConsentCL.renderCookieTable(selector)`

## Soporte de navegadores

El MVP apunta a navegadores modernos con soporte para `localStorage`, `CustomEvent`, `querySelectorAll` y JavaScript ES2020.

## Notas de accesibilidad

El banner usa `role="dialog"` y el modal usa `aria-modal`. Los controles son botones nativos, los toggles usan inputs checkbox y los estados de foco son visibles.

## Notas de seguridad y privacidad

No hay backend, telemetria ni tracking propio. La decision queda en `localStorage` del navegador. Si necesitas trazabilidad probatoria, integra un backend propio en `onConsentChange`.

## Licencia

MIT.

## Contribuir

Se aceptan issues y pull requests. Prioriza implementaciones pequenas, auditables, sin dependencias innecesarias y con foco en privacidad, accesibilidad y claridad para sitios chilenos.
