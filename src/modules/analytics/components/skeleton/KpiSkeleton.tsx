export const KpiSkeleton = () => {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-[120px] rounded-xl bg-muted animate-pulse"
        />
      ))}
    </div>
  );
};
