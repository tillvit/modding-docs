import type { Actor } from './Actor';
import { ACTOR_REGISTRY, createStaticLuaLib } from './LuaManager';

class ActorUtil {
	static SetXY(actor: Actor, metricsGroup: string) {
		/*
		 * Hack: This is run after InitCommand, and InitCommand might set X/Y.  If
		 * these are both 0, leave the actor where it is.  If InitCommand doesn't,
		 * then 0,0 is the default, anyway.
		 */
		const fX = THEME.GetMetricF(metricsGroup, actor.GetName() + 'X');
		const fY = THEME.GetMetricF(metricsGroup, actor.GetName() + 'Y');
		if (fX != 0 || fY != 0) actor.SetXY(fX, fY);
	}

	static GetFileType(type: string) {
		// Enum::Push( L, ActorUtil::GetFileType(SArg(1)) ); return 1;
		throw 'GetFileType: not implemented yet';
	}
	static ResolvePath(path: string, level: number, optional: boolean) {
		// RString sPath( SArg(1) );
		// int iLevel = IArg(2);
		// bool optional= lua_toboolean(L, 3);
		// luaL_where( L, iLevel );
		// RString sWhere = lua_tostring( L, -1 );
		// if( sWhere.size() > 2 && sWhere.substr(sWhere.size()-2, 2) == ": " )
		// 	sWhere = sWhere.substr( 0, sWhere.size()-2 ); // remove trailing ": "

		// LUA->YieldLua();
		// bool bRet = ActorUtil::ResolvePath(sPath, sWhere, optional);
		// LUA->UnyieldLua();

		// if( !bRet )
		// 	return 0;
		// LuaHelpers::Push( L, sPath );
		// return 1;
		throw 'ResolvePath: not implemented yet';
	}
	static IsRegisteredClass(className: string) {
		return className in ACTOR_REGISTRY;
	}
	static LoadAllCommands(actor: Actor, metricsGroup: string) {
		if (actor.name == '') throw 'LoadAllCommands requires the actor to have a name.';
		this.LoadAllCommandsFromName(actor, metricsGroup, actor.GetName());
	}
	static LoadAllCommandsFromName(actor: Actor, metricsGroup: string, name: string) {
		if (actor.name == '') throw 'LoadAllCommands requires the actor to have a name.';
		const vsValueNames = THEME.GetMetricsThatBeginWith(metricsGroup, name);

		for (const sv in vsValueNames) {
			if (sv.endsWith('Command')) {
				this.LoadCommandFromName(actor, metricsGroup, sv.substring(0, sv.length - 7), name);
			}
		}
	}
	static LoadAllCommandsAndSetXY(actor: Actor, metricsGroup: string) {
		if (actor.name == '') throw 'LoadAllCommands requires the actor to have a name.';
		this.LoadAllCommands(actor, metricsGroup);
		this.SetXY(actor, metricsGroup);
	}

	static LoadCommandFromName(
		actor: Actor,
		metricsGroup: string,
		commandName: string,
		actorName: string
	) {
		actor.AddCommand(
			commandName,
			THEME.GetMetricA(metricsGroup, actorName + commandName + 'Command')
		);
	}
}

export const ActorUtilLib = () =>
	createStaticLuaLib(ActorUtil, {
		GetFileType: { params: ['SArg'] },
		ResolvePath: { params: ['SArg', 'IArg', 'BArg'], returnValues: 1 },
		IsRegisteredClass: { params: ['SArg'], returnValues: 1 },
		LoadAllCommands: { params: ['Actor', 'SArg'] },
		LoadAllCommandsFromName: { params: ['Actor', 'SArg', 'SArg'] },
		LoadAllCommandsAndSetXY: { params: ['Actor', 'SArg'] }
	});
