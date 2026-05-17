# Modo etico y no dark patterns

El modo etico es el comportamiento por defecto.

Cuando `ethicalMode` esta activo:

- Las categorias opcionales no vienen preseleccionadas.
- El boton de rechazo tiene visibilidad similar al de aceptacion.
- El texto evita presion, culpa o ambiguedad.
- Cerrar el modal de preferencias no guarda consentimiento.
- El panel de configuracion incluye una accion directa para rechazar cookies no esenciales.
- Despues de guardar, se muestra un aviso temporal para informar como cambiar preferencias.
- El sitio debe ofrecer un enlace o boton propio para reabrir preferencias usando `CookieConsentCL.openPreferences()`.

Este proyecto prioriza claridad, simetria de opciones y control del usuario.
