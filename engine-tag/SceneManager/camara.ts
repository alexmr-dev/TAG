import { mat4, vec3 } from 'gl-matrix';
import { TEntidad } from './entidad'; // Asegúrate de que la ruta de importación sea correcta

export class TCamara extends TEntidad {
    private esPerspectiva: boolean;
    private cercano: number;
    private lejano: number;
    private angle: number = 0;
    private fov: number; // Campo de visión para la cámara perspectiva
    private aspectRatio: number; // Relación de aspecto para la cámara perspectiva

    private _projectionMatrix: mat4 = mat4.create();
    private _viewMatrix: mat4 = mat4.create();
    private _position: vec3 = vec3.create(); // Posición de la cámara
    private _lookAt: vec3 = vec3.create(); // Punto al que mira la cámara
    private _up: vec3 = vec3.fromValues(0, 1, 0); // Vector 'up'

    constructor(esPerspectiva: boolean, cercano: number, lejano: number, fov: number, aspectRatio: number) {
        super(); // Llama al constructor de TEntidad si es necesario
        this.esPerspectiva = esPerspectiva;
        this.cercano = cercano;
        this.lejano = lejano;
        this.fov = fov;
        this.aspectRatio = aspectRatio;

        this.calculateProjectionMatrix();
        this.calculateViewMatrix();
    }

    private roundMatrix(matrix: mat4, decimals: number = 2): mat4 {
        let roundedMatrix = mat4.create();
        for (let i = 0; i < matrix.length; i++) {
            roundedMatrix[i] = parseFloat(matrix[i].toFixed(decimals));
        }
        return roundedMatrix;
    }
    
    calculateProjectionMatrix(): void {
        if (this.esPerspectiva) {
            mat4.perspective(this._projectionMatrix,
                this.fov, // Campo de visión en radianes
                this.aspectRatio, // Relación de aspecto
                this.cercano, // Plano cercano
                this.lejano); // Plano lejano
        } else {
            // Implementar aquí la proyección ortográfica si es necesaria
            mat4.ortho(this._projectionMatrix,
                -this.aspectRatio, // izquierda
                this.aspectRatio, // derecha
                -1, // abajo
                1, // arriba
                this.cercano, // cerca
                this.lejano); // lejos
        }
        this._projectionMatrix = this.roundMatrix(this._projectionMatrix);
    }

    calculateViewMatrix(): void {
        mat4.lookAt(this._viewMatrix,   // Matriz de vista
                    this._position,     // posición de la cámara
                    this._lookAt,       // punto al que mira la cámara
                    this._up);          // vector up
                    this._projectionMatrix = this.roundMatrix(this._projectionMatrix); //Redondear los valores
    }

    // Métodos de acceso y modificación para la posición y el punto de mira
    setPosition(position: vec3): void {
        vec3.copy(this._position, position);
        this.calculateViewMatrix();
    }

    setLookAt(lookAt: vec3): void {
        vec3.copy(this._lookAt, lookAt);
        this.calculateViewMatrix();
    }

    setUp(up: vec3): void {
        vec3.copy(this._up, up);
        this.calculateViewMatrix();
    }

    getProjectionMatrix(): mat4 {
        return this._projectionMatrix;
    }

    getViewMatrix(): mat4 {
        return this._viewMatrix;
    }

    getPosition(): vec3 {
        return this._position;
    }

    getLookAt(): vec3 {
        return this._lookAt;
    }

    getUp(): vec3 {
        return this._up;
    }

    rotateX(angle: number): void {
        const rotationMatrix = mat4.create();
        mat4.rotateX(rotationMatrix, rotationMatrix, angle);
        
        const direction = vec3.create();
        vec3.sub(direction, this._lookAt, this._position);
        vec3.transformMat4(direction, direction, rotationMatrix);
        vec3.add(this._lookAt, this._position, direction);
        
        this.calculateViewMatrix();
    }

    // Método para rotar la cámara alrededor del eje Y
    rotateY(angle: number): void {
        const rotationMatrix = mat4.create();
        mat4.rotateY(rotationMatrix, rotationMatrix, angle);
        
        const direction = vec3.create();
        vec3.sub(direction, this._lookAt, this._position);
        vec3.transformMat4(direction, direction, rotationMatrix);
        vec3.add(this._lookAt, this._position, direction);
        
        this.calculateViewMatrix();
    }

    // Método para actualizar la posición orbital de la cámara
    updateOrbitPosition(angleIncrement: number, radius: number, fixedHeight: number): void {
        this.angle += angleIncrement;  // Incrementa el ángulo actual por un pequeño valor

        // Calcula las nuevas coordenadas x y z usando trigonometría
        const x = radius * Math.cos(this.angle);
        const z = radius * Math.sin(this.angle);
        const y = fixedHeight;  // Altura fija

        // Establece la nueva posición de la cámara
        this.setPosition(vec3.fromValues(x, y, z));

        // La cámara siempre mira al centro de la escena, que es (0, 0, 0)
        this.setLookAt(this._lookAt);

        // Asegura que la cámara esté mirando hacia el centro desde una altura fija
        this.setUp(vec3.fromValues(0, 1, 0));  // Asegura que el up vector es 'y' positivo
    }
    // Método dibujar para TCamara no hace nada porque una cámara no se dibuja a sí misma
    // Pero la clase es abstracta, así que debemos implementarlo
    dibujar(gl: WebGL2RenderingContext, camara:any): void {
        // La cámara no se dibuja a sí misma, pero podría usar esto para configurar 
        // la matriz de proyección y de vista en el shader, por ejemplo.
    }

}