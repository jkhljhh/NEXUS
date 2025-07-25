// mic-input.tsx
"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { IconLoader2, IconMicrophone } from "@tabler/icons-react";
import { speechToTextAction } from "@/actions/speechToText";
import { cn } from "@/lib/utils";

type MicInputProps = {
  onResult: (text: string) => void;
  disabled?: boolean;
};

export function MicInput({ onResult, disabled }: MicInputProps) {
  const [recording, setRecording] = useState(false);
  const [isPending, startTransition] = useTransition();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert("Your browser does not support microphone access.");
      return;
    }
    setRecording(true);
    audioChunks.current = [];
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    const mediaRecorder = new window.MediaRecorder(stream, {
      mimeType: "audio/webm",
    });
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.current.push(event.data);
      }
    };
    mediaRecorder.onstop = async () => {
      setRecording(false);
      const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
      const formData = new FormData();
      formData.append("file", audioBlob, "audio.webm");
      startTransition(async () => {
        const { text } = await speechToTextAction(formData);
        onResult(text);
      });
    };
    mediaRecorder.start();
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const handleMicClick = () => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <Button
      size="icon"
      variant="ghost"
      className={cn(
        recording && "animate-pulse bg-black/5 hover:bg-black/5",
        "hover:cursor-pointer rounded-full ml-auto",
      )}
      onClick={handleMicClick}
      aria-label={recording ? "Stop recording" : "Start recording"}
      disabled={isPending || disabled}
      type="button"
    >
      {isPending ? (
        <IconLoader2 className="size-5 animate-spin" />
      ) : (
        <IconMicrophone className="size-5" />
      )}
    </Button>
  );
}
