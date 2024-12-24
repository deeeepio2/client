import { setHomePageVisible, setIsPlayingGame } from "../app.tsx";

import * as gameCanvas from "./pixi.ts";
import * as PIXI from "pixi.js";

export const start = async (socket: WebSocket) => {
	socket.onclose = () => {
		console.log("disconnected");
		gameCanvas.destroy();
		setIsPlayingGame(false);
		setHomePageVisible(true);
	};

	const app = await gameCanvas.initialize();
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
