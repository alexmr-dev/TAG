import { TGestorRecursos } from "../ResourceManager/gestorRecursos";
import { TRecursoShader } from "../ResourceManager/recursoShader";
import { TModelo } from "../SceneManager/modelo";
import { TNodo } from "../SceneManager/nodo";
import { TEntidad } from '../SceneManager/entidad';
import { TCamara } from "../SceneManager/camara";
import { vec3 } from 'gl-matrix';
import { TLuz } from "../SceneManager/luz";
import { ShaderService } from '../services/shader.service';
import { Frustum } from '../SceneManager/frustum';


export class TMotorTAG {
    private arbolEscena!: TNodo; // Arbol de escena
    private gestorRecursos: TGestorRecursos = new TGestorRecursos(); // Gestor de recursos
    private webglCTX!: WebGL2RenderingContext; // Contexto WebGL

    private recursoShader!: TRecursoShader | null; // Recurso de shader

    private camara!: TCamara;

    private luzEscena!: TLuz;

    constructor(canvas: HTMLCanvasElement) {
        this.arbolEscena = new TNodo();
        this.gestorRecursos = new TGestorRecursos();
        this.webglCTX = canvas.getContext('webgl2', { preserveDrawingBuffer: true })!;
    }

    getWebglCTX(): WebGL2RenderingContext {
        return this.webglCTX;
    }

    async init() {
        ShaderService.getInstance().setRecursoShader(
            "vertexMain.glsl",
            "fragmentMain.glsl",
            "vertexColorSelect.glsl",
            "fragmentColorSelect.glsl",
            this.webglCTX
        );
        this.recursoShader = ShaderService.getInstance().getRecursoShader();
        if (this.recursoShader !== null) {
            await this.recursoShader.loadedPromise;
        } else {
            console.error('recursoShader es null');
        }

        if (!this.webglCTX) {
            console.error("No se pudo inicializar el contexto WebGL.");
            return;
        }
    }

    crearNodoModelo(ID: string, fichero: string, colorModelo: any): TModelo {
        const nModelo = new TNodo();
        let eModelo = new TModelo(
            ID, 
            fichero, 
            this.webglCTX, 
            this.gestorRecursos, 
            this.camara,
            colorModelo
        );
        nModelo.setEntidad(eModelo);
        this.arbolEscena.addHijo(nModelo);
        return eModelo;
    }

    eliminarNodoPorEntidad(entidad: TEntidad): boolean {
        return this.arbolEscena.removerHijoPorEntidad(entidad);
    }
    
    getGestorRecursos(): TGestorRecursos {
        return this.gestorRecursos;
    }

    InitCanvas(gl: WebGL2RenderingContext){
        gl.clearColor(1.0, 1.0, 1.0, 0.5); // Fondo blanco
        gl.enable(gl.DEPTH_TEST); // Habilitar Z-Buffer
        gl.clearDepth(1.0); // Limpiar
        gl.enable(gl.DEPTH_TEST); // Habilitar Z-Buffer
        gl.enable(gl.CULL_FACE); // Habilitar culling
        gl.cullFace(gl.BACK); // Culling de la parte trasera
        gl.depthFunc(gl.LEQUAL);
    }

    public InitLights(gl: WebGL2RenderingContext){
        let lightDirection = [0.0, 1.0, 0.0]; // Luz desde arriba
        let lightColor = [1.0, 1.0, 1.0]; // Color de la luz 
        let lightIntensity = 0.9; // Intensidad de la luz (0.0 a 1.0)

        this.luzEscena = new TLuz(lightDirection, lightColor, lightIntensity);
        this.luzEscena.dibujar(gl);
    }

    public crearCamara(esPerspectiva: boolean, cercano: number, lejano: number, fov: number, aspectRatio: number): TCamara {
        this.camara = new TCamara(esPerspectiva, cercano, lejano, fov, aspectRatio); // Asignación a la propiedad de la clase
        
        this.camara.setPosition(vec3.fromValues(13, 6.5, -13));
        this.camara.setLookAt([0, 2, 0]);
        this.camara.setUp([0, 1, 0]);
    
        this.camara.calculateViewMatrix();

        return this.camara;
    }    
    
    public dibujar() {
        if (!this.camara) {
            console.error("La cámara no está definida, no se puede dibujar la escena.");
            return;
        }
    
        const projectionMatrix = this.camara.getProjectionMatrix();
        const viewMatrix = this.camara.getViewMatrix();
        const frustum = new Frustum(projectionMatrix, viewMatrix);
    
        this.webglCTX.clear(this.webglCTX.COLOR_BUFFER_BIT | this.webglCTX.DEPTH_BUFFER_BIT);
    
        this.arbolEscena.recorrer(this.webglCTX, (nodo, gl) => {
            const entidad = nodo.getEntidad();
            if (entidad instanceof TModelo) {
                const min = vec3.fromValues(-1.0, -1.0, -1.0); // Ajusta estos valores
                const max = vec3.fromValues(1.0, 1.0, 1.0);    // Ajusta estos valores
                const worldMatrix = entidad.getWorldMatrix();
                vec3.transformMat4(min, min, worldMatrix);
                vec3.transformMat4(max, max, worldMatrix);
    
                if (frustum.isBoxInFrustum(min, max)) {
                    // Establecer el uniforme uIsWall antes de dibujar cada entidad
                    const isWall = entidad.getName().includes("pared");
                    entidad.dibujar(this.webglCTX, isWall); // Pasar isWall
                }
            }
        });
    }    

    comprobarError(){
        const error = this.webglCTX.getError();
        if (error !== this.webglCTX.NO_ERROR) {
            console.error('Error de WebGL detectado después del renderizado: ' + error);
        }
    }
}
