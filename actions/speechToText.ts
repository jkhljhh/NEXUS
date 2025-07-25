"use server";

import { SpeechClient } from "@google-cloud/speech";
import path from "path";

const keyFilename = path.resolve(process.cwd(), "google-service-account.json");

export async function speechToTextAction(formData: FormData) {
  "use server";
  const file = formData.get("file") as File;
  if (!file) return { text: "", error: "No file uploaded" };
  const arrayBuffer = await file.arrayBuffer();
  const audioBytes = Buffer.from(arrayBuffer).toString("base64");

  const client = new SpeechClient({ keyFilename });

  const [response] = await client.recognize({
    audio: { content: audioBytes },
    config: {
      encoding: "WEBM_OPUS",
      languageCode: "en-US",
      enableAutomaticPunctuation: true,
      model: "default",
    },
  });

  const transcript =
    response.results?.map((r) => r.alternatives?.[0]?.transcript).join(" ") ||
    "";

  return { text: transcript };
}
