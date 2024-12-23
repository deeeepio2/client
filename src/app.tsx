import { useCallback, useState } from "preact/hooks";
import "./app.css";

import { AnimatePresence, motion } from "motion/react";

import { connect } from "./game/network";

export let setHomePageVisible = (_visible: boolean) => {};
export let setIsPlayingGame = (_isPlaying: boolean) => {};

export function App() {
	const [name, setName] = useState("");
	const [showHomePage, setShowHomePage] = useState(true);
	const [isPlaying, setIsPlaying] = useState(false);

	setHomePageVisible = useCallback((visible: boolean) => {
		setShowHomePage(visible);
	}, []);

	setIsPlayingGame = useCallback((isPlaying: boolean) => {
		setIsPlaying(isPlaying);
	}, []);

	return (
		<>
			<main class={"w-screen h-screen quicksand overflow-hidden"}>
				{/* Canvas */}
				<div id={"game-canvas"} class={"fixed top-0 left-0 right-0 bottom-0"} />

				{/* Home page */}
				<AnimatePresence>
					{showHomePage && (
						<motion.div
							exit={{
								opacity: 0,
								y: "-100%",
								transition: {
									duration: 0.5,
								},
							}}
							class={"fixed top-0 left-0 right-0 bottom-0"}
						>
							{/* Background */}
							<div class={"fixed top-0 left-0 right-0 bottom-0 home-page bg"}>
								<div class={"sand"} />
							</div>

							{/* UI */}
							<div
								class={
									"fixed top-0 left-0 right-0 bottom-0 flex flex-col justify-center items-center select-none gap-2"
								}
							>
								<p class={"text-5xl bungee"}>Deeeep.io 2</p>
								<div class={"flex gap-2"}>
									<input
										type={"text"}
										placeholder={"Enter a name"}
										value={name}
										onChange={(e) => setName((e.target as HTMLInputElement).value)}
										class={"outline-none bg-white/10 px-4 py-2 rounded-xl"}
									/>
									<button
										type={"button"}
										onClick={() => {
											if (isPlaying) return setHomePageVisible(false);
											setIsPlaying(true);
											connect({
												name: name,
											});
										}}
										class={"btn btn-emerald w-20"}
									>
										Play
									</button>
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</main>
		</>
	);
}
