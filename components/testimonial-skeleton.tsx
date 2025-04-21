import { Skeleton } from "@/components/ui/skeleton"

export default function TestimonialSkeleton() {
    return (
        <div className="flex flex-col space-y-4 p-6 bg-muted/40 rounded-lg">
            {/* Quote icon placeholder */}
            <Skeleton className="h-6 w-6 rounded-full" />

            {/* Testimonial content placeholder */}
            <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-10/12" />
                <Skeleton className="h-4 w-9/12" />
            </div>

            {/* Author info placeholder */}
            <div className="flex items-center space-x-3 pt-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                </div>
            </div>
        </div>
    )
}

export function TestimonialGridSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(count)].map((_, i) => (
                <TestimonialSkeleton key={i} />
            ))}
        </div>
    )
}
