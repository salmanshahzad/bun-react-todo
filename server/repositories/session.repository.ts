import crypto from "node:crypto";

import type { Context } from "hono";
import { deleteCookie, getSignedCookie, setSignedCookie } from "hono/cookie";
import { inject, injectable } from "tsyringe-neo";

import { ConfigService } from "../services/config.service.ts";
import { DatabaseService } from "../services/database.service.ts";

@injectable()
export class SessionRepository {
    static readonly COOKIE_NAME = "session";
    static readonly TTL = 60 * 60 * 24 * 7;

    readonly #configService;
    readonly #databaseService;

    constructor(
        @inject(ConfigService) configService: ConfigService,
        @inject(DatabaseService) databaseService: DatabaseService,
    ) {
        this.#configService = configService;
        this.#databaseService = databaseService;
    }

    async createSession(c: Context, userId: number) {
        const sessionId = crypto.randomUUID();
        await this.#databaseService.redis.setEx(
            sessionId,
            SessionRepository.TTL,
            userId.toString(),
        );
        await setSignedCookie(
            c,
            SessionRepository.COOKIE_NAME,
            sessionId,
            this.#configService.config.COOKIE_SECRET,
            {
                httpOnly: true,
                maxAge: SessionRepository.TTL,
                sameSite: "Strict",
                secure: true,
            },
        );
    }

    async getSession(c: Context) {
        const sessionId = await getSignedCookie(
            c,
            this.#configService.config.COOKIE_SECRET,
            SessionRepository.COOKIE_NAME,
        );
        const userId = Number.parseInt(
            (await this.#databaseService.redis.get(sessionId || "")) ?? "",
        );
        return userId || undefined;
    }

    async destroySession(c: Context) {
        const sessionId = deleteCookie(c, SessionRepository.COOKIE_NAME);
        if (sessionId) {
            await this.#databaseService.redis.del(sessionId);
        }
    }
}
