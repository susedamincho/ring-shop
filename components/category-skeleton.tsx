import { Skeleton } from "@/components/ui/skeleton"

export default function CategorySkeleton() {
    return (
        <div className="flex flex-col items-center space-y-3">
            {/* Category image placeholder */}
            <Skeleton className="h-24 w-24 rounded-full" />

            {/* Category name placeholder */}
            <Skeleton className="h-4 w-20" />
        </div>
    )
}

export function CategoryGridSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-4 md:gap-6">
            {[...Array(count)].map((_, i) => (
                <CategorySkeleton key={i} />
            ))}
        </div>
    )
}
