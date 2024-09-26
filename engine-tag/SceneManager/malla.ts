import { mat4, vec3 } from 'gl-matrix';
import { TEntidad } from './entidad';
import * as OBJ from "webgl-obj-loader";
import { ShaderService } from '../services/shader.service';

export class TMalla extends TEntidad {
    private OBJfile: string;
    private buffers: any;

    private rotationAngleX: number = 0;
    private rotationAngleY: number = 0;

    colorPickingFramebuffer: WebGLFramebuffer | null = null;
    colorPickingFramebufferWidth: number = 0;
    colorPickingFramebufferHeight: number = 0;

    private ID_malla: string = "";
    private color_malla: any;

    private recursoShader!: any;
    private shaderProgramMain!: WebGLProgram;
    private shaderProgramColorSelect!: WebGLProgram;

    constructor(OBJfile_param: string) {
        super();
        this.OBJfile = OBJfile_param;
        this.buffers = new OBJ.Mesh(this.OBJfile);
        this.ID_malla = "ID_malla";
        this.recursoShader = ShaderService.getInstance().getRecursoShader();
        this.shaderProgramMain = this.recursoShader.getShaderProgramMain();
        this.shaderProgramColorSelect = this.recursoShader.getShaderProgramColorSelect();
    }

    public getIDMalla(): string {
        return this.ID_malla;
    }

    public setIDMalla(id: string): void {
        this.ID_malla = id;
    }

    public getColorMalla(): any {
        return this.color_malla;
    }

    public setColorMalla(color: any): void {
        this.color_malla = color;
    }

    public limpiarBuffers(gl: WebGL2RenderingContext): void {
        if (this.buffers) {
            if (this.buffers.vertexBuffer) {
                gl.deleteBuffer(this.buffers.vertexBuffer);
            }
            if (this.buffers.textureBuffer) {
                gl.deleteBuffer(this.buffers.textureBuffer);
            }
            if (this.buffers.normalBuffer) {
                gl.deleteBuffer(this.buffers.normalBuffer);
            }
            if (this.buffers.indexBuffer) {
                gl.deleteBuffer(this.buffers.indexBuffer);
            }
            this.buffers = null; // Establecer buffers a null después de limpiarlos
        }
    }
    

    private InitBuffersMain(gl: WebGL2RenderingContext, buffers: any) {
        if (!buffers) return; // Verificar que los buffers no sean null
        OBJ.initMeshBuffers(gl, buffers);

        let shaderProgram = gl.getParameter(gl.CURRENT_PROGRAM);
        let vertexPositionAttributeLocation = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        let textureCoordAttributeLocation = gl.getAttribLocation(shaderProgram, "aTextureCoord");
        let normalCoordAttributeLocation = gl.getAttribLocation(shaderProgram, "aNormalCoord");

        gl.enableVertexAttribArray(vertexPositionAttributeLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertexBuffer);
        gl.vertexAttribPointer(
            vertexPositionAttributeLocation,
            buffers.vertexBuffer.itemSize,
            gl.FLOAT,
            false,
            0,
            0
        );

        gl.enableVertexAttribArray(textureCoordAttributeLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureBuffer);
        gl.vertexAttribPointer(
            textureCoordAttributeLocation,
            buffers.textureBuffer.itemSize,
            gl.FLOAT,
            false,
            0,
            0
        );

        gl.enableVertexAttribArray(normalCoordAttributeLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normalBuffer);
        gl.vertexAttribPointer(
            normalCoordAttributeLocation,
            buffers.normalBuffer.itemSize,
            gl.FLOAT,
            false,
            0,
            0
        );

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indexBuffer);
        return buffers;
    }

    private InitBuffersColor(gl: WebGL2RenderingContext, buffers: any) {
        if (!buffers) return; // Verificar que los buffers no sean null
        OBJ.initMeshBuffers(gl, buffers);
        
        let vertexPositionAttributeLocation = 0;
    
        gl.enableVertexAttribArray(vertexPositionAttributeLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertexBuffer);
        gl.vertexAttribPointer(
            vertexPositionAttributeLocation,
            buffers.vertexBuffer.itemSize,
            gl.FLOAT,
            false,
            0,
            0
        );
    
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indexBuffer);
    
        return buffers;
    }

    dibujar(
        gl: WebGL2RenderingContext,
        texture: any,
        camara: any,
        colorModelo: any,
        matrizTransformacion: any,
        isWall: boolean // Añadido
    ): void {
        if (!this.buffers) {
            return; // Salir temprano si los buffers no están inicializados
        }
    
        const draw = () => {
            if (!this.buffers) return; // Verificar nuevamente antes de dibujar
    
            this.dibujarMalla(
                gl,
                this.buffers,
                texture,
                camara,
                colorModelo,
                matrizTransformacion,
                isWall // Añadido
            );
    
            requestAnimationFrame(draw);
        };
    
        draw();
    }     

    public setRotationAngleY(angle: number): void {
        this.rotationAngleY = angle * (Math.PI / 180);// Convierte el ángulo de grados a radianes
    }

    public getRotationAngleY(): number {
        return this.rotationAngleY;
    }

    private dibujarMalla(
        gl: WebGL2RenderingContext,
        buffers: any,
        texture: any,
        camara: any,
        colorModelo: any,
        matrizTransformacion: mat4,
        isWall: boolean // Añadido
    ): void {
        if (!buffers) {
            return; // Salir temprano si los buffers no están inicializados
        }
    
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);
    
        const projectionMatrix = mat4.create();
        mat4.perspective(
            projectionMatrix,
            (45 * Math.PI) / 180,
            gl.canvas.width / gl.canvas.height,
            0.1,
            100.0
        );
    
        const modelViewMatrix = mat4.create();
    
        // Aplicar la rotación primero
        mat4.rotate(modelViewMatrix, modelViewMatrix, this.rotationAngleX, [1, 0, 0]);
        mat4.rotate(modelViewMatrix, modelViewMatrix, this.rotationAngleY, [0, 1, 0]);
    
        // Aplicar la matriz de transformación si existe
        if (matrizTransformacion) {
            mat4.multiply(modelViewMatrix, matrizTransformacion, modelViewMatrix);
        }
    
        const roundedViewMatrix = this.roundMatrix(camara.getViewMatrix());
        
        let shaderProgram = gl.getParameter(gl.CURRENT_PROGRAM);
        gl.uniformMatrix4fv(
            gl.getUniformLocation(shaderProgram, "uModelMatrix"),
            false,
            modelViewMatrix
        );
        gl.uniformMatrix4fv(
            gl.getUniformLocation(shaderProgram, "uViewMatrix"),
            false,
            roundedViewMatrix
        );
        gl.uniformMatrix4fv(
            gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
            false,
            projectionMatrix
        );
    
        // Establecer el uniforme uIsWall antes de dibujar
        const uIsWallLocation = gl.getUniformLocation(shaderProgram, "uIsWall");
        gl.uniform1i(uIsWallLocation, isWall ? 1 : 0);
    
        if (this.shaderProgramMain === shaderProgram) {
            this.InitBuffersMain(gl, this.buffers);
           
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.uniform1i(gl.getUniformLocation(shaderProgram, "uSampler"), 0);
        } else if (this.shaderProgramColorSelect === shaderProgram) {
            this.InitBuffersColor(gl, this.buffers);
            let colorLocation = gl.getUniformLocation(shaderProgram, 'uColor');
            gl.uniform4fv(colorLocation, colorModelo);
        }
    
        gl.drawElements(
            gl.TRIANGLES,
            buffers.indexBuffer.numItems,
            gl.UNSIGNED_SHORT,
            0
        );
    }    

    private roundMatrix(matrix: mat4): mat4 {
        let roundedMatrix = mat4.create();
        for (let i = 0; i < matrix.length; i++) {
            roundedMatrix[i] = parseFloat(matrix[i].toFixed(2));
        }
        return roundedMatrix;
    }
}
