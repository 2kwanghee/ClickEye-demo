#!/usr/bin/env node
/**
 * Verify the 4 message files:
 *  - key parity (every locale has exactly the en key set)
 *  - value-level translation sanity:
 *      ja/id values must NOT contain Hangul (Korean leaked)
 *      id values must NOT contain kana/CJK (Japanese/Korean-Hanja leaked)
 *      ja/id values identical to en AND ko (minus brand allowlist) => probably untranslated
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const msgDir = join(dirname(fileURLToPath(import.meta.url)), "..", "messages");
const load = (l) => JSON.parse(readFileSync(join(msgDir, l + ".json"), "utf8"));

function flatten(obj, p = "", out = {}) {
  for (const k in obj) {
    const v = obj[k];
    const key = p ? p + "." + k : k;
    if (v && typeof v === "object" && !Array.isArray(v)) flatten(v, key, out);
    else out[key] = v;
  }
  return out;
}

const HANGUL = /[가-힣]/;
const KANA_CJK = /[぀-ヿ一-鿿]/; // hiragana, katakana, CJK ideographs
// short tokens that legitimately stay identical across locales
const ALLOW = /^[\s\d\p{P}\p{S}]*$|^(Slug|Agent|Linear|DevOps|ROI|API|MCP|QA|JSON|PM|OS|GitHub|ClickEye|Anthropic|Claude|Gemini|RAG|UI|UX|AI|URL|ID|HR|B2B|MVP|✓|—)$/iu;

const en = flatten(load("en"));
const ko = flatten(load("ko"));
const ja = flatten(load("ja"));
const id = flatten(load("id"));
const enKeys = Object.keys(en);
const enSet = new Set(enKeys);

let fail = 0;
function section(name) { console.log(`\n=== ${name} ===`); }

// 1. parity
section("KEY PARITY");
for (const [name, m] of [["ko", ko], ["ja", ja], ["id", id]]) {
  const ks = new Set(Object.keys(m));
  const missing = enKeys.filter((k) => !ks.has(k));
  const extra = [...ks].filter((k) => !enSet.has(k));
  console.log(`${name}: ${ks.size} keys | missing ${missing.length} | extra ${extra.length}`);
  if (missing.length) { fail++; console.log("  missing:", missing.slice(0, 30).join(", ") + (missing.length > 30 ? " …" : "")); }
  if (extra.length) { fail++; console.log("  extra:", extra.slice(0, 30).join(", ") + (extra.length > 30 ? " …" : "")); }
}

// 2. script leakage
section("SCRIPT LEAKAGE");
function scriptCheck(name, m, re, label) {
  const bad = enKeys.filter((k) => typeof m[k] === "string" && re.test(m[k]));
  console.log(`${name}: ${bad.length} value(s) contain ${label}`);
  if (bad.length) { fail++; bad.slice(0, 25).forEach((k) => console.log(`  ${k} = ${JSON.stringify(m[k])}`)); }
}
scriptCheck("ja", ja, HANGUL, "Hangul (Korean leak)");
scriptCheck("id", id, HANGUL, "Hangul (Korean leak)");
scriptCheck("id", id, KANA_CJK, "kana/CJK (Japanese leak)");

// 2b. placeholder/tag parity across locales (render-crash class)
section("PLACEHOLDER / TAG PARITY (vs en)");
function tokens(s) {
  if (typeof s !== "string") return { ph: [], tag: [] };
  // ICU placeholders: capture the first identifier inside {…}
  const ph = [...s.matchAll(/\{\s*([a-zA-Z0-9_]+)/g)].map((m) => m[1]).sort();
  // rich-text tag names: <name> ... opening tags (ignore closing)
  const tag = [...s.matchAll(/<([a-zA-Z0-9_]+)\s*>/g)].map((m) => m[1]).sort();
  return { ph: ph.join(","), tag: tag.join(",") };
}
for (const [name, m] of [["ko", ko], ["ja", ja], ["id", id]]) {
  const bad = [];
  for (const k of enKeys) {
    const a = tokens(en[k]);
    const b = tokens(m[k]);
    if (a.ph !== b.ph || a.tag !== b.tag) bad.push({ k, en: a, loc: b });
  }
  console.log(`${name}: ${bad.length} key(s) with placeholder/tag mismatch vs en`);
  if (bad.length) {
    fail++;
    bad.slice(0, 40).forEach(({ k, en: a, loc }) =>
      console.log(`  ${k}\n    en  ph=[${a.ph}] tag=[${a.tag}]\n    ${name} ph=[${loc.ph}] tag=[${loc.tag}]`),
    );
  }
}

// 3. untranslated (identical to BOTH en and ko)
section("LIKELY UNTRANSLATED (== en AND == ko, not allowlisted)");
function identicalCheck(name, m) {
  const bad = enKeys.filter((k) => {
    const v = m[k];
    if (typeof v !== "string") return false;
    if (ALLOW.test(v.trim())) return false;
    return v === en[k] && v === ko[k];
  });
  console.log(`${name}: ${bad.length} suspicious`);
  if (bad.length) { bad.slice(0, 25).forEach((k) => console.log(`  ${k} = ${JSON.stringify(m[k])}`)); }
  return bad.length;
}
identicalCheck("ja", ja);
identicalCheck("id", id);

console.log(`\n${fail ? "❌ FAIL: " + fail + " hard issue(s)" : "✅ parity + script checks passed"}`);
process.exit(fail ? 1 : 0);
