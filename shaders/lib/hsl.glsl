// hsl.glsl
// HSL <-> RGB conversions and harmony operations for GLSL
// Use for harmony angle math, not for perceptual interpolation (use oklab.glsl for that)

// HSL to RGB — standard cylindrical sRGB conversion
vec3 hsl_to_rgb(vec3 hsl) {
    float h = hsl.x / 360.0;
    float s = hsl.y;
    float l = hsl.z;

    if (s == 0.0) return vec3(l);

    float q = l < 0.5 ? l * (1.0 + s) : l + s - l * s;
    float p = 2.0 * l - q;

    vec3 rgb;
    float t[3];
    t[0] = h + 1.0/3.0;
    t[1] = h;
    t[2] = h - 1.0/3.0;

    for (int i = 0; i < 3; i++) {
        float tc = t[i];
        if (tc < 0.0) tc += 1.0;
        if (tc > 1.0) tc -= 1.0;

        float val;
        if (tc < 1.0/6.0)      val = p + (q - p) * 6.0 * tc;
        else if (tc < 0.5)     val = q;
        else if (tc < 2.0/3.0) val = p + (q - p) * (2.0/3.0 - tc) * 6.0;
        else                   val = p;

        if (i == 0) rgb.r = val;
        else if (i == 1) rgb.g = val;
        else rgb.b = val;
    }
    return rgb;
}

// RGB to HSL — inverse of hsl_to_rgb
vec3 rgb_to_hsl(vec3 rgb) {
    float maxC = max(rgb.r, max(rgb.g, rgb.b));
    float minC = min(rgb.r, min(rgb.g, rgb.b));
    float delta = maxC - minC;
    float l = (maxC + minC) / 2.0;
    float h = 0.0;
    float s = 0.0;

    if (delta > 0.0) {
        s = delta / (1.0 - abs(2.0 * l - 1.0));
        if (maxC == rgb.r)      h = mod((rgb.g - rgb.b) / delta, 6.0) / 6.0;
        else if (maxC == rgb.g) h = ((rgb.b - rgb.r) / delta + 2.0) / 6.0;
        else                    h = ((rgb.r - rgb.g) / delta + 4.0) / 6.0;
    }
    return vec3(h * 360.0, s, l);
}

// Harmony operations — angle arithmetic mod 360, the algebra of the color wheel
float complementaryHue(float h)          { return mod(h + 180.0, 360.0); }
float triadicHue1(float h)               { return mod(h + 120.0, 360.0); }
float triadicHue2(float h)               { return mod(h + 240.0, 360.0); }
float splitComplementary1(float h)       { return mod(h + 150.0, 360.0); }
float splitComplementary2(float h)       { return mod(h + 210.0, 360.0); }
float squareTetradic(float h, int i)     { return mod(h + float(i) * 90.0, 360.0); }

// Golden angle hue step — each step is maximally distant from all previous steps
const float GOLDEN_ANGLE = 137.50776405;
float goldenAngleHue(float baseHue, float n) {
    return mod(baseHue + n * GOLDEN_ANGLE, 360.0);
}

// Generate HSL palette color by index using golden angle — no two consecutive colors are similar
vec3 goldenAnglePaletteHSL(float index, float basHue, float sat, float lit) {
    float h = goldenAngleHue(basHue, index);
    return vec3(h, sat, lit);
}

// ─── Extended functions ───────────────────────────────────────────────────────

// Generate n analogous hues spread symmetrically around baseHue — fills one region of the wheel evenly
// Returns the hue for color i of n total, spread within ±spread/2 degrees of baseHue
float analogousPalette(float baseHue, float spread, int n, int i) {
    // Distribute n colors evenly within the spread window, centered on baseHue
    float step = n > 1 ? spread / float(n - 1) : 0.0;
    float offset = -spread * 0.5 + float(i) * step;
    return mod(baseHue + offset, 360.0);
}

// Perceptually correct HSL interpolation via OKLab — avoids the muddy gray zone of direct HSL lerp
// hslA and hslB: vec3(hue_degrees, saturation, lightness); t in [0,1]; returns sRGB
// Requires oklab.glsl to be included before this file
vec3 harmonicLerp(vec3 hslA, vec3 hslB, float t) {
    vec3 rgbA = hsl_to_rgb(hslA);
    vec3 rgbB = hsl_to_rgb(hslB);
    // Route through OKLab for perceptually straight interpolation
    return oklabMix(rgbA, rgbB, t);
}
