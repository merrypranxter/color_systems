# Color Spaces

## The Problem with RGB

sRGB is not how your eyes work. It's an engineering compromise from the 1990s, based on CRT phosphors. When you interpolate between red and green in sRGB, you get a brown muddy middle. When you rotate hues in HSL, bright yellow and dark blue get treated as equal. None of this is perceptually true.

Every color space in this repo is documented as:
1. **What it actually is** (the math)
2. **What it's good for** (use cases)
3. **What it gets wrong** (failure modes)
4. **How to convert** (matrices and formulas)

---

## The Stack (from physics to display)

```
Physical light (spectral power distribution)
    ↓ CIE 1931 XYZ (device-independent, models human cone response)
    ↓ CIELAB / OKLab (perceptually uniform transforms of XYZ)
    ↓ Linear sRGB (physically linear, based on XYZ)
    ↓ sRGB (gamma-encoded for display)
    ↓ Your monitor (with its own gamut and white point)
```

Every space in this chain is useful for different things.

---

## Which Space for What

| Task | Use |
|------|-----|
| Gradient interpolation | OKLab |
| Hue rotation | OKLCh (cylindrical OKLab) |
| Harmony math | HSL (hue angle arithmetic) |
| Accessibility / contrast | CIELAB (WCAG uses relative luminance) |
| Color difference | ΔE in CIELAB or OKLab |
| GLSL gradients | Linear sRGB interpolation minimum; OKLab for quality |
| Display output | sRGB (gamma-encoded) |
| Gamut visualization | CIE XYZ |

---

## OKLab vs CIELAB

Both are perceptually uniform. OKLab is newer (2020) and better:
- Better hue uniformity (CIELAB has hue shifts in blue region)
- Simpler math (no division, no arctan for basic ops)
- Faster in GLSL
- Still has the same L (lightness), a (green-red), b (blue-yellow) structure

Use OKLab for everything new. Use CIELAB if you're computing WCAG contrast or Delta-E 2000 (industry standard color difference).

---

## The Gamut Problem

Your monitor can only display a subset of all visible colors. sRGB covers ~36% of the visible gamut. Display P3 covers ~45%. Everything outside those boundaries gets **clamped** — silently. 

This means:
- Fluorescent colors often can't be represented in sRGB
- Some of your most vivid mental images are physically impossible on screen
- Colors that look great in math may look flat when rendered

Gamut mapping is the art of gracefully degrading out-of-gamut colors. See `data/gamuts/` for geometry data.
