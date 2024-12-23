import { Application } from "pixi.js";

let app: Application | null = null;
export const initialize = async () => {
	if (app) app.destroy();

	app = new Application();
	await app.init({
		background: "#000000",
		resizeTo: window,
	});

	if (!document.getElementById("game-canvas")) throw new Error("Game canvas container not found");
	(document.getElementById("game-canvas") as HTMLDivElement).appendChild(app.canvas);

	return app;
};

export const destroy = async () => {
	if (!app) return;
	app.destroy();
	if (document.getElementById("game-canvas"))
		(document.getElementById("game-canvas") as HTMLDivElement).innerHTML = "";
	app = null;
};
