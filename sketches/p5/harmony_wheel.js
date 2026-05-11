/**
 * harmony_wheel.js — p5.js sketch
 * Interactive color harmony wheel
 * Shows all harmony types with animated base hue rotation
 * Requires p5.js loaded in HTML
 */

import { harmonyAngles, hslToHex, hslToRgb, GOLDEN_ANGLE } from '../../utils/color_math.js';

const HARMONY_TYPES = [
  'complementary',
  'triadic',
  'split_complementary',
  'square_tetradic',
  'analogous',
  'analogous_wide',
];

let baseHue = 0;
let selectedHarmony = 'triadic';
let animating = true;

new p5(function(p) {
  p.setup = function() {
    const canvas = p.createCanvas(600, 600);
    canvas.parent('sketch-container');
    p.colorMode(p.HSL, 360, 100, 100, 1);
    p.textFont('monospace');
  };

  p.draw = function() {
    p.background(10);
    p.translate(p.width / 2, p.height / 2);

    if (animating) baseHue = (baseHue + 0.3) % 360;

    drawColorWheel(p, 220);
    drawHarmonyMarkers(p, 220);
    drawHarmonyLabels(p);
    drawCenterInfo(p);
  };

  p.mousePressed = function() {
    // Click to cycle harmony type
    const idx = HARMONY_TYPES.indexOf(selectedHarmony);
    selectedHarmony = HARMONY_TYPES[(idx + 1) % HARMONY_TYPES.length];
  };

  p.keyPressed = function() {
    if (p.key === ' ') animating = !animating;
    if (p.key === 'ArrowRight') baseHue = (baseHue + 5) % 360;
    if (p.key === 'ArrowLeft') baseHue = (baseHue - 5 + 360) % 360;
  };
});

function drawColorWheel(p, radius) {
  const steps = 360;
  for (let i = 0; i < steps; i++) {
    const angle = p.map(i, 0, steps, 0, p.TWO_PI) - p.HALF_PI;
    const nextAngle = p.map(i + 1, 0, steps, 0, p.TWO_PI) - p.HALF_PI;
    p.stroke(i, 100, 50, 1);
    p.strokeWeight(2);
    p.line(
      Math.cos(angle) * (radius - 40), Math.sin(angle) * (radius - 40),
      Math.cos(angle) * radius, Math.sin(angle) * radius
    );
  }
}

function drawHarmonyMarkers(p, radius) {
  const angles = harmonyAngles(baseHue, selectedHarmony);
  angles.forEach((hue, i) => {
    const angle = p.map(hue, 0, 360, 0, p.TWO_PI) - p.HALF_PI;
    const x = Math.cos(angle) * (radius - 20);
    const y = Math.sin(angle) * (radius - 20);

    // Line from center
    p.stroke(hue, 90, 70, 0.6);
    p.strokeWeight(1);
    p.line(0, 0, x, y);

    // Dot
    p.fill(hue, 90, 60, 1);
    p.noStroke();
    p.circle(x, y, i === 0 ? 28 : 20);

    // Color hex label
    const hex = hslToHex(hue, 0.85, 0.55);
    p.fill(255);
    p.noStroke();
    p.textSize(9);
    p.textAlign(p.CENTER, p.CENTER);
    p.text(hex, x, y);
  });

  // Draw center color
  p.fill(baseHue, 90, 55, 1);
  p.noStroke();
  p.circle(0, 0, 50);
}

function drawHarmonyLabels(p) {
  p.noStroke();
  p.fill(180);
  p.textSize(11);
  p.textAlign(p.LEFT);
  p.text(`Harmony: ${selectedHarmony}`, -p.width/2 + 12, p.height/2 - 40);
  p.text(`Base hue: ${Math.round(baseHue)}°`, -p.width/2 + 12, p.height/2 - 24);
  p.text('Click: next harmony  |  Space: pause  |  ←→: rotate', -p.width/2 + 12, p.height/2 - 8);
}

function drawCenterInfo(p) {
  p.noStroke();
  p.fill(100);
  p.textSize(10);
  p.textAlign(p.CENTER);
  p.text('color_systems / harmony_wheel.js', 0, -p.height/2 + 16);
}
