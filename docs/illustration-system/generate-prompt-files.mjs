import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manifestPath = process.argv[2] ?? path.join(root, "illustration-manifest.json");
const outputDir = process.argv[3] ?? path.join(root, "generated-prompts");

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
fs.mkdirSync(outputDir, { recursive: true });

function buildPrompt(c) {
  const a = c.artDirection;
  return `Create one premium editorial cocktail illustration for “${c.name}”.

ART CONSTITUTION — follow exactly:
- Semi-realistic luxury editorial digital painting; tactile and refined, not cartoonish and not photoreal product photography.
- One centered hero drink only. No people, hands, bottles, logos, labels, lettering, captions, borders, or watermarks.
- Three-quarter camera view from slightly above table height, approximately 50 mm visual perspective.
- Dark walnut bar surface; deep emerald-to-charcoal matte backdrop; restrained out-of-focus brass accents.
- Warm amber key light from upper left, soft neutral fill, subtle rim light, rich realistic shadow.
- Consistent negative space around the glass and generous crop-safe margins.
- Accurate glass geometry, believable liquid, physically plausible ice, condensation and bubbles only where appropriate.
- Final image must belong to a cohesive 322-image illustrated cocktail collection.

DRINK-SPECIFIC DIRECTION:
- Cocktail: ${c.name}
- Family: ${c.cocktailFamily}
- Template: ${a.template}
- Glass: ${a.glass}
- Liquid palette: ${a.liquidPalette.name} (${a.liquidPalette.hex})
- Ice: ${a.ice}
- Garnish: ${a.garnish}
- Flavor cues: ${c.flavorProfiles.join(", ")}
- Key ingredients: ${c.ingredientIds.join(", ")}

Render the cocktail itself only. Do not show ingredient containers. Do not add decorative fruit or herbs beyond the stated garnish. Do not invent a second garnish. No text.
`;
}

for (const cocktail of manifest.cocktails) {
  const outputPath = path.join(outputDir, `${cocktail.illustrationKey}.txt`);
  fs.writeFileSync(outputPath, buildPrompt(cocktail), "utf8");
}

console.log(`Generated ${manifest.cocktails.length} prompt files in ${outputDir}`);
