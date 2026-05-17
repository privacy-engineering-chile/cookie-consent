# Bloqueo y activacion de scripts

Usa `type="text/plain"` y `data-cookie-consent` para impedir que un script se ejecute antes del consentimiento:

```html
<script type="text/plain" data-cookie-consent="analytics">
  console.log("Analytics code goes here");
</script>
```

Para scripts externos:

```html
<script
  type="text/plain"
  data-cookie-consent="analytics"
  data-src="https://www.googletagmanager.com/gtag/js?id=G-XXXX"
></script>
```

Para iframes:

```html
<iframe data-cookie-consent="marketing" data-src="https://www.youtube.com/embed/XXXX"></iframe>
```

Cuando la categoria es autorizada, la libreria crea el script real o asigna el `src` del iframe.

Si el consentimiento de una categoria se revoca despues, los iframes asociados se descargan quitando su `src`. Los scripts ya ejecutados no se pueden revertir de forma confiable desde el navegador, por lo que cualquier limpieza adicional debe hacerse desde la integracion del sitio escuchando `cookie-consent-cl:update` u `onConsentChange`.
