// harmony_wheel.frag
// Renders a color harmony wheel showing the selected harmony type
// Uniforms: u_time, u_resolution, u_baseHue, u_harmonyType (0-6)

#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_baseHue;    // 0.0 - 360.0
uniform float u_harmonyType; // 0=mono, 1=comp, 2=triadic, 3=split, 4=square, 5=analogous, 6=golden

#include "hsl.glsl" // in real implementation, inline or use preprocessor

const float PI = 3.14159265359;
const float TAU = 6.28318530718;

// Map harmony type to set of hue angles
// (simplified inline version for standalone use)

vec3 hsl2rgb(float h, float s, float l) {
    // ... (paste hsl_to_rgb from hsl.glsl)
    return vec3(h/360.0, s, l); // placeholder
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
    float dist = length(uv);
    float angle = atan(uv.y, uv.x);
    float hueDeg = mod(degrees(angle) + 360.0, 360.0);

    // Outer ring: full hue spectrum
    if (dist > 0.35 && dist < 0.48) {
        vec3 col = hsl_to_rgb(vec3(hueDeg, 1.0, 0.5));
        gl_FragColor = vec4(col, 1.0);
        return;
    }

    // Inner area: show selected harmony colors as pie slices
    // [Further implementation in full sketch]

    gl_FragColor = vec4(vec3(0.05), 1.0);
}
