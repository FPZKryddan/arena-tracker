const StatsSkeleton = () => {
  return (
    <div className="bg-stone-200 flex flex-col rounded-xl w-[415px] p-[32px] gap-[32px] shadow-2xl animate-pulse">
      <div className="flex flex-row items-center gap-4">
        <div className="w-12 h-12 bg-stone-400 rounded-full" />
        <div className="flex flex-col gap-1">
          <div className="w-40 h-4 bg-stone-400 rounded" />
          <div className="flex gap-2">
            <div className="w-10 h-3 bg-stone-400 rounded" />
            <div className="w-10 h-3 bg-stone-400 rounded" />
            <div className="w-10 h-3 bg-stone-400 rounded" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="w-32 h-4 bg-stone-400 rounded" />
        <div className="w-full h-3 bg-stone-400 rounded" />
        <div className="w-32 h-4 bg-stone-400 rounded" />
        <div className="w-full h-3 bg-stone-400 rounded" />
      </div>

      <div className="flex flex-col gap-2">
        <div className="w-32 h-4 bg-stone-400 rounded" />
        <div className="flex flex-row gap-4 mt-2 justify-between">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 bg-stone-400 rounded-full" />
              <div className="w-4 h-3 bg-stone-400 rounded" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-4 text-sm">
          <div className="w-20 h-3 bg-stone-400 rounded" />
          <div className="w-24 h-3 bg-stone-400 rounded" />
          <div className="w-24 h-3 bg-stone-400 rounded" />
        </div>

        <div className="h-[150px] w-full flex items-end gap-1 justify-around">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="w-6 bg-stone-400 rounded"
              style={{ height: `${75 + (i % 2) * 50}px` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsSkeleton;