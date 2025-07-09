#version 300 es
precision mediump float;

layout(location=0) in vec3 vertexPosition;
layout(location=1) in vec2 aTexCoord;

out vec2 vTexCoord;

uniform mat4 matWorld;
uniform mat4 matViewProj;

void main() {
    vTexCoord = aTexCoord;
    gl_Position = matViewProj * matWorld * vec4(vertexPosition, 1.0);
}