export default function ProductSkeleton() {
  return (
    <div className="flex flex-col space-y-3 animate-pulse">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-200"></div>
      <div className="space-y-2">
        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  )
}
