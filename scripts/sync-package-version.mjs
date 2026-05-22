import { readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const checkOnly = process.argv.includes("--check");
const packageJson = JSON.parse(readFileSync(resolve(rootDir, "package.json"), "utf8"));
const version = packageJson.version;

if (!/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(version)) {
  throw new Error(`Version invalida en package.json: ${version}`);
}

const versionModulePath = "examples/configurator/version.js";
const managedFiles = [
  "README.md",
  "examples/configurator/index.html",
  versionModulePath
];
const activeReferenceFiles = [
  ...managedFiles,
  "examples/configurator/configurator.js",
  "examples/configurator/preview.html"
];

const desiredVersionModule = `export const COOKIE_CONSENT_CL_VERSION = "${version}";\n`;
let changed = false;

function readProjectFile(filePath) {
  return readFileSync(resolve(rootDir, filePath), "utf8");
}

function writeProjectFile(filePath, content) {
  if (!checkOnly) {
    writeFileSync(resolve(rootDir, filePath), content);
  }
  changed = true;
}

function updateFile(filePath, update) {
  const original = readProjectFile(filePath);
  const next = update(original);

  if (next !== original) {
    writeProjectFile(filePath, next);
  }
}

updateFile("README.md", (content) =>
  content.replace(/cookie-consent-cl@\d+\.\d+\.\d+/g, `cookie-consent-cl@${version}`)
);

updateFile("examples/configurator/index.html", (content) =>
  content.replace(/cookie-consent-cl@\d+\.\d+\.\d+/g, `cookie-consent-cl@${version}`)
);

updateFile(versionModulePath, () => desiredVersionModule);

const staleReferences = [];

for (const filePath of activeReferenceFiles) {
  const content = readProjectFile(filePath);
  const matches = content.matchAll(/cookie-consent-cl@(\d+\.\d+\.\d+)/g);

  for (const match of matches) {
    if (match[1] !== version) {
      staleReferences.push(`${filePath}: cookie-consent-cl@${match[1]}`);
    }
  }
}

if (staleReferences.length > 0) {
  throw new Error(
    `Referencias activas desactualizadas:\n${staleReferences.map((entry) => `- ${entry}`).join("\n")}`
  );
}

if (checkOnly && changed) {
  throw new Error(
    `Hay archivos desincronizados con package.json ${version}. Ejecuta npm run sync:version.`
  );
}

const mode = checkOnly ? "check" : "sync";
process.stdout.write(
  `${mode}: cookie-consent-cl@${version} sincronizado en ${managedFiles
    .map((filePath) => relative(rootDir, resolve(rootDir, filePath)))
    .join(", ")}\n`
);
