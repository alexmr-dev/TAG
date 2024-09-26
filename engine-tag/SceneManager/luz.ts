
import { TEntidad } from './entidad';

export class TLuz extends TEntidad {
    private lightDirection: number[];
    private lightColor: number[];
    private lightIntensity: number;

    constructor(lightDirection:number[], lightColor:number[], lightIntensity:number) {
        super();
        this.lightDirection = lightDirection;
        this.lightColor = lightColor;
        this.lightIntensity = lightIntensity;
    }

    // Getters
    getLightDirection(): number[] {
        return this.lightDirection;
    }

    getLightColor(): number[] {
        return this.lightColor;
    }

    getLightIntensity(): number {
        return this.lightIntensity;
    }

    // Setters
    setLightDirection(lightDirection: number[]): void {
        this.lightDirection = lightDirection;
    }

    setLightColor(lightColor: number[]): void {
        this.lightColor = lightColor;
    }

    setLightIntensity(lightIntensity: number): void {
        this.lightIntensity = lightIntensity;
    }

    override dibujar(gl: WebGL2RenderingContext): void {
        // Obtén el programa de shaders actualmente en uso
        let shaderProgram = gl.getParameter(gl.CURRENT_PROGRAM);
        // Obtén las ubicaciones de las variables uniformes
        let uLightDirectionLocation = gl.getUniformLocation(shaderProgram, "uLightDirection");
        let uLightColorLocation = gl.getUniformLocation(shaderProgram, "uLightColor");
        let uLightIntensityLocation = gl.getUniformLocation(shaderProgram, "uLightIntensity");
    
        // Establece los valores de las variables uniformes
        gl.uniform3fv(uLightDirectionLocation, this.getLightDirection());
        gl.uniform3fv(uLightColorLocation, this.getLightColor());
        gl.uniform1f(uLightIntensityLocation, this.getLightIntensity());
    }
}
