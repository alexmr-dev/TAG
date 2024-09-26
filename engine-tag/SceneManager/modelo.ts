import { TGestorRecursos } from "../ResourceManager/gestorRecursos";
import { TRecurso } from "../ResourceManager/recurso";
import { TRecursoModelo } from "../ResourceManager/recursoModelo";
import { TEntidad } from './entidad';
import { mat4, vec3 } from "gl-matrix";
import { TMalla } from './malla';

export class TModelo extends TEntidad {
    private webglCTX!: WebGL2RenderingContext;
    private recursoModelo?: TRecurso;
    private recursoTextura?: TRecurso;
    private texture?: any;
    private colorModelo?: any;
    private camara?: any;
    private position: vec3 = vec3.create();
    private rotation: vec3 = vec3.create(); // Añadir la rotación
    private matrizTransformacion: mat4 = mat4.create();
    private fichero: string; // Agregamos la propiedad fichero
    private rotationAngleX: number = 0;
    private rotationAngleY: number = 0;

    constructor(
        ID: string, 
        fichero: string, 
        context: WebGL2RenderingContext, 
        gestor: TGestorRecursos, 
        camara: any,
        colorModelo: any
    ) {
        super();
        this.webglCTX = context;
        this.fichero = fichero; // Inicializamos la propiedad fichero
        this.cargaFicheroOBJ(ID, fichero, gestor);
        this.cargaTextura(ID, fichero, gestor);
        this.camara = camara;
        this.colorModelo = colorModelo;
        this.position = vec3.fromValues(0, 0, 0); // Inicializar la posición en el origen
        this.rotation = vec3.fromValues(0, 0, 0); // Inicializar la rotación en el origen
        this.actualizarMatrizTransformacion();
    }

    private async cargaFicheroOBJ(ID: string, fichero: string, gestor: TGestorRecursos) {
        try {
            this.recursoModelo = await gestor.getRecursoModelo(ID, fichero);
        } catch (error) {
            console.error("Error obteniendo el recurso modelo:", error);
        }
    }

    private async cargaTextura(ID: string, fichero: string, gestor: TGestorRecursos) {
        try {
            this.recursoTextura = await gestor.getRecursoTextura(ID, fichero);
            this.texture = await this.recursoTextura.cargarTextura(this.webglCTX, fichero);
        } catch (error) {
            console.error("Error obteniendo el recurso textura:", error);
        }
    }

    getMallas(): TMalla[] {
        if (this.recursoModelo instanceof TRecursoModelo) {
            return this.recursoModelo.getMallas();
        }
        return [];
    }

    getColor(): Uint8Array {
        const color = new Uint8Array(4);
        color[0] = Math.round(this.colorModelo[0] * 255);
        color[1] = Math.round(this.colorModelo[1] * 255);
        color[2] = Math.round(this.colorModelo[2] * 255);
        color[3] = Math.round(this.colorModelo[3] * 255);
        return color;
    }

    getPosition(): vec3 {
        return vec3.clone(this.position);
    }

    setPosition(position: vec3): void {
        vec3.copy(this.position, position);
        this.actualizarMatrizTransformacion();
    }

    getRotation(): vec3 {
        return vec3.clone(this.rotation);
    }

    setRotation(rotation: vec3): void {
        vec3.copy(this.rotation, rotation);
        this.actualizarMatrizTransformacion();
    }

    setRotationY(angle: number): void {
        this.rotation[1] = angle * (Math.PI / 180); // Establecer el ángulo de rotación en el eje Y
        this.actualizarMatrizTransformacion(); // Actualizar la matriz de transformación
    }

    // Añadir este método a la clase TModelo
    getWorldMatrix(): mat4 {
        return this.matrizTransformacion;
    }

    private actualizarMatrizTransformacion(): void {
        mat4.identity(this.matrizTransformacion);
        mat4.translate(this.matrizTransformacion, this.matrizTransformacion, this.position);
        mat4.rotateX(this.matrizTransformacion, this.matrizTransformacion, this.rotation[0]);
        mat4.rotateY(this.matrizTransformacion, this.matrizTransformacion, this.rotation[1]);
        mat4.rotateZ(this.matrizTransformacion, this.matrizTransformacion, this.rotation[2]);
    }

    getRecursoModelo(): TRecurso | undefined {
        return this.recursoModelo;
    }

    // Método para obtener el nombre del fichero
    getName(): string {
        return this.fichero;
    }

    override async dibujar(gl: WebGL2RenderingContext, isWall: boolean = false): Promise<void> {
        await new Promise<void>(resolve => {
            if (this.recursoModelo) {
                resolve();
            } else {
                const intervalo = setInterval(() => {
                    if (this.recursoModelo) {
                        clearInterval(intervalo);
                        resolve();
                    }
                }, 100);
            }
        });
        if (this.recursoModelo instanceof TRecursoModelo) {
            this.recursoModelo.dibujarRecurso(
                this.webglCTX,
                this.texture,
                this.camara,
                this.colorModelo,
                this.matrizTransformacion,
                isWall // Añadido
            );
        } else {
            console.error('KO: Recurso modelo no disponible o no es del tipo esperado.');
        }
    }    
}