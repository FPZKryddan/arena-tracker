import type { ArenaItemRole } from "./itemMetadata";

export type RoleOverride = {
  include?: readonly ArenaItemRole[];
  exclude?: readonly ArenaItemRole[];
};

export const ROLE_OVERRIDES: Record<string, RoleOverride> = {
  Heartsteel: { include: ["Tank"] },
  "Warmog's Armor": { include: ["Tank"] },
  "Frozen Heart": { include: ["Tank"] },
  "Gargoyle Stoneplate": { include: ["Tank"] },
  "Plated Steelcaps": { include: ["Tank"] },
  "Mercury's Treads": { include: ["Tank"] },
  Eclipse: { include: ["Bruiser"] },
  "Berserker's Greaves": { include: ["Marksman"] },
  Manamune: { include: ["Marksman"] },
  "Rod of Ages": { include: ["Mage"] },
  "Sorcerer's Shoes": { include: ["Mage"] },
  "Eleisa's Miracle": { include: ["Support"] },
  "Whispering Circlet": { include: ["Support"] },
  "Empyrean Promise": { include: ["Support"] },
  Puppeteer: { include: ["Support"] },
  "Sword of the Divine": { include: ["Marksman", "Mage"] },
};
