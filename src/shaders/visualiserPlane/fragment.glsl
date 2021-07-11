varying float vElevation;
varying vec3 vColor1;
varying vec3 vColor2;
uniform vec3 fogColor;
uniform float fogNear;
uniform float fogFar;
void main(){
    vec3 color = mix(vColor2, vColor1, vElevation);
    float depth;
    float fogFactor;
#ifdef USE_FOG
#ifdef USE_LOGDEPTHBUF_EXT
  depth = gl_FragDepthEXT / gl_FragCoord.w;
#else
  depth = gl_FragCoord.z / gl_FragCoord.w;
#endif
    fogFactor = smoothstep( fogNear, fogFar, depth );
#endif
    gl_FragColor = vec4(mix(color, fogColor, fogFactor), 1.0);
}