import { mat4 } from 'gl-matrix';

export abstract class TRecurso {
    private ID: string = ""; // Identificador
    private archivo: any;

    getID(): string {
        return this.ID;
    }

    setID(n_ID: string): void {
        this.ID = n_ID;
    }

    cargarFichero(archivo: string): void {

    };

    cargarTextura(gl: WebGL2RenderingContext, filename: string): void {

    }

    crearTexturaColor(gl: WebGL2RenderingContext): void {

    }

    // texture con interrogante para que sea opcional
    dibujarRecurso(
        gl: WebGL2RenderingContext, 
        programInfo:any, 
        programInfoColorSelect:any, 
        texture?: WebGLTexture, 
        camara?:any
    ): void { };

    // Método para dibujar el recurso con color picking
    dibujarColorPicking(
        gl: WebGL2RenderingContext, 
        programInfoColorSelect:any, 
        texture?: WebGLTexture,
        matrizTransformacion?: mat4
    ): void { };
}