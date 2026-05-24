import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import { IoBook, IoPeople, IoStatsChart, IoTrophy } from "react-icons/io5";

export type ActivePage = "profiles" | "codex" | "leaderboard" | "compare";

export interface AppNavigationProps {
  children?: ReactNode;
  className?: string;
  comparePath?: string;
}

export interface AppNavigationItem {
  key: ActivePage;
  label: string;
  defaultTo: string;
  icon: IconType;
}

export const getActivePage = (pathname: string): ActivePage => {
  if (pathname.startsWith("/codex")) return "codex";
  if (pathname.startsWith("/leaderboard")) return "leaderboard";
  if (pathname.startsWith("/compare")) return "compare";
  return "profiles";
};

export const NAV_ITEMS: AppNavigationItem[] = [
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
  {
    key: "codex",
    label: "Codex",
    defaultTo: "/codex",
    icon: IoBook,
  },
];

export const getComparePathFromLocation = (
  pathname: string,
  search: string
): string => {
  const profileMatch = pathname.match(/^\/profile\/([^/]+)\/([^/]+)\/([^/]+)/);
  if (!profileMatch) return "/compare";

  const [, region, encodedGameName, encodedTagLine] = profileMatch;
  const gameName = safeDecode(encodedGameName);
  const tagLine = safeDecode(encodedTagLine);
  if (!gameName || !tagLine) return "/compare";

  const params = new URLSearchParams({
    p: [region, encodeURIComponent(gameName), encodeURIComponent(tagLine)].join("|"),
  });
  const mode = new URLSearchParams(search).get("mode");
  if (mode) params.set("mode", mode);

  return `/compare?${params.toString()}`;
};

export const getNavigationTarget = (
  item: AppNavigationItem,
  comparePath: string
) => (item.key === "compare" ? comparePath : item.defaultTo);

const safeDecode = (value: string): string | null => {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
};
