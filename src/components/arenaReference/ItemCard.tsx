import { getDdragonItemIconUrl } from "../../utils/assetUrls";
import GameStatIcon from "../common/GameStatIcon";
import Tooltip from "../Tooltip/Tooltip";
import { itemDescriptionToText, type ClassifiedArenaItem } from "./itemMetadata";

interface ItemCardProps {
  item: ClassifiedArenaItem;
  version: string;
}

const ItemCard = ({ item, version }: ItemCardProps) => (
  <Tooltip renderContent={() => <ItemTooltip item={item} version={version} />}>
    <article className="flex min-h-20 items-center gap-3 rounded-lg border border-border bg-surface p-3 shadow-resting transition-colors hover:border-border-strong hover:bg-surface-hover">
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
        <h3 className="text-sm font-semibold leading-5">{item.name}</h3>
        {item.gold && (
          <p className="mt-0.5 text-xs font-medium tabular-nums text-fg-muted">
            {item.gold.total} gold
          </p>
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
        <p className="text-sm font-semibold leading-5">{item.name}</p>
        {item.gold && (
          <p className="text-xs font-medium tabular-nums text-accent">
            {item.gold.total} gold
          </p>
        )}
      </div>
      {item.roles.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Item roles">
          {item.roles.map((role) => (
            <span
              key={role}
              className="rounded-full border border-accent px-2 py-0.5 text-xs font-medium text-accent"
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
              className="flex items-center w-fit gap-1 rounded-sm bg-surface-elevated px-2 py-0.5 text-xs font-medium text-fg"
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
              className="rounded-sm border border-border px-2 py-0.5 text-xs font-medium text-fg-muted"
            >
              {effect.label}
            </span>
          ))}
        </div>
      )}
      <p className="mt-1 text-xs font-normal leading-5 text-fg-muted">
        {itemDescriptionToText(item)}
      </p>
    </div>
  </div>
);

export default ItemCard;
