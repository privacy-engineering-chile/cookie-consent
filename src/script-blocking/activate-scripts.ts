import type { ConsentRecord } from "../config";

function hasCategoryConsent(consent: ConsentRecord, categoryId: string | null): boolean {
  return Boolean(categoryId && consent.categories[categoryId]);
}

export function activateConsentedAssets(consent: ConsentRecord, root: ParentNode = document): void {
  root.querySelectorAll<HTMLScriptElement>('script[type="text/plain"][data-cookie-consent]').forEach((script) => {
    if (script.dataset.cookieConsentActivated === "true") return;
    if (!hasCategoryConsent(consent, script.dataset.cookieConsent ?? null)) return;

    const executable = document.createElement("script");
    Array.from(script.attributes).forEach((attribute) => {
      if (attribute.name === "type" || attribute.name === "data-src" || attribute.name === "data-cookie-consent") {
        return;
      }
      executable.setAttribute(attribute.name, attribute.value);
    });

    executable.type = script.dataset.type ?? "text/javascript";
    if (script.dataset.src) {
      executable.src = script.dataset.src;
    } else {
      executable.text = script.textContent ?? "";
    }

    executable.dataset.cookieConsentActivated = "true";
    script.replaceWith(executable);
  });

  root.querySelectorAll<HTMLIFrameElement>("iframe[data-cookie-consent][data-src]").forEach((iframe) => {
    const isConsented = hasCategoryConsent(consent, iframe.dataset.cookieConsent ?? null);

    if (!isConsented) {
      if (iframe.dataset.cookieConsentActivated === "true") {
        const cleanIframe = iframe.cloneNode(false) as HTMLIFrameElement;
        cleanIframe.removeAttribute("src");
        cleanIframe.dataset.cookieConsentActivated = "false";
        iframe.replaceWith(cleanIframe);
      }
      return;
    }

    if (iframe.dataset.cookieConsentActivated === "true") return;

    iframe.src = iframe.dataset.src ?? "";
    iframe.dataset.cookieConsentActivated = "true";
  });
}
