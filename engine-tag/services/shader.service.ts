import { TRecursoShader } from '../ResourceManager/recursoShader';

export class ShaderService {
	private static instance: ShaderService | null = null;
	recursoShader: TRecursoShader | null = null;

	private constructor() { }

	static getInstance(): ShaderService {
		if (!this.instance) {
			this.instance = new ShaderService();
		}
		return this.instance;
	}

	setRecursoShader(
		rutaVertexMainShader: string,
		rutaFragmentMainShader: string,
		rutaVertexColorShader: string,
		rutaFragmentColorShader: string,
		context: WebGL2RenderingContext
	) {
		this.recursoShader = new TRecursoShader(
			rutaVertexMainShader,
			rutaFragmentMainShader,
			rutaVertexColorShader,
			rutaFragmentColorShader,
			context
		);
	}

	getRecursoShader(): TRecursoShader | null {
		return this.recursoShader;
	}
}