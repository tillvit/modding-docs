import * as fengari from 'fengari-web';
import { Actor, ActorLib, ActorMixin } from './Actor';
import { ActorUtilLib } from './ActorUtil';

interface RegistryEntry {
	class: ReturnType<typeof ActorMixin>;
	lib: () => object;
	loadedLib?: object;
}

export const ACTOR_REGISTRY: Record<string, RegistryEntry> = {
	Actor: {
		class: Actor,
		lib: ActorLib
	}
};

export const GLOBAL_LIBRARIES: Record<string, () => object> = {
	ActorUtil: ActorUtilLib
};

function loadLib(name: string) {
	ACTOR_REGISTRY[name].loadedLib = ACTOR_REGISTRY[name].lib();
}

export function getLoadedLib(name: string) {
	if (!ACTOR_REGISTRY[name]) {
		console.warn("Couldn't locate base Actor class " + name);
		return {};
	}
	if (ACTOR_REGISTRY[name].loadedLib) return ACTOR_REGISTRY[name].loadedLib!;
	loadLib(name);
	return ACTOR_REGISTRY[name].loadedLib!;
}

Object.keys(ACTOR_REGISTRY).forEach((lib) => loadLib(lib));

const decoder = new TextDecoder();

export class LuaManager {
	private L;
	private buff: string[] = [];
	private lua_writestring = (buf: Uint8Array) => {
		let str;
		try {
			/* If the string is valid utf8, then we can use to_jsstring */
			str = fengari.to_jsstring(buf);
		} catch (e) {
			/* otherwise push copy of raw array */
			const copy = new Uint8Array(buf.length);
			copy.set(buf);
			str = decoder.decode(copy);
		}
		this.buff.push(str);
	};
	private lua_writeline = () => {
		this.onLog(this.buff.join(' '));
		this.buff = [];
	};

	onLog = (msg: string) => {
		console.log(msg);
	};

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

		// replace print
		fengari.lua.lua_register(this.L, 'print', () => {
			const L = this.L;
			const n = fengari.lua.lua_gettop(L); /* number of arguments */
			fengari.lua.lua_getglobal(L, fengari.to_luastring('tostring', true));
			for (let i = 1; i <= n; i++) {
				fengari.lua.lua_pushvalue(L, -1); /* function to be called */
				fengari.lua.lua_pushvalue(L, i); /* value to print */
				fengari.lua.lua_call(L, 1, 1);
				const s = fengari.lua.lua_tolstring(L, -1);
				if (s === null)
					return fengari.lua.luaL_error(
						L,
						fengari.to_luastring("'tostring' must return a string to 'print'")
					);
				this.lua_writestring(s);
				fengari.lua.lua_pop(L, 1);
			}
			this.lua_writeline();
			return 0;
		});

		this.loadGlobalLibraries();
		this.registerTypes();
	}

	private loadGlobalLibraries() {
		for (const lib in GLOBAL_LIBRARIES) {
			fengari.lauxlib.luaL_requiref(
				this.L,
				fengari.to_luastring(lib),
				(L) => {
					fengari.lauxlib.luaL_newlib(L, GLOBAL_LIBRARIES[lib]());
					return 1;
				},
				1
			);
			fengari.lua.lua_pop(this.L, 1);
		}
	}

	private registerTypes() {
		for (const className in ACTOR_REGISTRY) {
			// Create instance metatable
			fengari.lauxlib.luaL_newmetatable(this.L, className); // -1: metatable

			// Load library
			fengari.lauxlib.luaL_requiref(
				this.L,
				fengari.to_luastring(className),
				(L) => {
					fengari.lauxlib.luaL_newlib(L, ACTOR_REGISTRY[className].loadedLib!);
					return 1;
				},
				1
			); // -2: metatable, -1: library

			// Hide library metatable
			fengari.lua.lua_newtable(this.L); // -3: metatable, -2: library, -1: table
			fengari.lua.lua_pushstring(this.L, '(hidden)'); // -4: metatable, -3: library, -2: table, -1: string
			fengari.lua.lua_setfield(this.L, -2, '__metatable'); // -3: metatable, -2: library, -1: table
			fengari.lua.lua_setmetatable(this.L, -2); // -2: metatable, -1: library

			// Setup instance metatable
			fengari.lua.lua_pushstring(this.L, '(hidden)'); //  -3: metatable, -2: library, -1: string
			fengari.lua.lua_setfield(this.L, -3, '__metatable'); // -2: metatable, -1: library
			fengari.lua.lua_pushvalue(this.L, -1); // -3: metatable, -2: library, -1: library
			fengari.lua.lua_setfield(this.L, -3, '__index'); // -2: metatable, -1: library
			fengari.lua.lua_pop(this.L, 2); // Remove library and metatable, stack is now clear
		}
	}

	async run(code: string) {
		// Compile the code
		const errStatus = fengari.lauxlib.luaL_loadbuffer(
			this.L,
			fengari.to_luastring(code),
			null,
			fengari.to_luastring('default.lua')
		);
		let response;
		if (errStatus !== fengari.lua.LUA_OK) {
			response = new SyntaxError(fengari.lua.lua_tojsstring(this.L, -1));
			fengari.lua.lua_pop(this.L, 1); // remove value from stack
			throw response;
		}

		// Call the function
		const runStatus = fengari.lua.lua_pcall(this.L, 0, 1, 0);
		if (runStatus !== 0) {
			response = new Error(fengari.lua.lua_tojsstring(this.L, -1));
			fengari.lua.lua_pop(this.L, 1); // remove value from stack
			throw response;
		}

		stackDump(this.L);

		const returnVal = tojs(this.L, -1);
		fengari.lua.lua_pop(this.L, 1); // remove value from stack

		if (typeof returnVal == 'object' && returnVal['Class'] in ACTOR_REGISTRY) {
			// Create the actor
			const actor = await this.loadActor(returnVal);
			return actor;
		}

		if (returnVal === undefined) return;

		// Log return value
		this.onLog(typeof returnVal == 'object' ? JSON.stringify(returnVal) : returnVal.toString());
	}

	async loadActor(table: Record<string, any>) {
		const actor = new ACTOR_REGISTRY[table.Class].class();

		// set metatable
		fengari.interop.push(this.L, actor);
		fengari.lauxlib.luaL_getmetatable(this.L, table.Class);
		fengari.lua.lua_setmetatable(this.L, -2);
		fengari.lua.lua_pop(this.L, 1);

		actor.loadFromTable(this, table);
		await actor.load();
		return actor;
	}
}

export function stackDump(L) {
	const top = fengari.lua.lua_gettop(L);
	const s = [];
	for (let i = 1; i <= top; i++) {
		/* repeat for each level */
		const t = fengari.lua.lua_type(L, i);
		switch (t) {
			case fengari.lua.LUA_TSTRING /* strings */:
				s.push(`${i} => ${fengari.lua.lua_tojsstring(L, i)}`);
				break;

			case fengari.lua.LUA_TBOOLEAN /* booleans */:
				s.push(`${i} => ${fengari.lua.lua_toboolean(L, i) ? 'true' : 'false'}`);
				break;

			case fengari.lua.LUA_TNUMBER /* numbers */:
				s.push(`${i} => ${fengari.lua.lua_tonumber(L, i)}`);
				break;

			default: /* other values */
				s.push(`${i} => ${decoder.decode(fengari.lua.lua_typename(L, t))}`);
				break;
		}
	}
	console.log(s.join('\n'));
}

export function PushGlobal(L, obj: any, name: string) {
	fengari.interop.push(L, obj);
	fengari.lua.lua_setglobal(L, fengari.to_luastring(name));
}

export const ArgMan = {
	SArg: (L, arg: number): string => {
		return decoder.decode(fengari.lauxlib.luaL_checkstring(L, arg));
	},
	BIArg: (L, arg: number): boolean => {
		fengari.lauxlib.luaL_checkany(L, arg);
		if (fengari.lua.lua_type(L, arg) == fengari.lua.LUA_TNUMBER) {
			return fengari.lauxlib.lua_tointeger(L, arg) != 0;
		}
		fengari.lauxlib.luaL_checktype(L, arg, fengari.lua.LUA_TBOOLEAN);
		return !!fengari.lauxlib.lua_toboolean(L, arg);
	},
	IArg: (L, arg: number): number => {
		return fengari.lauxlib.luaL_checkint(L, arg);
	},
	BArg: (L, arg: number): boolean => {
		fengari.lauxlib.luaL_checktype(L, arg, fengari.lua.LUA_TBOOLEAN);
		return !!fengari.lauxlib.lua_toboolean(L, arg);
	},
	FArg: (L, arg: number): number => {
		return fengari.lauxlib.luaL_checknumber(L, arg);
	},
	TArg: (L, arg: number): Record<string, any> => {
		fengari.lauxlib.luaL_checktype(L, arg, fengari.lua.LUA_TTABLE);
		return readTable(L, arg);
	},
	UArg: (L, arg: number, name = 'js object') => {
		return fengari.lauxlib.luaL_checkudata(L, arg, name).data;
	}
};

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
	const obj: Record<string, any> = {};

	fengari.lua.lua_pushvalue(L, arg);
	fengari.lua.lua_pushnil(L);
	while (fengari.lua.lua_next(L, -2) != 0) {
		// copy key name
		fengari.lua.lua_pushvalue(L, -2);
		const key = fengari.lua.lua_tojsstring(L, -1);
		fengari.lua.lua_pop(L, 1);

		const type = fengari.lua.lua_type(L, arg);
		if (type == fengari.lua.LUA_TTABLE) {
			obj[key] = readTable(L, -1);
		} else if (type == fengari.lua.LUA_TNIL) {
			obj[key] = null;
		} else {
			obj[key] = fengari.interop.tojs(L, arg);
		}
		fengari.lua.lua_pop(L, 1);
	}
	fengari.lua.lua_pop(L, 1);
	return obj;
}

export function createActorLuaLib<Class>(
	type: new (...args: any[]) => Class,
	methods: Record<string, [keyof Class, string[], number?]>
) {
	const library: Record<string, (L) => number> = {};
	const dummy = new type();

	for (const [methodName, spec] of Object.entries(methods)) {
		const funcName = spec[0];
		const funcArgs = spec[1];
		const funcReturn = spec[2];
		if (dummy[funcName] === undefined) {
			console.warn(
				`Couldn't register Lua binding for method ${String(funcName)} (class ${
					type.name
				}): method does not exist`
			);
			continue;
		}
		if (typeof dummy[funcName] !== 'function') {
			console.warn(
				`Couldn't register Lua binding for method ${String(funcName)} (class ${
					type.name
				}): field is not a function`
			);
			continue;
		}
		library[methodName] = (L) => {
			const self = ArgMan.UArg(L, 1, type.name) as Class;
			// Typecheck args
			const args = funcArgs.map((type, index) => {
				if (type in ArgMan) return ArgMan[type as keyof typeof ArgMan](L, index + 2);
				else return ArgMan.UArg(L, index + 1, type);
			});
			try {
				const ret = (self[funcName] as (...args: any[]) => any)(...args); // Call function
				if (funcReturn === undefined) return 0;
				if (funcReturn === 1) {
					fengari.interop.push(L, ret);
					return 1;
				}
				// Turn array into arguments
				for (let i = 0; i < funcReturn; i++) {
					fengari.interop.push(L, ret[i]);
				}
				return funcReturn;
			} catch (err) {
				fengari.lauxlib.luaL_error(L, err);
			}
			return 0;
		};
	}
	return library;
}

export function createStaticLuaLib<Class>(
	obj: Class,
	methods: Record<string, [keyof Class, string[], number?]>
) {
	const library: Record<string, (L) => number> = {};

	for (const [methodName, spec] of Object.entries(methods)) {
		const funcName = spec[0];
		const funcArgs = spec[1];
		const funcReturn = spec[2];
		if (obj[funcName] === undefined) {
			console.warn(
				`Couldn't register Lua binding for method ${String(
					funcName
				)} (obj ${obj}): method does not exist`
			);
			continue;
		}
		if (typeof obj[funcName] !== 'function') {
			console.warn(
				`Couldn't register Lua binding for method ${String(
					funcName
				)} (obj ${obj}): field is not a function`
			);
			continue;
		}
		library[methodName] = (L) => {
			// Typecheck args
			const args = funcArgs.map((type, index) => {
				if (type in ArgMan) return ArgMan[type as keyof typeof ArgMan](L, index + 1);
				else return ArgMan.UArg(L, index + 1, type);
			});
			try {
				const ret = (obj[funcName] as (...args: any[]) => any)(...args); // Call function
				if (funcReturn === undefined) return 0;
				if (funcReturn === 1) {
					fengari.interop.push(L, ret);
					return 1;
				}
				// Turn array into arguments
				for (let i = 0; i < funcReturn; i++) {
					fengari.interop.push(L, ret[i]);
				}
				return funcReturn;
			} catch (err) {
				fengari.lauxlib.luaL_error(L, err);
			}
			return 0;
		};
	}
	return library;
}
