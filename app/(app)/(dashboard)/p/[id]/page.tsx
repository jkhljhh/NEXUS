import { Id } from "@/convex/_generated/dataModel";
import { ListChats } from "@/components/list-chats";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: Id<"projects"> }>;
}) {
  const { id } = await params;
  console.log(id);
  return (
    <>
      <div className="flex-1 w-full mx-auto max-w-4xl">
        <ListChats projectId={id} />
      </div>
    </>
  );
}
