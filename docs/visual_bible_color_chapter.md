# Color Language
### A Working Reference for Generative Artists

*Source: color_systems. Flag for copy to merrys_visual_bible/chapters/.*

---

## Color Space Decision Tree

When you're about to do something with color, which space do you use?

```
What are you trying to do?
│
├── Display a color on screen
│   └── → sRGB (always, for final output)
│
├── Interpolate between two colors / make a gradient
│   ├── Want it to look right? → OKLab (oklabMix)
│   └── Quick and dirty? → HSL (expect muddy midpoints)
│
├── Rotate a hue / generate harmony angles
│   ├── Creative, wants to look uniform → OKLCh (rotate h channel)
│   └── Classic wheel math, fast → HSL (H ± angle mod 360)
│
├── Change brightness / saturation
│   ├── Perceptually accurate → OKLCh (adjust L and C)
│   └── Intuitive artist model → HSV (adjust V and S)
│
├── Measure color difference (ΔE)
│   ├── Industry standard → CIELAB + CIEDE2000
│   └── Good enough for art → OKLab Euclidean distance
│
├── Generate a palette of n evenly-spread colors
│   ├── Maximum coverage → golden angle (137.508° × n)
│   ├── Feels natural → Fibonacci ratios
│   └── Has character → prime gaps or Collatz
│
└── Check accessibility contrast (WCAG)
    └── → relative luminance from linear RGB (NOT HSL L)
```

---

## Harmony Vocabulary

Eight ways to structure color relationships. Listed from least to most confrontational.

**Monochromatic** — One hue, many values. The whole piece lives in one color's territory. Serene, controlled, can feel cold or clinical unless the value range is wide enough to show warmth.

**Analogous** — Three neighbors on the wheel, 30° apart. They belong together without explanation. Found in every sunset, every forest, every ocean. Nature's default. Low tension, high coherence.

**Analogous Wide** — Five neighbors across 120°. Enough range to feel varied, still close enough to feel unified. The workhorse of complex systems where you want interest without chaos.

**Split Complementary** — One anchor plus two colors flanking its opposite. You get most of the drama of a complementary pair with a softer landing. More sophisticated than straight complementary, less risky.

**Triadic** — Three colors at 120° each. Vibrant, democratic, nobody gets to be quiet. Primary red/yellow/blue is triadic. Everything in a triadic palette competes — you must give one color dominance or it becomes noise.

**Rectangular / Double Complementary** — Two complementary pairs. Two separate tensions operating simultaneously. Sophisticated and a bit unstable. Use when you want the painting to feel like two conversations happening at once.

**Square / Tetradic** — Four colors at 90°. Maximum structural complexity. Covers warm and cool simultaneously. Impossible to balance with equal weights — two colors must lead, two must follow. High reward, high difficulty.

**Complementary** — Two colors directly opposite. Maximum hue distance, maximum vibration. One hue makes the other look more intense. At equal weight and equal luminance, they vibrate. This is the palette of urgency, sports teams, warning signs.

---

## Itten's 7 Contrasts as Artistic Weapons

Josef Itten identified seven distinct types of color contrast. Each is a tool. Here is what each one does to a viewer and how to deploy it.

### 1. Hue Contrast
**What it does:** Pure difference of hue — red vs. blue vs. yellow. The clearest signal of "these are different things." No ambiguity, no subtlety.
**How to use it:** For categorical information. For bold graphic work. For anything that needs to be instantly legible from a distance. Primary colors are the strongest form.

### 2. Light-Dark Contrast
**What it does:** Creates depth, volume, drama. The most fundamental of all contrasts — black ink on white paper is pure light-dark. More powerful than any hue contrast.
**How to use it:** Before you think about hue, settle your value structure. A strong light-dark composition reads at any scale, in any medium, even in grayscale. Hue is secondary to this.

### 3. Cold-Warm Contrast
**What it does:** Creates spatial recession (cool colors recede) and advance (warm colors come forward). Atmospheric. Can create vibration at the boundary.
**How to use it:** Push warm colors forward in space, cool colors back. Use cool shadows, warm lights. In abstract work, warm-cool contrast creates the illusion of dimension even with flat shapes.

### 4. Complementary Contrast
**What it does:** Maximum vibration. Adjacent complementaries intensify each other — each looks more saturated because of the other. Can create visual buzzing that is either electric or exhausting.
**How to use it:** Use one color at 70% area, its complement at 30% for stable tension. For maximum vibration: equal areas, equal lightness, high saturation. Use this to make something impossible to ignore.

### 5. Simultaneous Contrast
**What it does:** A gray on an orange background looks bluish. The same gray on blue looks orange. Context changes perception. You cannot design colors in isolation.
**How to use it:** Test your palette in context, not in swatches. Use simultaneous contrast intentionally by placing colors that will make their neighbors more intense. Fight it by adding a neutral buffer zone.

### 6. Saturation Contrast
**What it does:** A saturated color next to a desaturated one makes the saturated one scream and the desaturated one whisper. The more context there is of muted colors, the louder a single saturated element becomes.
**How to use it:** One vivid accent in a field of grays or desaturated tones achieves more than five competing saturated colors. Master the art of deliberate desaturation to give your focal point maximum power.

### 7. Extension Contrast (Quantity Contrast)
**What it does:** Area ratio matters. Itten calculated approximate balance ratios: yellow needs the smallest area, violet the largest. Equal areas of complementaries are not balanced — they fight.
**How to use it:** Let the dominant color (usually the quieter one) take 70%+ of the space. Give the accent a small territory and let it earn its intensity through rarity. Never give complementary colors equal real estate unless vibration is the goal.

---

## Math Palette Types: Aesthetic Personalities

Four mathematical systems for generating color sequences. Each has a distinct character.

### Golden Angle (137.508°)
**Personality:** The diplomat. Every color is as different as possible from its neighbors without anyone being left out. No clustering, no repetition, perfect distribution across the wheel. Mathematically optimal, aesthetically neutral — it works for any n, looks good, has no strong character of its own. The golden angle is the default correct answer.

### Fibonacci Ratios
**Personality:** The traditionalist who discovers something new. Starts with complementary (0.5), moves through triadic (0.667), gradually converges toward the golden angle. Begins with familiar classical harmonies and evolves toward maximum coverage. Best for time-based animations that start with recognizable structure and slowly complexify. Has a narrative arc.

### Prime Gaps
**Personality:** The irregular heartbeat. Clusters of short steps (twin prime zones — analogous-like) punctuated by sudden long jumps (prime deserts). Not random — deterministic — but with the feeling of organic irregularity. Palettes have local neighborhoods and long-range surprises. The most interesting sequence for color: neither too ordered nor too chaotic.

### Collatz
**Personality:** The anarchist. Values spike and plunge according to a rule that nobody fully understands (we don't even know if all starting numbers eventually reach 1). High-energy, zero local coherence. Adjacent colors in a Collatz palette are maximally unlike each other. Use when you want complete unpredictability within a determined system. The palette of things that feel out of control but aren't.

---

## OKLab: One Paragraph for Artists

OKLab is a color space invented in 2020 by Björn Ottosson to fix a specific problem: when you mix two colors together (in code, in a gradient, in a shader), the result should look like the perceptual midpoint — not a muddy gray, not a hue-shifted mess, not something that's too dark in the middle. In sRGB and even in CIELAB, this goes wrong in predictable ways: blue-to-yellow goes through gray, saturated-to-black shifts hue unexpectedly. OKLab is calibrated so that equal numerical distances correspond to equal perceived differences — if you move 0.1 units in any direction, the color looks about the same amount different, everywhere in the space. The practical result: gradients don't go muddy. Hue rotations stay equally bright. Color animations don't flicker unexpectedly. You don't have to think about it — you just get colors that behave like they should. If you're doing any color math in code, route it through OKLab and your results will look better without any additional effort.

---

*color_systems — https://github.com/merrypranxter/color_systems*
