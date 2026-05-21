# Changelog

Todas las notas importantes de este proyecto se documentan en este archivo.

## [0.2.0] - 2026-05-20

### Agregado

- Soporte oficial para `theme.fontFamily` en el core.
- Sanitizacion conservadora de `fontFamily` para evitar valores CSS sospechosos.
- Configurador con seccion de tipografia y presets visuales.
- Configurador como asistente de privacidad para PYMEs chilenas.
- Presets por tipo de sitio: sitio informativo, PYME/servicios, ecommerce, ONG/comunidad y medio/blog.
- Mapa de herramientas para agregar integraciones frecuentes con snippets bloqueados.
- Revision antes de instalar con buenas practicas sin dark patterns.
- Resumen de configuracion copiable como bitacora tecnica.
- Instalacion por CDN con jsDelivr como opcion recomendada.

### Cambiado

- La categoria requerida `Necesarias` ahora se muestra como estado fijo `Siempre activa`, no como toggle clickeable.
- La fila de `Necesarias` ahora respeta el esquema de color elegido.
- El preview del configurador conserva el estado actual al cambiar opciones de diseno, incluyendo tipografia.
- El configurador ya no declara cookies de ejemplo por defecto.
- Al agregar herramientas en el configurador, la tarjeta muestra claramente la integracion agregada.
- El icono persistente de preferencias usa el PNG oficial embebido en el bundle.
- La experiencia post-consent usa toast ligero e icono persistente, sin segundo banner grande.

### Documentacion

- README actualizado para usar URLs CDN versionadas con `cookie-consent-cl@0.2.0`.
- Changelog incluido en el paquete publicado.

### Compatibilidad

- No hay cambios incompatibles conocidos.
- Configuraciones existentes de `0.1.0` siguen funcionando.
- `theme.fontFamily` es opcional.

## [0.1.0] - 2026-05-20

### Agregado

- Primera version publica en npm.
- Banner de consentimiento, modal de preferencias y almacenamiento local.
- Categorias configurables con defaults eticos.
- Google Consent Mode v2.
- Activacion guiada de scripts e iframes mediante `type="text/plain"` y `data-cookie-consent`.
- Tabla declarativa de cookies.
- Bundle ESM, IIFE y CSS.
- Configurador inicial y ejemplos HTML.
