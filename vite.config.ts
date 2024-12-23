import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import { createHtmlPlugin } from "vite-plugin-html";

import postcssRename from "postcss-rename";
import tailwindcss from "tailwindcss";
import tailwindConfig from "./tailwind.config.ts";
import cssnano from "cssnano";

const classMap: Record<string, string> = {};
let counter = 0;
const generateClass = () => {
	const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	const base = chars.length;
	let acc = "";
	const iter = (n: number) => {
		const q = Math.floor(n / base);
		const r = n % base;
		acc = chars[r] + acc;
		if (q > 0) {
			iter(q);
		}
	};
	iter(counter++);
	return acc;
};
const renameClass = (original: string) => {
	if (!classMap[original]) {
		classMap[original] = generateClass();
	}
	return classMap[original];
};

export default defineConfig({
	plugins: [
		preact(),
		createHtmlPlugin({
			minify: true,
		}),
		{
			name: "rename-classes",
			enforce: "post",
			transform(code, id) {
				const regex = /class.{1,4}"(.*?)"/g;
				if (/\.(js|jsx|ts|tsx|html)$/.test(id) && !/node_modules/.test(id)) {
					if ((code.match(regex)?.length as number) > 0) {
						return code.replace(regex, (match, p1) => {
							const renamedClasses = p1.split(" ").map(renameClass).join(" ");
							return `${match.slice(0, "class".length + 1)}"${renamedClasses}"`;
						});
					}
				}
			},
		},
	],
	css: {
		postcss: {
			plugins: [
				tailwindcss(tailwindConfig),
				postcssRename({
					strategy: (input) => renameClass(input),
				}),
				cssnano(),
			],
		},
	},
});
