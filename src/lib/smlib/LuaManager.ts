import * as fengari from 'fengari-web';
import { Actor, ActorMixin } from './Actor';
import { Sprite } from './Sprite';

export const ACTOR_REGISTRY: Record<string, ReturnType<typeof ActorMixin>> = {
	Actor,
	Sprite
};

export class LuaManager {
	L;
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
		this.registerTypes();
	}

	private async registerTypes() {
		const luaState = this.L;
		const LuaTable: Record<string, () => object> = {};
		Object.keys(ACTOR_REGISTRY).forEach((name) => {
			LuaTable[name] = function () {
				console.log('creating table ' + name);
				const table = TArg(luaState, -1);
				console.log(table);
				table.Class = name;
				return table;
			};
		});
		PushGlobal(this.L, LuaTable, 'Def');
	}

	compile(code: string) {
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
		return response;
	}

	async run(code: string) {
		const response = this.compile(code);

		// Run the function
		const table = response();
		if (typeof table != 'object') {
			return;
		}

		// Create the actor
		const actor = await this.loadActor(table);
		return actor;
	}

	async loadActor(table: Record<string, any>) {
		const actor = new ACTOR_REGISTRY[table.Class]();
		actor.loadFromTable(this, table);
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
