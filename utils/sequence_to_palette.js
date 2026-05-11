/**
 * sequence_to_palette.js
 * Generate color palettes from mathematical sequences
 * ES module.
 */

import { hslToHex, goldenAnglePalette, GOLDEN_ANGLE } from './color_math.js';

// ─── Fibonacci ────────────────────────────────────────────────────────────────

export function fibonacciSequence(n) {
  const seq = [1, 1];
  for (let i = 2; i < n; i++) seq.push(seq[i-1] + seq[i-2]);
  return seq;
}

export function fibonacciRatios(n) {
  const seq = fibonacciSequence(n + 1);
  return seq.slice(0, n).map((v, i) => v / seq[i + 1]);
}

/**
 * Palette from Fibonacci ratios as hue spacing
 * Each hue = previous + (Fib(n)/Fib(n+1)) * 360°
 */
export function fibonacciRatioPalette(n, baseHue = 0, sat = 0.85, lit = 0.55) {
  const ratios = fibonacciRatios(n);
  const hues = [baseHue];
  ratios.slice(0, n - 1).forEach(r => {
    hues.push((hues[hues.length - 1] + r * 360) % 360);
  });
  return hues.map(h => hslToHex(h, sat, lit));
}

// ─── Primes ───────────────────────────────────────────────────────────────────

export function sievePrimes(limit) {
  const sieve = new Array(limit + 1).fill(true);
  sieve[0] = sieve[1] = false;
  for (let i = 2; i <= Math.sqrt(limit); i++) {
    if (sieve[i]) for (let j = i*i; j <= limit; j += i) sieve[j] = false;
  }
  return sieve.reduce((acc, v, i) => v ? [...acc, i] : acc, []);
}

export function primeGaps(n) {
  const primes = sievePrimes(n * 15); // rough upper bound
  return primes.slice(0, n).map((p, i) => i === 0 ? 0 : p - primes[i-1]);
}

/**
 * Palette where hue jumps are determined by gaps between primes
 * Maps prime gap to hue step via a scale factor
 */
export function primePalette(n, baseHue = 0, scale = 30, sat = 0.85, lit = 0.55) {
  const gaps = primeGaps(n);
  const hues = [];
  let h = baseHue;
  gaps.forEach(gap => {
    hues.push(h % 360);
    h += gap * scale;
  });
  return hues.map(hue => hslToHex(hue, sat, lit));
}

// ─── Collatz ──────────────────────────────────────────────────────────────────

export function collatzSequence(start) {
  const seq = [start];
  let n = start;
  while (n !== 1) {
    n = n % 2 === 0 ? n / 2 : 3 * n + 1;
    seq.push(n);
  }
  return seq;
}

/**
 * Palette from Collatz sequence — hue angles derived from sequence values mod 360
 */
export function collatzPalette(startNum, n, sat = 0.9, lit = 0.55) {
  const seq = collatzSequence(startNum);
  return seq.slice(0, n).map(v => hslToHex(v % 360, sat, lit));
}

// ─── Golden Angle (re-export with name) ──────────────────────────────────────
export { goldenAnglePalette };

// ─── Palette preview (terminal) ───────────────────────────────────────────────
export function previewPalette(hexColors, label = '') {
  if (typeof process !== 'undefined') {
    console.log(`\n${label}`);
    hexColors.forEach(hex => {
      const r = parseInt(hex.slice(1,3), 16);
      const g = parseInt(hex.slice(3,5), 16);
      const b = parseInt(hex.slice(5,7), 16);
      console.log(`\x1b[48;2;${r};${g};${b}m    \x1b[0m ${hex}`);
    });
  }
}
