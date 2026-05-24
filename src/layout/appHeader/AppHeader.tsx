import { Link, useLocation } from "react-router-dom";
import { IoFlash } from "react-icons/io5";
import ThemeToggle from "../../components/themeToggle";
import {
  getActivePage,
  getComparePathFromLocation,
  getNavigationTarget,
  NAV_ITEMS,
  type AppNavigationItem,
  type AppNavigationProps,
} from "../appNavigation";

const AppHeader = ({
  children,
  className = "",
  comparePath,
}: AppNavigationProps) => {
  const { pathname, search } = useLocation();
  const activePage = getActivePage(pathname);
  const resolvedComparePath =
    comparePath ?? getComparePathFromLocation(pathname, search);

  return (
    <div
      className={`box-border flex h-dvh w-full flex-col overflow-hidden bg-bg text-fg ${className}`}
    >
      <div className="shrink-0 px-3 pt-3 md:px-6 md:pt-6">
        <header className="flex w-full flex-col gap-3 border-b border-border pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between gap-3">
            <Link
              to="/"
              className="group flex min-w-0 items-center gap-2 text-fg transition-colors hover:text-accent"
              aria-label="Arena Tracker home"
            >
              <IoFlash className="h-5 w-5 shrink-0 text-accent" />
              <span className="truncate text-base font-semibold md:text-lg">
                Arena Tracker
              </span>
            </Link>
            <div className="sm:hidden">
              <ThemeToggle />
            </div>
          </div>

          <nav
            aria-label="Primary navigation"
            className="grid w-full grid-cols-4 gap-2 sm:flex sm:w-auto sm:items-center"
          >
            {NAV_ITEMS.map((item) => (
              <HeaderLink
                key={item.key}
                to={getNavigationTarget(item, resolvedComparePath)}
                label={item.label}
                active={activePage === item.key}
                Icon={item.icon}
              />
            ))}
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
          </nav>
        </header>
      </div>

      <main className="min-h-0 flex-1 overflow-auto">{children}</main>
    </div>
  );
};

interface HeaderLinkProps {
  to: string;
  label: string;
  active: boolean;
  Icon: AppNavigationItem["icon"];
}

const HeaderLink = ({ to, label, active, Icon }: HeaderLinkProps) => (
  <Link
    to={to}
    aria-current={active ? "page" : undefined}
    className={`box-content flex h-9 min-w-0 items-center justify-center gap-1.5 border-b-4 px-2 text-xs font-semibold transition-colors sm:px-3 ${
      active
        ? "border-accent text-fg"
        : "border-transparent text-fg hover:border-border-strong"
    }`}
  >
    <Icon className="hidden h-4 w-4 shrink-0 md:block" />
    <span className="min-w-0 truncate">{label}</span>
  </Link>
);

export default AppHeader;
