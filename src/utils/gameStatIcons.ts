export type GameStatIconKey =
  | "level"
  | "attack-damage"
  | "ability-power"
  | "health"
  | "armor"
  | "magic-resist"
  | "ability-haste"
  | "attack-speed"
  | "critical-strike-chance"
  | "critical-strike-damage"
  | "lethality"
  | "armor-penetration"
  | "magic-penetration"
  | "life-steal"
  | "omnivamp"
  | "spell-vamp"
  | "mana"
  | "mana-regen"
  | "health-regen"
  | "move-speed"
  | "tenacity"
  | "adaptive-force"
  | "heal-and-shield-power"
  | "physical-damage"
  | "magic-damage"
  | "true-damage";

import { CDRAGON_STAT_ICON_BASE } from "./assetUrls";

const GAME_STAT_ICON_FILES: Record<GameStatIconKey, string> = {
  level: "scalelevel.png",
  "attack-damage": "scalead.png",
  "ability-power": "scaleap.png",
  health: "scalehealth.png",
  armor: "scalearmor.png",
  "magic-resist": "scalemr.png",
  "ability-haste": "scaleah.png",
  "attack-speed": "scaleas.png",
  "critical-strike-chance": "scalecrit.png",
  "critical-strike-damage": "scalecritmult.png",
  lethality: "scaleapen.png",
  "armor-penetration": "scaleapen.png",
  "magic-penetration": "scalempen.png",
  "life-steal": "scalels.png",
  omnivamp: "scalesv.png",
  "spell-vamp": "scalesv.png",
  mana: "scalemana.png",
  "mana-regen": "scalemanaregen.png",
  "health-regen": "scalehpregen.png",
  "move-speed": "scalems.png",
  tenacity: "scaletenacity.png",
  "adaptive-force": "scaleadaptiveforce.png",
  "heal-and-shield-power": "scalehealshield.png",
  "physical-damage": "scalead.png",
  "magic-damage": "scaleap.png",
  "true-damage": "scaleadaptiveforce.png",
};

export const getGameStatIconUrl = (stat: GameStatIconKey): string =>
  `${CDRAGON_STAT_ICON_BASE}${GAME_STAT_ICON_FILES[stat]}`;

export const FALLBACK_GAME_STAT_ICON_URL =
  getGameStatIconUrl("adaptive-force");
