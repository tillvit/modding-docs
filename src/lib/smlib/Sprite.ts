import { Texture } from 'pixi.js';
import { Sprite3D } from 'pixi3d/pixi7';
import { ActorMixin } from './Actor';
import { createActorLuaLib, getLoadedLib, type LuaManager } from './LuaManager';

export const SpriteMixin = (B: typeof Sprite3D) =>
	class extends ActorMixin(B) {
		constructor(...args: any[]) {
			super(...args);
			this.pixelsPerUnit = 1;
		}
		loadFromTable(luaMan: LuaManager, options: Record<string, any>) {
			super.loadFromTable(luaMan, options);
			console.log('Loading extra Sprite data');
			this.options = options;
			for (const [key, val] of Object.entries(options)) {
				if (key == 'Texture') this.texture = Texture.from(val);
			}
			// Flip texture on y axis becaues of coordinates
			this.texture.rotate = 8;
		}
	};

export const SpriteLib = () => {
	const ActorLib = getLoadedLib('Actor');
	return createActorLuaLib(Sprite, { ...ActorLib });
};

export class Sprite extends SpriteMixin(Sprite3D) {}
