// colorspace_transforms.glsl
// Full colorspace transform chain: sRGB ↔ Linear ↔ XYZ ↔ OKLab ↔ OKLCh
// Include oklab.glsl and hsl.glsl before this file, or paste inline.
// All functions assume vec3 inputs in their respective spaces.

// ─── sRGB ↔ Linear sRGB ───────────────────────────────────────────────────────

vec3 srgb_to_linear(vec3 c) {
    return vec3(
        c.r <= 0.04045 ? c.r / 12.92 : pow((c.r + 0.055) / 1.055, 2.4),
        c.g <= 0.04045 ? c.g / 12.92 : pow((c.g + 0.055) / 1.055, 2.4),
        c.b <= 0.04045 ? c.b / 12.92 : pow((c.b + 0.055) / 1.055, 2.4)
    );
}

vec3 linear_to_srgb(vec3 c) {
    return vec3(
        c.r <= 0.0031308 ? c.r * 12.92 : 1.055 * pow(c.r, 1.0/2.4) - 0.055,
        c.g <= 0.0031308 ? c.g * 12.92 : 1.055 * pow(c.g, 1.0/2.4) - 0.055,
        c.b <= 0.0031308 ? c.b * 12.92 : 1.055 * pow(c.b, 1.0/2.4) - 0.055
    );
}

// ─── Linear sRGB ↔ CIE XYZ (D65) ─────────────────────────────────────────────

vec3 linear_srgb_to_xyz(vec3 c) {
    return vec3(
        0.4124564 * c.r + 0.3575761 * c.g + 0.1804375 * c.b,
        0.2126729 * c.r + 0.7151522 * c.g + 0.0721750 * c.b,
        0.0193339 * c.r + 0.1191920 * c.g + 0.9503041 * c.b
    );
}

vec3 xyz_to_linear_srgb(vec3 c) {
    return vec3(
         3.2404542 * c.x - 1.5371385 * c.y - 0.4985314 * c.z,
        -0.9692660 * c.x + 1.8760108 * c.y + 0.0415560 * c.z,
         0.0556434 * c.x - 0.2040259 * c.y + 1.0572252 * c.z
    );
}

// ─── CIE XYZ ↔ CIELAB ─────────────────────────────────────────────────────────

// D65 white point
const vec3 D65 = vec3(0.95047, 1.00000, 1.08883);
const float DELTA = 6.0 / 29.0;

float lab_f(float t) {
    return t > DELTA * DELTA * DELTA
        ? pow(t, 1.0/3.0)
        : t / (3.0 * DELTA * DELTA) + 4.0/29.0;
}

float lab_f_inv(float t) {
    return t > DELTA ? t * t * t : 3.0 * DELTA * DELTA * (t - 4.0/29.0);
}

vec3 xyz_to_cielab(vec3 xyz) {
    vec3 f = vec3(lab_f(xyz.x / D65.x), lab_f(xyz.y / D65.y), lab_f(xyz.z / D65.z));
    return vec3(
        116.0 * f.y - 16.0,
        500.0 * (f.x - f.y),
        200.0 * (f.y - f.z)
    );
}

vec3 cielab_to_xyz(vec3 lab) {
    float fy = (lab.x + 16.0) / 116.0;
    float fx = lab.y / 500.0 + fy;
    float fz = fy - lab.z / 200.0;
    return vec3(
        D65.x * lab_f_inv(fx),
        D65.y * lab_f_inv(fy),
        D65.z * lab_f_inv(fz)
    );
}

// ─── Full pipeline shortcuts ──────────────────────────────────────────────────

// sRGB → CIELAB
vec3 srgb_to_cielab(vec3 c) {
    return xyz_to_cielab(linear_srgb_to_xyz(srgb_to_linear(c)));
}

// CIELAB → sRGB
vec3 cielab_to_srgb(vec3 lab) {
    return linear_to_srgb(xyz_to_linear_srgb(cielab_to_xyz(lab)));
}

// sRGB → OKLab (via oklab.glsl functions)
// vec3 sRGB_to_OKLab(vec3 c) — defined in oklab.glsl

// ─── Gamut clamping ───────────────────────────────────────────────────────────

// Clamp linear sRGB to valid gamut [0,1] (hard clip)
vec3 gamut_clip(vec3 linear_rgb) {
    return clamp(linear_rgb, 0.0, 1.0);
}

// Chroma-reduction gamut mapping: reduce chroma until color fits in gamut
// Input: OKLCh (L, C, h in radians). Output: valid OKLab
vec3 oklch_gamut_map(vec3 lch) {
    // Binary search on chroma
    float lo = 0.0;
    float hi = lch.y;
    vec3 lab;
    for (int i = 0; i < 16; i++) {
        float mid = (lo + hi) * 0.5;
        vec3 test_lch = vec3(lch.x, mid, lch.z);
        lab = OKLCh_to_OKLab(test_lch);
        vec3 rgb = OKLab_to_linearSRGB(lab);
        bool in_gamut = all(greaterThanEqual(rgb, vec3(0.0))) && all(lessThanEqual(rgb, vec3(1.0)));
        if (in_gamut) lo = mid; else hi = mid;
    }
    return lab;
}
