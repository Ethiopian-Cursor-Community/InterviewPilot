export type BrowserTtsOptions = {
  voiceGender?: "male" | "female";
  persona?: string;
  lang?: string;
};

const PERSONA_TONE: Record<string, { rate: number; pitch: number }> = {
  friendly: { rate: 1, pitch: 1 },
  strict: { rate: 0.9, pitch: 0.82 },
  faang: { rate: 1.05, pitch: 1.02 },
  founder: { rate: 0.95, pitch: 0.92 },
};

const FEMALE_HINTS = [
  "female",
  "samantha",
  "victoria",
  "karen",
  "moira",
  "tessa",
  "fiona",
  "zira",
  "susan",
  "aria",
  "jenny",
  "natasha",
];
const MALE_HINTS = [
  "male",
  "daniel",
  "david",
  "mark",
  "guy",
  "james",
  "tom",
  "fred",
  "alex",
  "ryan",
  "george",
  "brian",
];

function pickVoice(
  voices: SpeechSynthesisVoice[],
  gender: "male" | "female",
  lang: string,
): SpeechSynthesisVoice | undefined {
  const langPrefix = lang.split("-")[0].toLowerCase();
  const pool = voices.filter((v) => v.lang.toLowerCase().startsWith(langPrefix));
  const hints = gender === "female" ? FEMALE_HINTS : MALE_HINTS;
  const hinted = pool.find((v) => {
    const n = v.name.toLowerCase();
    return hints.some((h) => n.includes(h));
  });
  return hinted ?? pool[0] ?? voices[0];
}

function waitForVoices(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    return Promise.resolve([]);
  }
  const existing = window.speechSynthesis.getVoices();
  if (existing.length > 0) return Promise.resolve(existing);

  return new Promise((resolve) => {
    const finish = () => resolve(window.speechSynthesis.getVoices());
    const onChange = () => {
      window.speechSynthesis.removeEventListener("voiceschanged", onChange);
      finish();
    };
    window.speechSynthesis.addEventListener("voiceschanged", onChange);
    window.setTimeout(() => {
      window.speechSynthesis.removeEventListener("voiceschanged", onChange);
      finish();
    }, 800);
  });
}

export function cancelBrowserSpeech(): void {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export function isBrowserTtsSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export async function speakInBrowser(
  text: string,
  opts: BrowserTtsOptions = {},
): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) return;

  if (!isBrowserTtsSupported()) {
    throw new Error("Speech synthesis is not supported in this browser. Try Chrome or Edge.");
  }

  const lang = opts.lang ?? "en-US";
  const gender = opts.voiceGender ?? "female";
  const persona = opts.persona && PERSONA_TONE[opts.persona] ? opts.persona : "friendly";
  const tone = PERSONA_TONE[persona];

  cancelBrowserSpeech();

  const voices = await waitForVoices();
  const voice = pickVoice(voices, gender, lang);

  return new Promise((resolve, reject) => {
    const utter = new SpeechSynthesisUtterance(trimmed);
    utter.lang = lang;
    utter.rate = tone.rate;
    utter.pitch = tone.pitch;
    if (voice) utter.voice = voice;

    utter.onend = () => resolve();
    utter.onerror = (ev) => {
      const err = (ev as SpeechSynthesisErrorEvent).error;
      if (err === "interrupted" || err === "canceled") {
        resolve();
        return;
      }
      reject(new Error(err || "Speech synthesis failed"));
    };

    window.speechSynthesis.speak(utter);
  });
}
