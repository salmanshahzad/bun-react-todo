import { createRoute } from "@hono/zod-openapi";
import { StatusCodes } from "http-status-codes";
import postgres from "postgres";
import { inject, injectable } from "tsyringe-neo";
import { z } from "zod";

import { auth } from "../middlewares/auth.middleware.ts";
import { SessionRepository } from "../repositories/session.repository.ts";
import { UserRepository } from "../repositories/user.repository.ts";
import { Controller } from "./index.ts";

@injectable()
export class UserController extends Controller {
    readonly #sessionRepository;
    readonly #userRepository;

    constructor(
        @inject(SessionRepository) sessionRepository: SessionRepository,
        @inject(UserRepository) userRepository: UserRepository,
    ) {
        super();
        this.#sessionRepository = sessionRepository;
        this.#userRepository = userRepository;
    }

    override routes() {
        return this.router
            .openapi(
                createRoute({
                    description: "Get the signed in user",
                    method: "get",
                    middleware: [auth()],
                    path: "/",
                    responses: {
                        200: {
                            content: {
                                "application/json": {
                                    schema: z.object({
                                        id: z.number().int(),
                                        username: z.string(),
                                    }),
                                },
                            },
                            description: "Signed in user",
                            headers: {
                                "Set-Cookie": {
                                    schema: { type: "string" },
                                },
                            },
                        },
                        401: {
                            description: "Not signed in",
                        },
                        500: {
                            description: "Server error",
                        },
                    },
                    security: [{ cookie: [] }],
                }),
                async (c) => {
                    const user = await this.#userRepository.getUserById(
                        c.get("userId"),
                    );
                    if (!user) {
                        return c.json(undefined, StatusCodes.UNAUTHORIZED);
                    }
                    return c.json(user, StatusCodes.OK);
                },
            )
            .openapi(
                createRoute({
                    description: "Create a user",
                    method: "post",
                    path: "/",
                    request: {
                        body: {
                            content: {
                                "application/json": {
                                    schema: z
                                        .object({
                                            username: z
                                                .string({
                                                    message:
                                                        "username must be a string",
                                                })
                                                .trim()
                                                .min(1, {
                                                    message:
                                                        "username is required",
                                                }),
                                            password: z
                                                .string({
                                                    message:
                                                        "password must be a string",
                                                })
                                                .min(1, {
                                                    message:
                                                        "password is required",
                                                }),
                                            confirmPassword: z.string({
                                                message:
                                                    "confirmPassword must be a string",
                                            }),
                                        })
                                        .refine(
                                            (schema) => {
                                                return (
                                                    schema.password ===
                                                    schema.confirmPassword
                                                );
                                            },
                                            {
                                                message:
                                                    "password and confirmPassword do not match",
                                                path: ["confirmPassword"],
                                            },
                                        ),
                                },
                            },
                        },
                    },
                    responses: {
                        201: {
                            content: {
                                "application/json": {
                                    schema: z.object({
                                        id: z.number().int(),
                                        username: z.string(),
                                    }),
                                },
                            },
                            description: "Success",
                            headers: {
                                "Set-Cookie": {
                                    schema: {
                                        type: "string",
                                    },
                                },
                            },
                        },
                        422: {
                            content: {
                                "application/json": {
                                    schema: z.object({
                                        errors: z.object({
                                            username: z.string().optional(),
                                            password: z.string().optional(),
                                            confirmPassword: z
                                                .string()
                                                .optional(),
                                        }),
                                    }),
                                },
                            },
                            description: "Validation error",
                        },
                        500: {
                            description: "Server error",
                        },
                    },
                }),
                async (c) => {
                    const payload = c.req.valid("json");
                    try {
                        const user = await this.#userRepository.createUser(
                            payload.username,
                            payload.password,
                        );
                        await this.#sessionRepository.createSession(c, user.id);
                        return c.json(user, StatusCodes.CREATED);
                    } catch (err) {
                        if (
                            err instanceof postgres.PostgresError &&
                            err.code === "23505"
                        ) {
                            return c.json(
                                {
                                    errors: {
                                        username: "username already exists",
                                    },
                                },
                                StatusCodes.UNPROCESSABLE_ENTITY,
                            );
                        }
                        throw err;
                    }
                },
            );
    }
}
