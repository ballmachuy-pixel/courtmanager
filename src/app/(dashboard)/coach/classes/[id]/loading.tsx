import { Skeleton } from "@/components/ui/Skeleton";
import { ArrowLeft, Users } from 'lucide-react';

export default function ClassDetailLoading() {
  return (
    <div className="animate-in pb-24 mt-2">
      {/* Header Skeleton */}
      <div className="flex items-center gap-4 hide-on-search transition-all duration-300">
        <Skeleton className="w-10 h-10 rounded-xl bg-white/5" />
        <div className="flex-1">
          <Skeleton className="h-4 w-16 bg-white/5 mb-1.5" />
          <Skeleton className="h-6 w-32 bg-white/10" />
        </div>
      </div>

      <div className="mt-6 hide-on-search transition-all duration-300 space-y-4">
        {/* Date and Cancel Banner Skeleton */}
        <div className="flex justify-between items-center bg-slate-900/60 p-4 rounded-3xl border border-white/5">
          <Skeleton className="h-5 w-40 bg-white/5" />
          <Skeleton className="h-8 w-20 rounded-xl bg-white/5" />
        </div>
        
        {/* Class Info Card Skeleton */}
        <div className="bg-slate-900/40 p-5 rounded-[1.5rem] border border-white/5 flex gap-4">
          <Skeleton className="w-12 h-12 rounded-xl bg-white/5 shrink-0" />
          <div className="flex flex-col gap-2 w-full pt-1">
            <Skeleton className="h-5 w-3/4 bg-white/10" />
            <Skeleton className="h-4 w-1/2 bg-white/5" />
          </div>
        </div>
      </div>

      {/* Search Bar Skeleton */}
      <div className="mt-8 mb-4 sticky top-0 z-40 bg-slate-950 py-2 -mx-2 px-2 sm:mx-0 sm:px-0">
        <Skeleton className="h-12 w-full rounded-2xl bg-white/5" />
      </div>

      {/* Bulk Action Skeleton */}
      <div className="flex justify-between items-center mb-6 px-1">
        <div className="flex items-center gap-2">
          <Skeleton className="w-6 h-6 rounded-md bg-white/5" />
          <Skeleton className="h-4 w-24 bg-white/5" />
        </div>
        <Skeleton className="h-8 w-28 rounded-full bg-white/5" />
      </div>

      {/* Student List Skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-slate-900/30 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full bg-white/5" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-32 bg-white/10" />
                <Skeleton className="h-3 w-16 bg-white/5" />
              </div>
            </div>
            <Skeleton className="w-16 h-10 rounded-xl bg-white/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
