import { Color } from 'pixi.js';
import { Container3D, Quaternion, Vec3 } from 'pixi3d/pixi7';
import { LuaManager, createActorLuaLib } from './LuaManager';

export enum EffectClock {
	CLOCK_TIMER,
	CLOCK_TIMER_GLOBAL,
	CLOCK_BGM_TIME,
	CLOCK_BGM_BEAT,
	CLOCK_BGM_TIME_NO_OFFSET,
	CLOCK_BGM_BEAT_NO_OFFSET,
	CLOCK_BGM_BEAT_PLAYER1,
	CLOCK_BGM_BEAT_PLAYER2,
	CLOCK_LIGHT_1 = 1000,
	CLOCK_LIGHT_LAST = 1100,
	NUM_CLOCKS
}

export enum Effect {
	no_effect,
	diffuse_blink,
	diffuse_shift,
	diffuse_ramp,
	glow_blink,
	glow_shift,
	glow_ramp,
	rainbow,
	wag,
	bounce,
	bob,
	pulse,
	spin,
	vibrate
}

export enum ZTestMode {
	ZTEST_WRITE_ON_PASS,
	ZTEST_OFF
}

export enum CullMode {
	CULL_NONE,
	CULL_BACK
}

export class Rect {
	left;
	top;
	right;
	bottom;
	constructor(l?: number, t?: number, r?: number, b?: number) {
		this.left = l ?? 0;
		this.top = t ?? 0;
		this.right = r ?? 0;
		this.bottom = b ?? 0;
	}
}

class TweenState {
	pos = Vec3.fromValues(0, 0, 0);
	rotation = Vec3.fromValues(0, 0, 0);
	quat = new Quaternion(0, 0, 0, 1);
	scale = Vec3.fromValues(1, 1, 1);
	skewX = 0;
	skewY = 0;
	crop = new Rect();
	fade = new Rect();
	diffuse = [
		Color.shared.setValue(0xffffffff),
		Color.shared.setValue(0xffffffff),
		Color.shared.setValue(0xffffffff),
		Color.shared.setValue(0xffffffff)
	];
	glow = Color.shared.setValue(0xffffff00);
	aux = 0;

	clone() {
		return structuredClone(this);
	}

	// static void MakeWeightedAverage( TweenState& average_out, const TweenState& ts1, const TweenState& ts2, float fPercentBetween );
	// bool operator==( const TweenState &other ) const;
	// bool operator!=( const TweenState &other ) const { return !operator==(other); }
}

export const ActorMixin = <Base extends new (...args: any[]) => Container3D>(B: Base) =>
	class extends B {
		luaMan?: LuaManager;
		commands = new Map<string, (args?: object) => void>();
		options: Record<string, any> = {};
		size = [1, 1];
		constructor(...args: any[]) {
			super(...args);
		}

		loadFromTable(luaMan: LuaManager, options: Record<string, any>) {
			this.luaMan = luaMan;
			this.options = options;
			for (const [key, val] of Object.entries(options)) {
				if (key.endsWith('Command')) {
					this.commands.set(key.substring(0, key.length - 7), val);
				} else if (key == 'Name') this.name = val;
				// else if (key == 'BaseRotationX') this.SetBaseRotationX(val);
				// else if (key == 'BaseRotationY') this.SetBaseRotationY(val);
				// else if (key == 'BaseRotationZ') this.SetBaseRotationZ(val);
				// else if (key == 'BaseZoomX') this.SetBaseZoomX(val);
				// else if (key == 'BaseZoomY') this.SetBaseZoomY(val);
				// else if (key == 'BaseZoomZ') this.SetBaseZoomZ(val);
			}
		}

		async load() {
			this.PlayCommandNoRecurse('Init');

			// Load children
			for (const [key, val] of Object.entries(this.options)) {
				if (!isNaN(+key)) {
					const child = await this.luaMan!.loadActor(val);
					this.addChild(child);
				}
			}
		}

		PlayCommandNoRecurse(name: string, args?: object) {
			const command = this.commands.get(name);
			command?.bind(this)(args);
		}

		/**
		 * Plays the commands that follow at an accelerated rate (fRate * fRate), where fRate is in seconds.
		 * @param {number} fRate
		 */
		accelerate(fRate: number) {
			throw 'accelerate: method not implemented';
		}
		/**
		 * Adds fAux to the Actor's current aux value.
		 * @param {number} fAux
		 */
		addaux(fAux: number) {
			throw 'addaux: method not implemented';
		}
		/**
		 * Adds a command to the Actor.
		 * @param {string} sName
		 * @param {*} cmd
		 */
		addcommand(sName: string) {
			throw 'addcommand: method not implemented';
		}
		/**
		 * Adds rot to the Actor's current x rotation.
		 * @param {number} rot
		 */
		addrotationx(rot: number) {
			throw 'addrotationx: method not implemented';
		}
		/**
		 * Adds rot to the Actor's current y rotation.
		 * @param {number} rot
		 */
		/*static*/
		addrotationy(rot: number) {
			throw 'addrotationy: method not implemented';
		}
		/**
		 * Adds rot to the Actor's current z rotation.
		 * @param {number} rot
		 */
		addrotationz(rot: number) {
			throw 'addrotationz: method not implemented';
		}
		/**
		 * This adds a wrapper state around the Actor, which is like wrapping the Actor in an ActorFrame, except that you can use it on any actor, and add or remove wrapper states in response to things that happen while the screen is being used. (wrapping an Actor in an ActorFrame normally requires setting it up before the screen starts)
		 * The ActorFrame that is returned is the wrapper state, for convenience.
		 * An Actor can have any number of wrapper states. Use GetWrapperState to access wrapper states for the actor.
		 */
		AddWrapperState() {
			throw 'AddWrapperState: method not implemented';
		}
		/**
		 * Adds xPos to the Actor's current x position.
		 * @param {number} xPos
		 */
		addx(xPos: number) {
			throw 'addx: method not implemented';
		}
		/**
		 * Adds yPos to the Actor's current y position.
		 * @param {number} yPos
		 */
		addy(yPos: number) {
			throw 'addy: method not implemented';
		}
		/**
		 * Adds zPos to the Actor's current z position.
		 * @param {number} zPos
		 */
		addz(zPos: number) {
			throw 'addz: method not implemented';
		}
		/**
		 * Sets whether or not the Actor should animate.
		 * @param {boolean} b
		 */
		animate(b: boolean) {
			throw 'animate: method not implemented';
		}
		/**
		 * Sets the Actor's aux value. (This can be a solution for coupling data with an Actor.)
		 * @param {number} fAux
		 */
		aux(fAux: number) {
			throw 'aux: method not implemented';
		}
		/**
		 * If true, cull the Actor's back faces. See also: Actor.cullmode().
		 * @param {boolean} b
		 */
		backfacecull(b: boolean) {
			throw 'backfacecull: method not implemented';
		}
		/**
		 * Sets the Actor's base alpha to fAlpha, where fAlpha is in the range 0..1.
		 * @param {number} fAlpha
		 */
		basealpha(fAlpha: number) {
			throw 'basealpha: method not implemented';
		}
		/**
		 * Sets the Actor's base X rotation to rot.
		 * @param {number} rot
		 */
		baserotationx(rot: number) {
			throw 'baserotationx: method not implemented';
		}
		/**
		 * Sets the Actor's base Y rotation to rot.
		 * @param {number} rot
		 */
		baserotationy(rot: number) {
			throw 'baserotationy: method not implemented';
		}
		/**
		 * Sets the Actor's base Z rotation to rot.
		 * @param {number} rot
		 */
		baserotationz(rot: number) {
			throw 'baserotationz: method not implemented';
		}
		/**
		 * Sets the Actor's base zoom to zoom.
		 * @param {number} zoom
		 */
		basezoom(zoom: number) {
			throw 'basezoom: method not implemented';
		}
		/**
		 * Sets the Actor's base X zoom to zoom.
		 * @param {number} zoom
		 */
		basezoomx(zoom: number) {
			throw 'basezoomx: method not implemented';
		}
		/**
		 * Sets the Actor's base Y zoom to zoom.
		 * @param {number} zoom
		 */
		basezoomy(zoom: number) {
			throw 'basezoomy: method not implemented';
		}
		/**
		 * Sets the Actor's base Z zoom to zoom.
		 * @param {number} zoom
		 */
		basezoomz(zoom: number) {
			throw 'basezoomz: method not implemented';
		}
		/**
		 * Sets the Actor to use the specified blend mode.
		 * @param {*} mode
		 */
		blend() {
			throw 'blend: method not implemented';
		}
		/**
		 * Makes the Actor bob up and down. Can use Actor.effectmagnitude() to define different bobbing behavior.
		 */
		bob() {
			throw 'bob: method not implemented';
		}
		/**
		 * Makes the Actor bounce, similar to bob but with one point acting as the ground. Can use Actor.effectmagnitude() to define different bouncing behavior (with effectmagnitude values relating to x, y, and z movement).
		 */
		bounce() {
			throw 'bounce: method not implemented';
		}
		/**
		 *
		 * @param {number} time
		 */
		bouncebegin(time: number) {
			throw 'bouncebegin: method not implemented';
		}
		/**
		 *
		 * @param {number} time
		 */
		bounceend(time: number) {
			throw 'bounceend: method not implemented';
		}
		/**
		 * Determines if the z-buffer should be cleared or not.
		 * @param {boolean} bClear
		 */
		clearzbuffer(bClear: boolean) {
			throw 'clearzbuffer: method not implemented';
		}
		/**
		 * Crops the actor by left, top, right and bottom percent of the left, top, right and bottom respectively. left,top,right,bottom are in the range 0..1.
		 * @param {number} left
		 * @param {number} top
		 * @param {number} right
		 * @param {number} bottom
		 */
		crop(left: number, top: number, right: number, bottom: number) {
			throw 'crop: method not implemented';
		}
		/**
		 * Crops percent of the Actor from the bottom, where percent is in the range 0..1.
		 * @param {number} percent
		 */
		cropbottom(percent: number) {
			throw 'cropbottom: method not implemented';
		}
		/**
		 * Crops percent of the Actor from the left, where percent is in the range 0..1.
		 * @param {number} percent
		 */
		cropleft(percent: number) {
			throw 'cropleft: method not implemented';
		}
		/**
		 * Crops percent of the Actor from the right, where percent is in the range 0..1.
		 * @param {number} percent
		 */
		cropright(percent: number) {
			throw 'cropright: method not implemented';
		}
		/**
		 * Crops percent of the Actor from the top, where percent is in the range 0..1.
		 * @param {number} percent
		 */
		croptop(percent: number) {
			throw 'croptop: method not implemented';
		}
		/**
		 * Sets the Actor's cull mode to mode.
		 * @param {*} mode
		 */
		cullmode() {
			throw 'cullmode: method not implemented';
		}
		/**
		 * Sets the Actor's cull mode to mode.
		 * @param {number} fRate
		 */
		decelerate(fRate: number) {
			throw 'decelerate: method not implemented';
		}
		/**
		 * Set the Actor's diffuse color to c.
		 * @param {*} c
		 */
		diffuse() {
			throw 'diffuse: method not implemented';
		}
		/**
		 * Sets the Actor's alpha level to fAlpha, where fAlpha is in the range 0..1.
		 * @param {number} fAlpha
		 */
		diffusealpha(fAlpha: number) {
			throw 'diffusealpha: method not implemented';
		}
		/**
		 * Makes the Actor switch between two colors immediately. See Themerdocs/effect_colors.txt for an example.
		 */
		diffuseblink() {
			throw 'diffuseblink: method not implemented';
		}
		/**
		 * Sets the Actor's bottom edge color to c.
		 * @param {*} c
		 */
		diffusebottomedge() {
			throw 'diffusebottomedge: method not implemented';
		}
		/**
		 * Set the Actor's diffuse color to c, ignoring any alpha value in c.
		 * @param {*} c
		 */
		diffusecolor() {
			throw 'diffusecolor: method not implemented';
		}
		/**
		 * Sets the Actor's left edge color to c.
		 * @param {*} c
		 */
		diffuseleftedge() {
			throw 'diffuseleftedge: method not implemented';
		}
		/**
		 * Sets the Actor's lower left corner color to c.
		 * @param {*} c
		 */
		diffuselowerleft() {
			throw 'diffuselowerleft: method not implemented';
		}
		/**
		 * Makes the Actor switch between two colors, jumping back to the first after reaching the second. See Themerdocs/effect_colors.txt for an example.
		 */
		diffuseramp() {
			throw 'diffuseramp: method not implemented';
		}
		/**
		 * Sets the Actor's right edge color to c.
		 * @param {*} c
		 */
		diffuserightedge() {
			throw 'diffuserightedge: method not implemented';
		}
		/**
		 * Makes the Actor shift between two colors smoothly. See Themerdocs/effect_colors.txt for an example.
		 */
		diffuseshift() {
			throw 'diffuseshift: method not implemented';
		}
		/**
		 * Sets the Actor's top edge color to c.
		 * @param {} c
		 */
		diffusetopedge() {
			throw 'diffusetopedge: method not implemented';
		}
		/**
		 * Sets the Actor's upper left corner color to c.
		 * @param {*} c
		 */
		diffuseupperleft() {
			throw 'diffuseupperleft: method not implemented';
		}
		/**
		 * Sets the Actor's upper right corner color to c.
		 * @param {*} c
		 */
		diffuseupperright() {
			throw 'diffuseupperright: method not implemented';
		}
		/**
		 * Tells the Actor to draw itself.
		 */
		Draw() {
			throw 'Draw: method not implemented';
		}
		/**
		 * Sets the Actor's draworder to iOrder, where larger values display first.
		 * @param {number} iOrder
		 */
		draworder(iOrder: number) {
			throw 'draworder: method not implemented';
		}
		/**
		 * Plays the commands that follow with an inBack ease. fDuration is in seconds.
		 * @param {number} fDuration
		 */
		easeinback(fDuration: number) {
			throw 'easeinback: method not implemented';
		}
		/**
		 * Plays the commands that follow with an inBack ease and has a customizable overshoot. fDuration is in seconds.
		 * easeinback uses a value of 1.70158 for fOvershoot.
		 * @param {number} fDuration
		 * @param {number} fOvershoot
		 */
		easeinbackex(fDuration: number, fOvershoot: number) {
			throw 'easeinbackex: method not implemented';
		}
		/**
		 * Plays the commands that follow with an inBounce ease. fDuration is in seconds.
		 * @param {number} fDuration
		 */
		easeinbounce(fDuration: number) {
			throw 'easeinbounce: method not implemented';
		}
		/**
		 * Plays the commands that follow with an inCircle ease. fDuration is in seconds.
		 * @param {number} fDuration
		 */
		easeincircle(fDuration: number) {
			throw 'easeincircle: method not implemented';
		}
		/**
		 * Plays the commands that follow with an inCubic ease. fDuration is in seconds.
		 * @param {number} fDuration
		 */
		easeincubic(fDuration: number) {
			throw 'easeincubic: method not implemented';
		}
		/**
		 * Plays the commands that follow with an inElastic ease. fDuration is in seconds.
		 * @param {number} fDuration
		 */
		easeinelastic(fDuration: number) {
			throw 'easeinelastic: method not implemented';
		}
		/**
		 * Plays the commands that follow with an inElastic ease and has customizable amplitude & period. fDuration is in seconds.
		 * easeinelastic uses an fAmplitude of 0.1 and a fPeriod of 0.4.
		 * @param {number} fDuration
		 * @param {number} fAmplitude
		 * @param {number} fPeriod
		 */
		easeinelasticex(fDuration: number, fAmplitude: number, fPeriod: number) {
			throw 'easeinelasticex: method not implemented';
		}
		/**
		 * Plays the commands that follow with an inExpo ease. fDuration is in seconds.
		 * @param {number} fDuration
		 */
		easeinexpo(fDuration: number) {
			throw 'easeinexpo: method not implemented';
		}
		/**
		 * Plays the commands that follow with an inOutBack ease. fDuration is in seconds.
		 * @param {number} fDuration
		 */
		easeinoutback(fDuration: number) {
			throw 'easeinoutback: method not implemented';
		}
		/**
		 * Plays the commands that follow with an inOutBack ease and has a customizable overshoot. fDuration is in seconds.
		 * easeinoutback uses a value of 2.5949095 for fOvershoot.
		 * @param {number} fDuration
		 * @param {number} fOvershoot
		 */
		easeinoutbackex(fDuration: number, fOvershoot: number) {
			throw 'easeinoutbackex: method not implemented';
		}
		/**
		 * Plays the commands that follow with an inOutBounce ease. fDuration is in seconds.
		 * @param {number} fDuration
		 */
		easeinoutbounce(fDuration: number) {
			throw 'easeinoutbounce: method not implemented';
		}
		/**
		 * Plays the commands that follow with an inOutCircle ease. fDuration is in seconds.
		 * @param {number} fDuration
		 */
		easeinoutcircle(fDuration: number) {
			throw 'easeinoutcircle: method not implemented';
		}
		/**
		 * Plays the commands that follow with an inOutCubic ease. fDuration is in seconds.
		 * @param {number} fDuration
		 */
		easeinoutcubic(fDuration: number) {
			throw 'easeinoutcubic: method not implemented';
		}
		/**
		 * Plays the commands that follow with an inOutElastic ease. fDuration is in seconds.
		 * @param {number} fDuration
		 */
		easeinoutelastic(fDuration: number) {
			throw 'easeinoutelastic: method not implemented';
		}
		/**
		 * Plays the commands that follow with an inOutElastic ease and has customizable amplitude & period. fDuration is in seconds.
		 * easeinoutelastic uses an fAmplitude of 0.1 and a fPeriod of 0.4.
		 * @param {number} fDuration
		 * @param {number} fAmplitude
		 * @param {number} fPeriod
		 */
		easeinoutelasticex(fDuration: number, fAmplitude: number, fPeriod: number) {
			throw 'easeinoutelasticex: method not implemented';
		}
		/**
		 * Plays the commands that follow with an inOutExpo ease. fDuration is in seconds.
		 * @param {number} fDuration
		 */
		easeinoutexpo(fDuration: number) {
			throw 'easeinoutexpo: method not implemented';
		}
		/**
		 * Plays the commands that follow with an inOutQuad ease. fDuration is in seconds.
		 * @param {number} fDuration
		 */
		easeinoutquad(fDuration: number) {
			throw 'easeinoutquad: method not implemented';
		}
		/**
		 * Plays the commands that follow with an inOutQuart ease. fDuration is in seconds.
		 * @param {number} fDuration
		 */
		easeinoutquart(fDuration: number) {
			throw 'easeinoutquart: method not implemented';
		}
		/**
		 * Plays the commands that follow with an inOutQuint ease. fDuration is in seconds.
		 * @param {number} fDuration
		 */
		easeinoutquint(fDuration: number) {
			throw 'easeinoutquint: method not implemented';
		}
		/**
		 * Plays the commands that follow with an inOutSine ease. fDuration is in seconds.
		 * @param {number} fDuration
		 */
		easeinoutsine(fDuration: number) {
			throw 'easeinoutsine: method not implemented';
		}
		/**
		 * Plays the commands that follow with an inQuad ease. fDuration is in seconds.
		 * @param {number} fDuration
		 */
		easeinquad(fDuration: number) {
			throw 'easeinquad: method not implemented';
		}
		/**
		 * Plays the commands that follow with an inQuart ease. fDuration is in seconds.
		 * @param {number} fDuration
		 */
		easeinquart(fDuration: number) {
			throw 'easeinquart: method not implemented';
		}
		/**
		 * Plays the commands that follow with an inQuint ease. fDuration is in seconds.
		 * @param {number} fDuration
		 */
		easeinquint(fDuration: number) {
			throw 'easeinquint: method not implemented';
		}
		/**
		 * Plays the commands that follow with an inSine ease. fDuration is in seconds.
		 * @param {number} fDuration
		 */
		easeinsine(fDuration: number) {
			throw 'easeinsine: method not implemented';
		}
		/**
		 * Plays the commands that follow with an outBack ease. fDuration is in seconds.
		 * @param {number} fDuration
		 */
		easeoutback(fDuration: number) {
			throw 'easeoutback: method not implemented';
		}
		/**
		 * Plays the commands that follow with an outBack ease and has a customizable overshoot. fDuration is in seconds.
		 * easeoutback uses a value of 1.70158 for fOvershoot.
		 * @param {number} fDuration
		 * @param {number} fOvershoot
		 */
		easeoutbackex(fDuration: number, fOvershoot: number) {
			throw 'easeoutbackex: method not implemented';
		}
		/**
		 * Plays the commands that follow with an outBounce ease. fDuration is in seconds.
		 * @param {number} fDuration
		 */
		easeoutbounce(fDuration: number) {
			throw 'easeoutbounce: method not implemented';
		}
		/**
		 * Plays the commands that follow with an outCircle ease. fDuration is in seconds.
		 * @param {number} fDuration
		 */
		easeoutcircle(fDuration: number) {
			throw 'easeoutcircle: method not implemented';
		}
		/**
		 * Plays the commands that follow with an outCubic ease. fDuration is in seconds.
		 * @param {number} fDuration
		 */
		easeoutcubic(fDuration: number) {
			throw 'easeoutcubic: method not implemented';
		}
		/**
		 * Plays the commands that follow with an outElastic ease. fDuration is in seconds.
		 * @param {number} fDuration
		 */
		easeoutelastic(fDuration: number) {
			throw 'easeoutelastic: method not implemented';
		}
		/**
		 * Plays the commands that follow with an outElastic ease and has customizable amplitude & period. fDuration is in seconds.
		 * easeoutelastic uses an fAmplitude of 0.1 and a fPeriod of 0.4.
		 * @param {number} fDuration
		 * @param {number} fOvershoot
		 * @param {number} fPeriod
		 */
		easeoutelasticex(fDuration: number, fOvershoot: number, fPeriod: number) {
			throw 'easeoutelasticex: method not implemented';
		}
		/**
		 * Plays the commands that follow with an outExpo ease. fDuration is in seconds.
		 * @param {number} fDuration
		 */
		easeoutexpo(fDuration: number) {
			throw 'easeoutexpo: method not implemented';
		}
		/**
		 * Plays the commands that follow with an outInBack ease. fDuration is in seconds.
		 * @param {number} fDuration
		 */
		easeoutinback(fDuration: number) {
			throw 'easeoutinback: method not implemented';
		}
		/**
		 * Plays the commands that follow with an outInBack ease and has a customizable overshoot. fDuration is in seconds.
		 * easeoutinback uses a value of 2.5949095 for fOvershoot.
		 * @param {number} fDuration
		 * @param {number} fOvershoot
		 */
		easeoutinbackex(fDuration: number, fOvershoot: number) {
			throw 'easeoutinbackex: method not implemented';
		}
		/**
		 * Plays the commands that follow with an outInBounce ease. fDuration is in seconds.
		 * @param {number} fDuration
		 */
		easeoutinbounce(fDuration: number) {
			throw 'easeoutinbounce: method not implemented';
		}
		/**
		 * Plays the commands that follow with an outInCircle ease. fDuration is in seconds.
		 * @param {number} fDuration
		 */
		easeoutincircle(fDuration: number) {
			throw 'easeoutincircle: method not implemented';
		}
		/**
		 * Plays the commands that follow with an outInCubic ease. fDuration is in seconds.
		 * @param {number} fDuration
		 */
		easeoutincubic(fDuration: number) {
			throw 'easeoutincubic: method not implemented';
		}
		/**
		 * Plays the commands that follow with an outInElastic ease. fDuration is in seconds.
		 * @param {number} fDuration
		 */
		easeoutinelastic(fDuration: number) {
			throw 'easeoutinelastic: method not implemented';
		}
		/**
		 * Plays the commands that follow with an outInElastic ease and has customizable amplitude & period. fDuration is in seconds.
		 * easeoutinelastic uses an fAmplitude of 0.1 and a fPeriod of 0.4.
		 * @param {number} fDuration
		 * @param {number} fOvershoot
		 * @param {number} fPeriod
		 */
		easeoutinelasticex(fDuration: number, fOvershoot: number, fPeriod: number) {
			throw 'easeoutinelasticex: method not implemented';
		}
		/**
		 * Plays the commands that follow with an outInExpo ease. fDuration is in seconds.
		 * @param {number} fDuration
		 */
		easeoutinexpo(fDuration: number) {
			throw 'easeoutinexpo: method not implemented';
		}
		/**
		 * Plays the commands that follow with an outInQuad ease. fDuration is in seconds.
		 * @param {number} fDuration
		 */
		easeoutinquad(fDuration: number) {
			throw 'easeoutinquad: method not implemented';
		}
		/**
		 * Plays the commands that follow with an outInQuart ease. fDuration is in seconds.
		 * @param {number} fDuration
		 */
		easeoutinquart(fDuration: number) {
			throw 'easeoutinquart: method not implemented';
		}
		/**
		 * Plays the commands that follow with an outInQuint ease. fDuration is in seconds.
		 * @param {number} fDuration
		 */
		easeoutinquint(fDuration: number) {
			throw 'easeoutinquint: method not implemented';
		}
		/**
		 * Plays the commands that follow with an outInSine ease. fDuration is in seconds.
		 * @param {number} fDuration
		 */
		easeoutinsine(fDuration: number) {
			throw 'easeoutinsine: method not implemented';
		}
		/**
		 * Plays the commands that follow with an outQuad ease. fDuration is in seconds.
		 * @param {number} fDuration
		 */
		easeoutquad(fDuration: number) {
			throw 'easeoutquad: method not implemented';
		}
		/**
		 * Plays the commands that follow with an outQuart ease. fDuration is in seconds.
		 * @param {number} fDuration
		 */
		easeoutquart(fDuration: number) {
			throw 'easeoutquart: method not implemented';
		}
		/**
		 * Plays the commands that follow with an outQuint ease. fDuration is in seconds.
		 * @param {number} fDuration
		 */
		easeoutquint(fDuration: number) {
			throw 'easeoutquint: method not implemented';
		}
		/**
		 * Plays the commands that follow with an outQuint ease. fDuration is in seconds.
		 * @param {number} fDuration
		 */
		easeoutsine(fDuration: number) {
			throw 'easeoutsine: method not implemented';
		}
		/**
		 * Set the hold_at_full part of the effect timing while leaving the others unchanged.
		 * @param {number} hold_at_full
		 */
		effect_hold_at_full(hold_at_full: number) {
			throw 'effect_hold_at_full: method not implemented';
		}
		/**
		 * Set the Actor's effect clock to s.
		 * @param {string} s
		 */
		effectclock(s: string) {
			throw 'effectclock: method not implemented';
		}
		/**
		 * Set the Actor's effect clock to s.
		 * @param {*} c
		 */
		effectcolor1() {
			throw 'effectcolor1: method not implemented';
		}
		/**
		 * Sets the second effect color to c.
		 * @param {*} c
		 */
		effectcolor2() {
			throw 'effectcolor2: method not implemented';
		}
		/**
		 * Set the Actor's effect magnitude in each direction to the given values.
		 * @param {number} fX
		 * @param {number} fY
		 * @param {number} fZ
		 */
		effectmagnitude(fX: number, fY: number, fZ: number) {
			throw 'effectmagnitude: method not implemented';
		}
		/**
		 * Set the Actor's effect offset to fTime. The offset is added to the time into the effect before calculating percent_through_effect.
		 * @param {number} fTime
		 */
		effectoffset(fTime: number) {
			throw 'effectoffset: method not implemented';
		}
		/**
		 * Set the Actor's effect period to fTime.
		 * @param {number} fTime
		 */
		effectperiod(fTime: number) {
			throw 'effectperiod: method not implemented';
		}
		/**
		 * Set the Actor's effect timing.
		 * hold_at_zero is before hold_at_full in the argument list for compatibility. A future version will probably swap them because it makes more sense to have hold_at_full come before hold_at_zero.
		 * All effect timings must be greater than or equal to zero, at least one of them must be greater than zero.
		 * The effect timing controls how long it takes an effect to cycle and how long it spends in each phase.
		 * Depending on the effect clock, the actor's time into effect is updated every frame. That time is then translated into a percent_through_effect using the parameters to this function.
		 *
		 * ramp_to_half is the amount of time for percent_through_effect to reach 0.5.
		 * hold_at_half is the amount of time percent_through_effect will stay at 0.5.
		 * ramp_to_full is the amount of time percent_through_effect will take to go from 0.5 to 1.0.
		 * hold_at_full is the amount of time percent_through_effect will stay at 1.0.
		 * After reaching the end of hold_at_full, percent_through_effect stays at 0 until hold_at_zero is over.
		 *
		 * The different effects use percent_through_effect in different ways. Some use it to calculate percent_between_colors with this sine wave: sin((percent_through_effect + 0.25f) * 2 * PI ) / 2 + 0.5f
		 * Some effects check the internal bool blink_on. blink_on is true if percent_through_effect is greater than 0.5 and false if percent_through_effect is less than or equal to 0.5.
		 * Check the effect functions for individual explanations: diffuseblink, diffuseshift, glowblink, glowshift, glowramp, rainbow, wag, bounce, bob, pulse, spin, vibrate.
		 * @param {*} ramp_to_half
		 * @param {*} hold_at_half
		 * @param {*} ramp_to_full
		 * @param {*} hold_at_zero
		 * @param {*} hold_at_full
		 */
		effecttiming() {
			throw 'effecttiming: method not implemented';
		}
		/**
		 * Erases the Actor's command for the given name. Does nothing if the command doesn't exist.
		 * @param {string} sCmdName
		 */
		erasecommand(sCmdName: string) {
			throw 'erasecommand: method not implemented';
		}
		/**
		 * Fades percent of the Actor from the bottom where percent is in the range 0..1.
		 * @param {number} percent
		 */
		fadebottom(percent: number) {
			throw 'fadebottom: method not implemented';
		}
		/**
		 * Fades percent of the Actor from the left where percent is in the range 0..1.
		 * @param {number} percent
		 */
		fadeleft(percent: number) {
			throw 'fadeleft: method not implemented';
		}
		/**
		 * Fades percent of the Actor from the right where percent is in the range 0..1.
		 * @param {number} percent
		 */
		faderight(percent: number) {
			throw 'faderight: method not implemented';
		}
		/**
		 * Fades percent of the Actor from the top where percent is in the range 0..1.
		 * @param {number} percent
		 */
		fadetop(percent: number) {
			throw 'fadetop: method not implemented';
		}
		/**
		 * Finishes up an Actor's tween immediately.
		 */
		finishtweening() {
			throw 'finishtweening: method not implemented';
		}
		/**
		 * Returns true if this actor is currently set to use the effect delta for tweening.
		 */
		get_tween_uses_effect_delta() {
			throw 'get_tween_uses_effect_delta: method not implemented';
		}
		/**
		 * Returns what the Actor's absolute x position will be when it reaches its destination tween state. This can be used to determine its new location while being nested into multiple actorframes.
		 */
		GetAbsoluteDestX() {
			throw 'GetAbsoluteDestX: method not implemented';
		}
		/**
		 * Returns what the Actor's absolute y position will be when it reaches its destination tween state. This can be used to determine its new location while being nested into multiple actorframes.
		 */
		GetAbsoluteDestY() {
			throw 'GetAbsoluteDestY: method not implemented';
		}
		/**
		 * Returns the Actor's absolute x position. This can be used to determine its location while being nested into multiple actorframes.
		 */
		GetAbsoluteX() {
			throw 'GetAbsoluteX: method not implemented';
		}
		/**
		 * Returns the Actor's absolute y position. This can be used to determine its location while being nested into multiple actorframes.
		 */
		GetAbsoluteY() {
			throw 'GetAbsoluteY: method not implemented';
		}
		/**
		 * Returns the Actor's aux value.
		 */
		getaux() {
			throw 'getaux: method not implemented';
		}
		/**
		 * Returns the Actor's base X zoom value.
		 */
		GetBaseZoomX() {
			throw 'GetBaseZoomX: method not implemented';
		}
		/**
		 * Returns the Actor's base Y zoom value.
		 */
		GetBaseZoomY() {
			throw 'GetBaseZoomY: method not implemented';
		}
		/**
		 * Returns the Actor's base Z zoom value.
		 */
		GetBaseZoomZ() {
			throw 'GetBaseZoomZ: method not implemented';
		}
		/**
		 * Returns the command with the given name. Returns nil if the command doesn't exist for the Actor.
		 * @param {string} sCmdName
		 */
		GetCommand(sCmdName: string) {
			throw 'GetCommand: method not implemented';
		}
		/**
		 * Gets the percentage the actor is cropped from the bottom. bCurrent is an optional parameter that makes the function return the current mid-tween value if true.
		 * @param {boolean} bCurrent
		 */
		GetCropBottom(bCurrent: boolean) {
			throw 'GetCropBottom: method not implemented';
		}
		/**
		 * Gets the percentage the actor is cropped from the left. bCurrent is an optional parameter that makes the function return the current mid-tween value if true.
		 * @param {boolean} bCurrent
		 */
		GetCropLeft(bCurrent: boolean) {
			throw 'GetCropLeft: method not implemented';
		}
		/**
		 * Gets the height of the actor after cropping. bCurrent is an optional parameter that makes the function return the current mid-tween value if true.
		 * @param {boolean} bCurrent
		 */
		GetCroppedHeight(bCurrent: boolean) {
			throw 'GetCroppedHeight: method not implemented';
		}
		/**
		 * Gets the width of the actor after cropping. bCurrent is an optional parameter that makes the function return the current mid-tween value if true.
		 * @param {boolean} bCurrent
		 */
		GetCroppedWidth(bCurrent: boolean) {
			throw 'GetCroppedWidth: method not implemented';
		}
		/**
		 * Gets the zoomed height of the actor after cropping. bCurrent is an optional parameter that makes the function return the current mid-tween value if true.
		 * @param {boolean} bCurrent
		 */
		GetCroppedZoomedHeight(bCurrent: boolean) {
			throw 'GetCroppedZoomedHeight: method not implemented';
		}
		/**
		 * Gets the zoomed width of the actor after cropping. bCurrent is an optional parameter that makes the function return the current mid-tween value if true.
		 * @param {boolean} bCurrent
		 */
		GetCroppedZoomedWidth(bCurrent: boolean) {
			throw 'GetCroppedZoomedWidth: method not implemented';
		}
		/**
		 * Gets the percentage the actor is cropped from the right. bCurrent is an optional parameter that makes the function return the current mid-tween value if true.
		 * @param {boolean} bCurrent
		 */
		GetCropRight(bCurrent: boolean) {
			throw 'GetCropRight: method not implemented';
		}
		/**
		 * Gets the percentage the actor is cropped from the top. bCurrent is an optional parameter that makes the function return the current mid-tween value if true.
		 * @param {boolean} bCurrent
		 */
		GetCropTop(bCurrent: boolean) {
			throw 'GetCropTop: method not implemented';
		}
		/**
		 * Returns what the Actor's x position will be when it reaches its destination tween state.
		 */
		GetDestX() {
			throw 'GetDestX: method not implemented';
		}
		/**
		 * Returns what the Actor's y position will be when it reaches its destination tween state.
		 */
		GetDestY() {
			throw 'GetDestY: method not implemented';
		}
		/**
		 * Returns what the Actor's z position will be when it reaches its destination tween state.
		 */
		GetDestZ() {
			throw 'GetDestZ: method not implemented';
		}
		/**
		 * Returns the Actor's current diffuse color
		 */
		GetDiffuse() {
			throw 'GetDiffuse: method not implemented';
		}
		/**
		 * Returns the Actor's current diffusealpha.
		 */
		GetDiffuseAlpha() {
			throw 'GetDiffuseAlpha: method not implemented';
		}
		/**
		 * Returns the Actor's current effect delta.
		 */
		GetEffectDelta() {
			throw 'GetEffectDelta: method not implemented';
		}
		/**
		 * Returns the Actor's current effect magnitude as three floats.
		 */
		geteffectmagnitude() {
			throw 'geteffectmagnitude: method not implemented';
		}
		/**
		 * Returns the Actor's current X rotation, taking the current actor effect into account.
		 */
		GetEffectRotationX() {
			throw 'GetEffectRotationX: method not implemented';
		}
		/**
		 * Returns the Actor's current Y rotation, taking the current actor effect into account.
		 */
		GetEffectRotationY() {
			throw 'GetEffectRotationY: method not implemented';
		}
		/**
		 * Returns the Actor's current Z rotation, taking the current actor effect into account.
		 */
		GetEffectRotationZ() {
			throw 'GetEffectRotationZ: method not implemented';
		}
		/**
		 * Returns the Actor's fake parent, or nil if it doesn't have one.
		 */
		GetFakeParent() {
			throw 'GetFakeParent: method not implemented';
		}
		/**
		 * Returns the Actor's current glow color.
		 */
		GetGlow() {
			throw 'GetGlow: method not implemented';
		}
		/**
		 * Returns the Actor's horizontal alignment as a number in the range 0..1
		 */
		GetHAlign() {
			throw 'GetHAlign: method not implemented';
		}
		/**
		 * Returns the Actor's current height.
		 */
		GetHeight() {
			throw 'GetHeight: method not implemented';
		}
		/**
		 * @returns {number}
		 */
		GetHoldLength() {
			throw 'GetHoldLength: method not implemented';
		}
		/**
		 * Returns the Actor's name.
		 */
		GetName() {
			throw 'GetName: method not implemented';
		}
		/**
		 * Returns the number of states the Actor has.
		 */
		GetNumStates() {
			throw 'GetNumStates: method not implemented';
		}
		/**
		 * Returns the number of wrapper states the actor has.
		 */
		GetNumWrapperStates() {
			throw 'GetNumWrapperStates: method not implemented';
		}
		/**
		 * Returns the Actor's parent, or nil if it doesn't have one.
		 */
		GetParent() {
			throw 'GetParent: method not implemented';
		}
		/**
		 * Returns whether the Actor applies rotation after zoom or not.
		 */
		GetRotAfterZoom() {
			throw 'GetRotAfterZoom: method not implemented';
		}
		/**
		 * Returns the Actor's rotation in X, Y, and Z.
		 */
		getrotation() {
			throw 'getrotation: method not implemented';
		}
		/**
		 * Returns the Actor's destination X rotation.
		 * bGetCurrent is optional.
		 * When bGetCurrent is true, the function returns the Actor's current mid-tween value for X rotation.
		 * @param {boolean} bGetCurrent
		 */
		GetRotationX(bGetCurrent: boolean) {
			throw 'GetRotationX: method not implemented';
		}
		/**
		 * Returns the Actor's destination Y rotation.
		 * bGetCurrent is optional.
		 * When bGetCurrent is true, the function returns the Actor's current mid-tween value for Y rotation.
		 * @param {boolean} bGetCurrent
		 */
		GetRotationX(bGetCurrent: boolean) {
			throw 'GetRotationX: method not implemented';
		}
		/**
		 * Returns the Actor's destination Z rotation.
		 * bGetCurrent is optional.
		 * When bGetCurrent is true, the function returns the Actor's current mid-tween value for Z rotation.
		 * @param {number} bGetCurrent
		 */
		GetRotationX(bGetCurrent: number) {
			throw 'GetRotationX: method not implemented';
		}
		/**
		 * Returns the number of seconds into the currently running effect (e.g. diffuseshift, bob).
		 */
		GetSecsIntoEffect() {
			throw 'GetSecsIntoEffect: method not implemented';
		}
		/**
		 * Returns whether the Actor applies skew after zoom and rotation or not.
		 */
		GetSkewAfterZoomRot() {
			throw 'GetSkewAfterZoomRot: method not implemented';
		}
		/**
		 * Returns the Actor's destination value for SkewX.
		 * bGetCurrent is optional.
		 * When bGetCurrent is true, the function returns the Actor's current mid-tween value for SkewX.
		 * @param {boolean} bGetCurrent
		 */
		GetSkewX(bGetCurrent: boolean) {
			throw 'GetSkewX: method not implemented';
		}
		/**
		 * Returns the Actor's destination value for SkewY.
		 * bGetCurrent is optional.
		 * When bGetCurrent is true, the function returns the Actor's current mid-tween value for SkewY.
		 * @param {boolean} bGetCurrent
		 */
		GetSkewY(bGetCurrent: boolean) {
			throw 'GetSkewY: method not implemented';
		}
		/**
		 * Returns how much time is remaining for the current tween.
		 */
		GetTweenTimeLeft() {
			throw 'GetTweenTimeLeft: method not implemented';
		}
		/**
		 * Returns the Actor's vertical alignment as a number in the range 0..1.
		 */
		GetVAlign() {
			throw 'GetVAlign: method not implemented';
		}
		/**
		 * Returns the Actor's visibility.
		 */
		GetVisible() {
			throw 'GetVisible: method not implemented';
		}
		/**
		 * Returns the Actor's current width.
		 */
		GetWidth() {
			throw 'GetWidth: method not implemented';
		}
		/**
		 * Returns the wrapper state at index i. Think of wrapper states with a higher index as being "further out". Actor is inside Wrapper 1, Wrapper 1 is inside Wrapper 2, Wrapper 2 is inside Wrapper 3, and so on.
		 * @param {number} i
		 */
		GetWrapperState(i: number) {
			throw 'GetWrapperState: method not implemented';
		}
		/**
		 * Returns the Actor's x position.
		 */
		GetX() {
			throw 'GetX: method not implemented';
		}
		/**
		 * Returns the Actor's y position.
		 */
		GetY() {
			throw 'GetY: method not implemented';
		}
		/**
		 * Returns the Actor's z position.
		 */
		GetZ() {
			throw 'GetZ: method not implemented';
		}
		/**
		 * Returns the Actor's destination zoom.
		 * bGetCurrent is optional.
		 * When bGetCurrent is true, the function returns the Actor's current mid-tween value for zoom.
		 * @param {boolean} bGetCurrent
		 */
		GetZoom(bGetCurrent: boolean) {
			throw 'GetZoom: method not implemented';
		}
		/**
		 * Returns the zoomed height of an Actor.
		 */
		GetZoomedHeight() {
			throw 'GetZoomedHeight: method not implemented';
		}
		/**
		 * Returns the zoomed width of an Actor.
		 */
		GetZoomedWidth() {
			throw 'GetZoomedWidth: method not implemented';
		}
		/**
		 * Returns the Actor's destination X zoom.
		 * bGetCurrent is optional.
		 * When bGetCurrent is true, the function returns the Actor's current mid-tween value for X zoom.
		 * @param {boolean} bGetCurrent
		 */
		GetZoomX(bGetCurrent: boolean) {
			throw 'GetZoomX: method not implemented';
		}
		/**
		 * Returns the Actor's destination Y zoom.
		 * bGetCurrent is optional.
		 * When bGetCurrent is true, the function returns the Actor's current mid-tween value for Y zoom.
		 * @param {boolean} bGetCurrent
		 */
		GetZoomY(bGetCurrent: boolean) {
			throw 'GetZoomY: method not implemented';
		}
		/**
		 * Returns the Actor's destination Z zoom.
		 * bGetCurrent is optional.
		 * When bGetCurrent is true, the function returns the Actor's current mid-tween value for Z zoom.
		 * @param {boolean} bGetCurrent
		 */
		GetZoomZ(bGetCurrent: boolean) {
			throw 'GetZoomZ: method not implemented';
		}
		/**
		 * Sets the Actor's glow color.
		 * @param {*} c
		 */
		glow() {
			throw 'glow: method not implemented';
		}
		/**
		 * Makes the Actor glow between two colors immediately. See Themerdocs/effect_colors.txt for an example.
		 */
		glowblink() {
			throw 'glowblink: method not implemented';
		}
		/**
		 * Makes the Actor glow between two colors smoothly, jumping back to the first at the end. See Themerdocs/effect_colors.txt for an example.
		 */
		glowramp() {
			throw 'glowramp: method not implemented';
		}
		/**
		 * Makes the Actor glow between two colors smoothly. See Themerdocs/effect_colors.txt for an example.
		 */
		glowshift() {
			throw 'glowshift: method not implemented';
		}
		/**
		 * Set the fractional horizontal alignment of the Actor according to fAlign which should be ain the range 0..1. An alignment of 0 is left aligned while an alignment of 1 is right aligned. See Actor.horizalign() for the common case.
		 * @param {number} fAlign
		 */
		halign(fAlign: number) {
			throw 'halign: method not implemented';
		}
		/**
		 * Sets the heading of this Actor to fHeading.
		 * @param {number} fHeading
		 */
		heading(fHeading: number) {
			throw 'heading: method not implemented';
		}
		/**
		 * Hides the Actor for the specified amount of time.
		 * @param {number} fTime
		 */
		hibernate(fTime: number) {
			throw 'hibernate: method not implemented';
		}
		/**
		 * Set the horizontal alignment of the Actor according to align. See Actor.halign() for fractional alignment.
		 * @param {*} align
		 */
		horizalign() {
			throw 'horizalign: method not implemented';
		}
		/**
		 * Hurries up an Actor's tweening by factor.
		 * @param {number} factor
		 */
		hurrytweening(factor: number) {
			throw 'hurrytweening: method not implemented';
		}
		/**
		 * Plays the commands that follow at a normal rate, where fRate is in seconds.
		 * @param {number} fRate
		 */
		linear(fRate: number) {
			throw 'linear: method not implemented';
		}
		/**
		 * Sets the actor's effect command to sCommandName. Params cannot be passed to the command.
		 * @param {string} sCommandName
		 */
		luaeffect(sCommandName: string) {
			throw 'luaeffect: method not implemented';
		}
		/**
		 * Sets the Actor's name to sName.
		 * @param {string} sName
		 */
		name(sName: string) {
			throw 'name: method not implemented';
		}
		/**
		 * Stops the Actor's movement. (Usually used for Sprites or Models.)
		 */
		pause() {
			throw 'pause: method not implemented';
		}
		/**
		 * Sets the pitch of this Actor to fPitch.
		 * @param {number} fPitch
		 */
		pitch(fPitch: number) {
			throw 'pitch: method not implemented';
		}
		/**
		 * Starts the Actor's movement. (Usually used for Sprites or Models.)
		 */
		play() {
			throw 'play: method not implemented';
		}
		/**
		 * Starts the Actor's movement. (Usually used for Sprites or Models.)
		 * @param {string} sCommandName
		 * @param {*} params
		 */
		playcommand(sCommandName: string) {
			throw 'playcommand: method not implemented';
		}
		/**
		 * Sets how thick an Actor's lines are when the PolygonMode is set to Line.
		 * Only accepts positive numbers.
		 * @param {number} fWidth
		 */
		polygonlinewidth(fWidth: number) {
			throw 'polygonlinewidth: method not implemented';
		}
		/**
		 * Sets the fill mode of an Actor.
		 * @param {*} pm
		 */
		polygonmode() {
			throw 'polygonmode: method not implemented';
		}
		/**
		 * Makes the Actor grow and shrink. Can use Actor.effectmagnitude() to define different pulsing behavior.
		 */
		pulse() {
			throw 'pulse: method not implemented';
		}
		/**
		 * Makes the Actor grow and shrink on a sawtooth wave. Can use Actor.effectmagnitude() to define different pulsing behavior.
		 */
		pulseramp() {
			throw 'pulseramp: method not implemented';
		}
		/**
		 * Queues a command named sCommandName to be played.
		 * @param {string} sCommandName
		 */
		queuecommand(sCommandName: string) {
			throw 'queuecommand: method not implemented';
		}
		/**
		 * Basically creates a command named !sMessageName (Note the ! at the beginning. The source code says this: "Hack: use "!" as a marker to broadcast a command, instead of playing a command, so we don't have to add yet another element to every tween state for this rarely-used command.")
		 * @param {string} sMessageName
		 */
		queuemessage(sMessageName: string) {
			throw 'queuemessage: method not implemented';
		}
		/**
		 * Makes the Actor change colors continually using colors of the rainbow. Each channel follows a cosine wave, red starts at 0, green starts at 2pi/3, and blue starts at 4pi/3.
		 */
		rainbow() {
			throw 'rainbow: method not implemented';
		}
		/**
		 * Removes the wrapper state at index i.
		 * @param {number} i
		 */
		RemoveWrapperState(i: number) {
			throw 'RemoveWrapperState: method not implemented';
		}
		/**
		 * Sets the roll of this Actor to fRoll.
		 * @param {number} fRoll
		 */
		roll(fRoll: number) {
			throw 'roll: method not implemented';
		}
		/**
		 * Set whether the Actor applies rotation after zoom or not.
		 * @param {boolean} b
		 */
		rotafterzoom(b: boolean) {
			throw 'rotafterzoom: method not implemented';
		}
		/**
		 * Set the Actor's rotation on the X axis to fAlign.
		 * @param {number} fRotation
		 */
		rotationx(fRotation: number) {
			throw 'rotationx: method not implemented';
		}
		/**
		 * Set the Actor's rotation on the Y axis to fAlign.
		 * @param {number} fRotation
		 */
		rotationy(fRotation: number) {
			throw 'rotationy: method not implemented';
		}
		/**
		 * Set the Actor's rotation on the Z axis to fAlign.
		 * @param {number} fRotation
		 */
		rotationz(fRotation: number) {
			throw 'rotationz: method not implemented';
		}
		/**
		 * Run the lua function command on the Actor. If used on an ActorFrame, all Actors within will run the command.
		 * @param {*} command
		 * @param {*} params
		 */
		RunCommandsRecursively() {
			throw 'RunCommandsRecursively: method not implemented';
		}
		/**
		 * Scales the Actor to cover a rectangle defined by the fourarguments.
		 * @param {number} fLeft
		 * @param {number} fTop
		 * @param {number} fRight
		 * @param {number} fBottom
		 */
		scaletocover(fLeft: number, fTop: number, fRight: number, fBottom: number) {
			throw 'scaletocover: method not implemented';
		}
		/**
		 * Scales the Actor to fit inside a rectangle defined by the fourarguments.
		 * @param {number} fLeft
		 * @param {number} fTop
		 * @param {number} fRight
		 * @param {number} fBottom
		 */
		scaletofit(fLeft: number, fTop: number, fRight: number, fBottom: number) {
			throw 'scaletofit: method not implemented';
		}
		/**
		 * Scales the Actor to fit inside a rectangle defined by the fourarguments.
		 */
		set_tween_uses_effect_delta() {
			throw 'set_tween_uses_effect_delta: method not implemented';
		}
		/**
		 * Sets the Actor's fake parent to p, or clears it if p is nil.
		 * @param {new Actor} p
		 */
		SetFakeParent() {
			throw 'SetFakeParent: method not implemented';
		}
		/**
		 * Sets the height of the Actor.
		 * @param {number} height
		 */
		SetHeight(height: number) {
			throw 'SetHeight: method not implemented';
		}
		/**
		 * Sets the size of the Actor.
		 * @param {number} width
		 * @param {number} height
		 */
		setsize(width: number, height: number) {
			throw 'setsize: method not implemented';
		}
		/**
		 * Sets a multi-framed Actor's state to iNewState.
		 * @param {number} iNewState
		 */
		setstate(iNewState: number) {
			throw 'setstate: method not implemented';
		}
		/**
		 * Sets Texture Filtering for an Actor to b.
		 * @param {boolean} b
		 */
		SetTextureFiltering(b: boolean) {
			throw 'SetTextureFiltering: method not implemented';
		}
		/**
		 * Sets Texture Filtering for an Actor to b.
		 * @param {number} width
		 */
		SetWidth(width: number) {
			throw 'SetWidth: method not implemented';
		}
		/**
		 * Sets the shadow's color to c.
		 * @param {*} c
		 */
		shadowcolor() {
			throw 'shadowcolor: method not implemented';
		}
		/**
		 * Sets the Actor's shadow length to fLength.
		 * @param {number} fLength
		 */
		shadowlength(fLength: number) {
			throw 'shadowlength: method not implemented';
		}
		/**
		 * Sets the Actor's horizontal shadow length to fLength.
		 * @param {number} fLength
		 */
		shadowlengthx(fLength: number) {
			throw 'shadowlengthx: method not implemented';
		}
		/**
		 * Sets the Actor's horizontal shadow length to fLength.
		 * @param {number} fLength
		 */
		shadowlengthy(fLength: number) {
			throw 'shadowlengthy: method not implemented';
		}
		/**
		 * Set whether the Actor applies skew after zoom and rotation or not.
		 * @param {boolean} b
		 */
		skewafterzoomrot(b: boolean) {
			throw 'skewafterzoomrot: method not implemented';
		}
		/**
		 * Skews the Actor on the x axis by fAmount.
		 * @param {number} fAmount
		 */
		skewx(fAmount: number) {
			throw 'skewx: method not implemented';
		}
		/**
		 * Skews the Actor on the y axis by fAmount
		 * @param {number} fAmount
		 */
		skewy(fAmount: number) {
			throw 'skewy: method not implemented';
		}
		/**
		 * Waits fSeconds before executing the next command.
		 * @param {number} fSeconds
		 */
		sleep(fSeconds: number) {
			throw 'sleep: method not implemented';
		}
		/**
		 * Plays the next animation with a smoothened movement.
		 * @param {number} fDuration
		 */
		smooth(fDuration: number) {
			throw 'smooth: method not implemented';
		}
		/**
		 * Tells the Actor to spin. Can use Actor.effectmagnitude() to define different spinning behavior.
		 */
		spin() {
			throw 'spin: method not implemented';
		}
		/**
		 * Makes the next animation use a 'springing' movement.
		 * @param {number} fDuration
		 */
		spring(fDuration: number) {
			throw 'spring: method not implemented';
		}
		/**
		 * Tells the Actor to squich and stretch. Can use Actor.effectmagnitude() to define different squishing behavior.
		 */
		squish() {
			throw 'squish: method not implemented';
		}
		/**
		 * Stops any effect the Actor has.
		 */
		stopeffect() {
			throw 'stopeffect: method not implemented';
		}
		/**
		 * Stops any tweening.
		 */
		stoptweening() {
			throw 'stoptweening: method not implemented';
		}
		/**
		 * Stretches the Actor to a rectangle of a specific size.
		 * @param {number} x1
		 * @param {number} y1
		 * @param {number} x2
		 * @param {number} y2
		 */
		stretchto(x1: number, y1: number, x2: number, y2: number) {
			throw 'stretchto: method not implemented';
		}
		/**
		 * Translates the texture of the actor by x and y.
		 * @param {number} x
		 * @param {number} y
		 */
		texturetranslate(x: number, y: number) {
			throw 'texturetranslate: method not implemented';
		}
		/**
		 * Determines if the Actor should use texture wrapping or not.
		 * @param {boolean} bWrap
		 */
		texturewrapping(bWrap: boolean) {
			throw 'texturewrapping: method not implemented';
		}
		/**
		 * Uses type to determine the tween to use. The type must be one of the TweenType enum values. If the type is not TweenType_Bezier, the params table is ignored. If the type is TweenType_Bezier, then the params table must have 4 or 8 numbers. 4 numbers in the params creates a 1 dimensional bezier curve, 8 numbers creates a 2 dimensional bezier curve.
		 * It's usually more convenient to use Actor:linear, Actor:accelerate, and so on, rather than using Actor:tween directly.
		 * @param {number} time
		 * @param {*} type
		 * @param {*} params
		 */
		tween(time: number) {
			throw 'tween: method not implemented';
		}
		/**
		 * Set the fractional vertical alignment of the Actor according to fAlign which should be ain the range 0..1. An alignment of 0 is top aligned while an alignment of 1 is bottom aligned. See Actor.vertalign() for the common case.
		 * @param {number} fAlign
		 */
		valign(fAlign: number) {
			throw 'valign: method not implemented';
		}
		/**
		 * Set the vertical alignment of the Actor according to align. See Actor.valign() for fractional alignment.
		 * @param {*} align
		 */
		vertalign() {
			throw 'vertalign: method not implemented';
		}
		/**
		 * Set the vertical alignment of the Actor according to align. See Actor.valign() for fractional alignment.
		 */
		vibrate() {
			throw 'vibrate: method not implemented';
		}
		/**
		 * Sets an Actor's visibility to b.
		 * @param {boolean} b
		 */
		visible(b: boolean) {
			throw 'visible: method not implemented';
		}
		/**
		 * Makes the Actor wag. Use Actor.effectmagnitude() to define different wag behavior.
		 */
		wag() {
			throw 'wag: method not implemented';
		}
		/**
		 * Sets whether the actor render as a wireframe. Not all actors support this.
		 * @param {boolean} bWireFrame
		 */
		wireframe(bWireFrame: boolean) {
			throw 'wireframe: method not implemented';
		}
		/**
		 * Set the x position of the Actor to xPos.
		 * @param {number} xPos
		 */
		x(xPos: number) {
			throw 'x: method not implemented';
		}
		/**
		 * Sets the x and y location of the Actor in one command.
		 * @param {number} actorX
		 * @param {number} actorY
		 */
		xy(actorX: number, actorY: number) {
			throw 'xy: method not implemented';
		}
		/**
		 * Sets the x, y and z location of the Actor in one command.
		 * @param {number} actorX
		 * @param {number} actorY
		 * @param {number} actorZ
		 */
		xyz(actorX: number, actorY: number, actorZ: number) {
			throw 'xyz: method not implemented';
		}
		/**
		 * Set the y position of the Actor to yPos.
		 * @param {number} yPos
		 */
		y(yPos: number) {
			throw 'y: method not implemented';
		}
		/**
		 * Set the z position of the Actor to zPos.
		 * @param {number} zPos
		 */
		z(zPos: number) {
			throw 'z: method not implemented';
		}
		/**
		 * Sets the z bias to fBias.
		 * @param {number} fBias
		 */
		zbias(fBias: number) {
			throw 'zbias: method not implemented';
		}
		/**
		 * Enables/disables z-buffer depending on bUse.
		 * @param {boolean} bUse
		 */
		zbuffer(bUse: boolean) {
			throw 'zbuffer: method not implemented';
		}
		/**
		 * Zooms the Actor to zoom scale.
		 * @param {number} zoom
		 */
		zoom(zoom: number) {
			throw 'zoom: method not implemented';
		}
		/**
		 * Zooms the Actor on both the X and Y axis using zoomX and zoomY.
		 * @param {number} zoomX
		 * @param {number} zoomY
		 */
		zoomto(zoomX: number, zoomY: number) {
			throw 'zoomto: method not implemented';
		}
		/**
		 * Zooms the Actor to zoom height. See also: Actor.zoomy().
		 * @param {number} zoom
		 */
		zoomtoheight(zoom: number) {
			throw 'zoomtoheight: method not implemented';
		}
		/**
		 * Zooms the Actor to zoom width. See also: Actor.zoomx().
		 * @param {number} zoom
		 */
		zoomtowidth(zoom: number) {
			throw 'zoomtowidth: method not implemented';
		}
		/**
		 * Zooms the Actor to zoom scale on the X axis.
		 * @param {number} zoom
		 */
		zoomx(zoom: number) {
			throw 'zoomx: method not implemented';
		}
		/**
		 * Zooms the Actor to zoom scale on the Y axis.
		 * @param {number} zoom
		 */
		zoomy(zoom: number) {
			throw 'zoomy: method not implemented';
		}
		/**
		 * Zooms the Actor to zoom scale on the Z axis.
		 * @param {number} zoom
		 */
		zoomz(zoom: number) {
			throw 'zoomz: method not implemented';
		}
		/**
		 * Sets the z testing mode to write on pass if true, turns it off if false
		 * @param {boolean} bTest
		 */
		ztest(bTest: boolean) {
			throw 'ztest: method not implemented';
		}
		/**
		 * Sets the z testing mode to testMode.
		 * @param {*} testMode
		 */
		ztestmode() {
			throw 'ztestmode: method not implemented';
		}
		/**
		 * Sets z writing to true or false based on bWrite.
		 * @param {boolean} bWrite
		 */
		zwrite(bWrite: boolean) {
			throw 'zwrite: method not implemented';
		}
	};

export const ActorLib = () =>
	createActorLuaLib(Actor, {
		accelerate: { params: ['FArg'] },
		addaux: { params: ['FArg'] },
		addcommand: { params: ['SArg'] },
		addrotationx: { params: ['FArg'] },
		addrotationy: { params: ['FArg'] },
		addrotationz: { params: ['FArg'] },
		AddWrapperState: {},
		addx: { params: ['FArg'] },
		addy: { params: ['FArg'] },
		addz: { params: ['FArg'] },
		animate: { params: ['BIArg'] },
		aux: { params: ['FArg'] },
		backfacecull: { params: ['BIArg'] },
		basealpha: { params: ['FArg'] },
		baserotationx: { params: ['FArg'] },
		baserotationy: { params: ['FArg'] },
		baserotationz: { params: ['FArg'] },
		basezoom: { params: ['FArg'] },
		basezoomx: { params: ['FArg'] },
		basezoomy: { params: ['FArg'] },
		basezoomz: { params: ['FArg'] },
		blend: {},
		bob: {},
		bounce: {},
		bouncebegin: { params: ['FArg'] },
		bounceend: { params: ['FArg'] },
		clearzbuffer: { params: ['BIArg'] },
		crop: { params: ['FArg', 'FArg', 'FArg', 'FArg'] },
		cropbottom: { params: ['FArg'] },
		cropleft: { params: ['FArg'] },
		cropright: { params: ['FArg'] },
		croptop: { params: ['FArg'] },
		cullmode: {},
		decelerate: { params: ['FArg'] },
		diffuse: {},
		diffusealpha: { params: ['FArg'] },
		diffuseblink: {},
		diffusebottomedge: {},
		diffusecolor: {},
		diffuseleftedge: {},
		diffuselowerleft: {},
		diffuseramp: {},
		diffuserightedge: {},
		diffuseshift: {},
		diffusetopedge: {},
		diffuseupperleft: {},
		diffuseupperright: {},
		Draw: {},
		draworder: { params: ['FArg'] },
		easeinback: { params: ['FArg'] },
		easeinbackex: { params: ['FArg', 'FArg'] },
		easeinbounce: { params: ['FArg'] },
		easeincircle: { params: ['FArg'] },
		easeincubic: { params: ['FArg'] },
		easeinelastic: { params: ['FArg'] },
		easeinelasticex: { params: ['FArg', 'FArg', 'FArg'] },
		easeinexpo: { params: ['FArg'] },
		easeinoutback: { params: ['FArg'] },
		easeinoutbackex: { params: ['FArg', 'FArg'] },
		easeinoutbounce: { params: ['FArg'] },
		easeinoutcircle: { params: ['FArg'] },
		easeinoutcubic: { params: ['FArg'] },
		easeinoutelastic: { params: ['FArg'] },
		easeinoutelasticex: { params: ['FArg', 'FArg', 'FArg'] },
		easeinoutexpo: { params: ['FArg'] },
		easeinoutquad: { params: ['FArg'] },
		easeinoutquart: { params: ['FArg'] },
		easeinoutquint: { params: ['FArg'] },
		easeinoutsine: { params: ['FArg'] },
		easeinquad: { params: ['FArg'] },
		easeinquart: { params: ['FArg'] },
		easeinquint: { params: ['FArg'] },
		easeinsine: { params: ['FArg'] },
		easeoutback: { params: ['FArg'] },
		easeoutbackex: { params: ['FArg', 'FArg'] },
		easeoutbounce: { params: ['FArg'] },
		easeoutcircle: { params: ['FArg'] },
		easeoutcubic: { params: ['FArg'] },
		easeoutelastic: { params: ['FArg'] },
		easeoutelasticex: { params: ['FArg', 'FArg', 'FArg'] },
		easeoutexpo: { params: ['FArg'] },
		easeoutinback: { params: ['FArg'] },
		easeoutinbackex: { params: ['FArg', 'FArg'] },
		easeoutinbounce: { params: ['FArg'] },
		easeoutincircle: { params: ['FArg'] },
		easeoutincubic: { params: ['FArg'] },
		easeoutinelastic: { params: ['FArg'] },
		easeoutinelasticex: { params: ['FArg', 'FArg', 'FArg'] },
		easeoutinexpo: { params: ['FArg'] },
		easeoutinquad: { params: ['FArg'] },
		easeoutinquart: { params: ['FArg'] },
		easeoutinquint: { params: ['FArg'] },
		easeoutinsine: { params: ['FArg'] },
		easeoutquad: { params: ['FArg'] },
		easeoutquart: { params: ['FArg'] },
		easeoutquint: { params: ['FArg'] },
		easeoutsine: { params: ['FArg'] },
		effect_hold_at_full: { params: ['FArg'] },
		effectclock: { params: ['SArg'] },
		effectcolor1: {},
		effectcolor2: {},
		effectmagnitude: { params: ['FArg', 'FArg', 'FArg'] },
		effectoffset: { params: ['FArg'] },
		effectperiod: { params: ['FArg'] },
		effecttiming: {},
		erasecommand: { params: ['SArg'] },
		fadebottom: { params: ['FArg'] },
		fadeleft: { params: ['FArg'] },
		faderight: { params: ['FArg'] },
		fadetop: { params: ['FArg'] },
		finishtweening: {},
		get_tween_uses_effect_delta: {},
		GetAbsoluteDestX: {},
		GetAbsoluteDestY: {},
		GetAbsoluteX: {},
		GetAbsoluteY: {},
		getaux: {},
		GetBaseZoomX: {},
		GetBaseZoomY: {},
		GetBaseZoomZ: {},
		GetCommand: { params: ['SArg'] },
		GetCropBottom: { params: ['BIArg'] },
		GetCropLeft: { params: ['BIArg'] },
		GetCroppedHeight: { params: ['BIArg'] },
		GetCroppedWidth: { params: ['BIArg'] },
		GetCroppedZoomedHeight: { params: ['BIArg'] },
		GetCroppedZoomedWidth: { params: ['BIArg'] },
		GetCropRight: { params: ['BIArg'] },
		GetCropTop: { params: ['BIArg'] },
		GetDestX: {},
		GetDestY: {},
		GetDestZ: {},
		GetDiffuse: {},
		GetDiffuseAlpha: {},
		GetEffectDelta: {},
		geteffectmagnitude: {},
		GetEffectRotationX: {},
		GetEffectRotationY: {},
		GetEffectRotationZ: {},
		GetFakeParent: {},
		GetGlow: {},
		GetHAlign: {},
		GetHeight: {},
		GetHoldLength: {},
		GetName: {},
		GetNumStates: {},
		GetNumWrapperStates: {},
		GetParent: {},
		GetRotAfterZoom: {},
		getrotation: {},
		GetRotationX: { params: ['FArg'] },
		GetSecsIntoEffect: {},
		GetSkewAfterZoomRot: {},
		GetSkewX: { params: ['BIArg'] },
		GetSkewY: { params: ['BIArg'] },
		GetTweenTimeLeft: {},
		GetVAlign: {},
		GetVisible: {},
		GetWidth: {},
		GetWrapperState: { params: ['FArg'] },
		GetX: {},
		GetY: {},
		GetZ: {},
		GetZoom: { params: ['BIArg'] },
		GetZoomedHeight: {},
		GetZoomedWidth: {},
		GetZoomX: { params: ['BIArg'] },
		GetZoomY: { params: ['BIArg'] },
		GetZoomZ: { params: ['BIArg'] },
		glow: {},
		glowblink: {},
		glowramp: {},
		glowshift: {},
		halign: { params: ['FArg'] },
		heading: { params: ['FArg'] },
		hibernate: { params: ['FArg'] },
		horizalign: {},
		hurrytweening: { params: ['FArg'] },
		linear: { params: ['FArg'] },
		luaeffect: { params: ['SArg'] },
		name: { params: ['SArg'] },
		pause: {},
		pitch: { params: ['FArg'] },
		play: {},
		playcommand: { params: ['SArg'] },
		polygonlinewidth: { params: ['FArg'] },
		polygonmode: {},
		pulse: {},
		pulseramp: {},
		queuecommand: { params: ['SArg'] },
		queuemessage: { params: ['SArg'] },
		rainbow: {},
		RemoveWrapperState: { params: ['FArg'] },
		roll: { params: ['FArg'] },
		rotafterzoom: { params: ['BIArg'] },
		rotationx: { params: ['FArg'] },
		rotationy: { params: ['FArg'] },
		rotationz: { params: ['FArg'] },
		RunCommandsRecursively: {},
		scaletocover: { params: ['FArg', 'FArg', 'FArg', 'FArg'] },
		scaletofit: { params: ['FArg', 'FArg', 'FArg', 'FArg'] },
		set_tween_uses_effect_delta: {},
		SetFakeParent: {},
		SetHeight: { params: ['FArg'] },
		setsize: { params: ['FArg', 'FArg'] },
		setstate: { params: ['FArg'] },
		SetTextureFiltering: { params: ['BIArg'] },
		SetWidth: { params: ['FArg'] },
		shadowcolor: {},
		shadowlength: { params: ['FArg'] },
		shadowlengthx: { params: ['FArg'] },
		shadowlengthy: { params: ['FArg'] },
		skewafterzoomrot: { params: ['BIArg'] },
		skewx: { params: ['FArg'] },
		skewy: { params: ['FArg'] },
		sleep: { params: ['FArg'] },
		smooth: { params: ['FArg'] },
		spin: {},
		spring: { params: ['FArg'] },
		squish: {},
		stopeffect: {},
		stoptweening: {},
		stretchto: { params: ['FArg', 'FArg', 'FArg', 'FArg'] },
		texturetranslate: { params: ['FArg', 'FArg'] },
		texturewrapping: { params: ['BIArg'] },
		tween: { params: ['FArg'] },
		valign: { params: ['FArg'] },
		vertalign: {},
		vibrate: {},
		visible: { params: ['BIArg'] },
		wag: {},
		wireframe: { params: ['BIArg'] },
		x: { params: ['FArg'] },
		xy: { params: ['FArg', 'FArg'] },
		xyz: { params: ['FArg', 'FArg', 'FArg'] },
		y: { params: ['FArg'] },
		z: { params: ['FArg'] },
		zbias: { params: ['FArg'] },
		zbuffer: { params: ['BIArg'] },
		zoom: { params: ['FArg'] },
		zoomto: { params: ['FArg', 'FArg'] },
		zoomtoheight: { params: ['FArg'] },
		zoomtowidth: { params: ['FArg'] },
		zoomx: { params: ['FArg'] },
		zoomy: { params: ['FArg'] },
		zoomz: { params: ['FArg'] },
		ztest: { params: ['BIArg'] },
		ztestmode: {},
		zwrite: { params: ['BIArg'] }
	});

export class Actor extends ActorMixin(Container3D) {}
