import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const html = await readFile(join(root, "index.html"), "utf8");
const css = await readFile(join(root, "styles.css"), "utf8");
const js = await readFile(join(root, "main.js"), "utf8");
const notFound = await readFile(join(root, "404.html"), "utf8");

test("the page has a complete, indexable document head", () => {
  assert.match(html, /<html lang="en">/);
  assert.match(html, /<title>Mejo Labs/);
  assert.match(html, /name="description" content="[^"]{40,}/);
  assert.match(html, /rel="canonical" href="https:\/\/pkaycodes\.github\.io\/mejo-labs\/"/);
  assert.match(html, /property="og:title"/);
  assert.match(html, /property="og:image"/);
  assert.match(html, /property="og:url"/);
  assert.match(html, /name="twitter:card"/);
  assert.match(html, /application\/ld\+json/);
});

test("the primary navigation and page sections line up", () => {
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
  const internalLinks = [...html.matchAll(/href="#([^"]+)"/g)].map((match) => match[1]);

  assert.ok(internalLinks.length > 5);
  for (const target of internalLinks) {
    assert.ok(ids.has(target), `missing anchor target: #${target}`);
  }

  for (const section of ["services", "work", "process", "team", "contact"]) {
    assert.ok(ids.has(section), `missing section: ${section}`);
  }
});

test("every local image, stylesheet and script exists", async () => {
  const references = new Set();
  for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    const value = match[1];
    if (!value.startsWith("http") && !value.startsWith("#") && !value.startsWith("mailto:") && !value.startsWith("tel:")) {
      references.add(value.split("?")[0]);
    }
  }

  for (const reference of references) {
    const info = await stat(join(root, reference));
    assert.ok(info.isFile(), `missing local asset: ${reference}`);
  }
});

test("selected work is visible and links to real public destinations", () => {
  assert.match(html, /Selected work/);
  for (const project of [
    "Adom Hospital HMS",
    "Kae",
    "PKLink",
    "Efie",
    "Sukuu",
    "Sharkbook",
    "Edgebook",
    "MotorVault",
    "Sikapos",
    "AM Homecare",
  ]) {
    assert.match(html, new RegExp(`>${project}<`), `missing project: ${project}`);
  }

  assert.match(html, /https:\/\/github\.com\/pkaycodes\/adom-hospital-hms/);
  assert.match(html, /https:\/\/pkaycodes\.github\.io\/kae\/\?demo=1/);
  assert.match(html, /https:\/\/site-1e61daf990414aa78567f4776a59d442\.freebuff\.page\//);
  assert.match(html, /https:\/\/pkaycodes\.github\.io\/efie\//);
  assert.match(html, /https:\/\/pkaycodes\.github\.io\/sukuu\/\?demo=1/);
  assert.match(html, /https:\/\/pkaycodes\.github\.io\/sharkbook\/\?demo=1/);
  assert.match(html, /https:\/\/github\.com\/pkaycodes\/edgebook/);
  assert.match(html, /https:\/\/pkaycodes\.github\.io\/motorvault\//);
  assert.match(html, /https:\/\/github\.com\/pkaycodes\/sikapos/);
  assert.match(html, /https:\/\/pkaycodes\.github\.io\/am-homecare\//);
});

test("real contact routes are present and placeholder copy is gone", () => {
  assert.match(html, /mailto:pkafrifamensa@gmail\.com/);
  assert.match(html, /tel:\+233204473247/);
  assert.match(html, /https:\/\/wa\.me\/233204473247/);
  assert.match(html, /https:\/\/github\.com\/pkaycodes/);
  assert.doesNotMatch(html, /hello@mejolabs\.com/);
  assert.doesNotMatch(html, /replace (this|before)/i);
});

test("accessibility affordances are in the markup and CSS", () => {
  assert.match(html, /class="skip-link" href="#main"/);
  assert.match(html, /<main id="main">/);
  assert.match(html, /aria-label="Primary"/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /aria-hidden="true"/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(js, /aria-expanded/);
  assert.match(js, /event\.key !== "Escape"/);
});

test("the homepage stays focused on the business offer", () => {
  assert.doesNotMatch(html, /class="(?:ticker|terminal-card|code-card)"/);
  assert.doesNotMatch(html, /role="tablist"/);
  assert.match(html, /Software that fits/);
  assert.match(html, /Start a project/);
});

test("the 404 page resolves its assets from the deployed project path", async () => {
  assert.match(notFound, /href="\/mejo-labs\/styles\.css"/);
  assert.match(notFound, /href="\/mejo-labs\/assets\/mejo-favicon\.svg"/);
  assert.match(notFound, /src="\/mejo-labs\/assets\/mejo-labs-horizontal\.svg"/);
  assert.match(notFound, /href="\/mejo-labs\/"/);
  assert.match(notFound, /This page isn&rsquo;t here\./);
});

test("the static site has no runtime dependencies or analytics", () => {
  assert.doesNotMatch(html, /<script[^>]+src="https?:/);
  assert.doesNotMatch(html, /googletagmanager|google-analytics|facebook\.net|segment\.io|plausible\.io|posthog/i);
  assert.doesNotMatch(css, /@import\s+url\(["']?https?:/);
});
