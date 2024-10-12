import { validator } from "hono/validator";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

import { transformZodError } from "../utils/error.ts";

export const idParamValidator = validator("param", (value, c) => {
    const payload = z
        .object({
            id: z.coerce
                .number({ message: "id must be a number" })
                .int({ message: "id must be an integer" })
                .min(1, { message: "id must be positive" }),
        })
        .safeParse(value);
    if (!payload.success) {
        return c.json(
            { errors: transformZodError(payload.error) },
            StatusCodes.UNPROCESSABLE_ENTITY,
        );
    }
    return payload.data;
});
