import { useMemo } from "react";
import Tooltip from "../Tooltip/Tooltip";

interface ProgressTrackerProps {
  current: number;
  total: number;
  totalWidth: number;
  tracking: "played" | "top-4" | "victory" | 'none';
}

const ProgressTracker = ({
  current,
  total,
  totalWidth,
  tracking,
}: ProgressTrackerProps) => {
  const getBarWidthStyling = (): string => {
    return (current / total) * totalWidth + "px";
  };

  const { colorClass } = useMemo(() => {
    switch (tracking) {
      case "played":
        return { label: "Played", colorClass: "bg-amber-400" };
      case "top-4":
        return { label: "Placed in the top-4", colorClass: "bg-blue-400" };
      case "victory":
        return { label: "Won", colorClass: "bg-green-500" };
      case "none":
        return { label: "Not played", colorClass: "bg-slate-200" };
      default:
        return { label: "", colorClass: "bg-gray-400" };
    }
  }, [tracking]);

  const tooltipTextSwitch = (): string => {
    switch (tracking) {
      case "played":
        return 'Played - ' + current;
      case "top-4":
        return 'Placed in the top-4 - ' + current;
      case "victory":
        return 'Won - ' + current;
      case "none":
        return 'Not played - ' + current;
      default:
        return '';
    }
  };

  return (
    <Tooltip text={tooltipTextSwitch()}>
      <div
        className={`h-full ${colorClass} relative hover:outline-2 outline-amber-500 hover:drop-shadow-2xl hover:z-10`}
        style={{ width: getBarWidthStyling(), transition: "width 0.3s" }}
        >
      </div>
    </Tooltip>
  );
};

export default ProgressTracker;
