import { Link } from "wouter";

import { Button } from "../components/Button.tsx";

export function Home() {
    return (
        <main className="flex flex-col items-center gap-4 p-4">
            <div className="flex gap-4">
                <Link to="/signin">
                    <Button className="btn-primary">Sign In</Button>
                </Link>
                <Link to="/signup">
                    <Button className="btn-primary">Sign Up</Button>
                </Link>
            </div>
        </main>
    );
}
