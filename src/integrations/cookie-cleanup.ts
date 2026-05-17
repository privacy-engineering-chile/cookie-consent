import type { ConsentRecord, NormalizedCookieConsentConfig } from "../config";

export function deleteCookiesWithoutConsent(config: NormalizedCookieConsentConfig, consent: ConsentRecord): void {
  config.cookies
    .filter((cookie) => !consent.categories[cookie.category])
    .forEach((cookie) => deleteCookie(cookie.name));
}

function deleteCookie(name: string): void {
  const encodedName = encodeURIComponent(name);
  const expires = "expires=Thu, 01 Jan 1970 00:00:00 GMT";
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  const sameSite = "; SameSite=Lax";
  const paths = getPathCandidates();
  const domains = getDomainCandidates();

  paths.forEach((path) => {
    document.cookie = `${encodedName}=; ${expires}; path=${path}${sameSite}${secure}`;
    domains.forEach((domain) => {
      document.cookie = `${encodedName}=; ${expires}; path=${path}; domain=${domain}${sameSite}${secure}`;
    });
  });
}

function getPathCandidates(): string[] {
  const parts = window.location.pathname.split("/").filter(Boolean);
  const paths = new Set<string>(["/"]);
  parts.forEach((_, index) => {
    paths.add(`/${parts.slice(0, index + 1).join("/")}`);
  });
  return Array.from(paths);
}

function getDomainCandidates(): string[] {
  const hostname = window.location.hostname;
  if (!hostname || hostname === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return [];
  }

  const parts = hostname.split(".");
  return parts
    .map((_, index) => parts.slice(index).join("."))
    .filter((domain) => domain.includes("."))
    .flatMap((domain) => [domain, `.${domain}`]);
}
