/**
 * gamut_3d.js — p5.js sketch
 * 3D visualization of the sRGB gamut as a parallelepiped in CIE XYZ space
 * Rendered as wireframe with color-coded vertices
 * Requires p5.js with WEBGL mode
 */

// sRGB gamut vertices in CIE XYZ
const VERTICES = {
  black:   [0.0000, 0.0000, 0.0000],
  white:   [0.9505, 1.0000, 1.0890],
  red:     [0.4124, 0.2126, 0.0193],
  green:   [0.3576, 0.7152, 0.1192],
  blue:    [0.1805, 0.0722, 0.9505],
  cyan:    [0.5381, 0.7874, 1.0697],
  magenta: [0.5929, 0.2848, 0.9698],
  yellow:  [0.7700, 0.9278, 0.1385],
};

// Edges of the parallelepiped
const EDGES = [
  ['black', 'red'], ['black', 'green'], ['black', 'blue'],
  ['red', 'yellow'], ['red', 'magenta'],
  ['green', 'yellow'], ['green', 'cyan'],
  ['blue', 'cyan'], ['blue', 'magenta'],
  ['yellow', 'white'], ['cyan', 'white'], ['magenta', 'white'],
];

// sRGB colors for each vertex
const COLORS = {
  black:   [10, 10, 10],
  white:   [255, 255, 255],
  red:     [255, 0, 0],
  green:   [0, 255, 0],
  blue:    [0, 0, 255],
  cyan:    [0, 255, 255],
  magenta: [255, 0, 255],
  yellow:  [255, 255, 0],
};

new p5(function(p) {
  let angle = 0;
  const scale = 420;
  const center = [0.5, 0.5, 0.55]; // approximate center of gamut

  p.setup = function() {
    const canvas = p.createCanvas(600, 600, p.WEBGL);
    canvas.parent('sketch-container');
  };

  p.draw = function() {
    p.background(15);
    p.orbitControl();

    angle += 0.005;
    p.rotateY(angle);
    p.rotateX(0.3);

    // Draw axes
    drawAxes(p, scale * 1.3);

    // Draw edges
    EDGES.forEach(([a, b]) => {
      const va = xyzToScreen(VERTICES[a], center, scale);
      const vb = xyzToScreen(VERTICES[b], center, scale);
      const ca = COLORS[a];
      p.stroke(ca[0], ca[1], ca[2], 180);
      p.strokeWeight(2);
      p.line(...va, ...vb);
    });

    // Draw vertices
    Object.entries(VERTICES).forEach(([name, xyz]) => {
      const pos = xyzToScreen(xyz, center, scale);
      const col = COLORS[name];
      p.fill(col[0], col[1], col[2]);
      p.noStroke();
      p.push();
      p.translate(...pos);
      p.sphere(name === 'black' || name === 'white' ? 12 : 8);
      p.pop();
    });
  };
});

function xyzToScreen(xyz, center, scale) {
  return [
    (xyz[0] - center[0]) * scale,
    -(xyz[1] - center[1]) * scale, // Y flipped for screen
    (xyz[2] - center[2]) * scale,
  ];
}

function drawAxes(p, len) {
  p.strokeWeight(1);
  // X axis — red
  p.stroke(255, 60, 60, 120);
  p.line(-len/2, 0, 0, len/2, 0, 0);
  // Y axis — green
  p.stroke(60, 255, 60, 120);
  p.line(0, -len/2, 0, 0, len/2, 0);
  // Z axis — blue
  p.stroke(60, 60, 255, 120);
  p.line(0, 0, -len/2, 0, 0, len/2);
}
