import { Skeleton } from "@/components/ui/Skeleton";
import { Calendar, User, Sparkles } from 'lucide-react';

export default function CoachLoading() {
  return (
    <div className="animate-in flex flex-col gap-6 md:gap-8 pb-20 max-w-2xl mx-auto px-4 mt-4">
      {/* Welcome Banner Skeleton */}
      <div className="bg-slate-900/40 rounded-[2rem] p-6 md:p-8 relative overflow-hidden border border-white/5">
        <div className="relative z-10 flex flex-col gap-3">
          <Skeleton className="h-6 w-32 rounded-full bg-white/10" />
          <Skeleton className="h-8 w-48 bg-white/10 mt-1" />
          <Skeleton className="h-4 w-40 bg-white/5 mt-1" />
        </div>
      </div>

      {/* Today Schedule Header Skeleton */}
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl bg-white/5" />
        <Skeleton className="h-6 w-40 bg-white/5" />
      </div>

      {/* Cards Skeleton */}
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-1">
            <div className="bg-slate-950/50 rounded-[1.35rem] p-6 flex flex-col gap-4">
              <div className="flex items-start gap-4">
                <Skeleton className="w-16 h-16 rounded-2xl bg-white/5 shrink-0" />
                <div className="flex-1 flex flex-col gap-2 pt-1">
                  <Skeleton className="h-6 w-3/4 bg-white/5" />
                  <Skeleton className="h-4 w-1/2 bg-white/5" />
                </div>
              </div>
              <Skeleton className="h-12 w-full rounded-2xl bg-white/5 mt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
