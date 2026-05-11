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
// type: 0=mono, 1=complementary, 2=triadic, 3=split_comp, 4=square, 5=analogous, 6=golden
// index: which angle in the set [0..n-1]
// Returns -1.0 if index exceeds the set size
float harmonyHue(float baseHue, int type, int index) {
    float h = mod(baseHue, 360.0);
    if (type == 0) { // monochromatic
        return index == 0 ? h : -1.0;
    } else if (type == 1) { // complementary
        if (index == 0) return h;
        if (index == 1) return mod(h + 180.0, 360.0);
    } else if (type == 2) { // triadic
        return mod(h + float(index) * 120.0, 360.0);
    } else if (type == 3) { // split complementary
        if (index == 0) return h;
        if (index == 1) return mod(h + 150.0, 360.0);
        if (index == 2) return mod(h + 210.0, 360.0);
    } else if (type == 4) { // square tetradic
        return mod(h + float(index) * 90.0, 360.0);
    } else if (type == 5) { // analogous (3-color)
        if (index == 0) return mod(h - 30.0, 360.0);
        if (index == 1) return h;
        if (index == 2) return mod(h + 30.0, 360.0);
    } else if (type == 6) { // golden angle sequence
        return mod(h + float(index) * GOLDEN_ANGLE_DEG, 360.0);
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

// Generate an OKLab color at a harmony hue angle
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

// Animated hue rotation — full palette rotates at speed `rate` (degrees/second)
vec3 rotatingPalette(float index, float baseHue, float sat, float lit, float time, float rate) {
    float h = mod(baseHue + index * GOLDEN_ANGLE_DEG + time * rate, 360.0);
    return hsl_to_rgb(vec3(h, sat, lit));
}

// ─── Tension metric ───────────────────────────────────────────────────────────

// Circular hue distance, normalized to [0, 1]
// 0 = same hue, 1 = complementary
float hueTension(float h1, float h2) {
    float d = abs(mod(h1 - h2, 360.0));
    d = min(d, 360.0 - d);
    return d / 180.0;
}
