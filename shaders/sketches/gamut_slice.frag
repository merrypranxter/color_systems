// gamut_slice.frag
// Renders a 2D slice through the sRGB gamut in CIE xy chromaticity space
// Shows the sRGB triangle, D65 white point, and gamut boundary of the visible spectrum
// Uniforms: u_resolution, u_lightness (0..1), u_time

#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_resolution;
uniform float u_lightness;  // Y value (luminance) of the slice plane
uniform float u_time;

const float PI = 3.14159265359;

// sRGB primaries in xy chromaticity
const vec2 RED_XY   = vec2(0.6400, 0.3300);
const vec2 GREEN_XY = vec2(0.3000, 0.6000);
const vec2 BLUE_XY  = vec2(0.1500, 0.0600);
const vec2 WHITE_XY = vec2(0.3127, 0.3290); // D65

// Convert CIE xy + Y to XYZ
vec3 xyY_to_XYZ(vec2 xy, float Y) {
    if (xy.y == 0.0) return vec3(0.0);
    return vec3(
        Y * xy.x / xy.y,
        Y,
        Y * (1.0 - xy.x - xy.y) / xy.y
    );
}

// Linear sRGB to sRGB gamma
float linear_to_srgb(float x) {
    return x <= 0.0031308 ? x * 12.92 : 1.055 * pow(max(x, 0.0), 1.0/2.4) - 0.055;
}

// XYZ to linear sRGB
vec3 xyz_to_linear_srgb(vec3 c) {
    return vec3(
         3.2404542 * c.x - 1.5371385 * c.y - 0.4985314 * c.z,
        -0.9692660 * c.x + 1.8760108 * c.y + 0.0415560 * c.z,
         0.0556434 * c.x - 0.2040259 * c.y + 1.0572252 * c.z
    );
}

// Check if a point in xy chromaticity is inside the sRGB triangle
float sign2(vec2 p1, vec2 p2, vec2 p3) {
    return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
}

bool inTriangle(vec2 pt) {
    float d1 = sign2(pt, RED_XY, GREEN_XY);
    float d2 = sign2(pt, GREEN_XY, BLUE_XY);
    float d3 = sign2(pt, BLUE_XY, RED_XY);
    bool has_neg = (d1 < 0.0) || (d2 < 0.0) || (d3 < 0.0);
    bool has_pos = (d1 > 0.0) || (d2 > 0.0) || (d3 > 0.0);
    return !(has_neg && has_pos);
}

void main() {
    // Map screen space to CIE xy chromaticity [0..0.8] x [0..0.9]
    vec2 uv = gl_FragCoord.xy / u_resolution;
    vec2 xy = uv * vec2(0.8, 0.9);

    float Y = u_lightness;

    // Background: dark gray for out-of-gamut
    vec3 color = vec3(0.08);

    if (inTriangle(xy)) {
        // Convert xy+Y to XYZ, then to sRGB
        vec3 XYZ = xyY_to_XYZ(xy, Y);
        vec3 lin = xyz_to_linear_srgb(XYZ);
        lin = clamp(lin, 0.0, 1.0);
        color = vec3(linear_to_srgb(lin.r), linear_to_srgb(lin.g), linear_to_srgb(lin.b));
    }

    // Draw sRGB triangle boundary
    float distToRG = abs(sign2(xy, RED_XY, GREEN_XY)) / length(RED_XY - GREEN_XY);
    float distToGB = abs(sign2(xy, GREEN_XY, BLUE_XY)) / length(GREEN_XY - BLUE_XY);
    float distToBR = abs(sign2(xy, BLUE_XY, RED_XY)) / length(BLUE_XY - RED_XY);
    float minDist = min(distToRG, min(distToGB, distToBR));
    if (minDist < 0.003) color = mix(color, vec3(1.0), 0.5);

    // White point marker
    if (length(xy - WHITE_XY) < 0.006) color = vec3(1.0);

    gl_FragColor = vec4(color, 1.0);
}
