import classNames from "classnames";
import type { InferResponseType } from "hono/client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { RiDeleteBinFill, RiPencilFill, RiSaveFill } from "react-icons/ri";

import type { api } from "../api.ts";
import { Button } from "../components/Button.tsx";
import { TextInput } from "../components/TextInput.tsx";
import { useThemeStore } from "../hooks/useThemeStore.ts";

export interface TodoItemProps {
    todo: InferResponseType<typeof api.todo.$get, 200>["todos"][number];
    onComplete: (completed: boolean) => unknown;
    onDelete: () => unknown;
    onEdit: (name: string) => Promise<string>;
}

export function TodoItem(props: TodoItemProps) {
    const { handleSubmit, register } = useForm<{ name: string }>({
        defaultValues: {
            name: props.todo.name,
        },
    });
    const [isEditing, setIsEditing] = useState(false);
    const [nameError, setNameError] = useState("");
    const theme = useThemeStore((state) => state.theme);

    return (
        <li
            className={classNames("my-4 flex gap-4", {
                "items-center": !(isEditing && nameError),
                "items-start": isEditing && nameError,
            })}
        >
            <input
                autoComplete="off"
                className="checkbox-primary checkbox h-8 w-8"
                defaultChecked={props.todo.completed}
                type="checkbox"
                onChange={(e) => props.onComplete(e.target.checked)}
            />
            {isEditing && (
                <form
                    className="w-full"
                    onSubmit={handleSubmit(async (data) => {
                        setNameError("");
                        const error = await props.onEdit(data.name);
                        if (error) {
                            setNameError(error);
                        } else {
                            setIsEditing(false);
                        }
                    })}
                >
                    <fieldset className="flex gap-4">
                        <TextInput
                            autoFocus={true}
                            className="input-sm flex-grow"
                            error={nameError}
                            {...register("name")}
                        />
                        <Button
                            className="btn-square btn-secondary btn-sm text-xl"
                            type="submit"
                        >
                            <RiSaveFill
                                color={theme === "dark" ? "black" : "white"}
                            />
                        </Button>
                    </fieldset>
                </form>
            )}
            {!isEditing && (
                <>
                    <span
                        className={classNames("flex flex-grow items-center", {
                            "line-through": props.todo.completed,
                        })}
                    >
                        {props.todo.name}
                    </span>
                    <Button
                        className="btn-square btn-secondary btn-sm text-xl"
                        onClick={() => setIsEditing(true)}
                    >
                        <RiPencilFill
                            color={theme === "dark" ? "black" : "white"}
                        />
                    </Button>
                </>
            )}
            <Button
                className="btn-square btn-error btn-sm text-xl"
                onClick={() => props.onDelete()}
            >
                <RiDeleteBinFill color={theme === "dark" ? "black" : "white"} />
            </Button>
        </li>
    );
}
