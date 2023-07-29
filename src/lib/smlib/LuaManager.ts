import * as fengari from 'fengari-web';

export class LuaManager {
	private static registryLoaded = false;
	private static ACTOR_REGISTRY: Record<string, any>;
	static {
		this.loadRegistry();
	}

	private L;
	private onloadListeners: (() => void)[] = [];
	loaded;
	private resolve;
	constructor() {
		this.L = fengari.lauxlib.luaL_newstate();
		fengari.lualib.luaL_openlibs(this.L);
		fengari.lauxlib.luaL_requiref(
			this.L,
			fengari.to_luastring('js'),
			fengari.interop.luaopen_js,
			1
		);
		fengari.lua.lua_pop(this.L, 1);
		this.loaded = new Promise<void>((resolve) => (this.resolve = resolve));
		this.registerTypes();
	}

	private static async loadRegistry() {
		this.ACTOR_REGISTRY = {
			Actor: (await import('./Actor')).Actor,
			Sprite: (await import('./Sprite')).Sprite
		};
		this.registryLoaded = true;
	}

	private async registerTypes() {
		if (!LuaManager.registryLoaded) await LuaManager.loadRegistry();
		const luaState = this.L;
		const LuaTable: Record<string, () => object> = {};
		Object.keys(LuaManager.ACTOR_REGISTRY).forEach((name) => {
			LuaTable[name] = function () {
				console.log('creating table ' + name);
				const table = TArg(luaState, -1);
				console.log(table);
				table.Class = name;
				return table;
			};
		});
		PushGlobal(this.L, LuaTable, 'Def');
		this.resolve();
		this.onloadListeners.forEach((cb) => cb());
	}

	onload(cb: () => void) {
		this.onloadListeners.push(cb);
	}

	async run(code: string) {
		if (!this.loaded) return;

		// Compile the function
		const errStatus = fengari.lauxlib.luaL_loadbuffer(
			this.L,
			fengari.to_luastring(code),
			null,
			fengari.to_luastring('default.lua')
		);
		let response;
		if (errStatus === fengari.lua.LUA_ERRSYNTAX) {
			response = new SyntaxError(fengari.lua.lua_tojsstring(this.L, -1));
		} else {
			response = tojs(this.L, -1);
		}
		fengari.lua.lua_pop(this.L, 1);
		if (errStatus !== fengari.lua.LUA_OK) {
			throw response;
		}

		// Run the function
		const table = response();
		if (typeof table != 'object') {
			lua_error(this.L, 'invalid return: not an actor object');
		}

		// Create the actor
		const actor = await LuaManager.loadActor(table);
		return actor;
	}

	static async loadActor(table: Record<string, any>) {
		if (!LuaManager.registryLoaded) await LuaManager.loadRegistry();
		const actor = new LuaManager.ACTOR_REGISTRY[table.Class]();
		actor.loadFromTable(table);
		await actor.load();
		return actor;
	}
}

export function PushGlobal(L, obj: any, name: string) {
	fengari.interop.push(L, obj);
	fengari.lua.lua_setglobal(L, fengari.to_luastring(name));
}

export function SArg(L, arg: number): string {
	return fengari.lauxlib.luaL_checkstring(L, arg);
}
export function BIArg(L, arg: number): boolean {
	fengari.lauxlib.luaL_checkany(L, arg);
	if (fengari.lua.lua_type(L, arg) == fengari.lua.LUA_TNUMBER) {
		return fengari.lauxlib.lua_tointeger(L, arg) != 0;
	}

	return BArg(L, arg);
}
export function IArg(L, arg: number): number {
	return fengari.lauxlib.luaL_checkint(L, arg);
}
export function BArg(L, arg: number): boolean {
	fengari.lauxlib.luaL_checktype(L, arg, fengari.lua.LUA_TBOOLEAN);
	return !!fengari.lauxlib.lua_toboolean(L, arg);
}
export function FArg(L, arg: number): number {
	return fengari.lauxlib.luaL_checknumber(L, arg);
}
export function TArg(L, arg: number): Record<string, any> {
	fengari.lauxlib.luaL_checktype(L, arg, fengari.lua.LUA_TTABLE);
	return readTable(L, arg);
}

export function lua_error(L, error: string) {
	fengari.lua.lua_pushliteral(L, error);
	fengari.lua.lua_error(L);
}

export function tojs(L, idx: number) {
	if (fengari.lua.lua_type(L, idx) == fengari.lua.LUA_TTABLE) {
		return readTable(L, idx);
	}
	return fengari.interop.tojs(L, idx);
}

function readTable(L, arg: number) {
	const type = fengari.lua.lua_type(L, arg);
	if (type == fengari.lua.LUA_TTABLE) {
		const object: Record<string, any> = {};
		fengari.lua.lua_pushvalue(L, arg);
		// stack now contains: -1 => table
		fengari.lua.lua_pushnil(L);
		// stack now contains: -1 => nil; -2 => table
		while (fengari.lua.lua_next(L, -2)) {
			fengari.lua.lua_pushvalue(L, -2);
			object[fengari.lua.lua_tojsstring(L, -1)] = readTable(L, -2);
			fengari.lua.lua_pop(L, 2);
		}
		return object;
	} else if (type == fengari.lua.LUA_TNIL) {
		return null;
	} else {
		return fengari.interop.tojs(L, arg);
	}
}
