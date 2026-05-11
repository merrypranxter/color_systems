// moire_palette_test.frag
// Fragment shader: two overlapping grid patterns for testing color pairs in moiré contexts
// Renders both grids and their interference, computes visual tension metric
//
// Uniforms:
//   u_color1_hsl  — vec3(hue_deg, saturation, lightness) for grid 1
//   u_color2_hsl  — vec3(hue_deg, saturation, lightness) for grid 2
//   u_frequency1  — float, line frequency for grid 1 (lines per unit)
//   u_frequency2  — float, line frequency for grid 2 (lines per unit)
//   u_angle       — float, rotation angle between grids (radians)
//   u_time        — float, elapsed time in seconds (for animation)
//   u_resolution  — vec2, canvas dimensions in pixels

#ifdef GL_ES
precision highp float;
#endif

uniform vec3  u_color1_hsl;
uniform vec3  u_color2_hsl;
uniform float u_frequency1;
uniform float u_frequency2;
uniform float u_angle;
uniform float u_time;
uniform vec2  u_resolution;

const float PI  = 3.14159265359;
const float TAU = 6.28318530718;

// ─── HSL → RGB ────────────────────────────────────────────────────────────────
float hue2rgb(float p, float q, float t) {
    if (t < 0.0) t += 1.0;
    if (t > 1.0) t -= 1.0;
    if (t < 1.0/6.0) return p + (q - p) * 6.0 * t;
    if (t < 0.5)     return q;
    if (t < 2.0/3.0) return p + (q - p) * (2.0/3.0 - t) * 6.0;
    return p;
}

vec3 hsl_to_rgb(vec3 hsl) {
    float h = hsl.x / 360.0;
    float s = hsl.y;
    float l = hsl.z;
    if (s == 0.0) return vec3(l);
    float q = l < 0.5 ? l * (1.0 + s) : l + s - l * s;
    float p = 2.0 * l - q;
    return vec3(hue2rgb(p, q, h + 1.0/3.0),
                hue2rgb(p, q, h),
                hue2rgb(p, q, h - 1.0/3.0));
}

// ─── Grid pattern ─────────────────────────────────────────────────────────────

// Returns grid mask [0,1] for a line grid at given frequency and rotation angle
// uv: normalized screen coords [0,1]²; freq: lines per unit; angle: rotation in radians
float gridMask(vec2 uv, float freq, float angle, float lineWidth) {
    // Rotate UV by angle
    float cosA = cos(angle);
    float sinA = sin(angle);
    vec2 rot = vec2(uv.x * cosA - uv.y * sinA, uv.x * sinA + uv.y * cosA);
    // Grid: stripes along rotated X axis
    float pattern = sin(rot.x * freq * TAU);
    return smoothstep(lineWidth, lineWidth + 0.02, abs(pattern));
}

// ─── OKLab lightness extraction for tension metric ───────────────────────────
// Approximation only — avoids full OKLab pipeline in fragment shader
// Uses a simplified relative luminance from sRGB
float srgbToLinearScalar(float x) {
    return x <= 0.04045 ? x / 12.92 : pow((x + 0.055) / 1.055, 2.4);
}

float perceivedLightness(vec3 srgb) {
    float r = srgbToLinearScalar(srgb.r);
    float g = srgbToLinearScalar(srgb.g);
    float b = srgbToLinearScalar(srgb.b);
    // Y (relative luminance), then perceptual lightness approximation
    float Y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return pow(Y, 1.0/3.0); // cube root approximates OKLab L
}

// ─── Visual tension metric ────────────────────────────────────────────────────
// Returns [0,1]: complementary distance × chroma product × lightness parity
float visualTension(vec3 hsl1, vec3 hsl2) {
    // Circular hue distance, normalized to [0,1]
    float dh = abs(mod(hsl1.x - hsl2.x, 360.0));
    dh = min(dh, 360.0 - dh);
    float hueTension = dh / 180.0;

    // Chroma product — both must be saturated for vibration
    float chromaFactor = hsl1.y * hsl2.y;

    // Lightness parity — equal L maximizes simultaneous contrast
    float dl = abs(hsl1.z - hsl2.z);
    float lightnessParity = clamp(1.0 - dl * 2.0, 0.0, 1.0);

    return hueTension * chromaFactor * lightnessParity;
}

// ─── UI: tension bar ──────────────────────────────────────────────────────────
// Returns tension bar color overlay at screen position
vec3 tensionBar(vec2 uv, float tension) {
    // Bar occupies bottom 8% of screen, full width
    if (uv.y > 0.08) return vec3(0.0);
    float barFill = step(uv.x, tension);
    // Color: green (low) → red (high)
    vec3 barColor = mix(vec3(0.2, 0.8, 0.2), vec3(0.9, 0.1, 0.1), tension);
    return barColor * barFill * 0.9;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    // Correct aspect ratio
    uv.x *= u_resolution.x / u_resolution.y;

    // Center around (0.5, 0.5) scaled for aspect
    vec2 centered = uv - vec2(0.5 * u_resolution.x / u_resolution.y, 0.5);

    // Convert HSL to RGB
    vec3 rgb1 = hsl_to_rgb(u_color1_hsl);
    vec3 rgb2 = hsl_to_rgb(u_color2_hsl);

    // Background: dark gray
    vec3 bg = vec3(0.08);

    // Grid 1: no rotation (angle = 0)
    float mask1 = gridMask(centered + vec2(0.5), u_frequency1, 0.0, 0.3);

    // Grid 2: rotated by u_angle, slightly different frequency
    float mask2 = gridMask(centered + vec2(0.5), u_frequency2, u_angle, 0.3);

    // Combine grids: multiplicative overlay produces moiré in overlap regions
    // mask=1 means "not on a line" (background shows)
    // mask=0 means "on a line" (color shows)
    float onGrid1 = 1.0 - mask1;  // 1 on grid lines, 0 on background
    float onGrid2 = 1.0 - mask2;

    // Interference: where both grids overlap
    float interference = onGrid1 * onGrid2;

    // Compose: background + grid 1 lines + grid 2 lines + intersection
    vec3 color = bg;
    color = mix(color, rgb1, onGrid1 * (1.0 - onGrid2));
    color = mix(color, rgb2, onGrid2 * (1.0 - onGrid1));
    // Intersection: additive blend of both colors (complementaries will mix interestingly)
    color = mix(color, (rgb1 + rgb2) * 0.5, interference);

    // Compute visual tension
    float tension = visualTension(u_color1_hsl, u_color2_hsl);

    // Overlay tension bar in bottom strip
    vec2 uvOrig = gl_FragCoord.xy / u_resolution.xy;
    vec3 bar = tensionBar(uvOrig, tension);
    if (uvOrig.y < 0.08) {
        color = bar + bg * (1.0 - bar.r - bar.g - bar.b) * 0.1;
        // Label area: slightly lighter strip
        if (uvOrig.y < 0.02) color = vec3(0.15);
    }

    gl_FragColor = vec4(color, 1.0);
}
