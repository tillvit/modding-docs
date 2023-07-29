import { Texture } from 'pixi.js';
import { Sprite3D } from 'pixi3d/pixi7';
import { ActorMixin } from './Actor';

export const SpriteMixin = (B: typeof Sprite3D) =>
	class extends ActorMixin(B) {
		constructor(...args: any[]) {
			super(...args);
		}
		loadFromTable(options: Record<string, any>) {
			super.loadFromTable(options);
			console.log('Loading extra Sprite data');
			this.options = options;
			for (const [key, val] of Object.entries(options)) {
				if (key == 'Texture') this.texture = Texture.from(val);
			}
			this.metatable = this.exportMetatable();
		}

		exportMetatable() {
			return {
				...super.exportMetatable()
			};
		}
	};

export class Sprite extends SpriteMixin(Sprite3D) {}
