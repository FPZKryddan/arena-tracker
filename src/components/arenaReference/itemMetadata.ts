import type { ItemDataDto } from "../../types";
import type { GameStatIconKey } from "../../utils/gameStatIcons";

export type ArenaItemRole =
  | "Tank"
  | "Bruiser"
  | "Marksman"
  | "Mage"
  | "Support"
  | "Assassin";

export type ArenaItemStatKey = Exclude<
  GameStatIconKey,
  "level" | "spell-vamp" | "physical-damage" | "magic-damage" | "true-damage"
>;

export type ArenaItemEffectKey =
  | "on-hit"
  | "active"
  | "aura"
  | "slow"
  | "stealth";

export interface ItemFilterOption<TValue extends string> {
  value: TValue;
  label: string;
}

export const ITEM_ROLE_OPTIONS: readonly ItemFilterOption<ArenaItemRole>[] = [
  { value: "Tank", label: "Tank" },
  { value: "Bruiser", label: "Bruiser" },
  { value: "Marksman", label: "Marksman" },
  { value: "Mage", label: "Mage" },
  { value: "Support", label: "Support" },
  { value: "Assassin", label: "Assassin" },
];

type ItemStatDefinition = ItemFilterOption<ArenaItemStatKey> & {
  pattern: RegExp;
};

const STAT_DEFINITIONS: readonly ItemStatDefinition[] = [
  {
    value: "heal-and-shield-power",
    label: "Heal and Shield Power",
    pattern: /Heal and Shield Power$/i,
  },
  {
    value: "critical-strike-damage",
    label: "Critical Strike Damage",
    pattern: /Critical Strike Damage$/i,
  },
  {
    value: "critical-strike-chance",
    label: "Critical Strike Chance",
    pattern: /Critical Strike Chance$/i,
  },
  {
    value: "armor-penetration",
    label: "Armor Penetration",
    pattern: /Armor Penetration$/i,
  },
  {
    value: "magic-penetration",
    label: "Magic Penetration",
    pattern: /Magic Penetration$/i,
  },
  {
    value: "health-regen",
    label: "Health Regen",
    pattern: /(?:Base )?Health Regen(?:eration)?$/i,
  },
  {
    value: "mana-regen",
    label: "Mana Regen",
    pattern: /Base Mana Regen(?:eration)?$/i,
  },
  {
    value: "attack-damage",
    label: "Attack Damage",
    pattern: /Attack Damage$/i,
  },
  {
    value: "ability-power",
    label: "Ability Power",
    pattern: /Ability Power$/i,
  },
  {
    value: "magic-resist",
    label: "Magic Resist",
    pattern: /Magic Resist$/i,
  },
  {
    value: "ability-haste",
    label: "Ability Haste",
    pattern: /Ability Haste$/i,
  },
  {
    value: "attack-speed",
    label: "Attack Speed",
    pattern: /Attack Speed$/i,
  },
  {
    value: "life-steal",
    label: "Life Steal",
    pattern: /Life Steal$/i,
  },
  {
    value: "move-speed",
    label: "Move Speed",
    pattern: /Move(?:ment)? Speed$/i,
  },
  {
    value: "adaptive-force",
    label: "Adaptive Force",
    pattern: /Adaptive Force$/i,
  },
  { value: "omnivamp", label: "Omnivamp", pattern: /Omnivamp$/i },
  { value: "tenacity", label: "Tenacity", pattern: /Tenacity$/i },
  { value: "lethality", label: "Lethality", pattern: /Lethality$/i },
  { value: "health", label: "Health", pattern: /Health$/i },
  { value: "armor", label: "Armor", pattern: /Armor$/i },
  { value: "mana", label: "Mana", pattern: /Mana$/i },
];

export const ITEM_STAT_OPTIONS: readonly ItemFilterOption<ArenaItemStatKey>[] =
  STAT_DEFINITIONS.map(({ value, label }) => ({ value, label }));

type ItemEffectDefinition = ItemFilterOption<ArenaItemEffectKey> & {
  tag: string;
};

const EFFECT_DEFINITIONS: readonly ItemEffectDefinition[] = [
  { value: "on-hit", label: "On-hit", tag: "OnHit" },
  { value: "active", label: "Active", tag: "Active" },
  { value: "aura", label: "Aura", tag: "Aura" },
  { value: "slow", label: "Slow", tag: "Slow" },
  { value: "stealth", label: "Stealth", tag: "Stealth" },
];

export const ITEM_EFFECT_OPTIONS: readonly ItemFilterOption<ArenaItemEffectKey>[] =
  EFFECT_DEFINITIONS.map(({ value, label }) => ({ value, label }));

export interface ArenaShopItem extends ItemDataDto {
  id: number;
}

export interface NormalizedItemStat {
  value: ArenaItemStatKey;
  label: string;
  amount: string;
}

export interface NormalizedItemEffect {
  value: ArenaItemEffectKey;
  label: string;
}

export interface ItemMetadata {
  grantedStats: NormalizedItemStat[];
  statKeys: ReadonlySet<ArenaItemStatKey>;
  effects: NormalizedItemEffect[];
  effectKeys: ReadonlySet<ArenaItemEffectKey>;
}

export interface ClassifiedArenaItem extends ArenaShopItem, ItemMetadata {
  roles: ArenaItemRole[];
}

const decodeItemText = (text: string): string =>
  text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'");

const toPlainText = (html: string): string =>
  decodeItemText(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const NO_DESCRIPTION_FALLBACK = "No description available.";
const NO_EFFECTS_FALLBACK = "No additional item effects described.";

export const itemDescriptionToText = (item: ItemDataDto): string => {
  const source = item.description || item.plaintext || NO_DESCRIPTION_FALLBACK;
  const withoutStatsBlock = source.replace(/<stats>[\s\S]*?<\/stats>/gi, " ");
  const withNewlines = withoutStatsBlock.replace(/<br\s*\/?>/gi, "\n");
  return toPlainText(withNewlines) || NO_EFFECTS_FALLBACK;
};

export const parseGrantedStats = (
  description: string,
): NormalizedItemStat[] => {
  const statsBlock = description.match(/<stats>([\s\S]*?)<\/stats>/i)?.[1];
  if (!statsBlock) return [];

  return statsBlock
    .split(/<br\s*\/?>/i)
    .map((line) => toPlainText(line))
    .reduce<NormalizedItemStat[]>((stats, line) => {
      const definition = STAT_DEFINITIONS.find(({ pattern }) =>
        pattern.test(line),
      );
      if (!definition) return stats;

      const amount = line.replace(definition.pattern, "").trim();
      if (!amount || stats.some((stat) => stat.value === definition.value)) {
        return stats;
      }

      stats.push({
        value: definition.value,
        label: definition.label,
        amount,
      });
      return stats;
    }, []);
};

export const getItemMetadata = (item: ItemDataDto): ItemMetadata => {
  const grantedStats = parseGrantedStats(item.description);
  const itemTags = new Set(item.tags ?? []);
  const effects = EFFECT_DEFINITIONS.filter(({ tag }) => itemTags.has(tag)).map(
    ({ value, label }) => ({ value, label }),
  );

  return {
    grantedStats,
    statKeys: new Set(grantedStats.map((stat) => stat.value)),
    effects,
    effectKeys: new Set(effects.map((effect) => effect.value)),
  };
};
