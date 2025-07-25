// Filename: loading.tsx
// Path: @/app/(dashboard)/
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col space-y-2">
      <Skeleton className="h-[20px] w-2/3" />
      <Skeleton className="h-[20px] w-1/3" />
      <Skeleton className="h-[20px] w-4/5" />
    </div>
  );
}
