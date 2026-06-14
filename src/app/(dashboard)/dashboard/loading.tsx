import { Skeleton } from "@/components/ui/Skeleton";

// Custom Card Skeleton that matches HubAction tiles
function HubActionSkeleton() {
  return (
    <div className="glass-card flex flex-col items-center justify-center p-4 sm:p-6 text-center aspect-square sm:rounded-3xl border border-white/5 bg-slate-900/20">
       <Skeleton className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl mb-2 sm:mb-4 bg-white/5" />
       <Skeleton className="h-3 sm:h-4 w-20 sm:w-24 bg-white/10" />
    </div>
  );
}

export default function DashboardLoading() {
  return (
    <div className="space-y-10 animate-in pt-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
        <div className="flex flex-col gap-3">
           <Skeleton className="h-5 w-40 bg-white/10 rounded-full" />
           <Skeleton className="h-10 w-72 bg-white/10" />
           <Skeleton className="h-4 w-64 bg-white/5" />
        </div>
        <div className="flex items-center gap-3">
           <Skeleton className="h-10 w-40 rounded-xl bg-white/5" />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <HubActionSkeleton />
        <HubActionSkeleton />
        <HubActionSkeleton />
        <HubActionSkeleton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
        {/* Left: Operations */}
        <div className="lg:col-span-8 flex flex-col gap-8">
           <Skeleton className="h-[300px] rounded-[2rem] bg-slate-900/40 border border-white/5" />
           <Skeleton className="h-[400px] rounded-[2rem] bg-slate-900/40 border border-white/5" />
        </div>
        {/* Right: Staff & VIP */}
        <div className="lg:col-span-4 flex flex-col gap-6">
           <Skeleton className="h-40 rounded-[2rem] bg-indigo-500/10 border border-indigo-500/20" />
           <Skeleton className="h-[300px] rounded-[2rem] bg-slate-900/40 border border-white/5" />
           <Skeleton className="h-[250px] rounded-[2rem] bg-slate-900/40 border border-white/5" />
        </div>
      </div>
    </div>
  );
}
