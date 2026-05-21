# Publicacion del sitio

Este proyecto puede publicarse como sitio estatico en GitHub Pages. No requiere backend, base de datos ni telemetry.

## Opcion recomendada: GitHub Pages

1. Publicar `cookie-consent-cl@0.2.0` en npm.
2. Confirmar que el repositorio tiene `index.html` en la raiz.
3. En GitHub, ir a **Settings > Pages**.
4. En **Build and deployment**, elegir:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
5. Guardar.

GitHub Pages publicara:

- `/` landing publica.
- `/examples/configurator/` configurador interactivo.
- `/examples/*` ejemplos del proyecto.

## Dominio recomendado

Dominio inicial sugerido:

```txt
cookie-consent.privacyengineering.cl
```

DNS esperado:

```txt
CNAME cookie-consent privacy-engineering-chile.github.io.
```

Despues de configurar DNS:

1. Agregar el dominio en **Settings > Pages > Custom domain**.
2. Activar **Enforce HTTPS** cuando GitHub lo permita.
3. Verificar que el configurador carga sin errores.

## Verificacion

Probar estas URLs:

```txt
https://cookie-consent.privacyengineering.cl/
https://cookie-consent.privacyengineering.cl/examples/configurator/
https://cookie-consent.privacyengineering.cl/examples/vanilla-html/
```

## Nota

No agregar analytics ni scripts de medicion al sitio de lanzamiento en esta version. La promesa del proyecto es ser liviano, auditable y sin tracking propio.
