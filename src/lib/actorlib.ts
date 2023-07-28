import * as fengari from 'fengari';

const luaconf = fengari.luaconf;
const lua = fengari.lua;
const lauxlib = fengari.lauxlib;
const lualib = fengari.lualib;

const L = lauxlib.luaL_newstate();

lualib.luaL_openlibs(L);

function l_sin(L) {
	const d = lua_tonumber(L, 1); /* get argument */
	lua_pushnumber(L, sin(d)); /* push result */
	return 1; /* number of results */
}

lualua_pushjsfunction;

module.exports.L = L;
