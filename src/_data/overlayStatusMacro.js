/**
 * Reads the Foundry overlay status macro from its canonical file.
 * Shelf pages embed the text; /macros/overlay-status-macro.js is passthrough.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const macroPath = path.resolve(__dirname, "..", "macros", "overlay-status-macro.js");

function readMacro() {
  const text = readFileSync(macroPath, "utf8").replace(/^\uFEFF/, "");
  const commentVersion = text.match(/^\s*\/\*[\s\S]*?\bVersion:\s*([0-9]+(?:\.[0-9]+)*)/m)?.[1] || null;
  const constVersion = text.match(/\bconst\s+MACRO_VERSION\s*=\s*["']([^"']+)["']/)?.[1] || null;

  if (!commentVersion || !constVersion) {
    throw new Error(`overlay-status-macro.js: missing Version comment or MACRO_VERSION (${macroPath})`);
  }
  if (commentVersion !== constVersion) {
    throw new Error(
      `overlay-status-macro.js: Version comment (${commentVersion}) !== MACRO_VERSION (${constVersion})`
    );
  }

  // Avoid breaking the host page if the macro ever contains a script closer.
  const embedSafe = text.replace(/<\/script/gi, "<\\/script");

  return {
    version: constVersion,
    text: embedSafe.trimEnd() + "\n",
    path: "macros/overlay-status-macro.js",
    url: "/macros/overlay-status-macro.js",
  };
}

export default function () {
  return readMacro();
}
