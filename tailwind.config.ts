import daisyui from "daisyui";
import type { Config } from "tailwindcss";

// biome-ignore lint/style/noDefaultExport: required by Tailwind
export default {
    content: ["client/**/*.tsx"],
    plugins: [daisyui],
} satisfies Config;
