# THE-LISTS → color_systems: Sequence-to-Palette Data Flow

## Overview

`utils/lists_bridge.js` connects [THE-LISTS](../../THE-LISTS/) mathematical sequence data to `color_systems` palette generators. Each sequence type produces a distinct aesthetic behavior when mapped to hue spacing.

---

## Data Flow

```
THE-LISTS/data/sequences/{name}.json
    ↓  (imported as JSON array)
utils/lists_bridge.js  
    ↓  (maps sequence values → hue angles)
hex color array  →  data/palettes/lists_derived_palettes.json
```

When THE-LISTS is not available (standalone mode), `lists_bridge.js` computes sequences inline. THE-LISTS simply provides pre-computed, validated sequence data as a performance and correctness optimization.

---

## Sequence Types and Their Aesthetic Behaviors

### Fibonacci
**Formula:** `hue_n = (base + Fib(n)/Fib(n+1) × 360°) mod 360°`

**What it does:** Fibonacci ratios converge toward the golden ratio conjugate (≈0.618). The first ratio is 0.5 = complementary (180°), the second is 0.667 = triadic (240°), and subsequent steps creep closer to the golden angle (137.5°). The palette *discovers* optimal hue distribution from first principles.

**Aesthetic:** Starts with familiar classical harmonies and progressively becomes more evenly spread. Use for animations that begin with legible structure and evolve toward maximal coverage. The convergence is visible — you can watch it approach the golden angle.

---

### Lucas
**Formula:** `cumulative hue steps: Δhue_n = Lucas[n] × scale`

**What it does:** Lucas sequence (2,1,3,4,7,11,18,29...) shares Fibonacci's growth ratio (φ) but starts with different seeds. Gap sizes widen rapidly, producing short analogous steps early and large complementary-range jumps later.

**Aesthetic:** Accelerating hue spread. Starts with tight clusters, ends with wide coverage. Similar to Fibonacci but with different initial clustering. The 2,1 start creates a subtle retrograde feel in the first two steps.

---

### Padovan
**Formula:** `cumulative hue steps: Δhue_n = Padovan[n] × 22°`

**What it does:** Padovan recurrence P(n) = P(n-2) + P(n-3) starts 1,1,1. Three equal initial values mean the first three hues are evenly spaced (tight analogous). Growth is slower than Fibonacci (plastic constant ≈1.3247 vs φ≈1.618), so the acceleration is gradual.

**Aesthetic:** Opens with three analogous blues, slowly accelerates through pinks, yellows, greens. "Calm then dramatic." The palindrome start (1,1,1) creates a centered, stable opening before the sequence diverges. Works well for palettes that need a deliberate, unhurried pace.

---

### Prime Gaps
**Formula:** `cumulative hue steps: Δhue_n = prime_gap[n] × scale`

**What it does:** Gaps between consecutive primes (2→3=1, 3→5=2, 5→7=2, 7→11=4, 11→13=2, 13→17=4...). Twin prime pairs (gap=2) create short analogous-range steps; prime deserts (gap=6, 8, 14...) create dramatic leaps. The pattern is irregular but deterministic.

**Aesthetic:** Alternates between local clusters (analogous-like twin prime zones) and sudden jumps (prime deserts). The sequence knows no particular scale but can be rescaled by the `scale` parameter. Scale=30 gives analogous+triadic range; scale=90 makes every step feel like a complementary jump.

---

### Collatz
**Formula:** `hue_n = (collatz[n] × 2.5°) mod 360°`

**What it does:** Collatz sequences are chaotic in value but guaranteed to reach 1. Values can spike dramatically (27 reaches 9232 before descending). Each value mapped to hue produces sequences that jump wildly across the wheel with no local coherence.

**Aesthetic:** Maximum chaos within determinism. No adjacent colors are similar. Use for palettes where you want each element to feel completely unrelated to its neighbors — data encoding where similarity is misleading, or generative art where you want maximum visual surprise from each step.

---

### Tribonacci
**Formula:** `cumulative hue steps: Δhue_n = Tribonacci[n] × scale`

**What it does:** T(n) = T(n-1) + T(n-2) + T(n-3). Grows faster than Fibonacci (ratio ≈1.839). The initial 0 means the first step has zero movement. The acceleration is steeper — it sweeps more of the hue circle in fewer steps.

**Aesthetic:** Slow then fast. The 0,1,1 start creates two nearly identical hues, then the sequence explodes outward. Useful for palettes with a clear "anchor" color that references itself before expanding.

---

### Perrin
**Formula:** `cumulative hue steps: Δhue_n = Perrin[n] × 28°`

**What it does:** P(n) = P(n-2) + P(n-3), starts 3,0,2. The 0 term means one hue step has zero movement — a repeated color. Mathematical connection: P(prime p) ≡ 0 (mod p) for all primes. Slow, irregular growth.

**Aesthetic:** The Perrin palette has a "breath" — a pause where the same hue appears twice. This creates palettes with built-in repetition, useful when you want exactly one anchor color to appear at two points in the sequence. Unusual, slightly unsettling.

---

### Prime Direct
**Formula:** `hue_n = (prime[n] × scale) mod 360°`

**What it does:** Uses prime numbers themselves as hue angles (not gaps). Primes mod 360 have a slight bias toward certain residue classes (Dirichlet's theorem). At scale=18, the primes sweep almost the full spectral arc in the first 8 steps, with gaps corresponding to prime spacings.

**Aesthetic:** Nearly spectral but not quite. Feels like a rainbow with a few steps removed. Less chaotic than Collatz, more regular than prime gaps. Good for data encoding where you want clear visual separation between categories.

---

## Usage Examples

```javascript
import { primePalette, fibonacciPalette, collatzPalette } from './utils/lists_bridge.js';

// 8 colors from prime gaps, base hue 0°, saturated, medium lightness
const palette = await primePalette(8, 0, 0.85, 0.55);
// → ['#e83030', '#30e8e8', '#30e830', ...]

// Fibonacci ratios starting from blue
const fibPalette = await fibonacciPalette(6, 240, 0.8, 0.52);

// Collatz from seed 27, 10 colors, vivid
const collatzPalette = await collatzPalette(27, 10, 0.9, 0.55);
```

All generators return `string[]` of hex colors. All are `async` — they attempt to load from THE-LISTS and fall back to inline computation if THE-LISTS is unavailable.

---

## When to Use Which Sequence

| Need | Use |
|---|---|
| Maximum hue coverage for any n | Golden angle (in color_math.js) |
| Familiar harmony that evolves | Fibonacci ratios |
| Deliberate, accelerating spread | Padovan |
| Clusters + sudden jumps | Prime gaps |
| Complete unpredictability | Collatz |
| Fast sweep | Tribonacci |
| Built-in repetition | Perrin |
| Near-spectral ordering | Prime direct |
