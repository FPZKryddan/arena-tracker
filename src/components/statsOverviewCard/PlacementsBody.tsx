import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import type { PlacementDto } from "../../types";
import useStatsAggregator from "../../hooks/useStatsAggregator";
import useTheme from "../../hooks/useTheme";
import type { ArenaPlacementCount } from "../../utils/arenaModes";

interface PlacementsBodyProps {
  placements: PlacementDto;
  placementAvg: number;
  placementCount?: ArenaPlacementCount;
}

const getPlacementLabel = (placement: number): string => {
  const suffix =
    placement === 1 ? "st" : placement === 2 ? "nd" : placement === 3 ? "rd" : "th";
  return `${placement}${suffix}`;
};

const getAveragePlacementTone = (averagePlacement: number): string => {
  if (averagePlacement <= 2) {
    return "border-placement-first/70 text-placement-first";
  }
  if (averagePlacement <= 4) {
    return "border-success/70 text-success";
  }
  if (averagePlacement <= 5) {
    return "border-info/70 text-info";
  }
  if (averagePlacement <= 6.5) {
    return "border-warning/70 text-warning";
  }
  return "border-danger/70 text-danger";
};

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);
const PlacementsBody = ({
  placements,
  placementAvg,
  placementCount = 8,
}: PlacementsBodyProps) => {
  const { getLosses, getTotalMatches, getWinrate, getWins } =
    useStatsAggregator();
  const { theme } = useTheme();
  const averagePlacement = Math.ceil(placementAvg * 100) / 100;
  const averagePlacementTone = getAveragePlacementTone(averagePlacement);

  const placementsToDataArray = (): number[] => {
    const newArr: number[] = [];
    for (let i = placementCount; i >= 1; i--) {
      const v = i in placements ? placements[i] : 0;
      newArr.push(v);
    }
    return newArr;
  };

  const cssVar = (name: string) => {
    if (typeof window === "undefined") return `var(${name})`;
    return (
      getComputedStyle(document.documentElement).getPropertyValue(name).trim() ||
      `var(${name})`
    );
  };

  const placementColors = Array.from({ length: placementCount }, (_, index) => {
    const placement = placementCount - index;
    if (placement === 1) return cssVar("--color-placement-first");
    if (placement <= 3) return cssVar("--color-success");
    if (placement === 4) return cssVar("--color-info");
    if (placement <= 6) return cssVar("--color-warning");
    return cssVar("--color-danger");
  });

  const data = {
    labels: Array.from({ length: placementCount }, (_, index) =>
      getPlacementLabel(placementCount - index)
    ),
    datasets: [
      {
        data: placementsToDataArray(),
        borderWidth: 1,
        backgroundColor: placementColors,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          display: true,
        },
        ticks: {
          beginAtZero: true,
          maxTicksLimit: 5,
        },
      },
    },
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row flex-wrap items-center justify-between gap-2">
        <div
          className={`flex min-w-28 flex-col rounded-md px-2.5 py-2 ${averagePlacementTone}`}
        >
          <p className="text-xs font-semibold uppercase leading-none opacity-80">
            Avg Place
          </p>
          <p className="mt-1 text-2xl font-semibold leading-none tabular-nums">
            {averagePlacement.toFixed(2)}
          </p>
        </div>
        <div className="flex flex-1 flex-row flex-wrap justify-start gap-x-2.5 gap-y-1 text-xs font-medium text-fg-muted sm:justify-end">
          <p>Played: {getTotalMatches(placements)}</p>
          <p>
            <span className="text-success">{getWins(placements)}</span> /
            <span className="text-danger">{" " + getLosses(placements)}</span>{" "}
            ({getWinrate(placements)}%)
          </p>
        </div>
      </div>
      <div className="h-48">
        <Bar key={`placements-${theme}`} data={data} options={options} />
      </div>
    </div>
  );
};

export default PlacementsBody;
