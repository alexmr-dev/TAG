// fragmentMain.glsl
precision highp float;                  // Precisión de punto flotante

varying highp vec2 vTextureCoord;       // Coordenadas de textura
varying vec3 vNormal;                   // Normal del fragmento
varying vec3 vPosition;                 // Posición del fragmento
varying vec4 vShadowCoord;              // Coordenadas de sombra

uniform sampler2D uSampler;             // Textura
uniform sampler2D uShadowMap;           // Mapa de sombras
uniform vec3 uLightDirection;           // Dirección de la luz
uniform vec3 uLightColor;               // Color de la luz
uniform float uLightIntensity;          // Intensidad de la luz
uniform vec3 uCameraPosition;           // Posición de la cámara

varying vec2 vDepthUv;                  // Coordenadas de profundidad
varying vec4 shadowPos;                 // Posición de la sombra
uniform sampler2D depthColorTexture;    // Textura de profundidad

uniform bool uIsWall;

void main(void) {
    vec4 textureColor = texture2D(uSampler, vTextureCoord);

    if (uIsWall) {
        gl_FragColor = textureColor;
    } else {
        vec3 lightDirection = normalize(uLightDirection);
        float diffuse = max(dot(vNormal, lightDirection), 0.0);

        vec3 viewDirection = normalize(uCameraPosition - vPosition);
        vec3 reflectionDirection = reflect(-lightDirection, vNormal);
        float specular = pow(max(dot(viewDirection, reflectionDirection), 0.0), 5.0); // El segundo argumento es el brillo especular

        vec3 lightColor = vec3(uLightColor);
        vec3 diffuseColor = lightColor * diffuse * uLightIntensity;
        vec3 specularColor = lightColor * specular * uLightIntensity; // Aplica la intensidad a la luz especular

        // Calcular la sombra
        vec3 shadowCoord = vShadowCoord.xyz / vShadowCoord.w;
        float shadow = texture2D(uShadowMap, shadowCoord.xy).z < shadowCoord.z ? 0.5 : 1.0; // 0.5 es la intensidad de la sombra

        vec4 finalColor = textureColor * vec4(diffuseColor + specularColor, 1.0) * shadow; // Agrega la luz especular a la final

        gl_FragColor = finalColor;
    }
}