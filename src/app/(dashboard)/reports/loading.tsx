import { Skeleton } from "@/components/ui/Skeleton";

export default function ReportsLoading() {
  return (
    <div className="animate-in flex flex-col gap-6 md:gap-8">
      <Skeleton className="h-32 w-full rounded-[2rem]" />
      <Skeleton className="h-48 max-w-2xl rounded-3xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-56 rounded-3xl" />
        <Skeleton className="h-56 rounded-3xl" />
      </div>
    </div>
  );
}
