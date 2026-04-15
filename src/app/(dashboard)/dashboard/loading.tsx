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
        <div className="lg:col-span-8 flex flex-col gap-4">
           <Skeleton className="h-12 w-64" />
           <CardSkeleton />
        </div>
        <div className="lg:col-span-4 space-y-8">
           <CardSkeleton />
           <CardSkeleton />
        </div>
      </div>
    </div>
  );
}
