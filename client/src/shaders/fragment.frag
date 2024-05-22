#version 300 es

precision mediump float;

in vec2 textureCoord;
out vec4 fragColor;

uniform sampler2D u_sampler;

void main() {
    // fragColor = vec4(0.18f, 0.16f, 0.87f, 1.0f);
    fragColor = texture(u_sampler, textureCoord);
}