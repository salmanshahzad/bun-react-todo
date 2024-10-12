import { injectable } from "tsyringe-neo";
import { z } from "zod";

@injectable()
export class ConfigService {
    readonly #config;

    constructor() {
        this.#config = z
            .object({
                // biome-ignore lint/style/useNamingConvention: env var
                COOKIE_SECRET: z.string(),
                // biome-ignore lint/style/useNamingConvention: env var
                DATABASE_URL: z.string().url(),
                // biome-ignore lint/style/useNamingConvention: env var
                MIGRATIONS_DIR: z.string(),
                // biome-ignore lint/style/useNamingConvention: env var
                NODE_ENV: z.enum(["development", "production"]),
                // biome-ignore lint/style/useNamingConvention: env var
                PORT: z.coerce.number().int().min(0).max(65535),
                // biome-ignore lint/style/useNamingConvention: env var
                REDIS_URL: z.string().url(),
                // biome-ignore lint/style/useNamingConvention: env var
                VITE_ORIGIN: z.string().url(),
            })
            .parse(process.env);
        Object.freeze(this.#config);
    }

    get config() {
        return this.#config;
    }
}
