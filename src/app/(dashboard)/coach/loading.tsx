import { Skeleton } from "@/components/ui/Skeleton";

export default function CoachLoading() {
  return (
    <div className="animate-in flex flex-col gap-6 md:gap-8 max-w-2xl mx-auto">
      <Skeleton className="h-36 w-full rounded-[2rem]" />
      <Skeleton className="h-8 w-48" />
      <div className="space-y-4">
        <Skeleton className="h-32 rounded-3xl" />
        <Skeleton className="h-32 rounded-3xl" />
      </div>
    </div>
  );
}
