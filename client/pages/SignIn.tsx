import { useMutation } from "@tanstack/react-query";
import type { InferRequestType } from "hono/client";
import { StatusCodes } from "http-status-codes";
import { useForm } from "react-hook-form";
import { useLocation, useParams } from "wouter";

import { api } from "../api.ts";
import { Button } from "../components/Button.tsx";
import { TextInput } from "../components/TextInput.tsx";
import { useAuthStore } from "../hooks/useAuthStore.ts";

type SignInPayload = InferRequestType<typeof api.session.$post>["json"];

export function SignIn() {
    const { clearErrors, formState, handleSubmit, register, setError } =
        useForm<SignInPayload>({
            defaultValues: {
                username: "",
                password: "",
            },
        });
    const setSignedIn = useAuthStore((state) => state.setSignedIn);
    const [, navigate] = useLocation();
    const params = useParams();
    const signIn = useMutation<unknown, Error, SignInPayload>({
        mutationFn: async (data) => {
            clearErrors();
            const res = await api.session.$post({ json: data });
            if (res.status === StatusCodes.INTERNAL_SERVER_ERROR) {
                setError("root", { message: "An unexpected error occurred" });
            } else if (
                res.status === StatusCodes.UNAUTHORIZED ||
                res.status === StatusCodes.UNPROCESSABLE_ENTITY
            ) {
                const { errors } = await res.json();
                setError("username", { message: errors.username ?? "" });
                setError("password", { message: errors.password ?? "" });
            } else if (res.status === StatusCodes.OK) {
                const user = await res.json();
                setSignedIn(user);
                // biome-ignore lint/complexity/useLiteralKeys: TypeScript
                navigate(`/${params["redirect"] ?? "todos"}`, {
                    replace: true,
                });
            }
        },
    });

    return (
        <main className="flex justify-center p-4">
            <div className="flex w-full flex-col gap-4 sm:w-1/2 lg:w-1/4">
                <h1 className="text-center font-bold text-3xl">Sign In</h1>
                {formState.errors.root && (
                    <div className="alert alert-error">
                        {formState.errors.root.message}
                    </div>
                )}
                <form onSubmit={handleSubmit((data) => signIn.mutate(data))}>
                    <fieldset
                        className="flex flex-col gap-4"
                        disabled={signIn.isPending}
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
                        <Button className="btn-primary" type="submit">
                            Sign In
                        </Button>
                    </fieldset>
                </form>
            </div>
        </main>
    );
}
