import { useMutation } from "@tanstack/react-query";
import type { InferRequestType } from "hono/client";
import { StatusCodes } from "http-status-codes";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";

import { api } from "../api.ts";
import { Button } from "../components/Button.tsx";
import { TextInput } from "../components/TextInput.tsx";
import { useAuthStore } from "../hooks/useAuthStore.ts";

type SignUpPayload = InferRequestType<typeof api.user.$post>["json"];

export function SignUp() {
    const { clearErrors, formState, handleSubmit, register, setError } =
        useForm<SignUpPayload>({
            defaultValues: {
                username: "",
                password: "",
                confirmPassword: "",
            },
        });
    const setSignedIn = useAuthStore((state) => state.setSignedIn);
    const [, navigate] = useLocation();
    const signUp = useMutation<unknown, Error, SignUpPayload>({
        mutationFn: async (data) => {
            clearErrors();
            const res = await api.user.$post({ json: data });
            if (res.status === StatusCodes.INTERNAL_SERVER_ERROR) {
                setError("root", { message: "An unexpected error occurred" });
            } else if (res.status === StatusCodes.UNPROCESSABLE_ENTITY) {
                const { errors } = await res.json();
                setError("username", { message: errors.username ?? "" });
                setError("password", { message: errors.password ?? "" });
                setError("confirmPassword", {
                    message: errors.confirmPassword ?? "",
                });
            } else if (res.status === StatusCodes.CREATED) {
                const user = await res.json();
                setSignedIn(user);
                navigate("/todos", { replace: true });
            }
        },
    });

    return (
        <main className="flex justify-center p-4">
            <div className="flex w-full flex-col gap-4 sm:w-1/2 lg:w-1/4">
                <h1 className="text-center font-bold text-3xl">Sign Up</h1>
                {formState.errors.root && (
                    <div className="alert alert-error">
                        {formState.errors.root.message}
                    </div>
                )}
                <form onSubmit={handleSubmit((data) => signUp.mutate(data))}>
                    <fieldset
                        className="flex flex-col gap-4"
                        disabled={signUp.isPending}
                    >
                        <TextInput
                            error={formState.errors.username?.message}
                            label="Username"
                            type="text"
                            {...register("username")}
                        />
                        <TextInput
                            error={formState.errors.password?.message}
                            label="Password"
                            type="password"
                            {...register("password")}
                        />
                        <TextInput
                            error={formState.errors.confirmPassword?.message}
                            label="Confirm Password"
                            type="password"
                            {...register("confirmPassword")}
                        />
                        <Button className="btn-primary" type="submit">
                            Sign Up
                        </Button>
                    </fieldset>
                </form>
            </div>
        </main>
    );
}
