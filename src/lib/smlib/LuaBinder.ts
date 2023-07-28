export function bind<Inputs, Outputs>(func: () => Outputs, inputs: Inputs, outputs: Outputs) {}

// const math_sin = function(L) {
//   lua_pushnumber(L, Math.sin(luaL_checknumber(L, 1)));
//   return 1;
// };
