uniform float uFrequency;
uniform float uTime;
#pragma glslify: noise = require(glsl-noise/classic/3d)

uniform vec3 uColor1;
uniform vec3 uColor2;

varying float vElevation;
varying vec3 vColor1;
varying vec3 vColor2;
void main() {
    vec3 pos = position;
    vElevation = noise(position + vec3(uTime * 0.5)) * 0.02 * uFrequency;
    pos.z += vElevation;

    vec4 modelPosition = modelMatrix * vec4(pos, 1.0);


    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;
    vColor1 = uColor1;
    vColor2 = uColor2;
    gl_Position += projectionPosition;
}