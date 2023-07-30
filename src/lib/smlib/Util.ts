import { Camera, Matrix4x4, Point3D, Vec3 } from 'pixi3d/pixi7';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from './Constants';

export function SCALE(x: number, l1: number, h1: number, l2: number, h2: number) {
	return ((x - l1) * (h2 - l2)) / (h1 - l1) + l2;
}

export function CLAMP(val: number, min: number, max: number) {
	return Math.max(Math.min(val, max), min);
}

export function GetCenteringMatrix(
	fTranslateX: number,
	fTranslateY: number,
	fAddWidth: number,
	fAddHeight: number
) {
	// in screen space, left edge = -1, right edge = 1, bottom edge = -1. top edge = 1
	const fWidth = SCREEN_WIDTH;
	const fHeight = SCREEN_HEIGHT;
	const fPercentShiftX = SCALE(fTranslateX, 0, fWidth, 0, +2.0);
	const fPercentShiftY = SCALE(fTranslateY, 0, fHeight, 0, -2.0);
	const fPercentScaleX = SCALE(fAddWidth, 0, fWidth, 1.0, 2.0);
	const fPercentScaleY = SCALE(fAddHeight, 0, fHeight, 1.0, 2.0);

	const m1 = Matrix4x4.fromTranslation(new Point3D(fPercentShiftX, fPercentShiftY, 0));
	const m2 = Matrix4x4.fromScaling(new Point3D(fPercentScaleX, fPercentScaleY, 1));
	m1.multiply(m2);

	return m1;
}

export function GetOrthoMatrix(l: number, r: number, b: number, t: number, zn: number, zf: number) {
	return new Matrix4x4([
		2 / (r - l),
		0,
		0,
		0,
		0,
		2 / (t - b),
		0,
		0,
		0,
		0,
		-2 / (zf - zn),
		0,
		-(r + l) / (r - l),
		-(t + b) / (t - b),
		-(zf + zn) / (zf - zn),
		1
	]);
}
export function GetFrustumMatrix(
	l: number,
	r: number,
	b: number,
	t: number,
	zn: number,
	zf: number
) {
	// glFrustum
	const A = (r + l) / (r - l);
	const B = (t + b) / (t - b);
	const C = (-1 * (zf + zn)) / (zf - zn);
	const D = (-1 * (2 * zf * zn)) / (zf - zn);
	return new Matrix4x4([
		(2 * zn) / (r - l),
		0,
		0,
		0,
		0,
		(2 * zn) / (t - b),
		0,
		0,
		A,
		B,
		C,
		-1,
		0,
		0,
		D,
		0
	]);
}

export function RageVec3Normalize(pV: Float32Array) {
	const scale = 1.0 / Math.sqrt(pV[0] * pV[0] + pV[1] * pV[1] + pV[2] * pV[2]);
	const out = Vec3.create();
	out[0] = pV[0] * scale;
	out[1] = pV[1] * scale;
	out[2] = pV[2] * scale;
	return out;
}

export function RageLookAt(
	eyex: number,
	eyey: number,
	eyez: number,
	centerx: number,
	centery: number,
	centerz: number,
	upx: number,
	upy: number,
	upz: number
) {
	let Z = Vec3.fromValues(eyex - centerx, eyey - centery, eyez - centerz);
	Z = RageVec3Normalize(Z);

	let Y = Vec3.fromValues(upx, upy, upz);

	let X = Vec3.fromValues(
		Y[1] * Z[2] - Y[2] * Z[1],
		-Y[0] * Z[2] + Y[2] * Z[0],
		Y[0] * Z[1] - Y[1] * Z[0]
	);

	Y = Vec3.fromValues(
		Z[1] * X[2] - Z[2] * X[1],
		-Z[0] * X[2] + Z[2] * X[0],
		Z[0] * X[1] - Z[1] * X[0]
	);

	X = RageVec3Normalize(Y);
	X = RageVec3Normalize(Y);

	const mat = new Matrix4x4([
		X[0],
		Y[0],
		Z[0],
		0,
		X[1],
		Y[1],
		Z[1],
		0,
		X[2],
		Y[2],
		Z[2],
		0,
		0,
		0,
		0,
		1
	]);

	const mat2 = Matrix4x4.fromTranslation(new Point3D(-eyex, -eyey, -eyez));
	mat.multiply(mat2);

	return mat;
}

// cursed way to set pixi3d projection matrix
function setProjection(camera: Camera, mat: Matrix4x4) {
	const c = camera as any;

	c._projection = new MatrixComponent(c, mat, () => {});
	c._transformId++;
}

class MatrixComponent<Data> {
	_parent;
	_data;
	_update;
	_id = 0;
	constructor(_parent: Camera, _data: Data, _update: (data: Data) => void) {
		this._parent = _parent;
		this._data = _data;
		this._update = _update;
	}
	get data() {
		if (this._id !== this._parent.transformId) {
			this._update(this._data);
			this._id = this._parent.transformId;
		}
		return this._data;
	}
}

export function LoadMenuPerspective(
	fovDegrees: number,
	fWidth: number,
	fHeight: number,
	fVanishPointX: number,
	fVanishPointY: number
) {
	if (fovDegrees == 0) {
		setProjection(Camera.main, GetOrthoMatrix(0, fWidth, fHeight, 0, -1000, 1000));
	} else {
		// probably won't use
		fovDegrees = CLAMP(fovDegrees, 0.1, 179.9);
		const fovRadians = (fovDegrees / 180) * Math.PI;
		const theta = fovRadians / 2;
		const fDistCameraFromImage = fWidth / 2 / Math.tan(theta);

		fVanishPointX = SCALE(fVanishPointX, 0, fWidth, fWidth, 0);
		fVanishPointY = SCALE(fVanishPointY, 0, fHeight, fHeight, 0);

		fVanishPointX -= fWidth / 2;
		fVanishPointY -= fHeight / 2;

		// It's the caller's responsibility to push first.
		Camera.main.projection.copyFrom(
			GetFrustumMatrix(
				(fVanishPointX - fWidth / 2) / fDistCameraFromImage,
				(fVanishPointX + fWidth / 2) / fDistCameraFromImage,
				(fVanishPointY + fHeight / 2) / fDistCameraFromImage,
				(fVanishPointY - fHeight / 2) / fDistCameraFromImage,
				1,
				fDistCameraFromImage + 1000
			)
		);

		Camera.main.view.copyFrom(
			RageLookAt(
				-fVanishPointX + fWidth / 2,
				-fVanishPointY + fHeight / 2,
				fDistCameraFromImage,
				-fVanishPointX + fWidth / 2,
				-fVanishPointY + fHeight / 2,
				0,
				0.0,
				1.0,
				0.0
			)
		);
	}
}
