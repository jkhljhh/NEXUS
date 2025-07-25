// Filename: spinner.tsx
// Path: @/components/ui/
import { cn } from "@/lib/utils";
import { IconLoader2 } from "@tabler/icons-react";

export function Spinner({
  size = 24,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <IconLoader2
      className={cn(className, "animate-spin text-muted-foreground")}
      size={size}
      strokeWidth={2.5}
    />
  );
}
