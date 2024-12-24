import { setHomePageVisible, setIsPlayingGame } from "../app.tsx";

import { decompress } from "../../shared/compression";

import { encode } from "../../shared/websocket/index.ts";
import { ctsPacketIds } from "../../shared/websocket/packets.ts";

import * as PIXI from "pixi.js";

const serverUrl = "http://localhost:5005/";

let currentSocket: WebSocket | null = null;
let map = {};
export const connect = async ({ name }: { name: string }) => {
	// fetch map
	map = JSON.parse(await fetchMap());

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
};

const destroy = async () => {
	if (!app) return;
	app.destroy();
	if (document.getElementById("game-canvas"))
		(document.getElementById("game-canvas") as HTMLDivElement).innerHTML = "";
	app = null;
};
