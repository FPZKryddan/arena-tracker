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
      className="z-50 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md border border-border bg-surface text-fg transition-colors hover:border-border-strong hover:bg-surface-hover hover:text-accent"
    >
      {isDark ? <HiOutlineSun size={20} /> : <HiOutlineMoon size={20} />}
    </button>
  );
};

export default ThemeToggle;
