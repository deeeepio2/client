import type { DefaultEventsMap } from "@socket.io/component-emitter";
import type { Socket } from "socket.io-client";

import { io } from "socket.io-client";

import * as game from "./game";

const serverUrl = "http://localhost:5005/";

let currentSocket: Socket<DefaultEventsMap, DefaultEventsMap> | null = null;

export const connect = ({ name }: { name: string }) => {
	if (currentSocket) {
		currentSocket.disconnect();
	}
	currentSocket = io(serverUrl, {
		path: "/ws",
	});
	currentSocket.on("connect", () => {
		if (!currentSocket) return;

		console.log("connected", currentSocket.id);
		currentSocket.emit("name", name);
		game.start(currentSocket);
	});
};
