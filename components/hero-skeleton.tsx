import { Skeleton } from "@/components/ui/skeleton"

export default function HeroSkeleton() {
    return (
        <div className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
                <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
                    {/* Hero content placeholders */}
                    <div className="flex flex-col justify-center space-y-4">
                        <div className="space-y-2">
                            <Skeleton className="h-12 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <Skeleton className="h-4 w-4/6" />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Skeleton className="h-10 w-32" />
                            <Skeleton className="h-10 w-32" />
                        </div>
                    </div>

                    {/* Hero image placeholder */}
                    <div className="flex justify-center lg:justify-end">
                        <Skeleton className="aspect-square w-full max-w-[500px] rounded-lg" />
                    </div>
                </div>
            </div>
        </div>
    )
}
