import { useMemo } from "react";

interface ProgressTrackerProps {
  current: number;
  total: number;
  tracking: "played" | "top-4" | "victory" | 'none';
}

const ProgressTracker = ({
  current,
  total,
  tracking,
}: ProgressTrackerProps) => {
  const percent = total > 0 ? (current / total) * 100 : 0;

  const { label, colorClass } = useMemo(() => {
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

  return (
    <div
      className={`h-full ${colorClass} relative group hover:outline-4 outline-amber-500 hover:drop-shadow-2xl hover:z-10`}
      style={{ width: `${percent}%`, transition: "width 0.3s" }}
    >
      <div className="absolute -bottom-[8px] left-1/2 translate-y-full -translate-x-1/2 p-2 px-4 rounded-sm text-white text-lg font-bold text-nowrap bg-slate-500 opacity-0 hidden group-hover:opacity-100 group-hover:block transition-opacity duration-150 drop-shadow-2xl">
        {current} - {label}
      </div>
    </div>
  );
};

export default ProgressTracker;
