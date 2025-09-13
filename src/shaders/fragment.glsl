// Fragment shader for custom particle effects
precision mediump float;

uniform float time;
uniform vec2 resolution;

varying vec3 vColor;
varying float vOpacity;

void main() {
    // Create circular particles
    vec2 center = gl_PointCoord - vec2(0.5);
    float distance = length(center);
    
    // Discard pixels outside circle
    if (distance > 0.5) {
        discard;
    }
    
    // Create glow effect
    float glow = 1.0 - smoothstep(0.0, 0.5, distance);
    glow = pow(glow, 2.0);
    
    // Add subtle pulse animation
    float pulse = sin(time * 3.0) * 0.1 + 0.9;
    
    // Calculate final color with glow and opacity
    vec3 finalColor = vColor * glow * pulse;
    float finalOpacity = vOpacity * glow;
    
    // Add slight brightness variation
    finalColor += vec3(0.1) * glow;
    
    gl_FragColor = vec4(finalColor, finalOpacity);
}
