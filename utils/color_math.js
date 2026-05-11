/**
 * color_math.js
 * Core color math utilities — conversions, harmony, distance, palette operations
 * ES module. No dependencies.
 */

export const TAU = Math.PI * 2;
export const GOLDEN_ANGLE = 137.50776405;
export const GOLDEN_RATIO = 1.6180339887;

// ─── sRGB ↔ Linear ────────────────────────────────────────────────────────────

export function srgbToLinear(x) {
  return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}

export function linearToSrgb(x) {
  return x <= 0.0031308 ? x * 12.92 : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
}

// ─── OKLab ────────────────────────────────────────────────────────────────────

/**
 * Convert linear sRGB [0,1] to OKLab
 */
export function linearSrgbToOklab([r, g, b]) {
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
  const l_ = Math.cbrt(l), m_ = Math.cbrt(m), s_ = Math.cbrt(s);
  return [
    0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
    1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
    0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_,
  ];
}

/**
 * Convert OKLab to linear sRGB [0,1]
 */
export function oklabToLinearSrgb([L, a, b]) {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  return [
     4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  ];
}

/**
 * Convert sRGB hex string to OKLab
 */
export function hexToOklab(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return linearSrgbToOklab([srgbToLinear(r), srgbToLinear(g), srgbToLinear(b)]);
}

/**
 * Convert OKLab to sRGB hex string
 */
export function oklabToHex(lab) {
  const [r, g, b] = oklabToLinearSrgb(lab).map(x =>
    Math.round(Math.max(0, Math.min(1, linearToSrgb(x))) * 255)
  );
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

/**
 * OKLab → OKLCh (cylindrical)
 */
export function oklabToOklch([L, a, b]) {
  const C = Math.sqrt(a * a + b * b);
  const h = Math.atan2(b, a) * 180 / Math.PI;
  return [L, C, ((h % 360) + 360) % 360];
}

/**
 * OKLCh → OKLab
 */
export function oklchToOklab([L, C, h]) {
  const hRad = h * Math.PI / 180;
  return [L, C * Math.cos(hRad), C * Math.sin(hRad)];
}

/**
 * Perceptual interpolation between two hex colors via OKLab
 */
export function oklabMix(hexA, hexB, t) {
  const labA = hexToOklab(hexA);
  const labB = hexToOklab(hexB);
  const mixed = labA.map((v, i) => v + (labB[i] - v) * t);
  return oklabToHex(mixed);
}

// ─── HSL ──────────────────────────────────────────────────────────────────────

export function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360;
  if (s === 0) return [l, l, l];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hk = h / 360;
  return [hk + 1/3, hk, hk - 1/3].map(t => {
    t = ((t % 1) + 1) % 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  });
}

export function hslToHex(h, s, l) {
  const [r, g, b] = hslToRgb(h, s, l);
  return '#' + [r, g, b].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
}

// ─── Harmony ──────────────────────────────────────────────────────────────────

/**
 * Generate harmony hue angles from a base hue
 * @param {number} baseHue - degrees [0, 360)
 * @param {string} type - harmony type id
 * @returns {number[]} array of hue angles in degrees
 */
export function harmonyAngles(baseHue, type) {
  const mod = h => ((h % 360) + 360) % 360;
  const h = baseHue;
  const harmonies = {
    monochromatic:     [h],
    complementary:     [h, mod(h + 180)],
    split_complementary: [h, mod(h + 150), mod(h + 210)],
    triadic:           [h, mod(h + 120), mod(h + 240)],
    square_tetradic:   [h, mod(h + 90), mod(h + 180), mod(h + 270)],
    rectangular:       [h, mod(h + 60), mod(h + 180), mod(h + 240)],
    analogous:         [mod(h - 30), h, mod(h + 30)],
    analogous_wide:    [mod(h - 60), mod(h - 30), h, mod(h + 30), mod(h + 60)],
  };
  return harmonies[type] ?? [h];
}

/**
 * Generate golden angle palette
 * @param {number} n - number of colors
 * @param {number} baseHue - starting hue
 * @param {number} saturation
 * @param {number} lightness
 * @returns {string[]} array of hex colors
 */
export function goldenAnglePalette(n, baseHue = 0, saturation = 0.8, lightness = 0.55) {
  return Array.from({ length: n }, (_, i) => {
    const h = ((baseHue + i * GOLDEN_ANGLE) % 360 + 360) % 360;
    return hslToHex(h, saturation, lightness);
  });
}

// ─── Delta E (CIELAB color difference) ───────────────────────────────────────

/**
 * Simple Delta E 76 approximation (Euclidean in OKLab, scaled)
 * Not official CIEDE2000, but perceptually much better than RGB distance
 */
export function deltaE(hexA, hexB) {
  const labA = hexToOklab(hexA);
  const labB = hexToOklab(hexB);
  return Math.sqrt(labA.reduce((sum, v, i) => sum + (v - labB[i]) ** 2, 0));
}
