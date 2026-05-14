import { Link, useLocation } from "react-router-dom";
import { IoFlash, IoPeople, IoStatsChart, IoTrophy } from "react-icons/io5";
import ThemeToggle from "../themeToggle";

type ActivePage = "profiles" | "leaderboard" | "compare";

interface AppHeaderProps {
  comparePath?: string;
}

const getActivePage = (pathname: string): ActivePage => {
  if (pathname.startsWith("/leaderboard")) return "leaderboard";
  if (pathname.startsWith("/compare")) return "compare";
  return "profiles";
};

const NAV_ITEMS: Array<{
  key: ActivePage;
  label: string;
  defaultTo: string;
  icon: typeof IoStatsChart;
}> = [
  {
    key: "profiles",
    label: "Profiles",
    defaultTo: "/",
    icon: IoStatsChart,
  },
  {
    key: "leaderboard",
    label: "Leaderboard",
    defaultTo: "/leaderboard",
    icon: IoTrophy,
  },
  {
    key: "compare",
    label: "Compare",
    defaultTo: "/compare",
    icon: IoPeople,
  },
];

const AppHeader = ({ comparePath = "/compare" }: AppHeaderProps) => {
  const { pathname } = useLocation();
  const activePage = getActivePage(pathname);

  return (
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

      <div className="grid w-full grid-cols-3 gap-2 sm:flex sm:w-auto sm:items-center">
        {NAV_ITEMS.map((item) => (
          <HeaderLink
            key={item.key}
            to={item.key === "compare" ? comparePath : item.defaultTo}
            label={item.label}
            active={activePage === item.key}
            Icon={item.icon}
          />
        ))}
        <div className="hidden sm:block">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

interface HeaderLinkProps {
  to: string;
  label: string;
  active: boolean;
  Icon: typeof IoStatsChart;
}

const HeaderLink = ({ to, label, active, Icon }: HeaderLinkProps) => (
  <Link
    to={to}
    aria-current={active ? "page" : undefined}
    className={`flex h-9 min-w-0 items-center box-content border-b-4 justify-center gap-1.5 px-2 text-xs font-semibold transition-colors sm:px-3 ${
      active
        ? "text-fg border-accent"
        : "text-fg border-transparent hover:border-border-strong"
    }`}
  >
    <Icon className="hidden h-4 w-4 shrink-0 md:block" />
    <span className="min-w-0 truncate">{label}</span>
  </Link>
);

export default AppHeader;
