import { TableRowSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function ListLoading() {
  return (
    <div className="space-y-6 animate-in">
      <Skeleton className="h-[140px] md:h-[136px] w-full rounded-[2rem]" />
      <div className="glass-card p-6 space-y-4">
         <div className="flex justify-between mb-4">
           <Skeleton className="h-10 w-64 rounded-xl" />
           <Skeleton className="h-10 w-24 rounded-xl" />
         </div>
         <TableRowSkeleton />
         <TableRowSkeleton />
         <TableRowSkeleton />
         <TableRowSkeleton />
         <TableRowSkeleton />
      </div>
    </div>
  );
}
