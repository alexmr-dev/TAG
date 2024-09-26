import { TRecurso } from './recurso';

export class TRecursoTextura extends TRecurso {

    // Cargar la textura como fichero con fetch
    override cargarFichero(texture: string): Promise<Blob> {    // Para la carga de la textura. Devuelve el fichero
        // Atributos
        return new Promise((resolve, reject) => {
            fetch(`/assets/3D_Models/Texturas/${texture}.jpg`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.blob();
                })
                .then(blob => {
                    resolve(blob);
                })
                .catch(error => {
                    console.error("Error al cargar el archivo:", error);
                    reject(error);
                });
        });
    }

    // Cargar la textura en el contexto WebGL
    override async cargarTextura(gl: WebGL2RenderingContext, filename: string){
        // Cargar textura
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Atributos de la textura
        const level = 0;                    // Nivel de detalle de la imagen. 0 es el nivel base
        const internalFormat = gl.RGBA;     // Formato de los componentes de textura
        const width = 1;                    // Anchura de la textura
        const height = 1;                   // Altura de la textura
        const border = 0;                   // Siempre 0 
        const srcFormat = gl.RGBA;          // Formato de los datos de textura
        const srcType = gl.UNSIGNED_BYTE;   // Tipo de los datos de textura
        const pixel = new Uint8Array([10, 10, 10, 10]);     // Color azul 

        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);
        
        function isPowerOf2(value:any) {
            return (value & (value - 1)) === 0;
        }

        const image = new Image();
        this.cargarFichero(filename).then((blob) => {
            
            image.crossOrigin = "anonymous";
            image.onload = function () {
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);
    
                // Verificar si las dimensiones son potencias de 2
                if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
                    gl.generateMipmap(gl.TEXTURE_2D);
                } else {
                    // No es potencia de 2, desactivar mipmapping y establecer el env de textura a CLAMP_TO_EDGE
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                }
            };
            image.src = URL.createObjectURL(blob);
        });
        return texture;
    }   
}