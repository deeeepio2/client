import * as PIXI from "pixi.js";

import { setHomePageVisible, setIsPlayingGame } from "../app.tsx";

import { decompress } from "../../shared/compression";

import { encode } from "../../shared/websocket/index";
import { ctsPacketIds } from "../../shared/websocket/packets";

import { loadMap, type GameMap } from "../../shared/game/map";

import { MapRenderer } from "./renderer";
import { loadAssets } from "./assetLoader.ts";

const serverUrl = "http://localhost:5005/";

let currentSocket: WebSocket | null = null;
let map: GameMap;
export const connect = async ({ name }: { name: string }) => {
	await Promise.all([
		// fetch map
		new Promise((resolve) => {
			(async () => {
				map = loadMap(JSON.parse(await fetchMap()));
				resolve(null);
			})();
		}),

		// load textures
		new Promise((resolve) => {
			(async () => {
				await loadAssets();
				resolve(null);
			})();
		}),
	]);

	// connect to websocket
	if (currentSocket) {
		currentSocket.close();
	}
	currentSocket = new WebSocket(serverUrl);
	currentSocket.onclose = () => {
		currentSocket = null;
	};
	currentSocket.onopen = () => {
		if (!currentSocket) return;

		console.log("connected");
		currentSocket.send(encode(ctsPacketIds.name, { name }));
		start(currentSocket);
	};
};

const fetchMap = async () => {
	return await fetch(`${serverUrl}map`)
		.then((res) => res.arrayBuffer())
		.then((ab) => decompress(ab, "gzip"));
};

let app: PIXI.Application | null = null;
const start = async (socket: WebSocket) => {
	socket.onclose = () => {
		console.log("disconnected");
		destroy();
		setIsPlayingGame(false);
		setHomePageVisible(true);
	};

	if (app) app.destroy();

	app = new PIXI.Application();
	await app.init({
		background: "#000000",
		resizeTo: window,
	});

	if (!document.getElementById("game-canvas")) throw new Error("Game canvas container not found");
	(document.getElementById("game-canvas") as HTMLDivElement).appendChild(app.canvas);

	setHomePageVisible(false);

	const style = new PIXI.TextStyle({
		fontSize: 24,
		fill: "#ffffff",
		fontFamily: "Quicksand",
	});
	const socketText = new PIXI.Text({
		text: "Connected to websocket",
		style,
	});
	socketText.x = app.screen.width / 2 - socketText.width / 2;
	socketText.y = app.screen.height / 2 - socketText.height / 2;
	app.stage.addChild(socketText);

	const game = new Game({ websocket: socket, mapData: map, stage: app.stage });
};

const destroy = async () => {
	if (!app) return;
	app.destroy();
	if (document.getElementById("game-canvas"))
		(document.getElementById("game-canvas") as HTMLDivElement).innerHTML = "";
	app = null;
};

class Game {
	websocket: WebSocket;
	mapData: GameMap;
	stage: PIXI.Container<PIXI.ContainerChild>;

	mapContainer: PIXI.Container<PIXI.ContainerChild>;
	mapRenderer: MapRenderer;

	constructor({
		websocket,
		mapData,
		stage,
	}: { websocket: WebSocket; mapData: GameMap; stage: PIXI.Container<PIXI.ContainerChild> }) {
		this.websocket = websocket;
		this.mapData = mapData;
		this.stage = stage;

		this.mapContainer = new PIXI.Container();
		this.stage.addChild(this.mapContainer);
		this.mapRenderer = new MapRenderer({ map: this.mapData, container: this.mapContainer });
	}
}
