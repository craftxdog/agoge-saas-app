export const TableSkeleton = () => {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="h-10 w-full rounded bg-muted animate-pulse"
        />
      ))}
    </div>
  );
};
