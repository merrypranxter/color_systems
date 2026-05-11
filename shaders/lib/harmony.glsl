// harmony.glsl
// Color harmony generation utilities for GLSL
// Generates harmony sets, applies tension, produces palette colors
// Requires hsl.glsl and oklab.glsl to be included/inlined before this.

const float PI = 3.14159265359;
const float TAU = 6.28318530718;
const float GOLDEN_ANGLE_DEG = 137.50776405;
const float GOLDEN_ANGLE_RAD = 2.39996322973;

// ─── Harmony angle generators ─────────────────────────────────────────────────

// Returns hue angles (degrees) for a given harmony type
// type: 0=mono, 1=complementary, 2=triadic, 3=split_comp, 4=square, 5=analogous, 6=golden, 7=rectangular
// index: which angle in the set [0..n-1]
// Returns -1.0 if index exceeds the set size
float harmonyHue(float baseHue, int type, int index) {
    float h = mod(baseHue, 360.0);
    if (type == 0) { // monochromatic — single hue, vary S and L externally
        return index == 0 ? h : -1.0;
    } else if (type == 1) { // complementary — maximum tension, 2 colors
        if (index == 0) return h;
        if (index == 1) return mod(h + 180.0, 360.0);
    } else if (type == 2) { // triadic — equilateral triangle, 3 colors
        return mod(h + float(index) * 120.0, 360.0);
    } else if (type == 3) { // split complementary — 3 colors, softer than complementary
        if (index == 0) return h;
        if (index == 1) return mod(h + 150.0, 360.0);
        if (index == 2) return mod(h + 210.0, 360.0);
    } else if (type == 4) { // square tetradic — 4 colors at 90° intervals
        return mod(h + float(index) * 90.0, 360.0);
    } else if (type == 5) { // analogous — 3 neighboring hues at ±30°
        if (index == 0) return mod(h - 30.0, 360.0);
        if (index == 1) return h;
        if (index == 2) return mod(h + 30.0, 360.0);
    } else if (type == 6) { // golden angle sequence — maximum spread for any n
        return mod(h + float(index) * GOLDEN_ANGLE_DEG, 360.0);
    } else if (type == 7) { // rectangular tetradic — two complementary pairs
        if (index == 0) return h;
        if (index == 1) return mod(h + 60.0, 360.0);
        if (index == 2) return mod(h + 180.0, 360.0);
        if (index == 3) return mod(h + 240.0, 360.0);
    }
    return -1.0;
}

// ─── Color generation ─────────────────────────────────────────────────────────

// Generate an sRGB color from a harmony type, index, and base parameters
vec3 harmonyColor(float baseHue, int type, int index, float sat, float lit) {
    float h = harmonyHue(baseHue, type, index);
    if (h < 0.0) return vec3(0.0);
    return hsl_to_rgb(vec3(h, sat, lit));
}

// Generate an OKLab color at a harmony hue angle — perceptually uniform output
// More perceptually uniform than HSL-based generation
vec3 harmonyColorOKLab(float baseHue, int type, int index, float chroma, float lightness) {
    float h = harmonyHue(baseHue, type, index);
    if (h < 0.0) return vec3(lightness, 0.0, 0.0);
    float hRad = h * PI / 180.0;
    // OKLCh: L, C, h
    vec3 lch = vec3(lightness, chroma, hRad);
    return OKLCh_to_OKLab(lch);
}

// ─── Palette sampling ─────────────────────────────────────────────────────────

// Sample a golden-angle palette by continuous index (for smooth animation)
// index: float, can be fractional for interpolation between palette entries
vec3 goldenPaletteSample(float index, float baseHue, float sat, float lit) {
    float h = mod(baseHue + index * GOLDEN_ANGLE_DEG, 360.0);
    return hsl_to_rgb(vec3(h, sat, lit));
}

// Animated palette cycling: full golden-angle palette rotates at `rate` degrees/second via u_time
// Use u_time uniform (seconds elapsed) for live animation
vec3 rotatingPalette(float index, float baseHue, float sat, float lit, float u_time, float rate) {
    // rate in degrees/second — full rotation at rate=360 takes 1 second
    float h = mod(baseHue + index * GOLDEN_ANGLE_DEG + u_time * rate, 360.0);
    return hsl_to_rgb(vec3(h, sat, lit));
}

// Step through palette index at golden angle, animated by u_time — for discrete palette cycling
// stepRate: how many palette steps per second
vec3 animatedPaletteStep(float baseHue, float sat, float lit, float u_time, float stepRate) {
    float index = floor(u_time * stepRate);
    float h = mod(baseHue + index * GOLDEN_ANGLE_DEG, 360.0);
    return hsl_to_rgb(vec3(h, sat, lit));
}

// ─── Tension metric ───────────────────────────────────────────────────────────

// Circular hue distance, normalized to [0, 1] — 0 = same hue, 1 = complementary
float hueTension(float h1, float h2) {
    float d = abs(mod(h1 - h2, 360.0));
    d = min(d, 360.0 - d);
    return d / 180.0;
}

// Complementary vibration detector: returns [0,1] indicating visual tension between two HSL colors
// Combines hue distance (complementary = max) with chroma product (low sat = low vibration)
// hslA, hslB: vec3(hue_degrees, saturation, lightness)
float complementaryVibration(vec3 hslA, vec3 hslB) {
    // Hue tension: 1.0 at complementary (180° apart), 0.0 at same hue
    float hTension = hueTension(hslA.x, hslB.x);
    // Chroma product: vibration requires both colors to be saturated
    float chromaFactor = hslA.y * hslB.y;
    // Lightness parity: equal lightness maximizes simultaneous contrast
    float lightnessDiff = abs(hslA.z - hslB.z);
    float lightnessParity = 1.0 - lightnessDiff * 2.0; // 1.0 at equal L, 0.0 at max diff
    lightnessParity = clamp(lightnessParity, 0.0, 1.0);
    // Combined vibration: high when hues are complementary, both saturated, equal lightness
    return hTension * chromaFactor * lightnessParity;
}
