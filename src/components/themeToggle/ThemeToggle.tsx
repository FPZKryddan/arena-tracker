import { HiOutlineMoon, HiOutlineSun } from "react-icons/hi2";
import useTheme from "../../hooks/useTheme";

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            title={isDark ? "Switch to light theme" : "Switch to dark theme"}
            className="md:fixed md:top-3 md:right-3 z-50 shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-surface-elevated text-fg border border-border shadow-md hover:bg-surface-hover hover:text-accent transition-colors cursor-pointer"
        >
            {isDark ? <HiOutlineSun size={20} /> : <HiOutlineMoon size={20} />}
        </button>
    );
};

export default ThemeToggle;
