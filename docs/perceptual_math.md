# Perceptual Color Math

## What "Perceptually Uniform" Means

A color space is **perceptually uniform** if equal numerical distances correspond to equal perceived differences. sRGB is not perceptually uniform. HSL is not perceptually uniform. CIELAB and OKLab are approximately perceptually uniform.

Why does this matter?

```
// sRGB interpolation: goes through ugly muddy brown middle
mix(red, green, 0.5)  →  muddy brown

// OKLab interpolation: stays on the "real" perceptual path
oklabMix(red, green, 0.5)  →  warm olive (correct)
```

---

## The Human Visual System

Human color perception is driven by three cone types (S, M, L) responding to different wavelengths. The important properties for color math:

1. **Opponent channels**: The brain encodes color as L-M (red-green), S-(L+M) (blue-yellow), and L+M (luminance) — not as R, G, B. This is why color spaces with green-red and blue-yellow axes (like CIELAB and OKLab) are more perceptually natural.

2. **Non-linear luminance response**: We're much more sensitive to changes in dark regions than light regions. This is captured by the gamma curve in sRGB and the cube-root transform in CIELAB/OKLab.

3. **Hue non-uniformity**: Even in perceptually uniform spaces, hue perception is not perfectly uniform — yellows cluster more tightly, blues are perceived as darker. CIELAB is worse about this than OKLab.

---

## Interpolation in Practice

```javascript
// Bad: HSL interpolation (goes through ugly hues)
function badMix(hslA, hslB, t) {
  return [
    hslA[0] + (hslB[0] - hslA[0]) * t,  // hue lerp — WRONG
    ...
  ];
}

// Good: OKLab interpolation (perceptually linear path)
import { oklabMix } from './utils/color_math.js';
const midColor = oklabMix('#ff0000', '#00ff00', 0.5);  // correct olive
```

---

## Delta E — Color Difference

ΔE (Delta E) is the perceptual distance between two colors. The standard formulas are defined in CIELAB:

- **ΔE76**: Simple Euclidean distance in CIELAB. JND ≈ 1.
- **CIEDE2000**: Complex formula with hue/chroma/lightness weighting corrections. Industry standard.

In this repo, `utils/conversions.js` implements `deltaE76()` for quick perceptual distance checks. For accessibility work, `wcagContrastRatio()` uses the WCAG relative luminance formula.

---

## WCAG Contrast

WCAG (Web Content Accessibility Guidelines) defines contrast ratio as:

```
ratio = (L_lighter + 0.05) / (L_darker + 0.05)
```

where L is **relative luminance** from linear sRGB:

```
L = 0.2126 * R_linear + 0.7152 * G_linear + 0.0722 * B_linear
```

Note: This uses linear sRGB (after gamma removal), NOT L* from CIELAB. They're similar but not identical.

- AA compliance: ratio ≥ 4.5:1 (normal text), ≥ 3:1 (large text)
- AAA compliance: ratio ≥ 7:1 (normal text)

---

## Hue Uniformity: OKLab vs CIELAB

CIELAB has known hue non-uniformities, especially in the blue region — equal Δhue° in CIELCh doesn't look equal to your eyes. OKLab fixes most of this.

Test: rotate hue by 30° steps in CIELAB vs OKLCh. In OKLCh, all steps look approximately equal in perceptual size. In CIELCh, the blue steps look smaller and more muted.

**Conclusion**: For hue rotation and hue-based effects in generative art, always use OKLCh.
