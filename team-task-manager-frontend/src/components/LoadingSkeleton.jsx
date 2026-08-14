export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="w-full">
          <div className="h-4 bg-slate-200 rounded w-24" />

          <div className="h-9 bg-slate-200 rounded w-14 mt-3" />
        </div>

        <div className="w-10 h-10 bg-slate-200 rounded-lg" />
      </div>

      <div className="h-3 bg-slate-200 rounded w-32 mt-4" />
    </div>
  );
}

export function TaskSkeleton() {
  return (
    <div className="px-6 py-4 animate-pulse flex items-center justify-between">
      <div>
        <div className="h-4 bg-slate-200 rounded w-48" />
        <div className="h-3 bg-slate-200 rounded w-32 mt-2" />
      </div>

      <div className="flex gap-3">
        <div className="h-6 bg-slate-200 rounded-full w-16" />
        <div className="h-6 bg-slate-200 rounded-full w-20" />
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div>
        <div className="h-7 bg-slate-200 rounded w-48" />
        <div className="h-4 bg-slate-200 rounded w-72 mt-2" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((item) => (
          <StatCardSkeleton key={item} />
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="h-5 bg-slate-200 rounded w-32" />

        <div className="space-y-4 mt-6">
          {[1, 2, 3, 4].map((item) => (
            <TaskSkeleton key={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
