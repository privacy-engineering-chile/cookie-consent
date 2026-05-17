# Google Consent Mode v2

Las categorias pueden declarar senales de Google Consent Mode:

```js
{
  id: "analytics",
  googleConsentMode: ["analytics_storage"]
}
```

Al inicializar, `cookie-consent-cl` envia `gtag("consent", "default", ...)` con senales opcionales en `denied`, salvo que exista consentimiento vigente.

Cuando cambia el consentimiento, envia `gtag("consent", "update", ...)`.

Senales soportadas:

- `analytics_storage`
- `ad_storage`
- `ad_user_data`
- `ad_personalization`
- `functionality_storage`
- `personalization_storage`
- `security_storage`
