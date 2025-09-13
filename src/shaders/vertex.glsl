// Vertex shader for custom particle effects
attribute vec3 position;
attribute vec3 color;
attribute float size;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float time;
uniform float scale;

varying vec3 vColor;
varying float vOpacity;

void main() {
    vColor = color;
    
    // Calculate position with subtle animation
    vec3 animatedPosition = position;
    animatedPosition.y += sin(time * 2.0 + position.x * 0.1) * 0.5;
    animatedPosition.x += cos(time * 1.5 + position.z * 0.1) * 0.3;
    
    // Transform position
    vec4 mvPosition = modelViewMatrix * vec4(animatedPosition, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Calculate size based on distance and custom size attribute
    float distance = length(mvPosition.xyz);
    gl_PointSize = size * scale * (300.0 / distance);
    
    // Calculate opacity based on distance
    vOpacity = 1.0 - smoothstep(50.0, 200.0, distance);
}
