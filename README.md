# color_systems

> Color is not decoration. Color is **math with wavelengths**.

A structured knowledge base and generative art toolkit for color as a first-class mathematical object. Covers perceptual color spaces, harmony algebra, gamut geometry, and palette generation from mathematical sequences.

Part of the [merrypranxter](https://github.com/merrypranxter) generative art ecosystem.

**Cross-repo connections:**
- [`merrys_visual_bible`](https://github.com/merrypranxter/merrys_visual_bible) — color as visual language
- [`THE-LISTS`](https://github.com/merrypranxter/THE-LISTS) — mathematical sequences → palettes
- [`moire`](https://github.com/merrypranxter/moire) — interference patterns need perceptual color
- [`reaction_diffusion`](https://github.com/merrypranxter/reaction_diffusion) — Gray-Scott colormap library

---

## What's in here

### 📐 Color Spaces (`data/spaces/`)
Machine-readable specs for every major color space:
- **sRGB** — the boring default, but its math matters
- **HSL / HSV** — cylindrical representations, harmony algebra lives here
- **OKLab** — perceptually uniform, use this for interpolation
- **CIELAB** — the OG perceptual space, basis for Delta-E math

### 🎨 Harmony Systems (`data/harmony/`)
Classical harmonies formalized as circular algebra (complementary = +180°, triadic = +120°/+240°, etc.) plus Itten's 7 contrasts as computable properties.

### 🔺 Gamut Geometry (`data/gamuts/`)
Color gamuts as 3D geometric objects in CIE XYZ space. sRGB gamut is a parallelpiped. Display P3 is bigger. Your monitor lies to you constantly.

### 🌀 Math Palettes (`data/palettes/`)
Palettes generated from mathematical sequences:
- Fibonacci ratios → hue spacing
- Prime number gaps → saturation mapping
- Golden angle (137.5°) → phyllotaxis-inspired palette wheels
- Collatz sequence → chaos palette

### 🔮 GLSL Library (`shaders/lib/`)
Drop-in shader utilities:
- OKLab ↔ sRGB conversion (perceptual interpolation in GLSL)
- HSL encode/decode
- Harmony angle functions
- Full colorspace transform chain

### 🎛️ Sketches (`sketches/`)
- **p5.js:** Harmony wheel, gamut 3D visualizer, sequence palette generator
- **Three.js:** Interactive gamut geometry in 3D

---

## Quick Start

```bash
git clone https://github.com/merrypranxter/color_systems
cd color_systems
npm install
# open examples/basic_harmony.html in browser
# or open examples/fibonacci_palette.html
```

No build step. Pure JS + GLSL. Everything runs in-browser.

---

## Key Concepts

### Why OKLab?
HSL interpolation looks bad because it goes through ugly intermediate hues. OKLab is perceptually uniform — equal distances in OKLab space look equally different to human eyes. Use it for gradients, lerping, color scheme generation.

### Harmony as Circular Algebra
A color wheel is a circle. Harmony systems are angle relationships on that circle:
- Complementary: θ + 180°
- Split complementary: θ + 150°, θ + 210°
- Triadic: θ + 120°, θ + 240°
- Tetradic: θ + 90°, θ + 180°, θ + 270°
- Analogous: θ ± 30°
All harmony math happens in HSL hue space (0–360°), then convert to output space.

### Gamut Geometry
In CIE XYZ space, every color gamut is a convex polyhedron. sRGB is a parallelepiped defined by 8 corner colors (black, white, red, green, blue, cyan, magenta, yellow). Points inside the polyhedron are displayable. Points outside are impossible on that display.

---

## License

MIT — use it, abuse it, put it in your shaders.
