// sequence_palette_gen.frag
// Renders a palette strip generated from a mathematical sequence
// Uniforms: u_resolution, u_time, u_method (0=golden, 1=prime, 2=fibonacci, 3=collatz)
//           u_baseHue, u_saturation, u_lightness, u_nColors

#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_method;     // 0=golden angle, 1=prime gaps, 2=fib ratio, 3=collatz
uniform float u_baseHue;    // 0..360
uniform float u_saturation; // 0..1
uniform float u_lightness;  // 0..1
uniform float u_nColors;    // number of palette swatches

const float GOLDEN_ANGLE = 137.50776405;
const float PI = 3.14159265359;

// HSL to RGB (inline)
vec3 hsl_to_rgb(float h, float s, float l) {
    h = mod(h, 360.0) / 360.0;
    if (s == 0.0) return vec3(l);
    float q = l < 0.5 ? l * (1.0 + s) : l + s - l * s;
    float p = 2.0 * l - q;
    vec3 rgb;
    float t0 = h + 1.0/3.0; if (t0 > 1.0) t0 -= 1.0;
    float t1 = h;
    float t2 = h - 1.0/3.0; if (t2 < 0.0) t2 += 1.0;
    float ts[3]; ts[0] = t0; ts[1] = t1; ts[2] = t2;
    for (int i = 0; i < 3; i++) {
        float t = ts[i];
        float v;
        if      (t < 1.0/6.0) v = p + (q-p)*6.0*t;
        else if (t < 0.5)     v = q;
        else if (t < 2.0/3.0) v = p + (q-p)*(2.0/3.0-t)*6.0;
        else                   v = p;
        if (i == 0) rgb.r = v;
        else if (i == 1) rgb.g = v;
        else rgb.b = v;
    }
    return rgb;
}

// Golden angle hue for index i
float goldenHue(float base, float i) {
    return mod(base + i * GOLDEN_ANGLE, 360.0);
}

// Fake prime gap approximation (deterministic, no arrays in GLSL)
// Uses a simple hash approximation of prime gaps
float primeGapApprox(float n) {
    // Approximate: gaps follow log(p) on average; use sin-based pseudo-random
    return 2.0 + 4.0 * abs(sin(n * 1.2345 + 0.7));
}

float primeHue(float base, float i, float scale) {
    float h = base;
    for (float j = 0.0; j < i; j += 1.0) {
        h += primeGapApprox(j) * scale;
    }
    return mod(h, 360.0);
}

// Fibonacci ratio approximation: ratio_n ≈ 1/phi + small oscillation
float fibHue(float base, float i) {
    float phi = 1.6180339887;
    float ratio = 1.0 / phi;
    // Damped oscillation around golden ratio
    ratio += 0.05 * cos(i * PI) / (i + 1.0);
    float h = mod(base + i * ratio * 360.0, 360.0);
    return h;
}

// Collatz-inspired: hue based on collatz stopping time parity
float collatzHue(float base, float i) {
    float n = base + i * 3.0 + 1.0;
    float steps = 0.0;
    for (int k = 0; k < 64; k++) {
        if (n <= 1.0) break;
        if (mod(n, 2.0) == 0.0) n = n / 2.0;
        else n = 3.0 * n + 1.0;
        steps += 1.0;
    }
    return mod(base + steps * 7.3, 360.0);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    float n = max(u_nColors, 1.0);

    // Which palette slot are we in?
    float slotF = uv.x * n;
    float slotI = floor(slotF);
    float slotT = fract(slotF);

    float hue;
    if (u_method < 0.5) {
        hue = goldenHue(u_baseHue, slotI);
    } else if (u_method < 1.5) {
        hue = primeHue(u_baseHue, slotI, 30.0);
    } else if (u_method < 2.5) {
        hue = fibHue(u_baseHue, slotI);
    } else {
        hue = collatzHue(u_baseHue, slotI);
    }

    vec3 col = hsl_to_rgb(hue, u_saturation, u_lightness);

    // Thin dividing lines between swatches
    if (slotT < 0.02 || slotT > 0.98) col *= 0.3;

    // Hex label area at bottom
    if (uv.y < 0.12) col *= 0.6;

    gl_FragColor = vec4(col, 1.0);
}
