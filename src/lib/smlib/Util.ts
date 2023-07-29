export function SCALE(x: number, l1: number, h1: number, l2: number, h2: number) {
	return ((x - l1) * (h2 - l2)) / (h1 - l1) + l2;
}
export function applyMixins(derivedCtor: any, constructors: any[]) {
	constructors.forEach((baseCtor) => {
		Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
			Object.defineProperty(
				derivedCtor.prototype,
				name,
				Object.getOwnPropertyDescriptor(baseCtor.prototype, name) || Object.create(null)
			);
		});
	});
}
