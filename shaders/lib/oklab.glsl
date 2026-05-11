// oklab.glsl
// OKLab <-> linear sRGB conversion utilities for GLSL
// Reference: https://bottosson.github.io/posts/oklab/
// Drop into any fragment shader for perceptually uniform color operations.

// Linear sRGB to OKLab
vec3 linearSRGB_to_OKLab(vec3 c) {
    float l = 0.4122214708 * c.r + 0.5363325363 * c.g + 0.0514459929 * c.b;
    float m = 0.2119034982 * c.r + 0.6806995451 * c.g + 0.1073969566 * c.b;
    float s = 0.0883024619 * c.r + 0.2817188376 * c.g + 0.6299787005 * c.b;

    float l_ = pow(l, 1.0/3.0);
    float m_ = pow(m, 1.0/3.0);
    float s_ = pow(s, 1.0/3.0);

    return vec3(
        0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
        1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
        0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_
    );
}

// OKLab to linear sRGB
vec3 OKLab_to_linearSRGB(vec3 c) {
    float l_ = c.x + 0.3963377774 * c.y + 0.2158037573 * c.z;
    float m_ = c.x - 0.1055613458 * c.y - 0.0638541728 * c.z;
    float s_ = c.x - 0.0894841775 * c.y - 1.2914855480 * c.z;

    float l = l_ * l_ * l_;
    float m = m_ * m_ * m_;
    float s = s_ * s_ * s_;

    return vec3(
         4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
    );
}

// sRGB gamma (display) to linear sRGB
float sRGB_to_linear(float x) {
    return x <= 0.04045 ? x / 12.92 : pow((x + 0.055) / 1.055, 2.4);
}

// Linear sRGB to sRGB gamma
float linear_to_sRGB(float x) {
    return x <= 0.0031308 ? x * 12.92 : 1.055 * pow(x, 1.0/2.4) - 0.055;
}

// Full pipeline: sRGB (display) to OKLab
vec3 sRGB_to_OKLab(vec3 c) {
    vec3 lin = vec3(sRGB_to_linear(c.r), sRGB_to_linear(c.g), sRGB_to_linear(c.b));
    return linearSRGB_to_OKLab(lin);
}

// Full pipeline: OKLab to sRGB (display)
vec3 OKLab_to_sRGB(vec3 c) {
    vec3 lin = OKLab_to_linearSRGB(c);
    return vec3(linear_to_sRGB(lin.r), linear_to_sRGB(lin.g), linear_to_sRGB(lin.b));
}

// OKLab to OKLCh (cylindrical form — use for hue rotation)
vec3 OKLab_to_OKLCh(vec3 lab) {
    float C = length(lab.yz);          // chroma
    float h = atan(lab.z, lab.y);      // hue angle in radians
    return vec3(lab.x, C, h);
}

// OKLCh to OKLab
vec3 OKLCh_to_OKLab(vec3 lch) {
    return vec3(lch.x, lch.y * cos(lch.z), lch.y * sin(lch.z));
}

// Perceptual interpolation between two sRGB colors via OKLab
vec3 oklabMix(vec3 colA, vec3 colB, float t) {
    vec3 labA = sRGB_to_OKLab(colA);
    vec3 labB = sRGB_to_OKLab(colB);
    vec3 mixed = mix(labA, labB, t);
    return OKLab_to_sRGB(mixed);
}

// Rotate hue by angle (radians) in OKLCh space, returns sRGB
vec3 rotateHue(vec3 srgbColor, float angleRad) {
    vec3 lab = sRGB_to_OKLab(srgbColor);
    vec3 lch = OKLab_to_OKLCh(lab);
    lch.z += angleRad;
    return OKLab_to_sRGB(OKLCh_to_OKLab(lch));
}

// ─── Extended functions ───────────────────────────────────────────────────────

// Sample a multi-stop gradient in OKLab space — avoids the muddy grays of sRGB gradients
// a and b are sRGB endpoints; t in [0,1]; returns sRGB
vec3 oklabGradient(vec3 a, vec3 b, float t) {
    // Linear OKLab interpolation: perceptually straight path, no hue drift or gray mud
    return oklabMix(a, b, t);
}

// Perceptual contrast between two sRGB colors — Michelson-style contrast in OKLab L channel
// Returns 0.0 (same lightness) to 1.0 (black vs white)
float perceptualContrast(vec3 a, vec3 b) {
    float La = sRGB_to_OKLab(a).x;
    float Lb = sRGB_to_OKLab(b).x;
    float hi = max(La, Lb);
    float lo = min(La, Lb);
    // Michelson contrast: (hi - lo) / (hi + lo + eps)
    return (hi - lo) / (hi + lo + 0.001);
}

// Boost chroma in OKLab space by a multiplier — amplifies colorfulness without hue shift
// amount: 1.0 = unchanged, 2.0 = doubled chroma, 0.0 = gray
vec3 chromaBoost(vec3 lab, float amount) {
    // Scale the a and b channels symmetrically, preserving hue angle
    return vec3(lab.x, lab.y * amount, lab.z * amount);
}


// Linear sRGB to OKLab
vec3 linearSRGB_to_OKLab(vec3 c) {
    float l = 0.4122214708 * c.r + 0.5363325363 * c.g + 0.0514459929 * c.b;
    float m = 0.2119034982 * c.r + 0.6806995451 * c.g + 0.1073969566 * c.b;
    float s = 0.0883024619 * c.r + 0.2817188376 * c.g + 0.6299787005 * c.b;

    float l_ = pow(l, 1.0/3.0);
    float m_ = pow(m, 1.0/3.0);
    float s_ = pow(s, 1.0/3.0);

    return vec3(
        0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
        1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
        0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_
    );
}

// OKLab to linear sRGB
vec3 OKLab_to_linearSRGB(vec3 c) {
    float l_ = c.x + 0.3963377774 * c.y + 0.2158037573 * c.z;
    float m_ = c.x - 0.1055613458 * c.y - 0.0638541728 * c.z;
    float s_ = c.x - 0.0894841775 * c.y - 1.2914855480 * c.z;

    float l = l_ * l_ * l_;
    float m = m_ * m_ * m_;
    float s = s_ * s_ * s_;

    return vec3(
         4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
    );
}

// sRGB gamma (display) to linear sRGB
float sRGB_to_linear(float x) {
    return x <= 0.04045 ? x / 12.92 : pow((x + 0.055) / 1.055, 2.4);
}

// Linear sRGB to sRGB gamma
float linear_to_sRGB(float x) {
    return x <= 0.0031308 ? x * 12.92 : 1.055 * pow(x, 1.0/2.4) - 0.055;
}

// Full pipeline: sRGB (display) to OKLab
vec3 sRGB_to_OKLab(vec3 c) {
    vec3 lin = vec3(sRGB_to_linear(c.r), sRGB_to_linear(c.g), sRGB_to_linear(c.b));
    return linearSRGB_to_OKLab(lin);
}

// Full pipeline: OKLab to sRGB (display)
vec3 OKLab_to_sRGB(vec3 c) {
    vec3 lin = OKLab_to_linearSRGB(c);
    return vec3(linear_to_sRGB(lin.r), linear_to_sRGB(lin.g), linear_to_sRGB(lin.b));
}

// OKLab to OKLCh (cylindrical form — use for hue rotation)
vec3 OKLab_to_OKLCh(vec3 lab) {
    float C = length(lab.yz);          // chroma
    float h = atan(lab.z, lab.y);      // hue angle in radians
    return vec3(lab.x, C, h);
}

// OKLCh to OKLab
vec3 OKLCh_to_OKLab(vec3 lch) {
    return vec3(lch.x, lch.y * cos(lch.z), lch.y * sin(lch.z));
}

// Perceptual interpolation between two sRGB colors via OKLab
vec3 oklabMix(vec3 colA, vec3 colB, float t) {
    vec3 labA = sRGB_to_OKLab(colA);
    vec3 labB = sRGB_to_OKLab(colB);
    vec3 mixed = mix(labA, labB, t);
    return OKLab_to_sRGB(mixed);
}

// Rotate hue by angle (radians) in OKLCh space, returns sRGB
vec3 rotateHue(vec3 srgbColor, float angleRad) {
    vec3 lab = sRGB_to_OKLab(srgbColor);
    vec3 lch = OKLab_to_OKLCh(lab);
    lch.z += angleRad;
    return OKLab_to_sRGB(OKLCh_to_OKLab(lch));
}
