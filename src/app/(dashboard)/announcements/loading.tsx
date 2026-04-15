import { Skeleton, TableRowSkeleton } from "@/components/ui/Skeleton";

export default function AnnouncementsLoading() {
  return (
    <div className="animate-in flex flex-col gap-6 md:gap-8">
      <Skeleton className="h-32 w-full rounded-[2rem]" />
      <div className="space-y-4">
        <Skeleton className="h-40 rounded-3xl" />
        <Skeleton className="h-40 rounded-3xl" />
        <Skeleton className="h-40 rounded-3xl" />
      </div>
    </div>
  );
}
