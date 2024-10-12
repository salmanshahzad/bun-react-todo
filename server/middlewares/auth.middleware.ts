import { createMiddleware } from "hono/factory";
import { StatusCodes } from "http-status-codes";
import { container } from "tsyringe-neo";

import { SessionRepository } from "../repositories/session.repository.ts";

export function auth() {
    const sessionRepository = container.resolve(SessionRepository);
    return createMiddleware(async (c, next) => {
        const userId = await sessionRepository.getSession(c);
        if (!userId) {
            return c.json(undefined, StatusCodes.UNAUTHORIZED);
        }
        await sessionRepository.createSession(c, userId);
        c.set("userId", userId);
        await next();
        return;
    });
}
