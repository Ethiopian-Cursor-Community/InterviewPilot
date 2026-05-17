"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";

interface VoiceControlsProps {
  token: string;
  questionText?: string;
  answer: string;
  onAnswerChange: (value: string) => void;
  disabled?: boolean;
}

export function VoiceControls({
  token,
  questionText,
  answer,
  onAnswerChange,
  disabled,
}: VoiceControlsProps) {
  const [speaking, setSpeaking] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const revokeAudioUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      revokeAudioUrl();
      audioRef.current?.pause();
    };
  }, [revokeAudioUrl]);

  async function handleListen() {
    if (!questionText?.trim() || speaking) return;

    setVoiceError(null);
    setSpeaking(true);

    try {
      const blob = await api.speak(token, questionText);
      revokeAudioUrl();
      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;

      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => setSpeaking(false);
      audio.onerror = () => {
        setSpeaking(false);
        setVoiceError("Could not play question audio");
      };
      await audio.play();
    } catch (err) {
      setSpeaking(false);
      setVoiceError(err instanceof Error ? err.message : "Text-to-speech failed");
    }
  }

  async function startRecording() {
    if (recording || disabled) return;

    setVoiceError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mimeType });
        if (blob.size < 100) {
          setVoiceError("Recording too short — try again");
          return;
        }

        setTranscribing(true);
        const res = await api.transcribe(token, blob);
        setTranscribing(false);

        if (!res.success) {
          setVoiceError(res.error);
          return;
        }

        const next = answer.trim()
          ? `${answer.trim()} ${res.data.text}`
          : res.data.text;
        onAnswerChange(next);
      };

      recorder.start();
      setRecording(true);
    } catch {
      setVoiceError("Microphone access denied or unavailable");
    }
  }

  function stopRecording() {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") return;
    recorder.stop();
    setRecording(false);
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={handleListen}
          disabled={disabled || !questionText || speaking}
          loading={speaking}
        >
          {speaking ? "Playing…" : "Listen to question"}
        </Button>

        {!recording ? (
          <Button
            type="button"
            variant="secondary"
            onClick={startRecording}
            disabled={disabled || transcribing}
            loading={transcribing}
          >
            {transcribing ? "Transcribing…" : "Record answer"}
          </Button>
        ) : (
          <Button type="button" onClick={stopRecording}>
            Stop recording
          </Button>
        )}
      </div>

      {recording && (
        <p className="text-xs text-red-400 animate-pulse">
          Recording — speak your answer, then stop
        </p>
      )}

      {voiceError && <p className="text-xs text-red-400">{voiceError}</p>}
    </div>
  );
}
