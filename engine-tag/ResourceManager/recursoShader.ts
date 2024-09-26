import { TRecurso } from './recurso';

export class TRecursoShader extends TRecurso {

    // Vertex shader y Fragment shader como strings
    private vertexShaderMainSource: string = '';
    private fragmentShaderMainSource: string = '';

    private vertexShaderColorSource: string = '';
    private fragmentShaderColorSource: string = '';

    private gl!: WebGL2RenderingContext;
    public loadedPromise: Promise<void>;

    // Programas
    private shaderProgramMain!: WebGLProgram | null;
    private shaderProgramColorSelect!: WebGLProgram | null;

    constructor(
        rutaVertexMainShader: string, 
        rutaFragmentMainShader: string, 
        rutaVertexColorShader: string,
        rutaFragmentColorShader: string,
        context: WebGL2RenderingContext
    ) {
        super();
        this.gl = context;
        this.loadedPromise = (async () => {
            try {
                this.vertexShaderMainSource = await this.cargarFichero(rutaVertexMainShader);
                this.fragmentShaderMainSource = await this.cargarFichero(rutaFragmentMainShader);

                this.vertexShaderColorSource = await this.cargarFichero(rutaVertexColorShader);
                this.fragmentShaderColorSource = await this.cargarFichero(rutaFragmentColorShader);

                this.InitShaders(this.gl);
            } catch (error) {
                console.error("Error al cargar los archivos de shader:", error);
            }
        })();
    }

    override cargarFichero(filename: string): Promise<string> {
        return new Promise((resolve, reject) => {
            fetch(`/assets/Shaders/${filename}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.text();
                })
                .then(data => {
                    resolve(data);
                })
                .catch(error => {
                    console.error("Error al cargar el archivo:", error);
                    reject(error);
                });
        });
    }

    // Cargar shaders y devolverlo
    private CargarShader(type: any, sourceGLSL: string): any {
        const shader = this.gl.createShader(type);
        if (shader) {
            this.gl.shaderSource(shader, sourceGLSL);
            this.gl.compileShader(shader);
            if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
                console.log("Error al compilar shader: " + this.gl.getShaderInfoLog(shader))
                this.gl.deleteShader(shader);
                return null;
            }

        }
        return shader;
    }

    private async InitShaders(gl: WebGL2RenderingContext): Promise<any>  {
        // Codigo GLSL
        await this.loadedPromise;
        const vertexShader = this.CargarShader(this.gl.VERTEX_SHADER, this.vertexShaderMainSource);
        const fragmentShader = this.CargarShader(this.gl.FRAGMENT_SHADER, this.fragmentShaderMainSource);

        const vertexShaderColor = this.CargarShader(this.gl.VERTEX_SHADER, this.vertexShaderColorSource);
        const fragmentShaderColor = this.CargarShader(this.gl.FRAGMENT_SHADER, this.fragmentShaderColorSource);

        // Crear shader program main
        this.shaderProgramMain = gl.createProgram();
        if (this.shaderProgramMain !== null && vertexShader && fragmentShader) {
            gl.attachShader(this.shaderProgramMain, vertexShader);
            gl.attachShader(this.shaderProgramMain, fragmentShader);
            // Continúa con el resto del código aquí
            gl.linkProgram(this.shaderProgramMain);

            if (!gl.getProgramParameter(this.shaderProgramMain, gl.LINK_STATUS)) {
                alert(
                    "Unable to initialize the shader program: " +
                    gl.getProgramInfoLog(this.shaderProgramMain)
                );
                return null;
            }
        } else {
            throw new Error('No se pudo crear el programa de shaders');
        }

        // Crear shader program color select
        this.shaderProgramColorSelect = gl.createProgram();
        if(this.shaderProgramColorSelect !== null && vertexShaderColor && fragmentShaderColor) {
            gl.attachShader(this.shaderProgramColorSelect, vertexShaderColor);
            gl.attachShader(this.shaderProgramColorSelect, fragmentShaderColor);
            gl.linkProgram(this.shaderProgramColorSelect);

            if (!gl.getProgramParameter(this.shaderProgramColorSelect, gl.LINK_STATUS)) {
                alert(
                    "Unable to initialize the shader program: " +
                    gl.getProgramInfoLog(this.shaderProgramColorSelect)
                );
                return null;
            }
        } else {
            throw new Error('No se pudo crear el programa de shaders');
        }

        
        //gl.useProgram(this.shaderProgramColorSelect);
        gl.useProgram(this.shaderProgramMain);
    }

    public getShaderProgramMain(): WebGLProgram | null {
        return this.shaderProgramMain;
    }
    
    public getShaderProgramColorSelect(): WebGLProgram | null {
        return this.shaderProgramColorSelect;
    }

    public useProgramMain(gl: WebGL2RenderingContext): void {
        if (gl && this.shaderProgramMain) {
            gl.useProgram(this.shaderProgramMain);
        } else {
            console.error('No se puede usar el programa principal de shaders porque no se ha inicializado.');
        }
    }
    
    public useProgramColorSelect(gl: WebGL2RenderingContext): void {
        if (gl && this.shaderProgramColorSelect) {
            gl.useProgram(this.shaderProgramColorSelect);
        } else {
            console.error('No se puede usar el programa de selección de color porque no se ha inicializado.');
        }
    }

    public hola(){
        console.log("Hola");
    }
}