import { Component, ViewChild, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { TMotorTAG } from './TMotorTAG/motorTAG';
import { TModelo } from './SceneManager/modelo';
import { TMalla } from './SceneManager/malla';
import { vec3 } from 'gl-matrix';
import { CaptureService } from './services/capture.service';
import { ShaderService } from './services/shader.service';
import { ThreeService } from './services/three.service';

@Component({
	selector: 'app-engine-tag',
	templateUrl: './engine-tag.component.html',
	styleUrls: ['./engine-tag.component.css']
})
export class EngineTAGComponent implements OnInit, AfterViewInit {
	@ViewChild('canvas') private canvasRef!: ElementRef<HTMLCanvasElement>;

	private motorTAG!: TMotorTAG;
	private camaraMotor!: any;
	private muebles_escena: any[] = [];
	private nombreMueble: string = "";
	private nombreMuebleDuplicado: string = "";
	private clickStartX: number = 0;
	private clickStartY: number = 0;
	private isDragging: boolean = false;
	private lastPosX: number = 0;
	private lastPosY: number = 0;
	private totalRotation: number = 0;
	private totalMovementX: number = 0;
	private totalMovementY: number = 0;
	private radius: number = 20;
	private minRadius: number = 5;
	private maxRadius: number = 30;

	private recursoShader!: any;
	private shaderProgramMain!: WebGLProgram;
	private shaderProgramColorSelect!: WebGLProgram;

	private selected_object_id = -1;

	private gl!: WebGL2RenderingContext;
	private selected_mueble_index: number = 0;

	constructor(private captureService: CaptureService, private threeService: ThreeService) { }

	ngOnInit() {
		this.captureService.captureRequested.subscribe(() => {
			this.capturarCanvas();
		});
		this.threeService.setEngineComponent(this);
	}

	async ngAfterViewInit(): Promise<void> {
		this.initMotor();
		this.recursoShader = ShaderService.getInstance().getRecursoShader();
		this.shaderProgramMain = this.recursoShader.getShaderProgramMain();
		this.shaderProgramColorSelect = this.recursoShader.getShaderProgramColorSelect();
	}

	private nombres_muebles: any[] = [];

	async initMotor(): Promise<void> {
		const canvas = this.canvasRef.nativeElement;

		// Crear el motor
		this.motorTAG = new TMotorTAG(canvas);  // Asignar al motorTAG de la clase
		await this.motorTAG.init();

		let glContext = canvas.getContext('webgl2', { preserveDrawingBuffer: true });
		if (!glContext) {
			throw new Error('WebGL 2.0 no es soportado por tu navegador');
		}
		this.gl = glContext;
		if (!this.gl) {
			console.error('Unable to initialize WebGL. Your browser may not support it.');
			return;
		}

		this.motorTAG.InitLights(this.gl);

		// Crear la cámara
		this.camaraMotor = this.motorTAG.crearCamara(true, 0.1, 1000.0, 45 * Math.PI / 180, canvas.width / canvas.height);

		// Crear el suelo y agregarlo al array
		const idSuelo = 0; // Puedes asignar un ID específico para el suelo si es necesario
		const colorSuelo = this.createColor(idSuelo); // Generar un color único para el suelo
		const suelo: TModelo = this.motorTAG.crearNodoModelo("suelo", "suelo", colorSuelo);
		this.muebles_escena.push(suelo);

		this.crearParedes();

		this.motorTAG.dibujar();

		this.setupEventListeners(canvas);
	}

	private crearParedes(): void {
		if (this.muebles_escena.length === 0) {
			console.error("No hay suelo en la escena para duplicar.");
			return;
		}

		const posiciones = [
			vec3.fromValues(0, 4.9, 9.8),
			vec3.fromValues(-9.8, 4.9, 0),
			vec3.fromValues(0, 4.9, -9.8),
			vec3.fromValues(9.8, 4.9, 0)
		];

		const rotaciones = [
			vec3.fromValues(-Math.PI / 2, Math.PI, 0), //va
			vec3.fromValues(Math.PI / 2, 0, -Math.PI / 2),
			vec3.fromValues(Math.PI / 2, Math.PI, 0), //va
			vec3.fromValues(Math.PI / 2, 0, Math.PI / 2)
		];

		posiciones.forEach((posicion, index) => {
			const idPared = index + 1;
			const colorPared = this.createColor(idPared); // Genera un color único basado en la longitud actual del array
			const nuevaPared: TModelo = this.motorTAG.crearNodoModelo("pared", "pared", colorPared);

			nuevaPared.setPosition(posicion);
			nuevaPared.setRotation(rotaciones[index]);

			this.muebles_escena.push(nuevaPared);
			//// console.log(this.muebles_escena);
		});
	}

	public crearModelo(nombreModelo: string) {
		this.nombreMueble = nombreModelo;
		// Crear el mueble
		const colorMueble = this.createColor(this.muebles_escena.length + 1); // Genera un color único basado en la longitud actual del array
		const nuevoMueble: TModelo = this.motorTAG.crearNodoModelo(`${this.nombreMueble}_${this.muebles_escena.length + 1}`, this.nombreMueble, colorMueble);
		this.nombres_muebles.push(nombreModelo);
		this.muebles_escena.push(nuevoMueble);
		// console.log(this.muebles_escena);
		this.motorTAG.dibujar();
	}
	private contadorDuplicados: { [nombre: string]: number } = {};

	public crearModeloDuplicado() {
		const nombreBase = this.nombreMuebleDuplicado;
		const index = this.contadorDuplicados[nombreBase] || 1;
		const nombreMueble = `${nombreBase}_${index}`;

		// Incrementar el contador de duplicados para este nombre base
		this.contadorDuplicados[nombreBase] = index + 1;

		// Crear el mueble
		const colorMueble = this.createColor(this.muebles_escena.length + index); // Genera un color único basado en la longitud actual del array
		const nuevoMueble: TModelo = this.motorTAG.crearNodoModelo(nombreMueble, nombreBase, colorMueble);
		this.nombres_muebles.push(nombreBase);
		this.muebles_escena.push(nuevoMueble);
		// console.log(this.muebles_escena);
		this.motorTAG.dibujar();
	}

	public borrarModelos(): void {
		if (this.muebles_escena.length > 5) {
			for (let i = 5; i < this.muebles_escena.length; i++) {
				const modeloAEliminar = this.muebles_escena[i];
				if (modeloAEliminar instanceof TModelo) {
					// Limpiar buffers de las mallas dentro de cada modelo
					const mallas = modeloAEliminar.getMallas();
					for (let malla of mallas) {
						if (malla instanceof TMalla) {
							malla.limpiarBuffers(this.gl);
						}
					}

					// Eliminar el nodo del árbol de escena a través de motorTAG
					this.motorTAG.eliminarNodoPorEntidad(modeloAEliminar);
				}
			}

			const elementosFijos = this.muebles_escena.slice(0, 5);
			this.muebles_escena = elementosFijos;
			this.nombres_muebles = [];

			// Limpiar recursos del gestor de recursos
			this.motorTAG.getGestorRecursos().limpiarRecursosModelos();

			this.motorTAG.dibujar();
		} else {
			// console.log("No hay muebles para borrar.");
		}
	}


	public getMueblesEscena(): string[] {
		return this.nombres_muebles; // Devolver el array de nombres de muebles
	}

	// Método para eliminar el mueble seleccionado
	public eliminarMuebleSeleccionado(): void {
		if (this.selected_mueble_index === -1 || this.selected_mueble_index < 5) {
			// console.log("No hay mueble seleccionado para eliminar o el mueble seleccionado no puede ser eliminado.");
			return;
		}

		const modeloAEliminar = this.muebles_escena[this.selected_mueble_index];

		if (modeloAEliminar instanceof TModelo) {
			const mallas = modeloAEliminar.getMallas();
			for (let malla of mallas) {
				if (malla instanceof TMalla) {
					malla.limpiarBuffers(this.gl);
				}
			}

			this.motorTAG.eliminarNodoPorEntidad(modeloAEliminar);

			this.muebles_escena.splice(this.selected_mueble_index, 1);

			// Eliminar el nombre correspondiente en nombres_muebles
			const nombreIndex = this.nombres_muebles.indexOf(modeloAEliminar.getName());
			if (nombreIndex !== -1) {
				this.nombres_muebles.splice(nombreIndex, 1);
			}

			// Ajustar el índice seleccionado si es necesario
			if (this.selected_mueble_index >= this.muebles_escena.length) {
				this.selected_mueble_index = this.muebles_escena.length - 1;
			}

			// Si no hay más muebles, resetear el índice seleccionado
			if (this.muebles_escena.length <= 5) {
				this.selected_mueble_index = -1;
			}
			this.motorTAG.dibujar();
		} 

	}

	public createColor(id: number): Float32Array {
		id = id * 1000000;
		var r, g, b, a;
		var red_bits = this.gl.getParameter(this.gl.RED_BITS);
		var green_bits = this.gl.getParameter(this.gl.GREEN_BITS);
		var blue_bits = this.gl.getParameter(this.gl.BLUE_BITS);
		var alpha_bits = this.gl.getParameter(this.gl.ALPHA_BITS);
		var total_bits = red_bits + green_bits + blue_bits + alpha_bits;
		var red_scale = Math.pow(2, red_bits);
		var green_scale = Math.pow(2, green_bits);
		var blue_scale = Math.pow(2, blue_bits);
		var alpha_scale = Math.pow(2, alpha_bits);
		var red_shift = Math.pow(2, green_bits + blue_bits + alpha_bits);
		var green_shift = Math.pow(2, blue_bits + alpha_bits);
		var blue_shift = Math.pow(2, alpha_bits);
		var color = new Float32Array(4);
		r = Math.floor(id / red_shift);
		id = id - (r * red_shift);
		g = Math.floor(id / green_shift);
		id = id - (g * green_shift);
		b = Math.floor(id / blue_shift);
		id = id - (b * blue_shift);
		a = id;
		color[0] = r / (red_scale - 1);
		color[1] = g / (green_scale - 1);
		color[2] = b / (blue_scale - 1);
		color[3] = a / (alpha_scale - 1);
		return color;
	}

	public generarJSON(): string {
		const mueblesEscenaSimplificados = this.muebles_escena.slice(5).map(mueble => {
			const radianes = mueble.rotation[1];
			const grados = radianes * (180 / Math.PI); // Convertir radianes a grados
			return {
				posicion: mueble.position,
				colorModelo: mueble.colorModelo,
				fichero: mueble.fichero,
				ID: mueble.recursoTextura?.ID,
				rotacion: grados // Usar grados en lugar de radianes
			};
		});
		return JSON.stringify(mueblesEscenaSimplificados);
	}

	public cargarEscenaJSON(json_file: string): void {

		this.borrarModelos();

		let mueblesEscena = JSON.parse(json_file);

		for (let [index, mueble] of mueblesEscena.entries()) {
			const colorMueble = Object.values(mueble.colorModelo) as vec3;

			const nuevoMueble: TModelo = this.motorTAG.crearNodoModelo(`${mueble.fichero}_${index + 1}`, mueble.fichero, colorMueble);
			const position = Object.values(mueble.posicion) as vec3;
			const rotation = mueble.rotacion;
			// console.log("Rotacionm: ", rotation);
			nuevoMueble.setPosition(position);
			nuevoMueble.setRotationY(rotation);
			this.muebles_escena.push(nuevoMueble);
			this.nombres_muebles.push(mueble.fichero);

		}
		this.motorTAG.getGestorRecursos().limpiarRecursosModelos();
		this.motorTAG.dibujar();
	}

	public capturarCanvas(): void {
		const canvas = this.canvasRef.nativeElement;
		if (!canvas) {
			return;
		}

		window.requestAnimationFrame(() => {
			canvas.toBlob((blob) => {
				if (blob) {
					// console.log('Blob creado correctamente.');
					const url = URL.createObjectURL(blob);
					const link = document.createElement('a');
					link.href = url;
					link.download = 'captura.png'; // Nombre del archivo de salida
					link.click();
					URL.revokeObjectURL(url); // Limpia la memoria después de descargar
				} else {
					// console.log('No se pudo crear el blob.');
					// console.log(blob);
				}
			});
		});
	}

	public capturarCanvasEscena(): Promise<string> {
		return new Promise((resolve, reject) => {
			const canvas = this.canvasRef.nativeElement;
			if (!canvas) {
				reject('No se encontró el elemento canvas.');
				return;
			}
			const base64data = canvas.toDataURL('image/jpeg', 0.5); // Reducir la calidad a 0.5
			if (base64data) {
				resolve(base64data);
			} else {
				reject('No se pudo capturar la imagen como Base64.');
			}
		});
	}



	public colorsAreSimilar(color1: Uint8Array, color2: Uint8Array): boolean {
		const threshold = 10; // Umbral de diferencia permitido
		for (let i = 0; i < 4; i++) {
			if (Math.abs(color1[i] - color2[i]) > threshold) {
				return false; // Si la diferencia en cualquier componente es mayor que el umbral, los colores no son similares
			}
		}
		return true; // Si la diferencia en todos los componentes es menor que el umbral, los colores son similares
	}

	private convertColorToId(r: number, g: number, b: number, a: number): number {
		return r << 16 | g << 8 | b;
	}

	//----------------------------------------------MOVIMIENTO CAMARA----------------------------------------------
	private setupEventListeners(canvas: HTMLCanvasElement): void {
		let cursorState = 'default'; // Para rastrear el estado actual del cursor

		canvas.addEventListener('mousedown', (event: MouseEvent) => {
			this.clickStartX = event.clientX;
			this.clickStartY = event.clientY;
			this.isDragging = true;
			this.lastPosX = event.clientX;
			this.lastPosY = event.clientY;
		});

		canvas.addEventListener('click', (event: MouseEvent) => {
			this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
			this.recursoShader.useProgramColorSelect(this.gl);

			const rect = canvas.getBoundingClientRect();
			const x = event.clientX - rect.left;
			const y = event.clientY - rect.top;
			let mouse_y = canvas.clientHeight - y;
			let mouse_x = x;

			requestAnimationFrame(() => {
				const pixel = new Uint8Array(4);
				this.gl.readPixels(mouse_x, mouse_y, 1, 1, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixel);
				this.selected_object_id = this.convertColorToId(pixel[0], pixel[1], pixel[2], pixel[3]);

				this.selected_mueble_index = -1;
				for (let i = 0; i < this.muebles_escena.length; i++) {
					const mueble = this.muebles_escena[i];
					const muebleColor = mueble.getColor();
					if (this.colorsAreSimilar(pixel, muebleColor)) {
						this.selected_mueble_index = i;
						this.nombreMuebleDuplicado = mueble.getName();
						break;
					}
				}
				if (this.selected_mueble_index > 4) {
					this.threeService.controlesMueble("nombreObjetoClickeado");
				} else {
					this.threeService.controlesMueble(null);
				}
				this.recursoShader.useProgramMain(this.gl);
				this.motorTAG.dibujar();
			});
		});

		canvas.addEventListener('contextmenu', (event) => {
			event.preventDefault();
		});

		canvas.addEventListener('wheel', (event: WheelEvent) => {
			const delta = event.deltaY * 0.01;
			this.zoom_camara(delta);
			this.lastPosX = event.clientX;
			this.lastPosY = event.clientY;
			event.preventDefault();
		});

		canvas.addEventListener('mousemove', (event: MouseEvent) => {
			const rect = canvas.getBoundingClientRect();
			const x = event.clientX - rect.left;
			const y = event.clientY - rect.top;
			let mouse_y = canvas.clientHeight - y;
			let mouse_x = x;

			const pixel = new Uint8Array(4);
			this.gl.readPixels(mouse_x, mouse_y, 1, 1, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixel);

			const newCursorState = (pixel[0] !== 0 || pixel[1] !== 0 || pixel[2] !== 0 || pixel[3] !== 0) ? 'pointer' : 'default';
			if (newCursorState !== cursorState) {
				cursorState = newCursorState;
				canvas.style.cursor = cursorState;
			}

			if (this.isDragging) {
				const deltaX = event.clientX - this.lastPosX;
				const deltaY = event.clientY - this.lastPosY;

				if (this.selected_mueble_index > 4) {
					const mueble = this.muebles_escena[this.selected_mueble_index];
					const sensitivityX = 0.015;
					const sensitivityY = 0.02;

					// Obtener las direcciones de la cámara
					const cameraDirection = vec3.subtract(vec3.create(), this.camaraMotor.getLookAt(), this.camaraMotor.getPosition());
					const upVector = vec3.fromValues(0, 1, 0);
					const rightVector = vec3.cross(vec3.create(), cameraDirection, upVector);
					vec3.normalize(rightVector, rightVector);

					// Vector perpendicular a rightVector en el plano XZ (utilizando la componente Z del cameraDirection)
					const forwardVector = vec3.fromValues(cameraDirection[0], 0, cameraDirection[2]);
					vec3.normalize(forwardVector, forwardVector);

					const movementVector = vec3.create();
					vec3.scaleAndAdd(movementVector, movementVector, rightVector, deltaX * sensitivityX);
					vec3.scaleAndAdd(movementVector, movementVector, forwardVector, -deltaY * sensitivityY);
					movementVector[1] = 0; // Asegurarse de no mover en el eje Y

					let position = mueble.getPosition();
					vec3.add(position, position, movementVector);

					// Limitar el movimiento del mueble dentro de un rango específico
					position[0] = Math.max(-9, Math.min(9, position[0]));
					position[2] = Math.max(-9, Math.min(9, position[2]));

					mueble.setPosition(position);
					this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
				} else {
					if (event.buttons === 2) {
						this.rotacion_libre(deltaX, deltaY);
					} else if (event.buttons === 1) {
						this.movimiento_libre(deltaX, deltaY);
					}
					this.lastPosX = event.clientX;
					this.lastPosY = event.clientY;
					this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
				}
			}
			this.lastPosX = event.clientX;
			this.lastPosY = event.clientY;
		});

		window.addEventListener('mouseup', () => {
			this.isDragging = false;
			this.totalMovementX = 0;
			this.totalMovementY = 0;
		});
	}

	//---------------------------------------------------------METODOS DE CÁMARA-------------------------------------------------------
	zoom_camara(delta: number): void {
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

		this.radius += delta;
		this.radius = Math.max(this.minRadius, Math.min(this.radius, this.maxRadius));

		const cameraDirection = vec3.subtract(vec3.create(), this.camaraMotor.getLookAt(), this.camaraMotor.getPosition());
		vec3.normalize(cameraDirection, cameraDirection);
		const newPosition = vec3.scaleAndAdd(vec3.create(), this.camaraMotor.getLookAt(), cameraDirection, -this.radius);
		this.camaraMotor.setPosition(newPosition);
	}

	movimiento_libre(deltaX: number, deltaY: number): void {
		const sensitivity = 0.02;
		const cameraDirection = vec3.subtract(vec3.create(), this.camaraMotor.getLookAt(), this.camaraMotor.getPosition());
		const upVector = vec3.fromValues(0, 1, 0);
		const rightVector = vec3.cross(vec3.create(), cameraDirection, upVector);
		const upVectorAdjusted = vec3.cross(vec3.create(), rightVector, cameraDirection);
		vec3.normalize(rightVector, rightVector);
		vec3.normalize(upVectorAdjusted, upVectorAdjusted);

		const movementVector = vec3.create();
		vec3.scaleAndAdd(movementVector, movementVector, rightVector, -deltaX * sensitivity);
		vec3.scaleAndAdd(movementVector, movementVector, upVectorAdjusted, deltaY * sensitivity);

		const newPosition = vec3.create();
		vec3.add(newPosition, this.camaraMotor.getPosition(), movementVector);
		if (newPosition[1] < 1) {
			newPosition[1] = 1
		}

		this.camaraMotor.setPosition(newPosition);

		const newLookAt = vec3.create();
		vec3.add(newLookAt, this.camaraMotor.getLookAt(), movementVector);
		if (newLookAt[1] < 1) {
			newLookAt[1] = 1
		}
		this.camaraMotor.setLookAt(newLookAt);
	}

	movimiento_orbital(deltaX: number): void {
		const sensitivity = 0.005;
		const angle = deltaX * sensitivity;
		//this.camaraMotor.rotateY(angle);
		this.totalRotation += angle * 57;
		if (this.totalRotation > 360 || this.totalRotation < -360) {
			this.totalRotation = 0;
		}
		this.camaraMotor.updateOrbitPosition(angle, this.radius, this.radius / 2);
	}

	rotacion_libre(deltaX: number, deltaY: number): void {
		const sensitivity = 0.025;
		const cameraDirection = vec3.subtract(vec3.create(), this.camaraMotor.getLookAt(), this.camaraMotor.getPosition());
		const upVector = vec3.fromValues(0, 1, 0);
		const rightVector = vec3.cross(vec3.create(), cameraDirection, upVector);
		const upVectorAdjusted = vec3.cross(vec3.create(), rightVector, cameraDirection);
		vec3.normalize(rightVector, rightVector);
		vec3.normalize(upVectorAdjusted, upVectorAdjusted);
		const movementVector = vec3.scale(vec3.create(), rightVector, -deltaX * sensitivity);
		vec3.add(cameraDirection, cameraDirection, movementVector);
		vec3.scaleAndAdd(movementVector, movementVector, upVectorAdjusted, deltaY * sensitivity);
		const newPosition = vec3.scaleAndAdd(vec3.create(), this.camaraMotor.getLookAt(), cameraDirection, -this.radius);
		if (newPosition[1] < 0.25) newPosition[1] = 0.25;
		vec3.add(newPosition, this.camaraMotor.getPosition(), movementVector);

		vec3.normalize(cameraDirection, cameraDirection);
		if (newPosition[1] < 1) {
			newPosition[1] = 1
		}
		this.camaraMotor.setPosition(newPosition);
	}

	resetear_mov_camara(): void {
		this.camaraMotor.setPosition(vec3.fromValues(12, 5, -12));
		this.camaraMotor.setLookAt([0, 0, 0]);
		this.camaraMotor.setUp([0, 1, 0]);
	}

	public rotarMuebleSeleccionado(angle: number): void {
		if (this.selected_mueble_index === -1) {
			return;
		}
		const modeloARotar = this.muebles_escena[this.selected_mueble_index];
		if (modeloARotar instanceof TModelo) {
			modeloARotar.setRotationY(angle); // Ajusta la rotación en Y del modelo
			// Luego de rotar el modelo, necesitas redibujar la escena
			this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
		}
	}
}