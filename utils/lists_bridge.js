/**
 * lists_bridge.js
 * Bridge module: THE-LISTS mathematical sequences → color_systems palette generators
 *
 * Imports sequence data from THE-LISTS (data/sequences/*.json) and exports
 * one palette generator per sequence type.
 *
 * Each generator: (n, baseHue, sat, lit) → string[] of hex colors
 *
 * Assumes THE-LISTS exports sequence arrays from data/sequences/.
 * Falls back to inline computation when import fails (standalone mode).
 */

import { hslToHex, GOLDEN_ANGLE } from './color_math.js';

// ─── Sequence loaders ─────────────────────────────────────────────────────────
// These import from THE-LISTS if available; otherwise compute inline.

async function loadSequence(name) {
  try {
    const mod = await import(`../../THE-LISTS/data/sequences/${name}.json`, {
      assert: { type: 'json' }
    });
    return mod.default;
  } catch {
    return null; // fall through to inline computation
  }
}

// ─── Inline sequence generators (standalone fallback) ─────────────────────────

function fibonacciInline(n) {
  const seq = [1, 1];
  for (let i = 2; i < n; i++) seq.push(seq[i-1] + seq[i-2]);
  return seq.slice(0, n);
}

function lucasInline(n) {
  const seq = [2, 1];
  for (let i = 2; i < n; i++) seq.push(seq[i-1] + seq[i-2]);
  return seq.slice(0, n);
}

function padovanInline(n) {
  const seq = [1, 1, 1];
  for (let i = 3; i < n; i++) seq.push(seq[i-2] + seq[i-3]);
  return seq.slice(0, n);
}

function primesInline(limit) {
  const sieve = new Array(limit + 1).fill(true);
  sieve[0] = sieve[1] = false;
  for (let i = 2; i <= Math.sqrt(limit); i++) {
    if (sieve[i]) for (let j = i*i; j <= limit; j += i) sieve[j] = false;
  }
  return sieve.reduce((acc, v, i) => v ? [...acc, i] : acc, []);
}

function primeGapsInline(n) {
  const primes = primesInline(n * 20);
  return primes.slice(0, n).map((p, i) => i === 0 ? 0 : p - primes[i-1]);
}

function collatzInline(start) {
  const seq = [start];
  let n = start;
  while (n !== 1) {
    n = n % 2 === 0 ? n / 2 : 3 * n + 1;
    seq.push(n);
  }
  return seq;
}

function tribonacciInline(n) {
  const seq = [0, 1, 1];
  for (let i = 3; i < n; i++) seq.push(seq[i-1] + seq[i-2] + seq[i-3]);
  return seq.slice(0, n);
}

function perrinInline(n) {
  const seq = [3, 0, 2];
  for (let i = 3; i < n; i++) seq.push(seq[i-2] + seq[i-3]);
  return seq.slice(0, n);
}

// ─── Palette generators ───────────────────────────────────────────────────────

/**
 * Generate a palette from a raw sequence using cumulative hue steps.
 * Each element of seq adds (value * hueScale) to the running hue.
 */
function seqToPalette(seq, n, baseHue, sat, lit, hueScale = 1.0) {
  const colors = [];
  let h = baseHue;
  for (let i = 0; i < Math.min(n, seq.length); i++) {
    colors.push(hslToHex(((h % 360) + 360) % 360, sat, lit));
    h += seq[i] * hueScale;
  }
  return colors;
}

/**
 * Fibonacci palette — hue spacing from Fibonacci ratios (Fib(n)/Fib(n+1) × 360°)
 * Converges toward golden angle; early colors resemble classical harmonies.
 * @param {number} n - number of colors
 * @param {number} baseHue - starting hue in degrees
 * @param {number} sat - saturation [0,1]
 * @param {number} lit - lightness [0,1]
 * @returns {string[]} hex color array
 */
export async function fibonacciPalette(n, baseHue = 0, sat = 0.82, lit = 0.55) {
  const seq = (await loadSequence('fibonacci')) ?? fibonacciInline(n + 1);
  const ratios = seq.slice(0, n).map((v, i) => v / seq[i + 1]);
  const hues = [baseHue];
  ratios.slice(0, n - 1).forEach(r => hues.push((hues[hues.length - 1] + r * 360) % 360));
  return hues.map(h => hslToHex(h, sat, lit));
}

/**
 * Lucas palette — hue steps from Lucas sequence values scaled to degrees
 * Lucas: 2,1,3,4,7,11,18,29,47,76... — additive like Fibonacci but starts 2,1
 * Produces similar spread to Fibonacci but with different initial clustering.
 * @param {number} n - number of colors
 * @param {number} baseHue - starting hue in degrees
 * @param {number} sat - saturation [0,1]
 * @param {number} lit - lightness [0,1]
 * @returns {string[]} hex color array
 */
export async function lucasPalette(n, baseHue = 0, sat = 0.82, lit = 0.56) {
  const seq = (await loadSequence('lucas')) ?? lucasInline(n);
  // Scale: divide by max to normalize to [0,1] then multiply by 360
  const maxVal = Math.max(...seq.slice(0, n));
  return seqToPalette(seq, n, baseHue, sat, lit, 360 / (maxVal * 1.5));
}

/**
 * Padovan palette — hue steps from Padovan sequence (P(n) = P(n-2) + P(n-3))
 * Slower growth than Fibonacci — produces tighter initial clusters that expand gradually.
 * @param {number} n - number of colors
 * @param {number} baseHue - starting hue in degrees
 * @param {number} sat - saturation [0,1]
 * @param {number} lit - lightness [0,1]
 * @returns {string[]} hex color array
 */
export async function padovanPalette(n, baseHue = 200, sat = 0.78, lit = 0.52) {
  const seq = (await loadSequence('padovan')) ?? padovanInline(n);
  return seqToPalette(seq, n, baseHue, sat, lit, 22);
}

/**
 * Prime gaps palette — hue jumps from gaps between consecutive primes
 * Twin prime clusters produce analogous-like runs; prime deserts produce large leaps.
 * @param {number} n - number of colors
 * @param {number} baseHue - starting hue in degrees
 * @param {number} sat - saturation [0,1]
 * @param {number} lit - lightness [0,1]
 * @returns {string[]} hex color array
 */
export async function primePalette(n, baseHue = 0, sat = 0.85, lit = 0.55) {
  const gaps = (await loadSequence('prime_gaps')) ?? primeGapsInline(n);
  return seqToPalette(gaps, n, baseHue, sat, lit, 30);
}

/**
 * Collatz palette — hue from Collatz sequence values mod 360, scaled
 * Chaotic but deterministic — high-energy values create dramatic jumps.
 * @param {number} startNum - Collatz starting number (try 27 for long sequence)
 * @param {number} n - number of colors to use
 * @param {number} sat - saturation [0,1]
 * @param {number} lit - lightness [0,1]
 * @returns {string[]} hex color array
 */
export async function collatzPalette(startNum = 27, n = 10, sat = 0.9, lit = 0.55) {
  const seq = (await loadSequence(`collatz_${startNum}`)) ?? collatzInline(startNum);
  return seq.slice(0, n).map(v => hslToHex((v * 2.5) % 360, sat, lit));
}

/**
 * Tribonacci palette — each term = sum of previous 3 (0,1,1,2,4,7,13,24...)
 * Faster growth than Fibonacci — wider spacing that expands more rapidly.
 * @param {number} n - number of colors
 * @param {number} baseHue - starting hue in degrees
 * @param {number} sat - saturation [0,1]
 * @param {number} lit - lightness [0,1]
 * @returns {string[]} hex color array
 */
export async function tribonacciPalette(n, baseHue = 0, sat = 0.8, lit = 0.55) {
  const seq = (await loadSequence('tribonacci')) ?? tribonacciInline(n);
  const maxVal = Math.max(...seq.slice(0, n)) || 1;
  return seqToPalette(seq, n, baseHue, sat, lit, 360 / (maxVal * 1.2));
}

/**
 * Perrin palette — P(n) = P(n-2) + P(n-3), starts 3,0,2
 * Contains prime connection: P(prime n) ≡ 0 (mod n) for all primes.
 * Irregular enough to be interesting; grows more slowly than Fibonacci.
 * @param {number} n - number of colors
 * @param {number} baseHue - starting hue in degrees
 * @param {number} sat - saturation [0,1]
 * @param {number} lit - lightness [0,1]
 * @returns {string[]} hex color array
 */
export async function perrinPalette(n, baseHue = 120, sat = 0.75, lit = 0.5) {
  const seq = (await loadSequence('perrin')) ?? perrinInline(n);
  return seqToPalette(seq, n, baseHue, sat, lit, 28);
}

/**
 * Prime direct palette — prime numbers used as hue angles (p × scale mod 360)
 * Primes bunch near certain residue classes, producing subtle clustering patterns.
 * @param {number} n - number of colors
 * @param {number} scale - degrees per unit (try 18 for 0-360 coverage)
 * @param {number} sat - saturation [0,1]
 * @param {number} lit - lightness [0,1]
 * @returns {string[]} hex color array
 */
export async function primeDirectPalette(n, scale = 18, sat = 0.88, lit = 0.52) {
  const primes = (await loadSequence('primes')) ?? primesInline(n * 20);
  return primes.slice(0, n).map(p => hslToHex((p * scale) % 360, sat, lit));
}
