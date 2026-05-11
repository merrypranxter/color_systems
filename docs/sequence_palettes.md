# Mathematical Sequence Palettes

## The Core Idea

Most palette generators pick colors by eye or use fixed rules (triadic, analogous, etc.). This repo generates palettes from **mathematical sequences** — using the structure of the sequence to determine hue spacing, saturation variation, or lightness curves.

The result: palettes that have **underlying mathematical coherence** rather than arbitrary aesthetic choices. They often look weird and unexpected in ways that feel *right*.

---

## Golden Angle Palettes

The golden angle ≈ 137.508° is derived from the golden ratio φ:

```
golden_angle = 360° × (1 - 1/φ) = 360° / φ²
```

It's the angle between successive seeds in a sunflower head, leaf spirals, and pinecone scales. It's irrational (never repeats as a fraction of 360°), which means:
- N colors placed at golden angle intervals are **maximally spread** around the wheel
- No two colors will be at the same hue until you've gone through all of them
- Adding more colors fills gaps rather than clustering

**This is the best general-purpose multi-color palette algorithm.** Use it when you need N visually distinct colors.

---

## Fibonacci Ratio Palettes

Instead of the golden angle, use successive Fibonacci ratios (1/2, 2/3, 3/5, 5/8...) as hue step sizes. The ratios converge toward 1/φ, so:
- Early in the sequence: large, irregular jumps
- Late in the sequence: approaches golden angle behavior

Interesting as an **animation driver** — cycle through as a sequence over time.

---

## Prime Gap Palettes

Prime gaps are the differences between consecutive primes: [1, 2, 2, 4, 2, 4, 2, 4, 6, 2, 6, ...]

Multiply each gap by a scale factor to get hue steps. Result:
- Irregular but deterministic
- Controlled chaos without true randomness
- Longer runs of small gaps (boring sequences) punctuated by jumps

Scale factor tunes the drama level. Low scale = clustered, high scale = wild.

---

## Collatz Palettes

The Collatz sequence from a starting number n:
- If n is even: n → n/2
- If n is odd: n → 3n+1
- Repeat until n = 1

No one knows why all starting numbers eventually reach 1. Using sequence values mod 360 as hues gives strange, non-repeating color sequences that eventually terminate. The 27-sequence has 111 steps before reaching 1.

Starting numbers with long sequences are the most visually complex.

---

## Cross-repo connection

The sequence data in `THE-LISTS` (mathematical Rosetta Stone) is the upstream source for many of these generators. `color_systems` is where that data gets mapped to perceptual color space and becomes usable in shaders and sketches.
