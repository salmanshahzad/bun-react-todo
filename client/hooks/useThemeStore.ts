import { create } from "zustand";

const LOCAL_STORAGE_KEY = "theme";

export type Theme = "dark" | "light";

interface ThemeState {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

let defaultTheme: Theme = "dark";
const localStorageTheme = localStorage.getItem(LOCAL_STORAGE_KEY);
if (localStorageTheme === "dark" || localStorageTheme === "light") {
    defaultTheme = localStorageTheme;
} else if (matchMedia("(prefers-color-scheme: dark)").matches) {
    defaultTheme = "dark";
} else {
    defaultTheme = "light";
}
const htmlElement = document.querySelector("html");
htmlElement?.setAttribute("data-theme", defaultTheme);

export const useThemeStore = create<ThemeState>((set) => ({
    theme: defaultTheme,
    setTheme: (theme) => {
        htmlElement?.setAttribute("data-theme", theme);
        localStorage.setItem(LOCAL_STORAGE_KEY, theme);
        set({ theme });
    },
}));
