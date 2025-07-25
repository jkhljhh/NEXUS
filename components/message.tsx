import { cn } from "@/lib/utils";

function UserMessage({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="user-message" className={cn("px-4", className)}>
      <div
        className="ml-auto max-w-lg w-fit px-4 py-2 bg-secondary rounded-2xl"
        {...props}
      />
    </div>
  );
}

function AssistantMessage({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="assistant-message"
      className={cn("px-4", className)}
      {...props}
    />
  );
}

export { UserMessage, AssistantMessage };
