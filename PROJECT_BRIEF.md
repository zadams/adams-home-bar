# The Adams Home Bar

## A Personal Cocktail Manual for the Spirits You Own

Build a polished, installable Progressive Web App called **“The Adams Home Bar”**, with the subtitle **“A Personal Cocktail Manual for the Spirits You Own.”**

The app is a personalized cocktail book and home-bar inventory manager designed primarily for an 11-inch iPad Air used horizontally beside a home bar. It should feel like a premium cocktail book combined with a practical bar-management tool—not a generic admin dashboard.

---

## 1. Product Goals

Create one unified experience containing:

1. A personalized cocktail recipe book
2. A home-bar bottle and ingredient inventory
3. A “what can I make?” recommendation engine
4. A shopping-list generator
5. Favorites, ratings, tasting notes, and drink history
6. Cocktail illustrations and bottle imagery
7. Offline support and home-screen installation
8. Easy expansion as new recipes and bottles are added

The user should be able to place an iPad horizontally on the bar, open the app, select a cocktail, and comfortably read the recipe while preparing the drink.

The application must work well:

- As a landscape iPad PWA
- In portrait orientation
- On desktop browsers
- On phones, with stacked responsive layouts
- Offline after required assets have been cached

---

## 2. Technical Approach

Build the project as a static, client-side PWA.

Preferred characteristics:

- TypeScript
- A modern component-based frontend framework
- Static hosting compatibility
- No backend required for the initial version
- No login required
- Data stored locally
- Recipes and initial inventory stored as structured JSON or TypeScript data
- User preferences, inventory changes, ratings, notes, and history stored locally
- A clear persistence abstraction so cloud sync can be added later
- Service worker and web-app manifest
- Installable on an iPad home screen
- Fully usable without a network connection after initial caching

Choose an architecture that is maintainable and easy to extend.

Do not over-engineer the first release with authentication, databases, payments, or server infrastructure.

Suggested structure:

```text
src/
  components/
  data/
    cocktails/
    ingredients/
    inventory/
    bottles/
  features/
    cocktails/
    inventory/
    shopping-list/
    recommendations/
    favorites/
    history/
  pages/
  services/
    persistence/
    recommendation-engine/
  styles/
  types/
  utils/

public/
  icons/
  images/
    cocktails/
    bottles/
  manifest assets
```

Create reusable components and avoid placing all logic in one page.

---

## 3. Visual Direction

The visual identity should feel like a premium cocktail lounge and illustrated reference book.

Visual qualities:

- Warm walnut or dark wood surfaces
- Deep green, charcoal, cream, amber, brass, and muted gold
- Elegant serif typography for titles
- Highly readable sans-serif typography for instructions and controls
- Warm bar lighting
- Cocktail illustrations or editorial-style drink photography
- Bottle illustrations displayed near recommended recipes
- Subtle paper, leather, or book-inspired textures
- Refined rather than kitschy
- Avoid excessive gradients, neon, glassmorphism, or generic SaaS styling

Accessibility requirements:

- Strong contrast
- Large tap targets
- Recipe text readable from approximately arm’s length
- Do not encode status using color alone
- Keyboard navigation
- Visible focus states
- Semantic HTML
- Screen-reader labels
- Respect reduced-motion preferences

---

## 4. Primary iPad Layout

Optimize the main recipe experience for an approximately 4:3 landscape tablet display.

The recipe screen should resemble a premium two-page book spread.

### Left panel

- Large cocktail illustration
- Cocktail name
- Classification: classic, modern classic, tiki, highball, sour, spirit-forward, dessert, seasonal
- Readiness status
- Flavor profile
- Difficulty
- Preparation time
- Approximate strength
- Glassware
- Ice
- Garnish
- Recommended bottles from the user’s inventory

### Right panel

- Adjustable serving count
- Precise ingredient quantities
- Preparation steps
- Technique notes
- Short historical context
- Why the drink works
- Substitutions based on current inventory
- Related cocktails
- Favorite control
- Rating
- Personal tasting notes
- “I made this” button

On narrow displays, stack the panels vertically.

The recipe view should remain readable without excessive scrolling on a landscape iPad. Secondary sections may collapse into expandable panels.

---

## 5. Main Navigation

Provide persistent, touch-friendly navigation with:

- Home
- Cocktails
- My Bar
- Make Something
- Shopping List
- Favorites
- History
- Settings

On landscape tablets, use a compact sidebar or polished top navigation. On phones, use bottom navigation or a compact menu.

---

## 6. Home Screen

The home screen should immediately answer: **“What should I make?”**

Include:

- Make Something Now
- Ready to Make
- Missing One Ingredient
- Use a Specific Bottle
- Surprise Me
- Recently Viewed
- Recently Made
- Favorites
- Seasonal Suggestions
- Continue the Cocktail Journey

Show a compact inventory summary:

- Number of bottles
- Number of available cocktails
- Number of cocktails missing one ingredient
- Ingredients currently low or unavailable

Do not make the opening screen look like an accounting dashboard. Use editorial cards and drink imagery.

---

## 7. Cocktail Browsing

Support search by:

- Cocktail name
- Ingredient
- Bottle
- Spirit
- Flavor
- Cocktail family

Support filters for readiness, favorites, history, difficulty, flavor, style, season, and spirit category.

Sorting options:

- Best inventory match
- Recommended
- Name
- Difficulty
- Recently viewed
- Recently made
- Highest rated

Each cocktail card should display:

- Image
- Name
- Style
- Readiness status
- Missing ingredients, if any
- Difficulty
- Key spirit

---

## 8. “Make Something” Engine

Create a recommendation engine that ranks cocktails based on the user’s current inventory.

Readiness states:

- **Ready:** all required ingredients are available
- **Almost Ready:** one required ingredient is missing
- **Nearly Ready:** two required ingredients are missing
- **Not Ready:** more than two required ingredients are missing

Required and optional ingredients must be distinguished. A garnish should not normally block readiness unless structurally important.

The engine should account for:

- Ingredient categories
- Acceptable substitutions
- Specific preferred bottles
- Generic spirit matches
- Optional ingredients
- Fresh ingredients
- User-marked availability
- Quantity status where known

Ranking factors:

1. Exact inventory match
2. User favorites
3. Flavor preferences
4. Ingredients the user wants to use
5. Bottles not used recently
6. Difficulty preference
7. Seasonal relevance
8. User ratings
9. Whether the cocktail has been tried

Provide clear explanations for recommendations.

---

## 9. Inventory System

Support:

- Bottles
- Liqueurs
- Bitters
- Syrups
- Juices
- Carbonated mixers
- Fresh produce
- Garnishes
- Pantry ingredients
- Bar supplies

Inventory fields:

- ID
- Brand
- Product name
- Generic ingredient category
- Category
- Subcategory
- Quantity or status
- Bottle size
- Approximate remaining percentage
- Opened or unopened
- Date opened
- Purchase date
- Notes
- Preferred for mixing
- Preferred for sipping
- Image
- Tags

Statuses:

- In stock
- Low
- Out
- Unknown

Provide touch-friendly editing and bottle detail pages showing matching cocktails, recommendations, readiness, notes, and remaining quantity.

---

## 10. Initial User Inventory

Seed the app with the following known inventory.

### Whiskey, Bourbon, Rye, and Scotch

- Angel’s Envy Kentucky Straight Bourbon Finished in Port Wine Barrels
- Angel’s Envy Finished Rye
- ASW Fiddler Toasted Series Cask Strength Wheated Bourbon
- Barrell Rye
- Barrell Vantage
- Bardstown Bourbon Company Fusion Series
- Bardstown Bourbon Company Triple Blended Finish
- Blanton’s Original Single Barrel Bourbon
- Chicken Cock Kentucky Straight Bourbon
- Eagle Rare
- Elijah Craig Straight Rye
- Henry McKenna 10 Year Bottled-in-Bond
- Kirkland Signature Small Batch Kentucky Straight Bourbon
- The Macallan 12 Year
- Old Medley 12 Year
- Penelope Architect Bourbon
- Pinhook Kentucky Straight Bourbon
- Russell’s Reserve 10 Year
- Sazerac Rye
- Widow Jane Decadence
- Woodford Reserve Distiller’s Select
- Multiple Woodford Reserve Master’s Collection bottles

### Rum

- Havana Club Añejo 3 Años
- Havana Club Especial
- Havana Club Selección de Maestros
- Kraken Black Spiced Rum
- Stroh 160
- Toasted coconut rum

### Tequila

- Kirkland Signature Añejo Cristalino
- Kirkland Signature Extra Añejo
- Other confirmed Kirkland tequila from the photo inventory

### Gin

- Drumshanbo Gunpowder Irish Gin
- Hendrick’s Gin
- Malfy Gin Originale

### Vodka, Aquavit, and Flavored Spirits

- Tito’s Vodka
- Berliner Luft
- Božkov Peppermint
- Božkov Griotte
- Inderøy Den Gyldne Aquavit
- Koskenkorva Apple
- Koskenkorva Blueberry
- Koskenkorva Lemon
- Koskenkorva Peach
- Nemiroff Honey Pepper

### Liqueurs and Modifiers

- Aperol
- Baileys Original Irish Cream
- Becherovka Fruits & Herbs Lemond
- Blind Squirrel Peanut Butter Holiday Nog
- Campari
- Cointreau
- Crème de Banane
- Grand Marnier
- Luxardo Maraschino Liqueur
- MontBisou Pêches Liqueur
- The Bitter Truth Golden Falernum
- Finest Call Peach
- Finest Call Triple Sec
- Sweet vermouth
- Dry vermouth

### Bitters

- Angostura Aromatic Bitters
- Angostura Cocoa Bitters
- Fee Brothers Orange Bitters
- Peychaud’s Bitters

### Syrups and Sweeteners

- Agave syrup
- Simple syrup
- Brown sugar cinnamon syrup
- Sweetened lime juice
- Cream of coconut

### Mixers

- Fever-Tree tonic water
- Fever-Tree club soda
- Grapefruit soda when available
- Other mixers should be editable rather than assumed

### Garnish and Fresh Items

Default these to unknown or temporary availability:

- Lemons
- Limes
- Oranges
- Grapefruit
- Mint
- Cocktail cherries / Luxardo cherries
- Olives
- Cucumber
- Salt
- Tajín

Do not assume fresh ingredients remain permanently in stock.

---

## 11. Recipe Data Model

Create strongly typed recipe data using stable IDs.

```ts
interface Cocktail {
  id: string;
  slug: string;
  name: string;
  aliases: string[];
  description: string;
  history?: string;
  origin?: string;
  year?: number;
  creator?: string;
  classifications: string[];
  cocktailFamily: string;
  flavorProfiles: string[];
  difficulty: string;
  preparationTime: number;
  strength: string;
  glassware: string;
  ice: string;
  garnish: string[];
  illustration?: string;
  featuredBottleImages?: string[];
  ingredients: CocktailIngredient[];
  steps: string[];
  techniqueNotes: string[];
  recommendedBottles: RecommendedBottle[];
  substitutions: Substitution[];
  variations: Variation[];
  relatedCocktailIds: string[];
  seasonality: string[];
  tags: string[];
}
```

Allow metric and US customary units. Serving-size scaling must avoid nonsensical scaling for bitters, rinses, garnishes, and “top with” ingredients.

---

## 12. Initial Cocktail Collection

Create 40–60 complete recipes over time, prioritizing quality.

### Foundations

- Old Fashioned
- Manhattan
- Martini
- Daiquiri
- Margarita
- Negroni
- Whiskey Sour
- Gin and Tonic
- Paloma
- Tom Collins
- Southside
- Southside Fizz
- Gimlet
- Mojito

### Whiskey and Rye

- Boulevardier
- Gold Rush
- Mint Julep
- Sazerac
- Brown Sugar Cinnamon Old Fashioned
- Banana Old Fashioned
- Whiskey Highball
- Peach Whiskey Sour
- Manhattan variations
- Improved Whiskey Cocktail, if supported

### Rum and Tropical

- Corn ’n’ Oil
- Royal Bermuda Yacht Club
- Classic Daiquiri
- Banana Daiquiri
- Coconut Daiquiri
- Coconut Mojito
- Dark ’n’ Stormy
- Cuba Libre
- Rum Old Fashioned
- Jungle Bird
- Mai Tai
- Piña Colada
- Rum Swizzle
- Falernum Daiquiri variation

### Gin

- Negroni
- Martini
- Gimlet
- Southside
- Southside Fizz
- Tom Collins
- Gin Rickey
- French 75
- Falernum Gin Collins

### Tequila

- Margarita
- Tommy’s Margarita
- Paloma
- Tequila Limeade
- Tequila Old Fashioned
- Coconut Margarita
- Tequila Sunrise

### Vodka

- Vodka Gimlet
- Moscow Mule
- Cosmopolitan
- Vodka Tonic
- Vodka Soda

### Aperitif and Spritz

- Aperol Spritz
- Americano
- Negroni Sbagliato

### Dessert and Specialty

- Baileys-based drink
- Banana Boulevardier
- Peanut butter liqueur drink
- Peach Collins
- Cherry liqueur cocktail

Mark recipes requiring missing ingredients appropriately. Do not fabricate historical facts.

---

## 13. Personalized Bottle Recommendations

Store recommendations as structured data, not hard-coded component prose.

Examples:

### Old Fashioned

1. Russell’s Reserve 10 — classic, balanced, oak-forward
2. Penelope Architect — polished with extra oak influence
3. Eagle Rare — softer and fruitier
4. ASW Fiddler Toasted Wheated — richer and sweeter

### Daiquiri

1. Havana Club 3 Años
2. Havana Club Especial for a richer variation
3. Toasted coconut rum only for a coconut variation

### Southside

1. Drumshanbo Gunpowder Gin
2. Hendrick’s Gin
3. Malfy Gin Originale

### Sazerac

1. Sazerac Rye
2. Elijah Craig Rye

### Corn ’n’ Oil

1. Havana Club Especial
2. Kraken for a sweeter, spiced interpretation

### Margarita

Prefer Cointreau for individual premium cocktails. Use Finest Call Triple Sec for batching, frozen drinks, parties, and lower-cost variations.

---

## 14. Shopping List

Support:

- Adding a missing ingredient from a recipe
- Adding all missing ingredients for selected cocktails
- Grouping by produce, spirits, liqueurs, bitters, syrups, mixers, garnishes, and pantry
- Marking items purchased
- Updating inventory when purchased
- Showing how many cocktails each purchase unlocks

Rank purchases by cocktail-unlock value.

---

## 15. User Features

Support:

- Favorites
- Star ratings
- Written tasting notes
- “Made it” history
- Date prepared
- Bottle used
- Personal modifications
- Would make again
- Difficulty feedback
- Favorite variation

The history screen should show recent drinks, most-made drinks, highest-rated drinks, untried drinks, and bottle usage summaries.

---

## 16. Cocktail Journey

Include a guided learning section called **The Cocktail Journey**.

### Stage 1: Foundations

- Old Fashioned
- Daiquiri
- Margarita
- Manhattan
- Martini
- Negroni

### Stage 2: Build and Explore

- Whiskey Sour
- Gold Rush
- Boulevardier
- Southside
- Tom Collins
- Corn ’n’ Oil
- Royal Bermuda Yacht Club

### Stage 3: Advanced Classics

- Sazerac
- Mai Tai
- Jungle Bird
- Vieux Carré
- Paper Plane
- Last Word

Some drinks may appear locked or incomplete when ingredients are missing. Track completion locally and explain relationships between cocktail families.

---

## 17. Images and Illustrations

Create an image abstraction so placeholders can later be replaced without modifying recipe components.

Support:

- Cocktail hero illustration
- Bottle image
- Garnish image
- Optional glassware illustration

Use consistent aspect ratios and graceful fallbacks. Never embed important recipe text inside generated images.

---

## 18. Offline and PWA Requirements

Implement:

- Web-app manifest
- App name and short name
- App icons
- Theme color
- Landscape-friendly display
- Standalone display mode
- Service worker
- Offline app shell
- Cached recipe data
- Cached essential imagery
- Offline fallback
- Update-available notification

Provide iPad installation instructions:

1. Open the deployed site in Safari
2. Tap Share
3. Select Add to Home Screen
4. Launch from the home-screen icon

---

## 19. Data Export and Backup

Add controls for:

- Export all user data as JSON
- Import a prior JSON backup
- Reset app data
- Export shopping list
- Export tasting history

Validate imported files before applying them. Never allow malformed imports to erase valid data.

---

## 20. Testing

Add tests for:

- Inventory matching
- Substitution matching
- Cocktail readiness
- Missing-ingredient counts
- Serving-size scaling
- Shopping-list unlock counts
- Persistence
- Import/export validation

Representative cases should include exact matches, accepted substitutions, missing ingredients, optional garnishes, fresh ingredients marked out of stock, sensible bitters scaling, and “top with” ingredients.

Test responsive behavior at landscape iPad, portrait tablet, desktop, and mobile sizes.

---

## 21. Development Phases

### Phase 1 — Foundation

- Project setup
- Design tokens
- Routing
- PWA manifest
- Service worker
- Core data types
- Seed inventory
- Seed 12 foundational cocktails
- Cocktail browser
- Recipe view
- Responsive landscape tablet layout

### Phase 2 — Inventory and Matching

- Inventory management
- Readiness engine
- Missing-ingredient display
- Bottle detail pages
- Use a Specific Bottle
- Shopping list

### Phase 3 — Personalization

- Favorites
- Ratings
- Notes
- History
- Cocktail Journey
- Recommendation explanations

### Phase 4 — Content Expansion

- Expand to 40–60 recipes
- Add variations
- Add bottle recommendations
- Add related-cocktail links
- Add polished imagery

### Phase 5 — Finishing

- Accessibility review
- Tablet usability review
- Offline testing
- Import/export
- Performance optimization
- Installation instructions
- Deployment configuration

At the end of each phase:

1. Summarize what was implemented
2. List important files
3. Explain how to run it
4. Describe known limitations
5. Recommend the next phase
6. Include screenshots or a local preview when supported

---

## 22. Acceptance Criteria for the First Milestone

The first milestone is complete when:

- The app runs locally
- It has a polished landscape iPad layout
- It is installable as a PWA
- It contains the seeded inventory
- It contains at least 12 complete cocktail recipes
- Users can browse and search cocktails
- Users can open a full recipe
- Recipes show readiness based on inventory
- Missing ingredients are visible
- Serving quantities can be adjusted
- The app works offline after first load
- The UI remains usable on tablet, desktop, and phone
- Data is stored in maintainable structured files
- No backend is required

---

## 23. First Task

Begin with Phase 1 only.

Before implementation:

1. Inspect the existing repository
2. Summarize the current state
3. Propose the final technical stack
4. Propose the directory structure
5. Identify assumptions
6. Provide a concise Phase 1 implementation plan

Then implement Phase 1.

Seed these 12 complete cocktails:

- Old Fashioned
- Manhattan
- Martini
- Daiquiri
- Margarita
- Negroni
- Whiskey Sour
- Gin and Tonic
- Paloma
- Tom Collins
- Southside
- Sazerac

Use the user’s actual bottles in recommendations.

The final result should feel like the opening chapter of a premium personalized cocktail application, not a generic recipe database.

---

## Starter Instruction for a Coding Agent

```text
Read PROJECT_BRIEF.md in full.

Start Phase 1 only. First inspect the repository and propose the architecture, data model, and implementation plan. Then build a working, installable PWA with the 12 specified cocktails and the seeded home-bar inventory.

Prioritize the landscape 11-inch iPad recipe experience. Do not start later phases until Phase 1 is working, tested, and reviewed.
```
