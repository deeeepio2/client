import * as PIXI from "pixi.js";

import { animals } from "../../shared/consts/animals";
import { hidespaces } from "../../shared/consts/hidespaces";
import { props } from "../../shared/consts/props";

export function isClockwise(points: { x: number; y: number }[]) {
	let total = 0;
	for (let i = 0; i < points.length; i++) {
		// Get the current and next point
		const currentPoint = points[i];
		const nextPoint = points[(i + 1) % points.length];

		// Calculate the cross product of the points
		total += (nextPoint.x - currentPoint.x) * (nextPoint.y + currentPoint.y);
	}
	return total < 0;
}

export function makeBrighter(color: number, brightnessFactor: number) {
	const hexString = `00000${(0 | color).toString(16)}`.slice(-6);
	const r = Number.parseInt(hexString.slice(0, 2), 16);
	const o = Number.parseInt(hexString.slice(2, 4), 16);
	const l = Number.parseInt(hexString.slice(4, 6), 16);
	let c = brightnessFactor;

	if (r * brightnessFactor > 280) {
		const a = 280 / r;
		if (a < c) {
			c = a;
		}
	}

	if (o * brightnessFactor > 280) {
		const a = 280 / o;
		if (a < c) {
			c = a;
		}
	}

	if (l * brightnessFactor > 280) {
		const a = 280 / l;
		if (a < c) {
			c = a;
		}
	}

	const newR = r * c;
	const newO = o * c;
	const newL = l * c;
	const [red, green, blue] = redistributeRgb(newR, newO, newL);

	const newHexString = `#${`0${Math.floor(red).toString(16)}`.slice(-2)}${`0${Math.floor(green).toString(16)}`.slice(-2)}${`0${Math.floor(
		blue,
	).toString(16)}`.slice(-2)}`;

	return stringColorToHex(newHexString);
}
function redistributeRgb(red: number, green: number, blue: number) {
	const maxColorValue = 255.999;
	const maxColor = Math.max(red, green, blue);

	if (maxColor <= maxColorValue) {
		return [red, green, blue];
	}

	const sum = red + green + blue;

	if (sum >= 3 * maxColorValue) {
		return [maxColorValue, maxColorValue, maxColorValue];
	}

	const ratio = (3 * maxColorValue - sum) / (3 * maxColor - sum);
	const offset = maxColorValue - ratio * maxColor;

	return [offset + ratio * red, offset + ratio * green, offset + ratio * blue];
}
function stringColorToHex(color: string | number) {
	return typeof color === "string" ? Number.parseInt(color.slice(1), 16) : color;
}

export function createGradient(startColor: number, endColor: number, quality = 256): PIXI.Texture {
	const canvas: HTMLCanvasElement = document.createElement("canvas");

	canvas.width = 1;
	canvas.height = quality;

	const hexStartColor: string = `#${startColor.toString(16).padStart(6, "0")}`;
	const hexEndColor: string = `#${endColor.toString(16).padStart(6, "0")}`;

	const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");

	if (!ctx) return PIXI.Texture.EMPTY;

	// use canvas2d API to create gradient
	const grd: CanvasGradient = ctx.createLinearGradient(0, 0, 0, quality);

	grd.addColorStop(0, hexStartColor);
	grd.addColorStop(1, hexEndColor);

	ctx.fillStyle = grd;
	ctx.fillRect(0, 0, 1, quality);

	return PIXI.Texture.from(canvas);
}

export function createRadialGradient(
	radius: number,
	startColor: string,
	endColor: string,
): PIXI.Texture {
	const canvas: HTMLCanvasElement = document.createElement("canvas");

	canvas.width = radius;
	canvas.height = radius;

	const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");

	if (!ctx) return PIXI.Texture.EMPTY;

	// use canvas2d API to create gradient
	const hr = radius / 2;
	const grd: CanvasGradient = ctx.createRadialGradient(hr, hr, 0, hr, hr, hr);

	grd.addColorStop(0, startColor);
	grd.addColorStop(1, endColor);

	ctx.fillStyle = grd;
	ctx.fillRect(0, 0, radius, radius);

	return PIXI.Texture.from(canvas);
}

export function renderGradientShape(
	points: Array<{ x: number; y: number }>,
	gradientStart: number,
	gradientStop: number,
): PIXI.Graphics {
	const shape: PIXI.Graphics = new PIXI.Graphics();
	shape.moveTo(points[0].x, points[0].y);

	const minY: number = points.reduce((a, b) => (b.y < a ? b.y : a), Number.POSITIVE_INFINITY);
	const maxY: number = points.reduce((a, b) => (b.y > a ? b.y : a), Number.NEGATIVE_INFINITY);
	const shapeHeight: number = maxY - minY;

	if (gradientStart === gradientStop) {
		shape.fill({
			color: gradientStart,
		});
	} else {
		shape.fill({
			texture: createGradient(gradientStart, gradientStop, shapeHeight),
			matrix: new PIXI.Matrix(1, 0, 0, 1, points[0].x, minY),
		});
	}
	for (let i = 1; i < points.length; i++) {
		shape.lineTo(points[i].x, points[i].y);
	}
	shape.closePath();
	return shape;
}

function getTextureById(id: number) {
	return {
		1: "terrain",
		2: "terrain_back",
		3: "coldterrain",
		4: "coldterrain_back",
		5: "deepterrain",
		6: "beach",
		7: "beach_underwater",
		8: "swamp_island",
		9: "glacier",
		10: "reef",
		11: "reef2",
		12: "cenote1",
		13: "chalk",
		14: "clay",
		15: "estuarysand",
		16: "limestone",
		17: "rustymetal",
		18: "shallowglacier",
		19: "volcanicsand",
	}[id];
}
export function renderTerrainShape(
	points: Array<{ x: number; y: number }>,
	texture: number | string,
	isBackground: boolean,
) {
	const shape: PIXI.Graphics = new PIXI.Graphics();
	shape.moveTo(points[0].x, points[0].y);

	shape.fill({
		texture:
			typeof texture === "number"
				? PIXI.Texture.from(`/textures/${getTextureById(texture)}.png`)
				: PIXI.Texture.from(texture.replace("assets/terrains", "/textures")),
		color: "ffffff",
		matrix: new PIXI.Matrix(0.1, 0, 0, 0.1, isBackground ? 2 : 0, isBackground ? 2 : 0),
	});
	for (let i = 1; i < points.length; i++) {
		shape.lineTo(points[i].x, points[i].y);
	}
	shape.closePath();
	return shape;
}

// top means the top half of the water border
// top does NOT mean the higher layer/zIndex
export function renderWaterBorder(
	points: Array<{ x: number; y: number }>,
	color: number,
	isAirPocket = false,
): {
	topBorder: Array<PIXI.Graphics>;
	bottomBorder: Array<PIXI.Graphics>;
} {
	const borderColor = makeBrighter(color, 1.75);
	if (isAirPocket) {
		if (isClockwise(points)) points.reverse();
	} else {
		if (!isClockwise(points)) points.reverse();
	}

	const topBorders: Array<PIXI.Graphics> = [];
	const bottomBorders: Array<PIXI.Graphics> = [];

	for (let i = 0; i < points.length; i++) {
		const current = points[i];
		const last = points[i > 0 ? i - 1 : points.length - 1];

		if (current.x > last.x && current.x - last.x > 10) {
			const top = new PIXI.Graphics();
			top.moveTo(last.x, last.y - 1.5);
			top.beginFill(borderColor);
			top.lineTo(current.x, current.y - 1.5);
			top.lineTo(current.x, current.y);
			top.lineTo(last.x, last.y);
			top.closePath();

			const bottom = new PIXI.Graphics();
			bottom.moveTo(last.x, last.y - 0.1);
			bottom.beginFill(borderColor);
			bottom.lineTo(current.x, current.y - 0.1);
			bottom.lineTo(current.x, current.y + 1.5 - 0.1);
			bottom.lineTo(last.x, last.y + 1.5 - 0.1);
			bottom.closePath();

			topBorders.push(top);
			bottomBorders.push(bottom);
		}
	}

	return {
		topBorder: topBorders,
		bottomBorder: bottomBorders,
	};
}

export function clampCamera(
	x: number,
	y: number,
	zoom: number,
	mapW: number,
	mapH: number,
	width: number,
	height: number,
) {
	const hvw: number = width / 2 / zoom;
	const hvh: number = height / 2 / zoom;
	return [Math.max(hvw, Math.min(x, mapW - hvw)), Math.max(hvh, Math.min(y, mapH - hvh))];
}

export function getBiomes(n: number) {
	const habitats = [
		"reef", // 64
		"salt", // 32
		"fresh", // 16
		"deep", // 8
		"shallow", // 4
		"warm", // 2
		"cold", // 1
	];
	return n
		.toString(2)
		.substr(-7)
		.padStart(7, "0")
		.split("")
		.map((e: string, i: number) => (Number.parseInt(e) === 0 ? null : habitats[i]))
		.reduce((p: string[], c: string | null) => (c == null ? p : p.concat(c)), []);
}

export function getAnimalById(id: number) {
	return animals.find((a) => a.fishLevel === id);
}
export function getHidespaceById(id: number) {
	return hidespaces.find((h) => h.id === id);
}
export function getPropById(id: number) {
	return props.find((p) => p.id === id);
}

// Doesn't account for octopus ink
// Octopus ink has shadowSize of 350
export function getShadowSize(animalId: number) {
	const animal = getAnimalById(animalId);
	if (!animal) return 1200;
	const habitats = getBiomes(animal.habitat);

	const livesInDeep = habitats.includes("deep");
	const livesInShallow = habitats.includes("shallow");
	const livesInFresh = habitats.includes("fresh");
	const livesInWarmSalt = habitats.includes("warm") && habitats.includes("salt");

	if (["blindcavefish", "olm"].includes(animal.name)) {
		return 450;
	}
	if (animal.name === "ghost") {
		return 1750;
	}
	if (livesInDeep) {
		if (!livesInShallow) {
			return 1750;
		}
		if (livesInFresh && !livesInWarmSalt) {
			return 1750;
		}
		return 1200;
	}
	return 1200;
}
