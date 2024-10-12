import { useMutation, useQuery } from "@tanstack/react-query";
import type { InferRequestType } from "hono/client";
import { StatusCodes } from "http-status-codes";
import { useForm } from "react-hook-form";

import { api } from "../api.ts";
import { TextInput } from "../components/TextInput.tsx";
import { TodoItem } from "../components/TodoItem.tsx";

type AddTodoPayload = InferRequestType<typeof api.todo.$post>["json"];
type DeleteTodoPayload = InferRequestType<
    (typeof api.todo)[":id"]["$delete"]
>["param"];
type EditTodoPayload = InferRequestType<(typeof api.todo)[":id"]["$patch"]>;

export function Todos() {
    const {
        clearErrors,
        formState,
        handleSubmit,
        register,
        resetField,
        setError,
    } = useForm<AddTodoPayload>({
        defaultValues: {
            name: "",
        },
    });
    const todos = useQuery({
        queryKey: ["todos"],
        queryFn: async () => {
            const res = await api.todo.$get();
            if (res.status !== StatusCodes.OK) {
                setError("root", { message: "An unexpected error occurred" });
                return [];
            }
            const { todos } = await res.json();
            return todos;
        },
    });
    const addTodo = useMutation<unknown, Error, AddTodoPayload>({
        mutationFn: async (data) => {
            clearErrors();
            const res = await api.todo.$post({ json: data });
            if (
                res.status === StatusCodes.UNAUTHORIZED ||
                res.status === StatusCodes.INTERNAL_SERVER_ERROR
            ) {
                setError("root", { message: "An unexpected error occurred" });
            } else if (res.status === StatusCodes.UNPROCESSABLE_ENTITY) {
                const { errors } = await res.json();
                setError("name", { message: errors.name });
            } else if (res.status === StatusCodes.CREATED) {
                resetField("name");
                todos.refetch();
            }
        },
    });
    const deleteTodo = useMutation<unknown, Error, DeleteTodoPayload>({
        mutationFn: async (data) => {
            clearErrors();
            const res = await api.todo[":id"].$delete({ param: data });
            if (res.status === StatusCodes.NO_CONTENT) {
                todos.refetch();
            } else {
                setError("root", { message: "An unexpected error occurred" });
            }
        },
    });
    const editTodo = useMutation<string, Error, EditTodoPayload>({
        mutationFn: async (data) => {
            clearErrors();
            const res = await api.todo[":id"].$patch(data);
            if (res.status === StatusCodes.NO_CONTENT) {
                todos.refetch();
                return "";
            }
            if (res.status === StatusCodes.UNPROCESSABLE_ENTITY) {
                const { errors } = await res.json();
                return errors.name ?? "";
            }
            return "An unexpected error occurred";
        },
    });

    if (todos.isLoading) {
        return (
            <div className="flex justify-center">
                <span className="loading loading-spinner loading-md" />
            </div>
        );
    }

    return (
        <main className="flex flex-col items-center gap-4 p-4">
            <div className="flex w-full flex-col gap-4 sm:w-1/2">
                {formState.errors.root && (
                    <div className="alert alert-error">
                        {formState.errors.root.message}
                    </div>
                )}
                <form onSubmit={handleSubmit((data) => addTodo.mutate(data))}>
                    <TextInput
                        autoFocus={true}
                        className="w-full"
                        error={formState.errors.name?.message}
                        placeholder="New Todo"
                        {...register("name")}
                    />
                </form>
                <ul>
                    {(todos.data ?? []).map((todo) => (
                        <TodoItem
                            key={todo.id}
                            todo={todo}
                            onComplete={(completed) =>
                                editTodo.mutate({
                                    json: { completed },
                                    param: { id: todo.id.toString() },
                                })
                            }
                            onDelete={() =>
                                deleteTodo.mutate({ id: todo.id.toString() })
                            }
                            onEdit={(name) =>
                                editTodo.mutateAsync({
                                    json: { name },
                                    param: { id: todo.id.toString() },
                                })
                            }
                        />
                    ))}
                </ul>
            </div>
        </main>
    );
}
