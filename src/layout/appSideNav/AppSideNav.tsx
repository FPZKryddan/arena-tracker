import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { IoClose, IoFlash, IoMenu } from "react-icons/io5";
import ThemeToggle from "../../components/themeToggle";
import {
  getActivePage,
  getComparePathFromLocation,
  getNavigationTarget,
  NAV_ITEMS,
  type AppNavigationItem,
  type AppNavigationProps,
} from "../appNavigation";

const AppSideNav = ({
  children,
  className = "",
  comparePath,
}: AppNavigationProps) => {
  const { pathname, search } = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const activePage = getActivePage(pathname);
  const resolvedComparePath =
    comparePath ?? getComparePathFromLocation(pathname, search);
  const minimizeOnMobile = () => {
    if (window.matchMedia("(max-width: 767px)").matches) {
      setIsExpanded(false);
    }
  };

  useEffect(() => {
    if (!isExpanded) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsExpanded(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isExpanded]);

  return (
    <div
      className={`box-border flex h-dvh w-full overflow-hidden bg-bg text-fg ${className}`}
    >
      <aside
        id="app-side-navigation"
        className={`box-border flex h-full shrink-0 flex-col border-r border-border bg-bg p-2 transition-[width] duration-200 ${
          isExpanded
            ? "fixed inset-0 z-50 h-dvh w-full border-r-0 md:static md:z-auto md:h-full md:w-60 md:border-r"
            : "relative w-16"
        }`}
      >
        <div className="grid h-10 min-w-0 grid-cols-[2.5rem_minmax(0,1fr)] items-center gap-2">
          <button
            type="button"
            onClick={() => setIsExpanded((expanded) => !expanded)}
            aria-controls="app-side-navigation"
            aria-expanded={isExpanded}
            aria-label={
              isExpanded ? "Minimize navigation" : "Expand navigation"
            }
            title={isExpanded ? "Minimize navigation" : "Expand navigation"}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-fg transition-colors hover:border-border-strong hover:bg-surface-hover hover:text-accent"
          >
            {isExpanded ? (
              <IoClose className="h-5 w-5" />
            ) : (
              <IoMenu className="h-5 w-5" />
            )}
          </button>

          <Link
            to="/"
            onClick={minimizeOnMobile}
            tabIndex={isExpanded ? undefined : -1}
            aria-hidden={!isExpanded}
            className={`group flex min-w-0 items-center gap-2 overflow-hidden rounded-md text-fg transition-[color,max-width,opacity] duration-200 hover:text-accent ${
              isExpanded
                ? "max-w-44 opacity-100"
                : "pointer-events-none max-w-0 opacity-0"
            }`}
            aria-label="Arena Tracker home"
          >
            <IoFlash className="h-5 w-5 shrink-0 text-accent" />
            <span className="truncate whitespace-nowrap text-base font-semibold">
              Arena Tracker
            </span>
          </Link>
        </div>

        <nav
          aria-label="Primary navigation"
          className="mt-6 flex flex-1 flex-col gap-1"
        >
          {NAV_ITEMS.map((item) => (
            <SideNavLink
              key={item.key}
              to={getNavigationTarget(item, resolvedComparePath)}
              label={item.label}
              active={activePage === item.key}
              Icon={item.icon}
              expanded={isExpanded}
              onNavigate={minimizeOnMobile}
            />
          ))}
        </nav>

        <div className="border-t border-border pt-3">
          <div className="grid h-10 min-w-0 grid-cols-[2.5rem_minmax(0,1fr)] items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </aside>

      <main className="min-h-0 min-w-0 flex-1 overflow-auto">{children}</main>
    </div>
  );
};

interface SideNavLinkProps {
  to: string;
  label: string;
  active: boolean;
  Icon: AppNavigationItem["icon"];
  expanded: boolean;
  onNavigate: () => void;
}

const SideNavLink = ({
  to,
  label,
  active,
  Icon,
  expanded,
  onNavigate,
}: SideNavLinkProps) => (
  <Link
    to={to}
    onClick={onNavigate}
    aria-current={active ? "page" : undefined}
    aria-label={label}
    title={expanded ? undefined : label}
    className={`grid h-10 min-w-0 grid-cols-[2.5rem_minmax(0,1fr)] items-center gap-2 rounded-md text-sm font-semibold transition-colors ${
      active
        ? "bg-surface text-fg"
        : "text-fg-muted hover:bg-surface hover:text-fg"
    }`}
  >
    <span className="flex h-10 w-10 items-center justify-center">
      <Icon
        className={`h-4 w-4 shrink-0 ${
          active ? "text-accent" : "text-fg-subtle"
        }`}
      />
    </span>
    <span
      className={`min-w-0 overflow-hidden truncate whitespace-nowrap transition-[max-width,opacity] duration-200 ${
        expanded ? "max-w-36 opacity-100" : "max-w-0 opacity-0"
      }`}
    >
      {label}
    </span>
  </Link>
);

export default AppSideNav;
