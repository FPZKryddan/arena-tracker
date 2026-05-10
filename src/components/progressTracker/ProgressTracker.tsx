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
        return { label: "Played", colorClass: "bg-warning" };
      case "top-4":
        return { label: "Placed in the top-4", colorClass: "bg-info" };
      case "victory":
        return { label: "Won", colorClass: "bg-success" };
      case "none":
        return { label: "Not played", colorClass: "bg-border" };
      default:
        return { label: "", colorClass: "bg-border" };
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
        className={`relative h-full ${colorClass} outline-accent hover:z-10 hover:outline-1`}
        style={{ width: getBarWidthStyling(), transition: "width 0.3s" }}
        >
      </div>
    </Tooltip>
  );
};

export default ProgressTracker;
