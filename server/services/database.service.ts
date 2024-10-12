import { migrate } from "drizzle-orm/connect";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { createClient } from "redis";
import { type Disposable, inject, injectable } from "tsyringe-neo";

import { ConfigService } from "./config.service.ts";

@injectable()
export class DatabaseServiceFactory {
    readonly #configService;

    constructor(@inject(ConfigService) configService: ConfigService) {
        this.#configService = configService;
    }

    async create() {
        const pgConnection = postgres(this.#configService.config.DATABASE_URL);
        const pg = drizzle(pgConnection, { casing: "snake_case" });
        const redis = await createClient({
            url: this.#configService.config.REDIS_URL,
        }).connect();
        return new DatabaseService(
            this.#configService,
            pg,
            pgConnection,
            redis,
        );
    }
}

@injectable()
export class DatabaseService implements Disposable {
    readonly #configService;
    readonly #pg;
    readonly #pgConnection;
    readonly #redis;

    constructor(
        configService: ConfigService,
        pg: ReturnType<typeof drizzle>,
        pgConnection: postgres.Sql,
        redis: Awaited<ReturnType<ReturnType<typeof createClient>["connect"]>>,
    ) {
        this.#configService = configService;
        this.#pg = pg;
        this.#pgConnection = pgConnection;
        this.#redis = redis;
    }

    get pg() {
        return this.#pg;
    }

    get redis() {
        return this.#redis;
    }

    async dispose() {
        await Promise.all([this.#pgConnection.end(), this.#redis.disconnect()]);
    }

    async migrate() {
        await migrate(this.#pg, {
            migrationsFolder: this.#configService.config.MIGRATIONS_DIR,
        });
    }
}
