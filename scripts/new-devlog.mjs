#!/usr/bin/env node
/**
 * Scaffold a dev log teaser post.
 *
 *   npm run devlog:new -- --num 4 --date 2026-11-05
 *   npm run devlog:new -- --num 4                    (next Thursday)
 *   npm run devlog:new -- --num 4 --date 2026-11-05 --time 16:00
 *
 * Writes src/posts/<date>-dev-log-<num>.md from scripts/templates/devlog-teaser.md,
 * with the UK offset (BST or GMT) worked out for that day. See docs/devlog-teasers.md.
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? undefined : process.argv[i + 1];
}

function fail(msg) {
  console.error(`devlog:new: ${msg}`);
  process.exit(1);
}

const num = arg("num");
if (!num || !/^\d+$/.test(num)) fail("give the dev log number, e.g. --num 4");

function nextThursday() {
  const d = new Date();
  const add = (4 - d.getUTCDay() + 7) % 7 || 7;
  d.setUTCDate(d.getUTCDate() + add);
  return d.toISOString().slice(0, 10);
}

const day = arg("date") || nextThursday();
if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) fail("--date must look like 2026-11-05");
const time = arg("time") || "16:00";
if (!/^\d{2}:\d{2}$/.test(time)) fail("--time must look like 16:00");

/** "+01:00" in British Summer Time, "+00:00" otherwise, for that date and time. */
function londonOffset(dateStr, timeStr) {
  const probe = new Date(`${dateStr}T${timeStr}:00Z`);
  const name = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    timeZoneName: "shortOffset",
  })
    .formatToParts(probe)
    .find((p) => p.type === "timeZoneName").value; // "GMT" or "GMT+1"
  const h = Number(name.replace("GMT", "") || 0);
  return `${h >= 0 ? "+" : "-"}${String(Math.abs(h)).padStart(2, "0")}:00`;
}

const date = `${day}T${time}:00${londonOffset(day, time)}`;
const file = path.join(root, "src", "posts", `${day}-dev-log-${num}.md`);
if (existsSync(file) && !process.argv.includes("--force")) {
  fail(`${path.relative(root, file)} already exists (add --force to overwrite)`);
}

const template = readFileSync(path.join(root, "scripts", "templates", "devlog-teaser.md"), "utf8");
writeFileSync(file, template.replaceAll("__NUM__", num).replaceAll("__DATE__", date));

console.log(`Created ${path.relative(root, file)} (goes live ${date}).`);
console.log("Next: fill in every [Fill in: …], then preview with `npm run devlog:preview`.");
