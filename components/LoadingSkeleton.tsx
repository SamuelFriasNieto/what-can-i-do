interface LoadingSkeletonProps {
  featured?: boolean;
}

export function LoadingSkeleton({ featured = false }: LoadingSkeletonProps) {
  if (featured) {
    return (
      <div className="bg-card border border-line rounded-2xl overflow-hidden flex flex-col md:flex-row">
        <div className="w-full md:w-[42%] h-60 md:h-auto skeleton shrink-0" />
        <div className="flex-1 p-7 md:p-8 flex flex-col gap-4">
          <div className="h-2.5 w-20 skeleton rounded-full" />
          <div className="h-8 w-4/5 skeleton rounded-lg" />
          <div className="h-4 w-full skeleton rounded" />
          <div className="h-4 w-full skeleton rounded" />
          <div className="h-4 w-3/4 skeleton rounded" />
          <div className="mt-auto pt-5 border-t border-line flex items-center justify-between">
            <div className="h-3 w-28 skeleton rounded" />
            <div className="h-3 w-20 skeleton rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-line rounded-2xl overflow-hidden">
      <div className="h-48 skeleton" />
      <div className="p-5 flex flex-col gap-3">
        <div className="h-5 w-3/4 skeleton rounded" />
        <div className="h-4 w-full skeleton rounded" />
        <div className="h-4 w-5/6 skeleton rounded" />
        <div className="h-4 w-2/3 skeleton rounded" />
        <div className="pt-4 border-t border-line flex items-center justify-between">
          <div className="h-3 w-20 skeleton rounded" />
          <div className="h-3 w-16 skeleton rounded" />
        </div>
      </div>
    </div>
  );
}
