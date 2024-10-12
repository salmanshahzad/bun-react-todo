import type { ZodError } from "zod";

export function transformZodError(err: ZodError): Record<string, string> {
    return err.issues.reduce<Record<string, string>>((errors, issue) => {
        const field = issue.path[0]?.toString();
        if (field) {
            errors[field] = issue.message;
        }
        return errors;
    }, {});
}
