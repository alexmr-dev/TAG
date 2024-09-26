import { mat4 } from 'gl-matrix';
import { TRecurso } from './recurso';
import { TMalla } from '../SceneManager/malla';

export class TRecursoModelo extends TRecurso {
    private mallas: TMalla[] = [];
    private matrizTransformacion: mat4 = mat4.create();

    // Método para establecer la matriz de transformación
    setMatrizTransformacion(newMatrix: mat4): void {
        mat4.copy(this.matrizTransformacion, newMatrix);
    }

    // Método para obtener la matriz de transformación
    getMatrizTransformacion(): mat4 {
        return this.matrizTransformacion;
    }

    public getMallas(): TMalla[] {
        return this.mallas;
    }

    override cargarFichero(filename: string): Promise<void> {
        //console.log("Cargando para TMalla... " + filename);
        return new Promise((resolve, reject) => {
            fetch(`/assets/3D_Models/OBJ/${filename}.obj`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.text();
                })
                .then(data => {
                    const archivo = data;
                    const _malla: TMalla = new TMalla(archivo);
                    this.mallas.push(_malla);
                    resolve();
                })
                .catch(error => {
                    console.error("Error al cargar el archivo:", error);
                    reject(error);
                });
        });
    }

    override dibujarRecurso(
        gl: WebGL2RenderingContext, 
        texture: WebGLTexture,
        camara: any, 
        colorModelo: any,
        matrizTransformacion?: mat4,
        isWall: boolean = false // Añadido
    ): void {
        if (this.mallas.length === 0) {
            console.log("Aún no se han cargado las mallas.");
            return;
        }
    
        if (!gl) {
            console.error('No se pudo obtener el contexto WebGL.');
            return;
        }
    
        // Renderizado normal
        for (let i: number = 0; i < this.mallas.length; i++) {
            this.mallas[i].dibujar(
                gl, 
                texture, 
                camara, 
                colorModelo,
                matrizTransformacion,
                isWall // Añadido
            );
        }
    }      
}