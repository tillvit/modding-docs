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

type Metatable = Record<string, (...args: any[]) => any>;

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
		commands = new Map<string, (this: Metatable, args?: object) => void>();
		metatable: Record<string, (...args: any[]) => any> = {};
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
			this.metatable = this.exportMetatable();
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

		Sleep() {
			console.error('Sleep: method not implemented');
		}
		Linear() {
			console.error('Linear: method not implemented');
		}
		Accelerate() {
			console.error('Accelerate: method not implemented');
		}
		Decelerate() {
			console.error('Decelerate: method not implemented');
		}
		Spring() {
			console.error('Spring: method not implemented');
		}
		Tween() {
			console.error('Tween: method not implemented');
		}
		StopTweening() {
			console.error('StopTweening: method not implemented');
		}
		Finishtweening() {
			console.error('Finishtweening: method not implemented');
		}
		Hurrytweening() {
			console.error('Hurrytweening: method not implemented');
		}
		GetTweenTimeLeft() {
			console.error('GetTweenTimeLeft: method not implemented');
		}
		SetX(x: number) {
			this.x = x;
		}
		SetY(y: number) {
			this.y = y;
		}
		SetZ(z: number) {
			this.z = z;
		}
		SetXY(x: number, y: number) {
			this.x = x;
			this.y = y;
		}
		SetXYZ(x: number, y: number, z: number) {
			this.x = x;
			this.y = y;
			this.z = z;
		}
		AddX(x: number) {
			this.x += x;
		}
		AddY(y: number) {
			this.y += y;
		}
		AddZ(z: number) {
			this.z += z;
		}
		SetZoom(scale: number) {
			this.scale.set(scale);
		}
		SetZoomX(scale: number) {
			this.scale.x = scale;
		}
		SetZoomY(scale: number) {
			this.scale.y = scale;
		}
		SetZoomZ(scale: number) {
			this.scale.z = scale;
		}
		ZoomTo(width: number, height: number) {
			this.ZoomToWidth(width);
			this.ZoomToHeight(height);
		}
		ZoomToWidth(width: number) {
			this.scale.x = width / this.size[0];
		}
		ZoomToHeight(height: number) {
			this.scale.y = height / this.size[1];
		}
		SetWidth(width: number) {
			this.size[0] = width;
		}
		SetHeight(height: number) {
			this.size[0] = height;
		}
		SetBaseAlpha() {
			console.error('SetBaseAlpha: method not implemented');
		}
		SetBaseZoom() {
			console.error('SetBaseZoom: method not implemented');
		}
		SetName(name: string) {
			this.name = name;
		}
		SetBaseZoomX() {
			console.error('SetBaseZoomX: method not implemented');
		}
		SetBaseZoomY() {
			console.error('SetBaseZoomY: method not implemented');
		}
		SetBaseZoomZ() {
			console.error('SetBaseZoomZ: method not implemented');
		}
		StretchTo(left: number, top: number, bottom: number, right: number) {
			// width and height of rectangle
			const width = right - left;
			const height = bottom - top;

			// center of the rectangle
			const cx = left + width / 2.0;
			const cy = top + height / 2.0;

			// zoom fActor needed to scale the Actor to fill the rectangle
			const fNewZoomX = width / this.size[0];
			const fNewZoomY = height / this.size[1];

			this.SetXY(cx, cy);
			this.SetZoomX(fNewZoomX);
			this.SetZoomY(fNewZoomY);
		}
		SetCropLeft() {
			console.error('SetCropLeft: method not implemented');
		}
		SetCropTop() {
			console.error('SetCropTop: method not implemented');
		}
		SetCropRight() {
			console.error('SetCropRight: method not implemented');
		}
		SetCropBottom() {
			console.error('SetCropBottom: method not implemented');
		}
		SetFadeLeft() {
			console.error('SetFadeLeft: method not implemented');
		}
		SetFadeTop() {
			console.error('SetFadeTop: method not implemented');
		}
		SetFadeRight() {
			console.error('SetFadeRight: method not implemented');
		}
		SetFadeBottom() {
			console.error('SetFadeBottom: method not implemented');
		}
		SetDiffuse() {
			console.error('SetDiffuse: method not implemented');
		}
		SetDiffuseUpperLeft() {
			console.error('SetDiffuseUpperLeft: method not implemented');
		}
		SetDiffuseUpperRight() {
			console.error('SetDiffuseUpperRight: method not implemented');
		}
		SetDiffuseLowerLeft() {
			console.error('SetDiffuseLowerLeft: method not implemented');
		}
		SetDiffuseLowerRight() {
			console.error('SetDiffuseLowerRight: method not implemented');
		}
		SetDiffuseLeftEdge() {
			console.error('SetDiffuseLeftEdge: method not implemented');
		}
		SetDiffuseRightEdge() {
			console.error('SetDiffuseRightEdge: method not implemented');
		}
		SetDiffuseTopEdge() {
			console.error('SetDiffuseTopEdge: method not implemented');
		}
		SetDiffuseBottomEdge() {
			console.error('SetDiffuseBottomEdge: method not implemented');
		}
		SetDiffuseAlpha() {
			console.error('SetDiffuseAlpha: method not implemented');
		}
		SetDiffuseColor() {
			console.error('SetDiffuseColor: method not implemented');
		}
		SetGlow() {
			console.error('SetGlow: method not implemented');
		}
		SetAux() {
			console.error('SetAux: method not implemented');
		}
		GetAux() {
			console.error('GetAux: method not implemented');
		}
		SetRotationX() {
			this.rotationQuaternion.setEulerAngles(0, 0, 0);
		}
		SetRotationY() {
			console.error('SetRotationY: method not implemented');
		}
		SetRotationZ() {
			console.error('SetRotationZ: method not implemented');
		}
		AddRotationX() {
			console.error('AddRotationX: method not implemented');
		}
		AddRotationY() {
			console.error('AddRotationY: method not implemented');
		}
		AddRotationZ() {
			console.error('AddRotationZ: method not implemented');
		}
		SetBaseRotationX() {
			console.error('SetBaseRotationX: method not implemented');
		}
		SetBaseRotationY() {
			console.error('SetBaseRotationY: method not implemented');
		}
		SetBaseRotationZ() {
			console.error('SetBaseRotationZ: method not implemented');
		}
		SetSkewX() {
			console.error('SetSkewX: method not implemented');
		}
		SetSkewY() {
			console.error('SetSkewY: method not implemented');
		}
		AddRotationH() {
			console.error('AddRotationH: method not implemented');
		}
		AddRotationP() {
			console.error('AddRotationP: method not implemented');
		}
		AddRotationR() {
			console.error('AddRotationR: method not implemented');
		}
		SetShadowLength() {
			console.error('SetShadowLength: method not implemented');
		}
		SetShadowLengthX() {
			console.error('SetShadowLengthX: method not implemented');
		}
		SetShadowLengthY() {
			console.error('SetShadowLengthY: method not implemented');
		}
		SetShadowColor() {
			console.error('SetShadowColor: method not implemented');
		}
		SetHorizAlign() {
			console.error('SetHorizAlign: method not implemented');
		}
		SetVertAlign() {
			console.error('SetVertAlign: method not implemented');
		}
		SetEffectDiffuseBlink() {
			console.error('SetEffectDiffuseBlink: method not implemented');
		}
		SetEffectDiffuseShift() {
			console.error('SetEffectDiffuseShift: method not implemented');
		}
		SetEffectDiffuseRamp() {
			console.error('SetEffectDiffuseRamp: method not implemented');
		}
		SetEffectGlowBlink() {
			console.error('SetEffectGlowBlink: method not implemented');
		}
		SetEffectGlowShift() {
			console.error('SetEffectGlowShift: method not implemented');
		}
		SetEffectGlowRamp() {
			console.error('SetEffectGlowRamp: method not implemented');
		}
		SetEffectRainbow() {
			console.error('SetEffectRainbow: method not implemented');
		}
		SetEffectWag() {
			console.error('SetEffectWag: method not implemented');
		}
		SetEffectBounce() {
			console.error('SetEffectBounce: method not implemented');
		}
		SetEffectBob() {
			console.error('SetEffectBob: method not implemented');
		}
		SetEffectPulse() {
			console.error('SetEffectPulse: method not implemented');
		}
		SetEffectSpin() {
			console.error('SetEffectSpin: method not implemented');
		}
		SetEffectVibrate() {
			console.error('SetEffectVibrate: method not implemented');
		}
		StopEffect() {
			console.error('StopEffect: method not implemented');
		}
		SetEffectColor1() {
			console.error('SetEffectColor1: method not implemented');
		}
		SetEffectColor2() {
			console.error('SetEffectColor2: method not implemented');
		}
		SetEffectPeriod() {
			console.error('SetEffectPeriod: method not implemented');
		}
		SetEffectTiming() {
			console.error('SetEffectTiming: method not implemented');
		}
		SetEffectHoldAtFull() {
			console.error('SetEffectHoldAtFull: method not implemented');
		}
		SetEffectOffset() {
			console.error('SetEffectOffset: method not implemented');
		}
		SetEffectClockString() {
			console.error('SetEffectClockString: method not implemented');
		}
		SetEffectMagnitude() {
			console.error('SetEffectMagnitude: method not implemented');
		}
		GetEffectMagnitude() {
			console.error('GetEffectMagnitude: method not implemented');
		}
		ScaleToCover() {
			console.error('ScaleToCover: method not implemented');
		}
		ScaleToFitInside() {
			console.error('ScaleToFitInside: method not implemented');
		}
		EnableAnimation() {
			console.error('EnableAnimation: method not implemented');
		}
		SetState() {
			console.error('SetState: method not implemented');
		}
		GetNumStates() {
			console.error('GetNumStates: method not implemented');
		}
		SetTextureTranslate() {
			console.error('SetTextureTranslate: method not implemented');
		}
		SetTextureWrapping() {
			console.error('SetTextureWrapping: method not implemented');
		}
		SetTextureFiltering() {
			console.error('SetTextureFiltering: method not implemented');
		}
		SetBlendMode() {
			console.error('SetBlendMode: method not implemented');
		}
		SetUseZBuffer() {
			console.error('SetUseZBuffer: method not implemented');
		}
		SetZTestMode() {
			console.error('SetZTestMode: method not implemented');
		}
		SetZWrite() {
			console.error('SetZWrite: method not implemented');
		}
		SetZBias() {
			console.error('SetZBias: method not implemented');
		}
		SetClearZBuffer() {
			console.error('SetClearZBuffer: method not implemented');
		}
		SetCullMode() {
			console.error('SetCullMode: method not implemented');
		}
		SetVisible() {
			console.error('SetVisible: method not implemented');
		}
		SetHibernate() {
			console.error('SetHibernate: method not implemented');
		}
		SetDrawOrder() {
			console.error('SetDrawOrder: method not implemented');
		}
		HandleMessage() {
			console.error('HandleMessage: method not implemented');
		}
		QueueCommand() {
			console.error('QueueCommand: method not implemented');
		}
		QueueMessage() {
			console.error('QueueMessage: method not implemented');
		}
		AddCommand() {
			console.error('AddCommand: method not implemented');
		}
		RunCommandsRecursively() {
			console.error('RunCommandsRecursively: method not implemented');
		}
		GetX() {
			console.error('GetX: method not implemented');
		}
		GetY() {
			console.error('GetY: method not implemented');
		}
		GetZ() {
			console.error('GetZ: method not implemented');
		}
		GetDestX() {
			console.error('GetDestX: method not implemented');
		}
		GetDestY() {
			console.error('GetDestY: method not implemented');
		}
		GetDestZ() {
			console.error('GetDestZ: method not implemented');
		}
		GetUnzoomedWidth() {
			console.error('GetUnzoomedWidth: method not implemented');
		}
		GetUnzoomedHeight() {
			console.error('GetUnzoomedHeight: method not implemented');
		}
		GetZoomedWidth() {
			console.error('GetZoomedWidth: method not implemented');
		}
		GetZoomedHeight() {
			console.error('GetZoomedHeight: method not implemented');
		}
		GetZoom() {
			console.error('GetZoom: method not implemented');
		}
		GetZoomX() {
			console.error('GetZoomX: method not implemented');
		}
		GetZoomY() {
			console.error('GetZoomY: method not implemented');
		}
		GetZoomZ() {
			console.error('GetZoomZ: method not implemented');
		}
		GetBaseZoomX() {
			console.error('GetBaseZoomX: method not implemented');
		}
		GetBaseZoomY() {
			console.error('GetBaseZoomY: method not implemented');
		}
		GetBaseZoomZ() {
			console.error('GetBaseZoomZ: method not implemented');
		}
		GetRotationX() {
			console.error('GetRotationX: method not implemented');
		}
		GetRotationY() {
			console.error('GetRotationY: method not implemented');
		}
		GetRotationZ() {
			console.error('GetRotationZ: method not implemented');
		}
		GetSecsIntoEffect() {
			console.error('GetSecsIntoEffect: method not implemented');
		}
		GetEffectDelta() {
			console.error('GetEffectDelta: method not implemented');
		}
		GetDiffuse() {
			console.error('GetDiffuse: method not implemented');
		}
		GetGlow() {
			console.error('GetGlow: method not implemented');
		}
		GetDiffuseAlpha() {
			console.error('GetDiffuseAlpha: method not implemented');
		}
		GetVisible() {
			console.error('GetVisible: method not implemented');
		}
		GetHorizAlign() {
			console.error('GetHorizAlign: method not implemented');
		}
		GetVertAlign() {
			console.error('GetVertAlign: method not implemented');
		}
		GetName() {
			return this.name ?? '';
		}
		GetParent() {
			console.error('GetParent: method not implemented');
		}
		GetFakeParent() {
			console.error('GetFakeParent: method not implemented');
		}
		SetFakeParent() {
			console.error('SetFakeParent: method not implemented');
		}
		AddWrapperState() {
			console.error('AddWrapperState: method not implemented');
		}
		RemoveWrapperState() {
			console.error('RemoveWrapperState: method not implemented');
		}
		GetNumWrapperStates() {
			console.error('GetNumWrapperStates: method not implemented');
		}
		GetWrapperState() {
			console.error('GetWrapperState: method not implemented');
		}
		Draw() {
			console.error('Draw: method not implemented');
		}
	};

export const ActorLib = () =>
	createActorLuaLib(Actor, {
		x: ['SetX', ['FArg']],
		y: ['SetY', ['FArg']],
		z: ['SetZ', ['FArg']],
		xy: ['SetXY', ['FArg', 'FArg']],
		xyz: ['SetXYZ', ['FArg', 'FArg', 'FArg']]
	});

export class Actor extends ActorMixin(Container3D) {}
