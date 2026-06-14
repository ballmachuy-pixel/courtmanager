import { TableRowSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function ListLoading() {
  return (
    <div className="space-y-6 animate-in pt-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
         <div className="flex flex-col gap-2">
            <Skeleton className="h-10 w-48 bg-white/10" />
            <Skeleton className="h-4 w-64 bg-white/5" />
         </div>
         <Skeleton className="h-10 w-full md:w-32 rounded-xl bg-white/5" />
      </div>

      <div className="glass-card p-2 md:p-6 space-y-4 bg-slate-900/20 border-white/5 mt-4">
         <div className="hidden md:flex justify-between mb-6 pb-4 border-b border-white/5">
           <Skeleton className="h-6 w-32 bg-white/5" />
           <Skeleton className="h-6 w-16 bg-white/5" />
         </div>
         
         {[1, 2, 3, 4, 5].map((i) => (
           <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
             <Skeleton className="w-12 h-12 rounded-2xl bg-white/5 shrink-0" />
             <div className="flex flex-col gap-2 flex-1">
                <Skeleton className="h-5 w-48 bg-white/10" />
                <Skeleton className="h-3 w-32 bg-white/5" />
             </div>
             <Skeleton className="w-20 h-8 rounded-full bg-white/5 hidden md:block" />
             <Skeleton className="w-8 h-8 rounded-lg bg-white/5 md:hidden" />
           </div>
         ))}
      </div>
    </div>
  );
}
