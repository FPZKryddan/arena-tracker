import type {
  ArenaItemEffectKey,
  ArenaItemRole,
  ArenaItemStatKey,
  ClassifiedArenaItem,
} from "./itemMetadata";

export interface ArenaItemFilters {
  roles: ArenaItemRole[];
  stats: ArenaItemStatKey[];
  effects: ArenaItemEffectKey[];
}

export const DEFAULT_ARENA_ITEM_FILTERS: ArenaItemFilters = {
  roles: [],
  stats: [],
  effects: [],
};

export const hasActiveItemFilters = (filters: ArenaItemFilters): boolean =>
  filters.roles.length > 0 ||
  filters.stats.length > 0 ||
  filters.effects.length > 0;

export const matchesItemFilters = (
  item: ClassifiedArenaItem,
  filters: ArenaItemFilters
): boolean =>
  filters.roles.every((role) => item.roles.includes(role)) &&
  filters.stats.every((stat) => item.statKeys.has(stat)) &&
  filters.effects.every((effect) => item.effectKeys.has(effect));
