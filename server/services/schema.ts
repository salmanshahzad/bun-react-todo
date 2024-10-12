import { boolean, integer, pgTable, serial, text } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: serial().primaryKey(),
    username: text().unique().notNull(),
    password: text().notNull(),
});

export type User = typeof users.$inferSelect;

export const todos = pgTable("todos", {
    id: serial().primaryKey(),
    userId: integer()
        .notNull()
        .references(() => users.id, {
            onDelete: "cascade",
            onUpdate: "cascade",
        }),
    name: text().notNull(),
    completed: boolean().notNull().default(false),
});

export type Todo = typeof todos.$inferSelect;
