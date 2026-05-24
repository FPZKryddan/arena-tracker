import { getDdragonItemIconUrl } from "../../utils/assetUrls";
import GameStatIcon from "../common/GameStatIcon";
import Tooltip from "../Tooltip/Tooltip";
import {
  itemDescriptionToText,
  type ClassifiedArenaItem,
} from "./itemMetadata";

interface ItemCardProps {
  item: ClassifiedArenaItem;
  version: string;
}

const ItemCard = ({ item, version }: ItemCardProps) => (
  <Tooltip renderContent={() => <ItemTooltip item={item} version={version} />}>
    <article className="flex items-center gap-3 rounded-lg border border-border bg-surface p-1 shadow-resting transition-colors hover:border-border-strong hover:bg-surface-hover">
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border bg-surface-elevated">
        <img
          src={getDdragonItemIconUrl(version, item.id)}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="min-w-0">
        <h3 className="t-label">{item.name}</h3>
        {item.gold && (
          <p className="t-stat mt-0.5 text-fg-muted">{item.gold.total} gold</p>
        )}
      </div>
    </article>
  </Tooltip>
);

const ItemTooltip = ({ item, version }: ItemCardProps) => (
  <div className="flex max-w-md items-start gap-3 whitespace-normal px-3 py-2.5">
    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border border-border bg-surface-elevated">
      <img
        src={getDdragonItemIconUrl(version, item.id)}
        alt=""
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover"
      />
    </div>
    <div className="min-w-0">
      <div className="flex flex-wrap items-baseline gap-x-2">
        <p className="t-h2">{item.name}</p>
        {item.gold && (
          <p className="t-stat text-accent">{item.gold.total} gold</p>
        )}
      </div>
      {item.roles.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Item roles">
          {item.roles.map((role) => (
            <span
              key={role}
              className="t-meta rounded-full border border-accent px-2 py-0.5 text-accent"
            >
              {role}
            </span>
          ))}
        </div>
      )}
      {item.grantedStats.length > 0 && (
        <div className="mt-2 flex flex-col gap-1.5" aria-label="Granted stats">
          {item.grantedStats.map((stat) => (
            <span
              key={stat.value}
              className="t-meta flex items-center w-fit gap-1 rounded-sm bg-surface-elevated px-2 py-0.5 text-fg"
            >
              <GameStatIcon stat={stat.value} />
              {stat.amount} {stat.label}
            </span>
          ))}
        </div>
      )}
      {item.effects.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Item effects">
          {item.effects.map((effect) => (
            <span
              key={effect.value}
              className="t-meta rounded-sm border border-border px-2 py-0.5 text-fg-muted"
            >
              {effect.label}
            </span>
          ))}
        </div>
      )}
      <p className="t-body-sm mt-1 text-fg-muted">
        {itemDescriptionToText(item)}
      </p>
    </div>
  </div>
);

export default ItemCard;
