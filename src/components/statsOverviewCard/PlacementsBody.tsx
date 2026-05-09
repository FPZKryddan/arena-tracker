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
  const placementsToDataArray = (): number[] => {
    const newArr: number[] = [];
    for (let i = 8; i >= 1; i--) {
      const v = i in placements ? placements[i] : 0;
      newArr.push(v);
    }
    return newArr;
  };

  const cssVar = (name: string, fallback: string) => {
    if (typeof window === "undefined") return fallback;
    return (
      getComputedStyle(document.documentElement).getPropertyValue(name).trim() ||
      fallback
    );
  };

  const placementColors = [
    cssVar("--color-danger", "#f87171"),
    cssVar("--color-danger", "#f87171"),
    cssVar("--color-warning", "#fbbf24"),
    cssVar("--color-warning", "#fbbf24"),
    cssVar("--color-info", "#93c5fd"),
    cssVar("--color-success", "#4ade80"),
    cssVar("--color-success", "#4ade80"),
    cssVar("--color-accent", "#f6f600"),
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
    <div className="flex flex-col ">
      <div className="flex flex-row gap-[8px] text-[12px] font-medium">
        <p>Played: {getTotalMatches(placements)}</p>
        <p>
          <span className="text-success">{getWins(placements)}</span> /
          <span className="text-danger">{" " + getLosses(placements)}</span> (
          {getWinrate(placements)}%)
        </p>
        <p>Average Place: {Math.ceil(placementAvg * 100) / 100}</p>
      </div>
      <div className="h-[200px]">
        <Bar key={`placements-${theme}`} data={data} options={options} />
      </div>
    </div>
  );
};

export default PlacementsBody;
