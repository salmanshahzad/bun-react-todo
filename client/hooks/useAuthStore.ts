import type { InferResponseType } from "hono/client";
import { create } from "zustand";

import type { api } from "../api.ts";

type User = InferResponseType<typeof api.user.$get, 200>;

interface AuthState {
    state: "authenticated" | "loading" | "unauthenticated";
    user: User | undefined;
    setSignedIn: (user: User) => void;
    setSignedOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    state: "loading",
    user: undefined,
    setSignedIn: (user: User) => set({ state: "authenticated", user }),
    setSignedOut: () => set({ state: "unauthenticated", user: undefined }),
}));
