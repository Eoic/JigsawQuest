#version 300 es

precision mediump float;
in vec2 a_position;
in vec2 a_textureCoord;

out vec2 textureCoord;

uniform mat3 translationMatrix;
uniform mat3 projectionMatrix;

void main() {
    gl_Position = vec4((projectionMatrix * translationMatrix * vec3(a_position, 1.0f)).xy, 0.0f, 1.0f);
    textureCoord = a_textureCoord;
}