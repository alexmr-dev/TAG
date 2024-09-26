#version 300 es
precision highp float;                  // Precisión de punto flotante

uniform vec4 uColor; // Color de la malla
out vec4 fragColor;

void main(void) {
    fragColor = uColor;
}