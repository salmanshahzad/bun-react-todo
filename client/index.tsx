import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusCodes } from "http-status-codes";
import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Redirect, Route, Switch } from "wouter";

import { api } from "./api.ts";
import { NavBar } from "./components/NavBar.tsx";
import { useAuthStore } from "./hooks/useAuthStore.ts";
import { Home } from "./pages/Home.tsx";
import { SignIn } from "./pages/SignIn.tsx";
import { SignUp } from "./pages/SignUp.tsx";
import { Todos } from "./pages/Todos.tsx";
import "./index.css";

function App() {
    const auth = useAuthStore();
    const authenticatedRoutes = (
        <Switch>
            <Route path="/todos" component={Todos} />
            <Redirect to="/todos" replace={true} />
        </Switch>
    );
    const publicRoutes = (
        <Switch>
            <Route path="/" component={Home} />
            <Route path="/signin" component={SignIn} />
            <Route path="/signup" component={SignUp} />
            <Route path="*">
                {(params) => (
                    <Redirect
                        to={`/signin?redirect=${params["*"]}`}
                        replace={true}
                    />
                )}
            </Route>
        </Switch>
    );
    const queryClient = new QueryClient();

    useEffect(() => {
        api.user.$get().then((res) => {
            if (res.status === StatusCodes.OK) {
                res.json().then(auth.setSignedIn);
            } else {
                auth.setSignedOut();
            }
        });
    }, [auth.setSignedIn, auth.setSignedOut]);

    if (auth.state === "loading") {
        return (
            <div className="flex justify-center">
                <span className="loading loading-spinner loading-md" />
            </div>
        );
    }

    return (
        <QueryClientProvider client={queryClient}>
            <NavBar user={auth.user} />
            {auth.state === "authenticated"
                ? authenticatedRoutes
                : publicRoutes}
        </QueryClientProvider>
    );
}

const root = document.getElementById("root");
if (!root) {
    throw new Error("Could not find root element");
}
createRoot(root).render(<App />);
