import { CardSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-10 animate-in">
      <div className="flex flex-col gap-2">
         <Skeleton className="h-4 w-32 rounded-full" />
         <Skeleton className="h-10 w-64" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Operations */}
        <div className="lg:col-span-8 flex flex-col gap-8">
           <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Skeleton className="h-32 rounded-3xl" />
              <Skeleton className="h-32 rounded-3xl" />
              <Skeleton className="h-32 rounded-3xl" />
              <Skeleton className="h-32 rounded-3xl" />
              <Skeleton className="h-32 rounded-3xl" />
              <Skeleton className="h-32 rounded-3xl" />
           </div>
           <Skeleton className="h-64 rounded-3xl" />
           <CardSkeleton />
        </div>
        {/* Right: Staff & VIP */}
        <div className="lg:col-span-4 flex flex-col gap-8">
           <Skeleton className="h-48 rounded-3xl" />
           <CardSkeleton />
           <CardSkeleton />
        </div>
      </div>
    </div>
  );
}
