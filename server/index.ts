import "reflect-metadata";

import path from "node:path";

import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { cors } from "hono/cors";
import { StatusCodes } from "http-status-codes";
import { container } from "tsyringe-neo";

import { HealthController } from "./controllers/health.controller.ts";
import { SessionController } from "./controllers/session.controller.ts";
import { TodoController } from "./controllers/todo.controller.ts";
import { UserController } from "./controllers/user.controller.ts";
import { ConfigService } from "./services/config.service.ts";
import {
    DatabaseService,
    DatabaseServiceFactory,
} from "./services/database.service.ts";
import { LogService } from "./services/log.service.ts";

const configService = container.resolve(ConfigService);
const databaseService = await container
    .resolve(DatabaseServiceFactory)
    .create();
container.register(DatabaseService, {
    useValue: databaseService,
});
await databaseService.migrate();

const api = new OpenAPIHono();
if (configService.config.NODE_ENV === "development") {
    api.use(
        cors({
            credentials: true,
            origin: "http://localhost:5173",
        }),
    );
}

const routes = api
    .route("/health", container.resolve(HealthController).routes())
    .route("/session", container.resolve(SessionController).routes())
    .route("/todo", container.resolve(TodoController).routes())
    .route("/user", container.resolve(UserController).routes());
export type ApiRoutes = typeof routes;

api.openAPIRegistry.registerComponent("securitySchemes", "cookie", {
    in: "cookie",
    name: "session",
    type: "apiKey",
});
api.doc("/doc", {
    openapi: "3.0.0",
    info: {
        title: "Bun + React To-dos API",
        version: "1.0.0",
    },
});
api.get("/docs", swaggerUI({ url: "/api/doc" }));

const app = new Hono();
app.route("/api", api);
app.get("*", serveStatic({ root: "dist" }));
app.get("*", serveStatic({ path: path.join("dist", "index.html") }));

const logService = container.resolve(LogService);
app.onError((err, c) => {
    logService.logger.error(c.req.path, err);
    return c.json(undefined, StatusCodes.INTERNAL_SERVER_ERROR);
});

async function shutdown() {
    try {
        await container.dispose();
        process.exit(0);
    } catch (err) {
        logService.logger.error("shutdown", err);
        process.exit(1);
    }
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

Bun.serve({
    fetch: app.fetch,
    port: configService.config.PORT,
});
