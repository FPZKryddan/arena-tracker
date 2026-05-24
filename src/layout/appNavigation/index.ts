import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import { IoBook, IoPeople, IoStatsChart, IoTrophy } from "react-icons/io5";

const LAST_VIEWED_PROFILE_STORAGE_KEY = "lastViewedProfilePath";
const PROFILE_PATH_PATTERN = /^\/profile\/[^/?#]+\/[^/?#]+\/[^/?#]+\/?$/;

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
    label: "Profile",
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
  search: string,
): string => {
  const profileMatch = pathname.match(/^\/profile\/([^/]+)\/([^/]+)\/([^/]+)/);
  if (!profileMatch) return "/compare";

  const [, region, encodedGameName, encodedTagLine] = profileMatch;
  const gameName = safeDecode(encodedGameName);
  const tagLine = safeDecode(encodedTagLine);
  if (!gameName || !tagLine) return "/compare";

  const params = new URLSearchParams({
    p: [region, encodeURIComponent(gameName), encodeURIComponent(tagLine)].join(
      "|",
    ),
  });
  const mode = new URLSearchParams(search).get("mode");
  if (mode) params.set("mode", mode);

  return `/compare?${params.toString()}`;
};

export const getProfilePathFromLocation = (
  pathname: string,
  search: string,
): string | null => (isProfilePath(pathname) ? `${pathname}${search}` : null);

export const saveLastViewedProfilePath = (profilePath: string): void => {
  if (!isProfilePath(profilePath) || typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(LAST_VIEWED_PROFILE_STORAGE_KEY, profilePath);
  } catch {
    // Storage may be unavailable in restricted browser contexts.
  }
};

export const getLastViewedProfilePath = (): string => {
  if (typeof window === "undefined") return "/";

  try {
    const savedPath = window.sessionStorage.getItem(
      LAST_VIEWED_PROFILE_STORAGE_KEY,
    );
    return savedPath && isProfilePath(savedPath) ? savedPath : "/";
  } catch {
    return "/";
  }
};

export const getNavigationTarget = (
  item: AppNavigationItem,
  comparePath: string,
  profilePath = "/",
) => {
  if (item.key === "compare") return comparePath;
  if (item.key === "profiles") return profilePath;
  return item.defaultTo;
};

const safeDecode = (value: string): string | null => {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
};

const isProfilePath = (path: string): boolean =>
  PROFILE_PATH_PATTERN.test(path.split(/[?#]/, 1)[0]);
