import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { EngineTAGComponent } from '../engine-tag.component';


@Injectable({
	providedIn: 'root'
})
export class ThreeService {
	private _engineComponent: EngineTAGComponent | null = null;


	private _objClickeadoSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
	public objClickeado$: Observable<string | null> = this._objClickeadoSubject.asObservable();

	private _clicFueraSubject: Subject<void> = new Subject<void>();

	public clicFuera$: Observable<void> = this._clicFueraSubject.asObservable();

	public emitObjClickeado(nombreObjeto: string | null): void {
		this._objClickeadoSubject.next(nombreObjeto);
	}

	public emitClicFuera(): void {
		this._clicFueraSubject.next();
	}

	controlesMueble(nombreObjeto: string | null) {
		if (nombreObjeto) {
			this.emitObjClickeado(nombreObjeto);
		} else {
			this.emitClicFuera();
		}
	}


	setEngineComponent(engineComponent: EngineTAGComponent): void {
		this._engineComponent = engineComponent;
	}

	cargarModelo(nombreModelo: string): void {
		if (this._engineComponent) {
			this._engineComponent.crearModelo(nombreModelo);
		} else {
			console.error('EngineTAGComponent no ha sido establecido en ThreeService.');
		}
	}
	duplicarModelo() {
		if (this._engineComponent) {
			this._engineComponent.crearModeloDuplicado();
		} else {
			console.error('EngineTAGComponent no ha sido establecido en ThreeService.');
		}

	}
	borrarMueble() {
		if (this._engineComponent) {
			this._engineComponent.eliminarMuebleSeleccionado();
		} else {
			console.error('EngineTAGComponent no ha sido establecido en ThreeService.');
		}
	}

	borrarMueblesEscena() {
		if (this._engineComponent) {
			this._engineComponent.borrarModelos();
		} else {
			console.error('EngineTAGComponent no ha sido establecido en ThreeService.');
		}
	}
	// Método para obtener los muebles de la escena
	getMueblesEscena(): string[] {
		if (this._engineComponent) {
			// console.log(this._engineComponent.getMueblesEscena());
			return this._engineComponent.getMueblesEscena();
		} else {
			// console.log("Error: EngineTAGComponent no ha sido establecido en ThreeService.");
			return [];
		}
	}


	rotarMuebleService(angulo: number) {
		if (this._engineComponent) {
			this._engineComponent.rotarMuebleSeleccionado(angulo);
		} else {
			console.error('EngineTAGComponent no ha sido establecido en ThreeService.');
		}
	}

	// Método para generar un JSON de la escena
	generarJSON() {
		if (this._engineComponent) {
			return this._engineComponent.generarJSON();
		} else {
			console.error('EngineTAGComponent no ha sido establecido en ThreeService.');
			return null;
		}
	}

	capturarCanvas() {
		if (this._engineComponent) {
			this._engineComponent.capturarCanvas();
		} else {
			console.error('EngineTAGComponent no ha sido establecido en ThreeService.');
		}
	}

	capturarCanvasEscena(){
		if (this._engineComponent) {
			return this._engineComponent.capturarCanvasEscena();
		} else {
			console.error('EngineTAGComponent no ha sido establecido en ThreeService.');
			return null;
		}
	
	}

	cargarEscena(json_file:string){
		if (this._engineComponent) {
			this._engineComponent.cargarEscenaJSON(json_file);
		} else {
			console.error('EngineTAGComponent no ha sido establecido en ThreeService.');
		}
	}

}
