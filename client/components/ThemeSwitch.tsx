import { RiMoonFill, RiSunFill } from "react-icons/ri";

import { useThemeStore } from "../hooks/useThemeStore.ts";

export function ThemeSwitch() {
    const theme = useThemeStore((state) => state.theme);
    const setTheme = useThemeStore((state) => state.setTheme);

    return (
        <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
            {theme === "dark" ? <RiSunFill /> : <RiMoonFill />}
        </button>
    );
}
