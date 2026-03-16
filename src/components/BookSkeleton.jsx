export default function BookSkeleton() {
  return (
    <div className="book-card-explore overflow-hidden animate-pulse">
      {/* Cover */}
      <div className="skeleton" style={{ aspectRatio: '2/3' }} />
      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="skeleton h-4 rounded w-4/5" />
        <div className="skeleton h-3 rounded w-1/2" />
        <div className="skeleton h-3 rounded w-full" />
        <div className="skeleton h-3 rounded w-3/4" />
        <div className="skeleton h-8 rounded-xl mt-2" />
      </div>
    </div>
  );
}
