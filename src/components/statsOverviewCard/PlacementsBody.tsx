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
import type { placementDto } from "../../types";
import useStatsAggregator from "../../hooks/useStatsAggregator";

interface PlacementsBodyProps {
  placements: placementDto;
  placementAvg: number;
  darkGraph?: boolean;
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
  darkGraph = false,
}: PlacementsBodyProps) => {
  const { getLosses, getTotalMatches, getWinrate, getWins } =
    useStatsAggregator();
  const placementsToDataArray = (): number[] => {
    const newArr: number[] = [];
    for (let i = 8; i >= 1; i--) {
      const v = i in placements ? placements[i] : 0;
      newArr.push(v);
    }
    return newArr;
  };

  const data = {
    labels: ["8th", "7th", "6th", "5th", "4th", "3rd", "2nd", "1st"],
    datasets: [
      {
        data: placementsToDataArray(),
        borderWidth: 1,
        backgroundColor: darkGraph ? "#000" : "#fff",
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
          <span className="text-green-500">{getWins(placements)}</span> /
          <span className="text-red-500">{" " + getLosses(placements)}</span> (
          {getWinrate(placements)}%)
        </p>
        <p>Average Place: {Math.ceil(placementAvg * 100) / 100}</p>
      </div>
      <div className="h-[200px]">
        <Bar key={"Player"} data={data} options={options} />
      </div>
    </div>
  );
};

export default PlacementsBody;
