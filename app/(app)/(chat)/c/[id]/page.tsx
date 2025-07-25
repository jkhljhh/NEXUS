import { Id } from "@/convex/_generated/dataModel";
import { ListMessages } from "@/components/list-messages";
import { CreateMessageForm } from "@/forms/create-message-form";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: Id<"chats"> }>;
}) {
  const { id } = await params;

  return (
    <>
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="w-full mx-auto max-w-4xl ">
          <ListMessages chatId={id} />
          <div className="shrink-0 min-w-[24px] min-h-[24px]" />
        </div>
      </div>
      <div className="px-4 pb-2">
        <div className="w-full mx-auto max-w-4xl ">
          <CreateMessageForm chatId={id} />
        </div>
      </div>
    </>
  );
}
