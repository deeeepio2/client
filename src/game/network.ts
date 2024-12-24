import { encode } from "../../shared/websocket";
import { ctsPacketIds } from "../../shared/websocket/packets";

import * as game from "./game";

const serverUrl = "http://localhost:5005/";

let currentSocket: WebSocket | null = null;

export const connect = ({ name }: { name: string }) => {
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
		game.start(currentSocket);
	};
};
