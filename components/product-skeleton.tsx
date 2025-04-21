import { Skeleton } from "@/components/ui/skeleton"

export default function ProductSkeleton() {
    return (
        <div className="flex flex-col space-y-3">
            {/* Product image placeholder */}
            <Skeleton className="aspect-square w-full rounded-lg" />

            {/* Product details placeholders */}
            <div className="space-y-2">
                {/* Brand name placeholder */}
                <Skeleton className="h-3 w-1/3" />

                {/* Product name placeholder */}
                <Skeleton className="h-4 w-4/5" />

                {/* Price placeholder */}
                <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-1/4" />
                    <Skeleton className="h-4 w-1/5 rounded-full" />
                </div>

                {/* Rating placeholder */}
                <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-3 w-3 rounded-full" />
                    ))}
                    <Skeleton className="h-3 w-8 ml-1" />
                </div>
            </div>
        </div>
    )
}

export function ProductGridSkeleton({ count = 4 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(count)].map((_, i) => (
                <ProductSkeleton key={i} />
            ))}
        </div>
    )
}
