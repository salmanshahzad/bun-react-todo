import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// biome-ignore lint/style/noDefaultExport: required by Vite
export default defineConfig({
    plugins: [react()],
});
