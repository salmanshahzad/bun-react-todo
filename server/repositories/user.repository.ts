import { eq } from "drizzle-orm";
import { inject, injectable } from "tsyringe-neo";

import { DatabaseService } from "../services/database.service.ts";
import { users } from "../services/schema.ts";

@injectable()
export class UserRepository {
    readonly #databaseService;

    constructor(@inject(DatabaseService) databaseService: DatabaseService) {
        this.#databaseService = databaseService;
    }

    async createUser(username: string, password: string) {
        const [user] = await this.#databaseService.pg
            .insert(users)
            .values({
                username,
                password: await Bun.password.hash(password),
            })
            .returning();
        if (!user) {
            throw new Error("Did not get user after creating");
        }
        return user;
    }

    async getUserById(userId: number) {
        const [user] = await this.#databaseService.pg
            .select()
            .from(users)
            .where(eq(users.id, userId));
        return user;
    }

    async getUserByUsername(username: string) {
        const [user] = await this.#databaseService.pg
            .select()
            .from(users)
            .where(eq(users.username, username));
        return user;
    }
}
