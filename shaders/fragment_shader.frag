#version 300 es
precision mediump float;
precision mediump sampler2DArray;

in vec2 vTexCoord;
in float vDepth;

uniform sampler2DArray uSampler;

out vec4 fragColor;

void main() {
    fragColor = texture(uSampler, vec3(vTexCoord, vDepth));
}