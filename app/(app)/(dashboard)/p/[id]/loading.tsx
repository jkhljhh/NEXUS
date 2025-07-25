import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-2">
      {["60%", "70%", "40%", "90%", "75%"].map((width, i) => (
        <Skeleton key={i} className="h-6" style={{ width }} />
      ))}
    </div>
  );
}
