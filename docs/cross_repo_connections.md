# Cross-Repo Connections

## Overview

`color_systems` is one module in the [merrypranxter](https://github.com/merrypranxter) generative art ecosystem. Color is a cross-cutting concern — it appears in every visual project. This doc tracks explicit connections.

---

## merrys_visual_bible

**Direction**: color_systems → merrys_visual_bible  
**What**: Color as visual language — the conceptual framework for how color choices communicate meaning.

- `color_systems` provides the mathematical machinery
- `merrys_visual_bible` provides the intentional/symbolic layer
- Itten's 7 contrasts (`data/harmony/itten_contrasts.json`) are the bridge between math and meaning

**Practical connection**: When merrys_visual_bible defines a "tension palette" or "calm palette", the actual color values come from `color_systems` harmony generators.

---

## THE-LISTS

**Direction**: THE-LISTS → color_systems  
**What**: Mathematical sequences that get mapped to color palettes.

`THE-LISTS` is the mathematical Rosetta Stone — it maintains canonical lists of:
- Fibonacci sequence and ratios
- Prime sequences and gap distributions  
- Collatz trajectories for key starting numbers
- Other mathematical sequences

`color_systems` consumes these as input to `utils/sequence_to_palette.js`. The palette data files in `data/palettes/` are the rendered output.

**Update flow**: When THE-LISTS adds a new sequence (e.g. Lucas numbers, Stern-Brocot), color_systems can immediately generate palette variants from it.

---

## moire

**Direction**: color_systems → moire  
**What**: Interference patterns need perceptual color.

Moiré patterns rely on complementary contrast and simultaneous contrast to create vibration. The mathematical models in `data/harmony/itten_contrasts.json` (especially `complementary_contrast` and `simultaneous_contrast`) directly inform moiré color choices.

**Specific connections**:
- `shaders/lib/oklab.glsl` is used directly in moire fragment shaders for perceptual gradient blending
- The `vibration_threshold` property in `complementary_contrast` (`S > 0.8, L ≈ 0.5`) is the target state for maximum moiré effect

---

## reaction_diffusion

**Direction**: color_systems → reaction_diffusion  
**What**: Gray-Scott colormap library.

Reaction-diffusion systems (Gray-Scott model) produce scalar fields (U concentration, V concentration). Color mapping determines everything about how these look.

**Specific connections**:
- `oklabMix()` from `utils/color_math.js` is used for perceptual gradient generation
- The diverging colormap pattern (neutral center → saturated extremes) maps directly to OKLab L channel manipulation
- `shaders/lib/oklab.glsl` is included in Gray-Scott fragment shaders

**Colormaps to implement** (planned):
- `reaction_diffusion/colormaps/gray_scott_fire.json` → warm OKLab gradient
- `reaction_diffusion/colormaps/gray_scott_ocean.json` → cool OKLab gradient
- Both will live in color_systems and be referenced from reaction_diffusion

---

## strange_attractors (future)

**Direction**: color_systems → strange_attractors (planned)  
**What**: Attractor visualization needs perceptual depth cues.

Lorenz, Rössler, and other strange attractors are 3D objects projected to 2D. Color can encode:
- Z-depth (lightness in OKLab)
- Iteration count (hue via golden angle sequence)
- Lyapunov exponent (saturation / chroma)

This connection is documented in advance so color_systems data structures support it when strange_attractors is built.

---

## Integration Pattern

Each consuming repo should:

1. **Copy GLSL files** from `shaders/lib/` as needed (they're designed to be inline-ready)
2. **Import JS utilities** from `utils/` as ES modules
3. **Reference JSON data** from `data/` for palette/harmony/gamut parameters
4. **Cross-link** back to color_systems in their own documentation

The color_systems repo is read-only from consumers' perspective — pull from it, don't modify it to fit a specific project. If a new color space or harmony type is needed, add it here and it becomes available to all consumers.
