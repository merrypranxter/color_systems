/**
 * conversions.js
 * Comprehensive colorspace conversion utilities
 * Covers: sRGB ↔ Linear ↔ XYZ ↔ CIELAB ↔ OKLab ↔ HSL ↔ HSV
 * ES module. No dependencies.
 */

import { srgbToLinear, linearToSrgb, linearSrgbToOklab, oklabToLinearSrgb } from './color_math.js';

// ─── CIE XYZ (D65) ────────────────────────────────────────────────────────────

const D65 = { X: 0.95047, Y: 1.00000, Z: 1.08883 };

export function linearSrgbToXyz([r, g, b]) {
  return [
    0.4124564 * r + 0.3575761 * g + 0.1804375 * b,
    0.2126729 * r + 0.7151522 * g + 0.0721750 * b,
    0.0193339 * r + 0.1191920 * g + 0.9503041 * b,
  ];
}

export function xyzToLinearSrgb([X, Y, Z]) {
  return [
     3.2404542 * X - 1.5371385 * Y - 0.4985314 * Z,
    -0.9692660 * X + 1.8760108 * Y + 0.0415560 * Z,
     0.0556434 * X - 0.2040259 * Y + 1.0572252 * Z,
  ];
}

export function hexToXyz(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return linearSrgbToXyz([srgbToLinear(r), srgbToLinear(g), srgbToLinear(b)]);
}

// ─── CIELAB ───────────────────────────────────────────────────────────────────

function labF(t) {
  const delta = 6 / 29;
  return t > delta ** 3 ? Math.cbrt(t) : t / (3 * delta ** 2) + 4 / 29;
}

function labFInv(t) {
  const delta = 6 / 29;
  return t > delta ? t ** 3 : 3 * delta ** 2 * (t - 4 / 29);
}

export function xyzToCielab([X, Y, Z]) {
  const fx = labF(X / D65.X);
  const fy = labF(Y / D65.Y);
  const fz = labF(Z / D65.Z);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

export function cielabToXyz([L, a, b]) {
  const fy = (L + 16) / 116;
  const fx = a / 500 + fy;
  const fz = fy - b / 200;
  return [D65.X * labFInv(fx), D65.Y * labFInv(fy), D65.Z * labFInv(fz)];
}

export function hexToCielab(hex) {
  return xyzToCielab(hexToXyz(hex));
}

export function cielabToHex([L, a, b]) {
  const [X, Y, Z] = cielabToXyz([L, a, b]);
  const [r, g, bv] = xyzToLinearSrgb([X, Y, Z]);
  return '#' + [r, g, bv].map(v =>
    Math.round(Math.max(0, Math.min(1, linearToSrgb(v))) * 255).toString(16).padStart(2, '0')
  ).join('');
}

// CIELCh (cylindrical CIELAB)
export function cielabToCielch([L, a, b]) {
  const C = Math.sqrt(a * a + b * b);
  const h = ((Math.atan2(b, a) * 180 / Math.PI) % 360 + 360) % 360;
  return [L, C, h];
}

export function cielchToCielab([L, C, h]) {
  const hRad = h * Math.PI / 180;
  return [L, C * Math.cos(hRad), C * Math.sin(hRad)];
}

// ─── Delta E ──────────────────────────────────────────────────────────────────

/**
 * CIE76 Delta E — Euclidean distance in CIELAB
 * JND (just noticeable difference) ≈ 1
 */
export function deltaE76(hexA, hexB) {
  const [L1, a1, b1] = hexToCielab(hexA);
  const [L2, a2, b2] = hexToCielab(hexB);
  return Math.sqrt((L1-L2)**2 + (a1-a2)**2 + (b1-b2)**2);
}

/**
 * Relative luminance (WCAG definition) — from linear RGB Y channel
 */
export function relativeLuminance(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

/**
 * WCAG 2.x contrast ratio between two hex colors
 */
export function wcagContrastRatio(hexA, hexB) {
  const l1 = relativeLuminance(hexA);
  const l2 = relativeLuminance(hexB);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// ─── HSV ──────────────────────────────────────────────────────────────────────

export function rgbToHsv(r, g, b) {
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  const v = max;
  const s = max === 0 ? 0 : d / max;
  let h = 0;
  if (d > 0) {
    if (max === r)      h = ((g - b) / d % 6 + 6) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else                h = (r - g) / d + 4;
    h *= 60;
  }
  return [h, s, v];
}

export function hsvToRgb(h, s, v) {
  h = ((h % 360) + 360) % 360;
  const c = v * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  if      (h < 60)  { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else              { r = c; b = x; }
  return [r + m, g + m, b + m];
}

export function hsvToHex(h, s, v) {
  const [r, g, b] = hsvToRgb(h, s, v);
  return '#' + [r, g, b].map(ch => Math.round(ch * 255).toString(16).padStart(2, '0')).join('');
}

// ─── Hex utilities ────────────────────────────────────────────────────────────

export function hexToRgb(hex) {
  return [
    parseInt(hex.slice(1, 3), 16) / 255,
    parseInt(hex.slice(3, 5), 16) / 255,
    parseInt(hex.slice(5, 7), 16) / 255,
  ];
}

export function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
}

// ─── sRGB → OKLab (convenience re-exports) ───────────────────────────────────

export { linearSrgbToOklab, oklabToLinearSrgb, srgbToLinear, linearToSrgb };
