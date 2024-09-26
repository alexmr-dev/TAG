#version 300 es
layout(location = 0) in vec4 VertexPosition;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

void main()
{
    mat4 mvp = uProjectionMatrix * uViewMatrix * uModelMatrix;
    gl_Position = mvp * VertexPosition;
}