import { createRoute } from "@hono/zod-openapi";
import { StatusCodes } from "http-status-codes";
import { inject, injectable } from "tsyringe-neo";
import { z } from "zod";

import { auth } from "../middlewares/auth.middleware.ts";
import { idParamValidator } from "../middlewares/idParam.middleware.ts";
import { TodoRepository } from "../repositories/todo.repository.ts";
import { Controller } from "./index.ts";

@injectable()
export class TodoController extends Controller {
    readonly #todoRepository;

    constructor(@inject(TodoRepository) todoRepository: TodoRepository) {
        super();
        this.#todoRepository = todoRepository;
    }

    override routes() {
        return this.router
            .openapi(
                createRoute({
                    description: "Get todos",
                    method: "get",
                    middleware: [auth()],
                    path: "/",
                    responses: {
                        200: {
                            content: {
                                "application/json": {
                                    schema: z.object({
                                        todos: z.array(
                                            z.object({
                                                completed: z.boolean(),
                                                id: z.number().int(),
                                                name: z.string(),
                                                userId: z.number().int(),
                                            }),
                                        ),
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
                    const todos = await this.#todoRepository.getTodos(
                        c.get("userId"),
                    );
                    return c.json({ todos });
                },
            )
            .openapi(
                createRoute({
                    description: "Create a todo",
                    method: "post",
                    middleware: [auth()],
                    path: "/",
                    request: {
                        body: {
                            content: {
                                "application/json": {
                                    schema: z.object({
                                        name: z
                                            .string({
                                                message:
                                                    "name must be a string",
                                            })
                                            .trim()
                                            .min(1, {
                                                message: "name is required",
                                            }),
                                    }),
                                },
                            },
                        },
                    },
                    responses: {
                        201: {
                            content: {
                                "application/json": {
                                    schema: z.object({
                                        completed: z.boolean(),
                                        id: z.number().int(),
                                        name: z.string(),
                                        userId: z.number().int(),
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
                        401: {
                            description: "Not signed in",
                        },
                        422: {
                            content: {
                                "application/json": {
                                    schema: z.object({
                                        errors: z.object({
                                            name: z.string(),
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
                    security: [{ cookie: [] }],
                }),
                async (c) => {
                    const payload = c.req.valid("json");
                    const todo = await this.#todoRepository.createTodo(
                        c.get("userId"),
                        payload.name,
                    );
                    return c.json(todo, StatusCodes.CREATED);
                },
            )
            .openapi(
                createRoute({
                    description: "Edit a todo",
                    middleware: [idParamValidator, auth()],
                    method: "patch",
                    path: "/{id}",
                    request: {
                        body: {
                            content: {
                                "application/json": {
                                    schema: z.object({
                                        completed: z
                                            .boolean({
                                                message:
                                                    "completed must be a boolean",
                                            })
                                            .optional(),
                                        name: z
                                            .string({
                                                message:
                                                    "name must be a string",
                                            })
                                            .trim()
                                            .min(1, {
                                                message: "name is required",
                                            })
                                            .optional(),
                                    }),
                                },
                            },
                        },
                        params: z.object({
                            id: z.coerce.number().int(),
                        }),
                    },
                    responses: {
                        204: {
                            description: "Success",
                            headers: {
                                "Set-Cookie": {
                                    schema: {
                                        type: "string",
                                    },
                                },
                            },
                        },
                        401: {
                            description: "Not signed in",
                        },
                        422: {
                            content: {
                                "application/json": {
                                    schema: z.object({
                                        errors: z.object({
                                            completed: z.string().optional(),
                                            id: z.string().optional(),
                                            name: z.string().optional(),
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
                    security: [{ cookie: [] }],
                }),
                async (c) => {
                    const { id } = c.req.valid("param");
                    const payload = c.req.valid("json");
                    if (typeof payload.completed !== "undefined") {
                        await this.#todoRepository.setTodoCompleted(
                            id,
                            payload.completed,
                        );
                    }
                    if (typeof payload.name !== "undefined") {
                        await this.#todoRepository.setTodoName(
                            id,
                            payload.name,
                        );
                    }
                    return c.json(undefined, StatusCodes.NO_CONTENT);
                },
            )
            .openapi(
                createRoute({
                    description: "Delete a todo",
                    middleware: [idParamValidator, auth()],
                    method: "delete",
                    path: "/{id}",
                    request: {
                        params: z.object({
                            id: z.coerce.number().int(),
                        }),
                    },
                    responses: {
                        204: {
                            description: "Success",
                            headers: {
                                "Set-Cookie": {
                                    schema: {
                                        type: "string",
                                    },
                                },
                            },
                        },
                        401: {
                            description: "Not signed in",
                        },
                        422: {
                            content: {
                                "application/json": {
                                    schema: z.object({ id: z.string() }),
                                },
                            },
                            description: "Validation error",
                        },
                        500: {
                            description: "Server error",
                        },
                    },
                    security: [{ cookie: [] }],
                }),
                async (c) => {
                    const { id } = c.req.valid("param");
                    await this.#todoRepository.deleteTodo(id);
                    return c.json(undefined, StatusCodes.NO_CONTENT);
                },
            );
    }
}
