// Filename: page.tsx
// Path: @/app/(dashboard)/(home)
import { CreateChatForm } from "@/forms/create-chat-form";
 
const sentences = [
  "What can I help with?",
  "Ready to analyze?",
  "Let’s dive into your document",
];
 
export default function Page() {
  const randomSentence =
    sentences[Math.floor(Math.random() * sentences.length)];
 
  return (
    <div className="flex flex-col h-full justify-center items-center gap-4">
      <div className="w-full flex-1 flex items-end justify-center">
        <div className="w-full max-w-2xl mx-auto">
          <h1 className="text-3xl">{randomSentence}</h1>
        </div>
      </div>
 
      <div className="w-full max-w-2xl flex-1 flex items-start justify-center mb-32">
        <CreateChatForm />
      </div>
    </div>
  );
}
 
 