import * as PIXI from "pixi.js";

import type { GameMap } from "../../shared/game/map";
import {
	getHidespaceById,
	getPropById,
	renderGradientShape,
	renderTerrainShape,
	renderWaterBorder,
} from "./utils";

const pixiStyles = {
	messageSignText: new PIXI.TextStyle({
		fontFamily: "Quicksand",
		fontSize: 24,
		fill: 0x7f694e,
		align: "center",
		wordWrapWidth: 300,
		trim: true,
		wordWrap: true,
		breakWords: true,
		fontWeight: "bolder",
	}),
};

export class MapRenderer {
	map: GameMap;

	constructor({
		map,
		container,
	}: { map: GameMap; container: PIXI.Container<PIXI.ContainerChild> }) {
		this.map = map;

		const skyLayer = new PIXI.Container();
		container.addChild(skyLayer);

		const waterLayer = new PIXI.Container();
		container.addChild(waterLayer);

		const backgroundTerrainsLayer = new PIXI.Container();
		container.addChild(backgroundTerrainsLayer);

		const airPocketsLayer = new PIXI.Container();
		container.addChild(airPocketsLayer);

		const waterBorderLowLayer = new PIXI.Container();
		container.addChild(waterBorderLowLayer);

		const hideSpacesLowerLayer = new PIXI.Container();
		container.addChild(hideSpacesLowerLayer);

		const hideSpacesLowLayer = new PIXI.Container();
		container.addChild(hideSpacesLowLayer);

		const propsLayer = new PIXI.Container();
		container.addChild(propsLayer);

		const platformsLayer = new PIXI.Container();
		container.addChild(platformsLayer);

		const currentsLayer = new PIXI.Container();
		container.addChild(currentsLayer);

		const animalsLayer = new PIXI.Container();
		container.addChild(animalsLayer);

		const animalsUiLayer = new PIXI.Container();
		container.addChild(animalsUiLayer);

		const hideSpacesHighLayer = new PIXI.Container();
		container.addChild(hideSpacesHighLayer);

		const islandsLayer = new PIXI.Container();
		container.addChild(islandsLayer);

		const waterBorderHighLayer = new PIXI.Container();
		container.addChild(waterBorderHighLayer);

		const terrainsLayer = new PIXI.Container();
		container.addChild(terrainsLayer);

		const ceilingsLayer = new PIXI.Container();
		container.addChild(ceilingsLayer);

		const shadowLayer = new PIXI.Container();
		container.addChild(shadowLayer);

		const foodLayer = new PIXI.Container();
		container.addChild(foodLayer);

		const waterObjects: {
			x: number;
			y: number;
		}[][] = [];
		const airPocketObjects: {
			x: number;
			y: number;
		}[][] = [];

		// one-time rendering
		// Render map
		for (const sky of map.screenObjects.sky ?? []) {
			const shape = renderGradientShape(sky.points, sky.colors[0], sky.colors[1]);
			skyLayer.addChild(shape);
		}
		for (const water of map.screenObjects.water ?? []) {
			const shape: PIXI.Graphics & { points?: number[][] } = renderGradientShape(
				water.points,
				water.colors[0],
				water.colors[1],
			);
			shape.points = water.points.map((p) => [p.x, p.y]);
			waterLayer.addChild(shape);
			waterObjects.push(water.points);

			if (water.hasBorder) {
				const border = renderWaterBorder(water.points, water.colors[0], false);
				for (const b of border.topBorder ?? []) {
					waterBorderLowLayer.addChild(b);
				}
				for (const b of border.bottomBorder ?? []) {
					waterBorderHighLayer.addChild(b);
				}
			}
		}
		for (const airpocket of map.screenObjects["air-pockets"] ?? []) {
			const shape: PIXI.Graphics & { points?: number[][] } = renderTerrainShape(
				airpocket.points,
				airpocket.texture,
				true,
			);
			shape.points = airpocket.points.map((p) => [p.x, p.y]);
			shape.tint = 0xaaaaaa; // Hex color code #AAAAAA
			airPocketsLayer.addChild(shape);
			airPocketObjects.push(airpocket.points);

			const border = renderWaterBorder(airpocket.points, airpocket.borderColor, true);
			for (const b of border.topBorder ?? []) {
				waterBorderLowLayer.addChild(b);
			}
			for (const b of border.bottomBorder ?? []) {
				waterBorderHighLayer.addChild(b);
			}
		}
		for (const bgterrain of map.screenObjects["background-terrains"] ?? []) {
			const shape = renderTerrainShape(bgterrain.points, bgterrain.texture, true);
			shape.alpha = bgterrain.opacity;
			backgroundTerrainsLayer.addChild(shape);
		}
		for (const platform of map.screenObjects.platforms ?? []) {
			const shape = renderTerrainShape(platform.points, platform.texture, false);
			platformsLayer.addChild(shape);
		}
		for (const island of map.screenObjects.islands ?? []) {
			const shape: PIXI.Graphics & { points?: number[][] } = renderTerrainShape(
				island.points,
				island.texture,
				false,
			);
			shape.points = island.points.map((p) => [p.x, p.y]);
			islandsLayer.addChild(shape);
		}
		for (const terrain of map.screenObjects.terrains ?? []) {
			const shape: PIXI.Graphics & { points?: number[][] } = renderTerrainShape(
				terrain.points,
				terrain.texture,
				false,
			);
			shape.points = terrain.points.map((p) => [p.x, p.y]);
			terrainsLayer.addChild(shape);
		}
		for (const ceiling of map.screenObjects.ceilings ?? []) {
			const shape: PIXI.Graphics & { points?: number[][] } = renderTerrainShape(
				ceiling.points,
				ceiling.texture,
				false,
			);
			shape.points = ceiling.points.map((p) => [p.x, p.y]);
			ceilingsLayer.addChild(shape);
		}
		for (const hidespace of map.screenObjects["hide-spaces"] ?? []) {
			const hs = getHidespaceById(hidespace.hSType);
			if (!hs) return;
			const object: PIXI.Sprite & { animation?: string } = new PIXI.Sprite(
				PIXI.Assets.get(hs.asset),
			);
			object.width = hs.width * 10;
			object.height = hs.height * 10;
			object.anchor.set(hs.anchor_x, hs.anchor_y);
			object.position.set(hidespace.x, hidespace.y);
			object.alpha = hidespace.opacity || 1;
			object.angle = hidespace.rotation;
			object.zIndex = hidespace.id;
			if (hidespace.hSType === 21) {
				object.animation = "whirlpool";
				object.alpha /= 2;
			}

			if (hs.above && (hidespace.opacity === 1 || hidespace.opacity === undefined)) {
				hideSpacesHighLayer.addChild(object);
			} else if (hidespace.opacity !== 1) {
				hideSpacesLowerLayer.addChild(object);
			} else {
				hideSpacesLowLayer.addChild(object);
			}
		}
		for (const prop of map.screenObjects.props ?? []) {
			const p = getPropById(prop.pType);
			if (!p) return;
			const object = new PIXI.Sprite(PIXI.Assets.get(p.asset));
			object.width = p.width * 10;
			object.height = p.height * 10;
			object.anchor.set(p.anchor_x, p.anchor_y);
			object.position.set(prop.x, prop.y);
			object.angle = prop.rotation;

			// Message sign
			if (p.id === 1 && prop.params?.text) {
				const text = new PIXI.Text({
					text: prop.params.text,
					style: pixiStyles.messageSignText,
				});
				text.anchor.set(0.5);
				text.localTransform.setTransform(0, -350, 0, 0, 1, 1, 0, 0, 0);
				object.addChild(text);
			}

			propsLayer.addChild(object);
		}
	}
}
