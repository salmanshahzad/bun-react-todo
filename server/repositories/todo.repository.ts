import { asc, eq } from "drizzle-orm";
import { inject, injectable } from "tsyringe-neo";

import { DatabaseService } from "../services/database.service.ts";
import { todos } from "../services/schema.ts";

@injectable()
export class TodoRepository {
    #databaseService;

    constructor(@inject(DatabaseService) databaseService: DatabaseService) {
        this.#databaseService = databaseService;
    }

    async createTodo(userId: number, name: string) {
        const [todo] = await this.#databaseService.pg
            .insert(todos)
            .values({
                name,
                userId,
            })
            .returning();
        if (!todo) {
            throw new Error("Did not get todo after creating");
        }
        return todo;
    }

    async getTodos(userId: number) {
        return await this.#databaseService.pg
            .select()
            .from(todos)
            .where(eq(todos.userId, userId))
            .orderBy(asc(todos.id));
    }

    async deleteTodo(id: number) {
        await this.#databaseService.pg.delete(todos).where(eq(todos.id, id));
    }

    async setTodoCompleted(id: number, completed: boolean) {
        await this.#databaseService.pg
            .update(todos)
            .set({
                completed,
            })
            .where(eq(todos.id, id));
    }

    async setTodoName(id: number, name: string) {
        await this.#databaseService.pg
            .update(todos)
            .set({
                name,
            })
            .where(eq(todos.id, id));
    }
}
