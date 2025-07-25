import { ListChats } from "@/components/list-chats";

export default async function MyAnalysis() {
  return (
    <>
      <div className="mb-2">
        <h1 className="text-xl font-medium">Analysis Library</h1>
        <p className="text-muted-foreground">List of all past Analysis</p>
      </div>

      <ListChats />
    </>
  );
}
