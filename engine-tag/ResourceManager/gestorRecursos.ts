
import { TRecurso } from "./recurso";
import { TRecursoShader } from "./recursoShader";
import { TRecursoModelo } from "./recursoModelo";
import { TRecursoTextura } from "./recursoTextura";
export class TGestorRecursos {
    private recursosModelo: TRecurso[] = [];
    private recursosMaterial: TRecurso[] = [];
    private recursosTextura: TRecurso[] = [];

    private agregarRecurso(recurso: TRecurso, tipo: string): void {
        switch (tipo) {
            case "Modelo":
                this.recursosModelo.push(recurso);
                break;
            case "Material":
                this.recursosMaterial.push(recurso);
                break;
            case "Textura":
                this.recursosTextura.push(recurso);
                break;
            default:
                break;
        }
    }

    public getRecursoModelo(ID: string, filename: string) {
        let recModelo;
        recModelo = this.recursosModelo.find(recurso => recurso.getID() === ID);
        if (!recModelo) {
            recModelo = new TRecursoModelo();
            recModelo.setID(ID);
            recModelo.cargarFichero(filename);
            this.agregarRecurso(recModelo, "Modelo");
        } else {
            //console.log("Ya existe " + ID);
        }
        return recModelo;
    }

    public getRecursoMaterial(ID: string, filename: string) {
        let recMaterial;
        recMaterial = this.recursosMaterial.find(recurso => recurso.getID() === ID);
        if (!recMaterial) {
            recMaterial = new TRecursoMaterial();
            recMaterial.setID(ID);
            recMaterial.cargarFichero(filename);
            this.agregarRecurso(recMaterial, "Material");
        }
        return recMaterial;
    }

    public async getRecursoTextura(ID: string, filename: string) {
        let recTextura;
        recTextura = this.recursosTextura.find(recurso => recurso.getID() === ID);
        if (!recTextura) {
            recTextura = new TRecursoTextura();
            recTextura.setID(ID);
            await recTextura.cargarFichero(filename);
            this.agregarRecurso(recTextura, "Textura");
        }
        return recTextura;
    }

    // Pasamos la ruta del vertex y el fragment y se encarga de crear un shader program
    public async getRecursoShader(
        gl:WebGL2RenderingContext, 
        vertexShaderMainPath: string, 
        fragmentShaderMainPath: string,
        vertexShaderColorPath: string,
        fragmentShaderColorPath: string
    ) {
        let recShader;
        recShader = new TRecursoShader(
            vertexShaderMainPath, 
            fragmentShaderMainPath, 
            vertexShaderColorPath,
            fragmentShaderColorPath,
            gl);
        return recShader;
    }
    public limpiarRecursosModelos(): void {
        this.recursosModelo = [];
    }
}



export class TRecursoMaterial extends TRecurso {
    override dibujarRecurso(): void {
        console.log("Dibujando malla");
        // Lógica específica de dibujado para la malla
    }

    override cargarFichero(filename: string): void {
        console.log("Cargando para TMaterial... mtl");
    }
}

