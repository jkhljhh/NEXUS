import { cn } from "@/lib/utils";

export function PageHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex justify-between items-center", className)}
      {...props}
    />
  );
}

export function PageHeaderTitle({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("leading-none font-semibold", className)} {...props} />
  );
}

export function PageHeaderDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}
