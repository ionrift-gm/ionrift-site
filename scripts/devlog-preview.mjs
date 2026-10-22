#!/usr/bin/env node
/**
 * Local preview that includes future-dated posts and allows "[Fill in" placeholders.
 *   npm run devlog:preview            (serves on http://localhost:8080)
 *   npm run devlog:preview -- --build (one-off build into _site)
 * Never deploy a preview build.
 */
import { spawn } from "child_process";

const build = process.argv.includes("--build");
const child = spawn("npx", ["@11ty/eleventy", ...(build ? [] : ["--serve"])], {
  stdio: "inherit",
  shell: process.platform === "win32",
  env: { ...process.env, DEVLOG_PREVIEW: "1" },
});
child.on("exit", (code) => process.exit(code ?? 1));
