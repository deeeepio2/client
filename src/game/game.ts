import type { DefaultEventsMap } from "@socket.io/component-emitter";
import type { Socket } from "socket.io-client";

import { setHomePageVisible, setIsPlayingGame } from "../app.tsx";

import * as gameCanvas from "./pixi.ts";
import * as PIXI from "pixi.js";

export const start = async (socket: Socket<DefaultEventsMap, DefaultEventsMap>) => {
	socket.on("disconnect", () => {
		console.log("disconnected");
		gameCanvas.destroy();
		setIsPlayingGame(false);
		setHomePageVisible(true);
	});

	const app = await gameCanvas.initialize();
	setHomePageVisible(false);

	const style = new PIXI.TextStyle({
		fontSize: 24,
		fill: "#ffffff",
		fontFamily: "Quicksand",
	});
	const socketText = new PIXI.Text({
		text: `Connected to socket ID ${socket.id}`,
		style,
	});
	socketText.x = app.screen.width / 2 - socketText.width / 2;
	socketText.y = app.screen.height / 2 - socketText.height / 2;
	app.stage.addChild(socketText);
};
