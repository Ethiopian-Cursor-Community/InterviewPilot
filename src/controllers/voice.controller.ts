import type { Context } from "hono";
import type { AuthVariables } from "../middleware/auth.js";
import { speechToText, textToSpeech } from "../services/elevenlabs.service.js";
import { jsonError, jsonSuccess } from "../utils/response.js";

type AuthedContext = Context<{ Variables: AuthVariables }>;

export async function speak(c: AuthedContext) {
  const body = await c.req.json<{ text?: string; voiceId?: string }>().catch(() => null);
  const text = body?.text?.trim();

  if (!text) {
    return jsonError(c, "text is required");
  }

  try {
    const audio = await textToSpeech(text, body?.voiceId);
    return new Response(audio, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Text-to-speech failed";
    return jsonError(c, message, 502);
  }
}

export async function transcribe(c: AuthedContext) {
  const body = await c.req.parseBody();
  const file = body.file;

  if (!file || typeof file === "string") {
    return jsonError(c, "audio file is required (multipart field: file)");
  }

  const upload = file as File | Blob;
  const blob =
    upload instanceof Blob
      ? upload
      : new Blob([], { type: "audio/webm" });

  if (blob.size < 100) {
    return jsonError(c, "Recording is too short");
  }

  const filename =
    upload instanceof File && upload.name ? upload.name : "recording.webm";

  try {
    const result = await speechToText(blob, filename);
    return jsonSuccess(c, result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Speech-to-text failed";
    return jsonError(c, message, 502);
  }
}

export async function voiceHealth(c: Context) {
  return jsonSuccess(c, { provider: "elevenlabs", tts: true, stt: true });
}
