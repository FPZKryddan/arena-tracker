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

const AppSideNav = ({
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
      className={`box-border flex h-dvh w-full overflow-hidden bg-bg text-fg ${className}`}
    >
      <aside className="box-border flex h-full w-16 shrink-0 flex-col border-r border-border bg-bg p-2 md:w-60 md:p-4">
        <Link
          to="/"
          className="group flex min-w-0 items-center justify-center gap-2 rounded-md px-2 py-2 text-fg transition-colors hover:text-accent md:justify-start"
          aria-label="Arena Tracker home"
          title="Arena Tracker"
        >
          <IoFlash className="h-5 w-5 shrink-0 text-accent" />
          <span className="hidden truncate text-base font-semibold md:block">
            Arena Tracker
          </span>
        </Link>

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
            />
          ))}
        </nav>

        <div className="flex justify-center border-t border-border pt-3 md:justify-start">
          <ThemeToggle />
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
}

const SideNavLink = ({ to, label, active, Icon }: SideNavLinkProps) => (
  <Link
    to={to}
    aria-current={active ? "page" : undefined}
    aria-label={label}
    title={label}
    className={`flex h-10 min-w-0 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold transition-colors md:justify-start ${
      active
        ? "bg-surface text-fg"
        : "text-fg-muted hover:bg-surface hover:text-fg"
    }`}
  >
    <Icon
      className={`h-4 w-4 shrink-0 ${active ? "text-accent" : "text-fg-subtle"}`}
    />
    <span className="hidden min-w-0 truncate md:block">{label}</span>
  </Link>
);

export default AppSideNav;
