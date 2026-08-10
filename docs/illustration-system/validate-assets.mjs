import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manifestPath = process.argv[2] ?? path.join(root, "illustration-manifest.json");
const assetDir = process.argv[3] ?? path.join(root, "public", "images", "cocktails");

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const expected = new Set(manifest.cocktails.map((c) => `${c.illustrationKey}.webp`));

const actual = new Set(
  fs.existsSync(assetDir)
    ? fs.readdirSync(assetDir).filter((name) => name.toLowerCase().endsWith(".webp"))
    : []
);

const missing = [...expected].filter((name) => !actual.has(name)).sort();
const orphaned = [...actual].filter((name) => !expected.has(name)).sort();

console.log(`Expected: ${expected.size}`);
console.log(`Found: ${actual.size}`);
console.log(`Missing: ${missing.length}`);
console.log(`Orphaned: ${orphaned.length}`);

if (missing.length) {
  console.log("\nMissing files:");
  for (const name of missing) console.log(`- ${name}`);
}

if (orphaned.length) {
  console.log("\nOrphaned files:");
  for (const name of orphaned) console.log(`- ${name}`);
}

process.exitCode = missing.length ? 1 : 0;
