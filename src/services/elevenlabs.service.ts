import { env } from "../config/env.js";

const ELEVENLABS_BASE = "https://api.elevenlabs.io/v1";

function apiHeaders(contentType?: string): Record<string, string> {
  const headers: Record<string, string> = {
    "xi-api-key": env.ELEVENLABS_API_KEY,
  };
  if (contentType) headers["Content-Type"] = contentType;
  return headers;
}

export async function textToSpeech(text: string, voiceId?: string): Promise<ArrayBuffer> {
  const id = voiceId ?? env.ELEVENLABS_VOICE_ID;
  const res = await fetch(`${ELEVENLABS_BASE}/text-to-speech/${id}`, {
    method: "POST",
    headers: apiHeaders("application/json"),
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`ElevenLabs TTS failed (${res.status}): ${detail || res.statusText}`);
  }

  return res.arrayBuffer();
}

export interface TranscriptionResult {
  text: string;
  languageCode?: string;
}

export async function speechToText(
  audio: Blob,
  filename = "recording.webm"
): Promise<TranscriptionResult> {
  const form = new FormData();
  form.append("model_id", "scribe_v2");
  form.append("file", audio, filename);

  const res = await fetch(`${ELEVENLABS_BASE}/speech-to-text`, {
    method: "POST",
    headers: { "xi-api-key": env.ELEVENLABS_API_KEY },
    body: form,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`ElevenLabs STT failed (${res.status}): ${detail || res.statusText}`);
  }

  const data = (await res.json()) as {
    text?: string;
    language_code?: string;
    transcripts?: Array<{ text?: string; language_code?: string }>;
  };

  const text =
    data.text?.trim() ||
    data.transcripts?.[0]?.text?.trim() ||
    "";

  if (!text) {
    throw new Error("No speech detected in the recording");
  }

  return {
    text,
    languageCode: data.language_code ?? data.transcripts?.[0]?.language_code,
  };
}
