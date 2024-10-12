import { useMutation } from "@tanstack/react-query";
import classNames from "classnames";
import type { InferResponseType } from "hono/client";
import { StatusCodes } from "http-status-codes";
import { RiUserLine } from "react-icons/ri";
import { Link, useLocation } from "wouter";

import { api } from "../api.ts";
import { useAuthStore } from "../hooks/useAuthStore.ts";
import { useThemeStore } from "../hooks/useThemeStore.ts";
import { ThemeSwitch } from "./ThemeSwitch.tsx";

export interface NavBarProps {
    user?: InferResponseType<typeof api.user.$get, 200> | undefined;
}

export function NavBar(props: NavBarProps) {
    const [, navigate] = useLocation();
    const setSignedOut = useAuthStore((state) => state.setSignedOut);
    const signOut = useMutation({
        mutationFn: async () => {
            const res = await api.session.$delete();
            if (res.status === StatusCodes.NO_CONTENT) {
                setSignedOut();
                navigate("/", { replace: true });
            }
        },
    });
    const theme = useThemeStore((state) => state.theme);

    return (
        <header className="flex w-full items-center justify-between px-8 py-4">
            <Link to={props.user ? "/todos" : "/"}>
                <h1 className="font-bold text-3xl">Bun + React To-dos</h1>
            </Link>
            <div className="flex items-center gap-4">
                <ThemeSwitch />
                {props.user && (
                    <div className="dropdown dropdown-end">
                        <button
                            className="flex items-center gap-2"
                            type="button"
                        >
                            <RiUserLine />
                            <span>{props.user.username}</span>
                        </button>
                        <ul
                            className={classNames(
                                "menu dropdown-content mt-2 w-40 rounded-box p-2 drop-shadow-lg",
                                {
                                    "bg-gray-700": theme === "dark",
                                    "bg-gray-200": theme === "light",
                                },
                            )}
                        >
                            <li>
                                <button
                                    disabled={signOut.isPending}
                                    type="button"
                                    onClick={() => signOut.mutate()}
                                >
                                    Sign Out
                                </button>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </header>
    );
}
