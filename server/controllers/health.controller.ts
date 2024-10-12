import { createRoute } from "@hono/zod-openapi";
import { StatusCodes } from "http-status-codes";
import { injectable } from "tsyringe-neo";

import { Controller } from "./index.ts";

@injectable()
export class HealthController extends Controller {
    override routes() {
        return this.router.openapi(
            createRoute({
                description: "Server health check",
                method: "get",
                path: "/",
                responses: {
                    204: {
                        description: "Success",
                    },
                },
            }),
            (c) => {
                return c.json(undefined, StatusCodes.NO_CONTENT);
            },
        );
    }
}
