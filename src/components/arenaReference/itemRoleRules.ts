import {
  ITEM_ROLE_OPTIONS,
  getItemMetadata,
  type ArenaItemEffectKey,
  type ArenaItemRole,
  type ArenaItemStatKey,
  type ArenaShopItem,
  type ClassifiedArenaItem,
  type ItemMetadata,
} from "./itemMetadata";
import { ROLE_OVERRIDES } from "./itemRoleOverrides";

export const ARENA_ITEM_ROLES: readonly ArenaItemRole[] = ITEM_ROLE_OPTIONS.map(
  ({ value }) => value
);

export type RoleRuleInput = Pick<ItemMetadata, "statKeys" | "effectKeys"> & {
  name: string;
  tags: readonly string[];
};

type RoleRule = (item: RoleRuleInput) => boolean;

export const hasAll = <T,>(
  values: ReadonlySet<T>,
  requiredValues: readonly T[]
): boolean => requiredValues.every((value) => values.has(value));

export const hasAny = <T,>(
  values: ReadonlySet<T>,
  requiredValues: readonly T[]
): boolean => requiredValues.some((value) => values.has(value));

const hasStats = (
  item: RoleRuleInput,
  ...requiredStats: ArenaItemStatKey[]
): boolean => hasAll(item.statKeys, requiredStats);

const hasAnyStat = (
  item: RoleRuleInput,
  ...requiredStats: ArenaItemStatKey[]
): boolean => hasAny(item.statKeys, requiredStats);

const hasEffects = (
  item: RoleRuleInput,
  ...requiredEffects: ArenaItemEffectKey[]
): boolean => hasAll(item.effectKeys, requiredEffects);

const hasAnyEffect = (
  item: RoleRuleInput,
  ...requiredEffects: ArenaItemEffectKey[]
): boolean => hasAny(item.effectKeys, requiredEffects);

export const ROLE_RULES: Record<ArenaItemRole, RoleRule> = {
  Tank: (item) =>
    (hasStats(item, "health") &&
      hasAnyStat(item, "armor", "magic-resist", "tenacity")) ||
    hasStats(item, "armor", "magic-resist") ||
    (hasStats(item, "health") && hasEffects(item, "aura")) ||
    (hasStats(item, "health", "ability-haste") && hasEffects(item, "active")),
  Bruiser: (item) =>
    hasStats(item, "attack-damage") &&
    hasAnyStat(
      item,
      "health",
      "armor",
      "magic-resist",
      "life-steal",
      "omnivamp",
      "tenacity"
    ),
  Marksman: (item) =>
    (hasStats(item, "attack-damage") &&
      hasAnyStat(item, "attack-speed", "critical-strike-chance")) ||
    (hasStats(item, "attack-speed") && hasEffects(item, "on-hit")) ||
    (hasStats(item, "critical-strike-chance") &&
      hasAnyStat(item, "attack-speed", "attack-damage")),
  Mage: (item) =>
    (hasStats(item, "ability-power") || hasAnyStat(item, "magic-penetration")) && !hasAnyStat(item, "heal-and-shield-power"),
  Support: (item) =>
    hasStats(item, "heal-and-shield-power") ||
    (hasStats(item, "mana-regen") &&
      hasAnyStat(item, "ability-power", "ability-haste")) ||
    (hasStats(item, "health") && hasAnyEffect(item, "aura", "active")),
  Assassin: (item) =>
    hasStats(item, "attack-damage") &&
    hasAnyStat(item, "lethality", "armor-penetration") &&
    !hasStats(item, "health"),
};

export const classifyItemRoles = (item: RoleRuleInput): ArenaItemRole[] => {
  const tags = new Set(item.tags);
  if (tags.has("Consumable")) return [];

  const override = ROLE_OVERRIDES[item.name];
  if (tags.has("Boots")) {
    return ARENA_ITEM_ROLES.filter((role) =>
      (override?.include ?? []).includes(role)
    );
  }

  const roles = new Set(
    ARENA_ITEM_ROLES.filter((role) => ROLE_RULES[role](item))
  );

  override?.exclude?.forEach((role) => roles.delete(role));
  override?.include?.forEach((role) => roles.add(role));

  return ARENA_ITEM_ROLES.filter((role) => roles.has(role));
};

export const classifyArenaItem = (item: ArenaShopItem): ClassifiedArenaItem => {
  const metadata = getItemMetadata(item);

  return {
    ...item,
    ...metadata,
    roles: classifyItemRoles({
      name: item.name,
      tags: item.tags ?? [],
      statKeys: metadata.statKeys,
      effectKeys: metadata.effectKeys,
    }),
  };
};
