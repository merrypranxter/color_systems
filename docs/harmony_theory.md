# Harmony Theory

## Color as Circular Algebra

A color wheel is a circle. That's not a metaphor — it's the math. Hue in HSL is an angle (0–360°), and all harmony systems are geometric operations on that circle.

This means:
- **Harmony relationships are addition and modular arithmetic**
- Every classical system is just a regular polygon inscribed in the wheel
- Tension between colors is circular distance, normalized

---

## The 7 Classical Harmonies

All defined by angle arithmetic on a base hue θ (theta):

| Harmony | Angles | Polygon |
|---------|--------|---------|
| Monochromatic | θ (vary S and L) | point |
| Complementary | θ, θ+180 | diameter |
| Split Complementary | θ, θ+150, θ+210 | isoceles triangle |
| Triadic | θ, θ+120, θ+240 | equilateral triangle |
| Analogous | θ-30, θ, θ+30 | arc |
| Square/Tetradic | θ, θ+90, θ+180, θ+270 | square |
| Rectangular | θ, θ+60, θ+180, θ+240 | rectangle |

All arithmetic is mod 360.

---

## Itten's 7 Contrasts

Johannes Itten (Bauhaus, 1961) identified 7 distinct types of color contrast — not just hue difference, but qualitative relationships:

1. **Hue contrast** — pure colors at maximum saturation, maximum hue distance
2. **Light/dark contrast** — luminance difference (most powerful spatial effect)
3. **Cold/warm contrast** — blue/green vs orange/red; creates depth
4. **Complementary contrast** — opposite hues at equal saturation → visual vibration
5. **Simultaneous contrast** — surrounding color shifts perception of inner color
6. **Saturation contrast** — saturated vs. muted (focal point creation)
7. **Quantity/extension contrast** — area ratios must be inverse to luminance weights for balance

See `data/harmony/itten_contrasts.json` for formalizations.

---

## Tension Index

Each harmony has a "tension index" based on its maximum hue distance (normalized to [0, 1]):

```
tension(H1, H2) = min(|H1-H2|, 360-|H1-H2|) / 180
```

- Monochromatic: 0 (no tension)
- Analogous: ~0.17 (low tension, restful)
- Triadic: 0.67 (medium-high tension)
- Complementary: 1.0 (maximum tension, vibrates)

Use tension deliberately. Low tension = calm backgrounds. High tension = focal points, alerts, energy.

---

## The Golden Angle Exception

All classical harmonies use whole-number fractions of 360° (180°, 120°, 90°, etc.). The golden angle (137.508°) breaks this pattern — it's irrational, never forming a closed polygon.

This makes golden angle sequences unique:
- They never cluster
- They never repeat for finite n  
- Adding more colors always fills the largest gap (Weyl equidistribution theorem)

Use it when you need N maximally distinct colors with no fixed geometric structure.

---

## Implementation

All harmony functions are in `utils/color_math.js` (`harmonyAngles()`).  
GLSL versions are in `shaders/lib/harmony.glsl` and `shaders/lib/hsl.glsl`.  
Data specs for each harmony are in `data/harmony/classical_harmonies.json`.
