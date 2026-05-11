# Gamut Geometry

## What Is a Color Gamut?

A color gamut is the set of colors that a device or color space can represent. Mathematically, it's a **convex polyhedron** in CIE XYZ space.

The shape of the gamut determines:
- What colors can be faithfully represented
- How colors outside the gamut get clamped (gamut clipping)
- How to gracefully map out-of-gamut colors (gamut mapping)

---

## The sRGB Gamut

sRGB is a **parallelepiped** (skewed cube) in XYZ space, defined by 8 vertices:

| Vertex | XYZ |
|--------|-----|
| Black | (0, 0, 0) |
| White | (0.9505, 1.0000, 1.0890) |
| Red | (0.4124, 0.2126, 0.0193) |
| Green | (0.3576, 0.7152, 0.1192) |
| Blue | (0.1805, 0.0722, 0.9505) |
| Cyan | (0.5381, 0.7874, 1.0697) |
| Magenta | (0.5929, 0.2848, 0.9698) |
| Yellow | (0.7700, 0.9278, 0.1385) |

The 12 edges connect each primary to its two secondary neighbors. Any color inside this parallelepiped is displayable in sRGB; any color outside gets clipped.

**sRGB covers only ~36% of visible colors.**

---

## Display P3

Display P3 has wider red and green primaries than sRGB, covering ~45% of visible colors. It's supported on all modern Apple devices and most current monitors.

The P3 gamut strictly contains the sRGB gamut — all sRGB colors are valid P3 colors, but not vice versa.

```css
/* Use P3 in CSS */
color(display-p3 1.0 0.0 0.0)  /* Most saturated P3 red — impossible in sRGB */
```

---

## Gamut Clipping vs. Mapping

When a computed color falls outside the display gamut, two strategies exist:

**Clipping (hard)**: Clamp each channel to [0, 1] independently. Fast, but can cause hue shifts and loss of detail.

**Chroma reduction (soft)**: Reduce the OKLCh chroma (C) while holding L and h constant, until the color fits in gamut. Preserves hue and lightness. Used in `shaders/lib/colorspace_transforms.glsl` (`oklch_gamut_map()`).

---

## Why This Matters for Generative Art

When you do math in OKLab or use very saturated HSL values, you're often generating colors that don't exist in sRGB. The conversion to display silently clips them. This is why:

- A color you compute as "very saturated green" comes out looking dull on screen
- Some color spaces look richer in GLSL than when displayed
- Trying to match a mental image of a color on screen is often impossible

Understanding gamut geometry means you can predict which colors will survive to the display and which won't.

**General rule**: sRGB has the most headroom in the middle lightnesses (L ≈ 0.4–0.6 in OKLab). Very bright or very saturated colors tend to be out-of-gamut.

---

## Visualization

- `sketches/p5/gamut_3d.js` — p5.js wireframe of sRGB parallelepiped in 3D XYZ space
- `sketches/three/gamut_geometry.js` — Three.js interactive version with OrbitControls
- `shaders/sketches/gamut_slice.frag` — 2D slice through gamut in CIE xy chromaticity
