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

interface PlacementsBodyProps {
  placements: PlacementDto;
  placementAvg: number;
}

const getAveragePlacementTone = (averagePlacement: number): string => {
  if (averagePlacement <= 2) {
    return "border-placement-first/70 bg-placement-first/15 text-placement-first shadow-[0_0_18px_var(--color-placement-first-glow)]";
  }
  if (averagePlacement <= 4) {
    return "border-success/70 bg-success/15 text-success";
  }
  if (averagePlacement <= 5) {
    return "border-info/70 bg-info/15 text-info";
  }
  if (averagePlacement <= 6.5) {
    return "border-warning/70 bg-warning/15 text-warning";
  }
  return "border-danger/70 bg-danger/15 text-danger";
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
}: PlacementsBodyProps) => {
  const { getLosses, getTotalMatches, getWinrate, getWins } =
    useStatsAggregator();
  const { theme } = useTheme();
  const averagePlacement = Math.ceil(placementAvg * 100) / 100;
  const averagePlacementTone = getAveragePlacementTone(averagePlacement);

  const placementsToDataArray = (): number[] => {
    const newArr: number[] = [];
    for (let i = 8; i >= 1; i--) {
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

  const placementColors = [
    cssVar("--color-danger"),
    cssVar("--color-danger"),
    cssVar("--color-warning"),
    cssVar("--color-warning"),
    cssVar("--color-info"),
    cssVar("--color-success"),
    cssVar("--color-success"),
    cssVar("--color-placement-first"),
  ];

  const data = {
    labels: ["8th", "7th", "6th", "5th", "4th", "3rd", "2nd", "1st"],
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
    <div className="flex flex-col gap-[8px]">
      <div className="flex flex-row flex-wrap items-center justify-between gap-[8px]">
        <div
          className={`flex min-w-[112px] flex-col rounded-md border px-[10px] py-[8px] ${averagePlacementTone}`}
        >
          <p className="text-[10px] font-bold uppercase leading-none opacity-80">
            Avg Place
          </p>
          <p className="mt-[4px] text-[28px] font-extrabold leading-none tabular-nums">
            {averagePlacement.toFixed(2)}
          </p>
        </div>
        <div className="flex flex-1 flex-row flex-wrap justify-start gap-x-[10px] gap-y-[4px] text-[12px] font-medium text-fg-muted sm:justify-end">
          <p>Played: {getTotalMatches(placements)}</p>
          <p>
            <span className="text-success">{getWins(placements)}</span> /
            <span className="text-danger">{" " + getLosses(placements)}</span>{" "}
            ({getWinrate(placements)}%)
          </p>
        </div>
      </div>
      <div className="h-[200px]">
        <Bar key={`placements-${theme}`} data={data} options={options} />
      </div>
    </div>
  );
};

export default PlacementsBody;
