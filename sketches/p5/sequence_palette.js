/**
 * sequence_palette.js — p5.js sketch
 * Generates and displays palettes from mathematical sequences
 * Interactive controls for method, count, base hue, saturation, lightness
 * Requires p5.js
 */

import {
  goldenAnglePalette,
  fibonacciRatioPalette,
  primePalette,
  collatzPalette,
  previewPalette,
} from '../../utils/sequence_to_palette.js';

import { hslToRgb } from '../../utils/color_math.js';

const METHODS = ['golden', 'fibonacci', 'prime', 'collatz'];

let method = 'golden';
let n = 8;
let baseHue = 0;
let saturation = 0.85;
let lightness = 0.55;
let colors = [];

new p5(function(p) {
  p.setup = function() {
    const canvas = p.createCanvas(700, 400);
    canvas.parent('sketch-container');
    generatePalette();
    setupControls(p);
  };

  p.draw = function() {
    p.background(12);
    drawSwatches(p);
    drawInfo(p);
  };

  p.keyPressed = function() {
    if (p.key === 'ArrowRight') {
      baseHue = (baseHue + 5) % 360;
      generatePalette();
    }
    if (p.key === 'ArrowLeft') {
      baseHue = (baseHue - 5 + 360) % 360;
      generatePalette();
    }
    if (p.key === 'm' || p.key === 'M') {
      const idx = METHODS.indexOf(method);
      method = METHODS[(idx + 1) % METHODS.length];
      generatePalette();
    }
    if (p.key === '+') { n = Math.min(n + 1, 24); generatePalette(); }
    if (p.key === '-') { n = Math.max(n - 1, 2); generatePalette(); }
  };
});

function generatePalette() {
  switch (method) {
    case 'golden':    colors = goldenAnglePalette(n, baseHue, saturation, lightness); break;
    case 'fibonacci': colors = fibonacciRatioPalette(n, baseHue, saturation, lightness); break;
    case 'prime':     colors = primePalette(n, baseHue, 30, saturation, lightness); break;
    case 'collatz':   colors = collatzPalette(Math.round(baseHue) || 27, n, saturation, lightness); break;
  }
}

function drawSwatches(p) {
  const swatchW = p.width / colors.length;
  const swatchH = p.height * 0.65;

  colors.forEach((hex, i) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    p.fill(r, g, b);
    p.noStroke();
    p.rect(i * swatchW, 0, swatchW - 2, swatchH);

    // Hex label
    p.fill(200);
    p.textSize(9);
    p.textAlign(p.CENTER);
    p.text(hex, i * swatchW + swatchW / 2, swatchH + 14);
  });
}

function drawInfo(p) {
  p.fill(140);
  p.noStroke();
  p.textSize(11);
  p.textAlign(p.LEFT);
  const y = p.height * 0.65 + 35;
  p.text(`Method: ${method}  |  Colors: ${n}  |  Base hue: ${Math.round(baseHue)}°`, 10, y);
  p.text('M: cycle method  |  ←→: rotate hue  |  +/-: add/remove colors', 10, y + 16);
}

function setupControls(p) {
  // Controls can be added as HTML elements outside canvas
}
