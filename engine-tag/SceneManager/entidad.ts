
// Clase base para las entidades que pueden ser dibujadas
export abstract class TEntidad {
    //abstract dibujar(gl: WebGL2RenderingContext, matriz: mat4): void;
    
    abstract dibujar(
        gl: WebGL2RenderingContext, 
        texture?:any, 
        textureColor?:any,
        camara?:any, 
        matrizTransformacion?: any,
        isWall?: boolean
    ): void;
}