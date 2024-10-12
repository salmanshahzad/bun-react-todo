import { hc } from "hono/client";

import type { ApiRoutes } from "../server/index.ts";

export const api = hc<ApiRoutes>(
    // biome-ignore lint/complexity/useLiteralKeys: TypeScript
    `${import.meta.env["VITE_ORIGIN"] ?? ""}/api`,
    {
        init: {
            credentials: "include",
        },
    },
);
