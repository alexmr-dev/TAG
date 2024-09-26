attribute vec3 aVertexPosition;     // Agregar un atributo para las coordenadas del vértice
attribute vec3 aNormalCoord;        // Agregar un atributo para las coordenadas de la normal
attribute vec2 aTextureCoord;       // Agregar un atributo para las coordenadas de textura

uniform mat4 uModelMatrix;          // Agregar una matriz de modelo
uniform mat4 uProjectionMatrix;     // Agregar una matriz de proyección
uniform mat4 uViewMatrix;           // Agregar una matriz de vista
uniform mat4 uShadowMatrix;         // Agregar una matriz para transformar a las coordenadas de sombra

varying highp vec2 vTextureCoord;   // Agregar una variable para las coordenadas de textura
varying vec3 vNormal;               // Agregar una variable para la normal del vértice
varying vec3 vPosition;             // Agregar una variable para la posición del vértice
varying vec4 vShadowCoord;          // Agregar una variable para las coordenadas de sombra

void main(void) {
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aVertexPosition, 1);
    vTextureCoord = aTextureCoord;
    vNormal = mat3(uModelMatrix) * aNormalCoord; // Transformar la normal a espacio de vista
    vPosition = vec3(uModelMatrix * vec4(aVertexPosition, 1.0));
    vShadowCoord = uShadowMatrix * vec4(aVertexPosition, 1.0); // Calcular las coordenadas de sombra
}