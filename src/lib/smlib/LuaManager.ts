// import { lua, to_luastring } from 'fengari';
import * as fengari from 'fengari-web';
import { createActor } from './Actor';

export function interopTest() {
	registerTypes();
	const actor = fengari.load(`
  local obj = Def.Actor{
    OnCommand=function(self)
    end,
    InitCommand=function(self)
    end,
  }
  return obj
  `)();
	console.log(actor);
}

function wrap(func: (options: Record<string, any>) => object) {
	return function () {
		// check arg is table
		if (!fengari.lua.lua_istable(fengari.L, -1)) {
			error(fengari.L, 'incorrect arg');
		}
		return func(read(fengari.L, -1));
	};
}

function error(L, error: string) {
	fengari.lua.lua_pushliteral(L, error);
	fengari.lua.lua_error(L);
}

export function registerTypes() {
	const Def = {
		Actor: wrap(createActor)
	};
	fengari.interop.push(fengari.L, Def);
	fengari.lua.lua_setglobal(fengari.L, fengari.to_luastring('Def'));
}
export const read = (L, index) => {
	const type = fengari.lua.lua_type(L, index);
	if (type == fengari.lua.LUA_TTABLE) {
		const object: Record<string, any> = {};
		fengari.lua.lua_pushvalue(L, index);
		// stack now contains: -1 => table
		fengari.lua.lua_pushnil(L);
		// stack now contains: -1 => nil; -2 => table
		while (fengari.lua.lua_next(L, -2)) {
			fengari.lua.lua_pushvalue(L, -2);
			object[fengari.lua.lua_tojsstring(L, -1)] = read(L, -2);
			fengari.lua.lua_pop(L, 2);
		}
		return object;
	} else if (type == fengari.lua.LUA_TNIL) {
		return null;
	} else {
		return fengari.interop.tojs(L, index);
	}
};
