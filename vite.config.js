import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import electron from "vite-plugin-electron";
import path from "node:path";

export default defineConfig({
    plugins: [
        react(),
        electron({
            main: {
                entry: "src/electron/main.js",
            },
            preload: {
                input: "src/electron/preload.js"
            },
            vite: {
                resolve: {
                    alias: {
                        "@": path.resolve(__dirname, "./src"),
                    },
                }
            }
        })
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    }
})
