/**
 * gamut_geometry.js — Three.js sketch
 * Interactive 3D visualization of the sRGB gamut parallelepiped in CIE XYZ space
 * Shows gamut volume, primary vertices, edges, and out-of-gamut region
 * Requires Three.js (r150+) and OrbitControls
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// sRGB vertices in CIE XYZ
const XYZ_VERTICES = {
  black:   new THREE.Vector3(0.0000, 0.0000, 0.0000),
  white:   new THREE.Vector3(0.9505, 1.0000, 1.0890),
  red:     new THREE.Vector3(0.4124, 0.2126, 0.0193),
  green:   new THREE.Vector3(0.3576, 0.7152, 0.1192),
  blue:    new THREE.Vector3(0.1805, 0.0722, 0.9505),
  cyan:    new THREE.Vector3(0.5381, 0.7874, 1.0697),
  magenta: new THREE.Vector3(0.5929, 0.2848, 0.9698),
  yellow:  new THREE.Vector3(0.7700, 0.9278, 0.1385),
};

const SRGB_COLORS = {
  black:   0x0a0a0a,
  white:   0xffffff,
  red:     0xff0000,
  green:   0x00ff00,
  blue:    0x0000ff,
  cyan:    0x00ffff,
  magenta: 0xff00ff,
  yellow:  0xffff00,
};

const EDGES = [
  ['black', 'red'], ['black', 'green'], ['black', 'blue'],
  ['red', 'yellow'], ['red', 'magenta'],
  ['green', 'yellow'], ['green', 'cyan'],
  ['blue', 'cyan'], ['blue', 'magenta'],
  ['yellow', 'white'], ['cyan', 'white'], ['magenta', 'white'],
];

// ─── Setup ────────────────────────────────────────────────────────────────────

const container = document.getElementById('sketch-container') || document.body;
const W = container.clientWidth || 700;
const H = container.clientHeight || 500;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(W, H);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0d0d0d);

const camera = new THREE.PerspectiveCamera(50, W / H, 0.01, 100);
camera.position.set(1.5, 1.2, 2.0);
camera.lookAt(0.5, 0.5, 0.55);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0.5, 0.5, 0.55);
controls.enableDamping = true;

// ─── Geometry ─────────────────────────────────────────────────────────────────

// Edges as line segments
EDGES.forEach(([a, b]) => {
  const geometry = new THREE.BufferGeometry().setFromPoints([
    XYZ_VERTICES[a], XYZ_VERTICES[b]
  ]);
  const material = new THREE.LineBasicMaterial({
    color: SRGB_COLORS[a],
    opacity: 0.8,
    transparent: true,
  });
  scene.add(new THREE.Line(geometry, material));
});

// Vertex spheres
Object.entries(XYZ_VERTICES).forEach(([name, pos]) => {
  const geo = new THREE.SphereGeometry(name === 'black' || name === 'white' ? 0.025 : 0.018, 16, 16);
  const mat = new THREE.MeshBasicMaterial({ color: SRGB_COLORS[name] });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(pos);
  scene.add(mesh);

  // Label (using HTML overlay for simplicity)
  // In a full implementation, use CSS2DObject or a texture atlas
});

// Axes helper
const axesHelper = new THREE.AxesHelper(1.4);
scene.add(axesHelper);

// Axis labels group
const axisLabels = [
  { text: 'X (Red)', pos: new THREE.Vector3(1.5, 0, 0), color: '#ff6060' },
  { text: 'Y (Luminance)', pos: new THREE.Vector3(0, 1.5, 0), color: '#60ff60' },
  { text: 'Z (Blue-depth)', pos: new THREE.Vector3(0, 0, 1.5), color: '#6060ff' },
];

// ─── Animation loop ───────────────────────────────────────────────────────────

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();

// ─── Resize ───────────────────────────────────────────────────────────────────

window.addEventListener('resize', () => {
  const w = container.clientWidth;
  const h = container.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});
