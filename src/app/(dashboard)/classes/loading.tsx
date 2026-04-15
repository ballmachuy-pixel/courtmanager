import { TableRowSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function ListLoading() {
  return (
    <div className="space-y-6 animate-in">
      <div className="flex justify-between items-center">
         <Skeleton className="h-10 w-48" />
         <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
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
