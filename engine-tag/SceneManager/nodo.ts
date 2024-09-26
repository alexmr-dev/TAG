import { mat4, vec3 } from 'gl-matrix';
import { TEntidad } from './entidad';

export class TNodo {
    entidad: TEntidad | null = null;
    hijos: TNodo[] = [];
    padre: TNodo | null = null;
    _traslacion: vec3 = vec3.create();
    _rotacion: vec3 = vec3.create();
    _escalado: vec3 = vec3.fromValues(1, 1, 1);
    _matrizTransformacion: mat4 = mat4.create();

    addHijo(hijo: TNodo): number {
        this.hijos.push(hijo);
        hijo.padre = this;
        return this.hijos.length;
    }

    remHijo(hijo: TNodo): boolean {
        const index = this.hijos.indexOf(hijo);
        if (index !== -1) {
            hijo.padre = null;
            this.hijos.splice(index, 1);
            return true;
        }
        return false;
    }

    removerHijoPorEntidad(entidad: TEntidad): boolean {
        const index = this.hijos.findIndex(hijo => hijo.entidad === entidad);
        if (index !== -1) {
            const hijo = this.hijos[index];
            hijo.padre = null;
            this.hijos.splice(index, 1);
            
            return true;
        }
        return false;
    }

    setEntidad(entidad: TEntidad): void {
        this.entidad = entidad;
    }

    getEntidad(): TEntidad | null {
        return this.entidad;
    }

    getPadre(): TNodo | null {
        return this.padre;
    }

    trasladar(traslacion: vec3): void {
        vec3.add(this._traslacion, this._traslacion, traslacion);
        this.actualizarMatrizTransformacion();
    }

    rotar(rotacion: vec3): void {
        vec3.add(this._rotacion, this._rotacion, rotacion);
        this.actualizarMatrizTransformacion();
    }

    escalar(escalado: vec3): void {
        vec3.multiply(this._escalado, this._escalado, escalado);
        this.actualizarMatrizTransformacion();
    }

    get traslacion(): vec3 {
        return this._traslacion;
    }

    set traslacion(value: vec3) {
        this._traslacion = value;
        this.actualizarMatrizTransformacion();
    }

    get rotacion(): vec3 {
        return this._rotacion;
    }

    set rotacion(value: vec3) {
        this._rotacion = value;
        this.actualizarMatrizTransformacion();
    }

    get escalado(): vec3 {
        return this._escalado;
    }

    set escalado(value: vec3) {
        this._escalado = value;
        this.actualizarMatrizTransformacion();
    }

    get matrizTransformacion(): mat4 {
        return this._matrizTransformacion;
    }

    set matrizTransformacion(matriz: mat4) {
        mat4.copy(this._matrizTransformacion, matriz);
    }

    actualizarMatrizTransformacion(): void {
        let matrizAux = mat4.create();
        mat4.translate(matrizAux, matrizAux, this.traslacion);
        mat4.rotateX(matrizAux, matrizAux, this.gradosARadianes(this.rotacion[0]));
        mat4.rotateY(matrizAux, matrizAux, this.gradosARadianes(this.rotacion[1]));
        mat4.rotateZ(matrizAux, matrizAux, this.gradosARadianes(this.rotacion[2]));
        mat4.scale(matrizAux, matrizAux, this.escalado);
        this.matrizTransformacion = matrizAux;
    }

    public recorrer(gl: WebGL2RenderingContext, callback?: (nodo: TNodo, gl: WebGL2RenderingContext) => void): void {
        if (callback) {
            callback(this, gl);
        } else {
            this.getEntidad()?.dibujar(gl);
        }
        if (this.hijos.length > 0) {
            for (let hijo of this.hijos) {
                hijo.recorrer(gl, callback);
            }
        }
    }
    

    private gradosARadianes(grados: number): number {
        return grados * Math.PI / 180;
    }
}