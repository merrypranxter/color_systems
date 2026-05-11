# Moiré and Color: A Perceptual Theory

*How color choice transforms moiré from decoration to weapon.*

---

## Simultaneous Contrast in Interference Patterns

Moiré patterns emerge from the interference of two repeating grids. The spatial frequency of the interference pattern (the moiré "beat") is the difference frequency of the two component grids. But the *visibility* of that beat pattern is almost entirely controlled by color.

When two grids use the **same color**, the moiré disappears — you see only the overlapping grid. When they use **complementary colors at equal luminance**, the moiré achieves maximum visibility: the eye cannot blend the two grid colors into a neutral average, so every intersection reads as a distinct chromatic event. The beat pattern becomes a field of color-flicker.

This is simultaneous contrast operating at spatial frequency. The two grid colors, adjacent at every grid intersection, intensify each other. A red grid on a cyan grid doesn't produce pink at the intersections — it produces a vibrating chromatic boundary that the visual system cannot resolve into a stable percept. The moiré beat frequency becomes visible not because the geometry is clearer but because the color contrast is forcing the eye to make a binary choice at every line crossing.

---

## Which Harmony Types Amplify vs. Suppress Moiré Visibility

**Amplifiers (use these to maximize moiré drama):**

- **Complementary** — Maximum hue distance + maximum simultaneous contrast. At equal luminance and high chroma, complementary pairs produce the strongest moiré vibration. The eye cannot average them.
- **Square tetradic** — Two complementary pairs operating simultaneously. Creates interference patterns with secondary moiré effects at multiple spatial frequencies.
- **Split complementary** — High contrast without full complementary vibration. The two flanking colors produce slightly different beat frequencies, creating layered moiré textures.

**Suppressors (use these to quiet the moiré into texture):**

- **Analogous** — Similar hues blend at intersections. The moiré beat appears as a subtle luminance shimmer rather than chromatic vibration. Useful for moiré as background texture.
- **Monochromatic** — Single hue with value variation. Moiré appears as a gray-scale interference pattern. Classical, controlled, good for technical illustration.
- **High-lightness, low-saturation pairs** — Pastel grids produce moiré that reads as gentle luminance variation. Appropriate when the moiré should be felt rather than seen.

---

## How OKLCh Chroma Affects Fringe Intensity

Moiré fringe intensity scales with the chroma (colorfulness) of both component grids. In OKLCh terms:

```
fringe_intensity ≈ C₁ × C₂ × f(hue_distance)
```

Where C₁ and C₂ are the OKLCh chroma values of the two grid colors, and f(hue_distance) is a function that peaks at complementary (hue_distance = 180°) and falls to near-zero at monochromatic (hue_distance = 0°).

**Practical implications:**

1. **Maximum fringe:** Two complementary colors at maximum chroma (C ≈ 0.35–0.4 in OKLCh). Any reduction in chroma immediately reduces fringe visibility.
2. **Controlled fringe:** Reduce C of the dominant grid to 0.1–0.15 while keeping the accent grid at full chroma. The moiré pattern becomes visible only at the accent grid intersections.
3. **Invisible fringe:** Match chroma exactly between grids. Even at complementary hue angles, equal-chroma pairs at equal lightness produce minimal perceived movement.
4. **The lightness trap:** You can have C₁ × C₂ = 0 by desaturating either grid to gray. A colored grid moiréing against a gray grid produces luminance moiré only — all the spatial frequency information appears as brightness variation, not hue contrast. Useful when you want the pattern shape without the vibration.

---

## Why Complementary Pairs at Equal Luminance Create Maximum Vibration

The maximum vibration condition requires three simultaneous properties:

1. **Maximum hue distance:** 180° apart in OKLCh hue space (complementary). The visual system's opponent channels (red-green, blue-yellow) are maximally activated.

2. **Equal OKLab lightness:** When L values match, neither color appears "in front" of the other. The eye cannot use depth cues to resolve the ambiguity. The two grids compete as equals.

3. **High chroma in both:** The opponent channels need high input signal to generate strong rivalry. A high-chroma complementary pair at equal L produces the maximum signal in both red-green and blue-yellow channels simultaneously.

When all three conditions are met, the visual system cannot settle on a stable interpretation of the image. It alternates between seeing Grid A and Grid B as dominant. This alternation is what we perceive as "vibration." In moiré contexts, this vibration is modulated by the interference frequency — the moiré beat — creating the impression of a moving, breathing field even in a static image.

The practical recipe: select two OKLCh colors with the same L value (L ≈ 0.65 is a good working range), set hue angles 180° apart, and push C to near the gamut boundary for both. Then apply them to two overlapping grids of similar frequency. The result should be uncomfortable to look at for more than a few seconds — which is either a problem or the whole point.

---

## Cross-Reference

- Harmony types and angle math: `data/harmony/circle_algebra.json`
- OKLCh perceptual properties: `data/spaces/oklch.json`
- Moiré-optimized color pairs: `data/palettes/moire_optimized.json`
- Fragment shader for testing: `shaders/sketches/moire_palette_test.frag`
- GLSL vibration metric: `shaders/lib/harmony.glsl` → `complementaryVibration()`
