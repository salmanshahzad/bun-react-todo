import path from "node:path";

import { defineConfig } from "drizzle-kit";

// biome-ignore lint/style/noDefaultExport: required by Drizzle
export default defineConfig({
    casing: "snake_case",
    dialect: "postgresql",
    dbCredentials: {
        // biome-ignore lint/complexity/useLiteralKeys: required by TypeScript
        url: process.env["DATABASE_URL"] ?? "",
    },
    out: "drizzle",
    schema: path.join("src", "lib", "server", "services", "schema.ts"),
});
