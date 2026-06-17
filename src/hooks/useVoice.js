import { useRef, useState, useCallback } from "react";

// Languages supported by the navigator. `code` is sent to the AI; `speech` is
// the BCP-47 tag used by the browser Speech APIs.
export const LANGUAGES = [
  { code: "en", label: "English", speech: "en-IN" },
  { code: "hi", label: "हिन्दी", speech: "hi-IN" },
  { code: "gu", label: "ગુજરાતી", speech: "gu-IN" },
  { code: "mr", label: "मराठी", speech: "mr-IN" },
  { code: "bn", label: "বাংলা", speech: "bn-IN" },
  { code: "ta", label: "தமிழ்", speech: "ta-IN" },
  { code: "te", label: "తెలుగు", speech: "te-IN" },
  { code: "kn", label: "ಕನ್ನಡ", speech: "kn-IN" },
  { code: "ml", label: "മലയാളം", speech: "ml-IN" },
  { code: "pa", label: "ਪੰਜਾਬੀ", speech: "pa-IN" },
  { code: "ur", label: "اردو", speech: "ur-IN" },
];

export const speechCodeFor = (code) =>
  LANGUAGES.find((l) => l.code === code)?.speech || "en-IN";

const SR =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

export const sttSupported = !!SR;
export const ttsSupported =
  typeof window !== "undefined" && "speechSynthesis" in window;

// Read text aloud in the given language.
export function speak(text, speechCode = "en-IN") {
  if (!ttsSupported || !text) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = speechCode;
  const voices = window.speechSynthesis.getVoices();
  const base = speechCode.split("-")[0];
  u.voice =
    voices.find((v) => v.lang === speechCode) ||
    voices.find((v) => v.lang && v.lang.startsWith(base)) ||
    null;
  window.speechSynthesis.speak(u);
}

export function stopSpeaking() {
  if (ttsSupported) window.speechSynthesis.cancel();
}

// Hook for one-shot speech-to-text input.
export function useSpeechInput() {
  const [listening, setListening] = useState(false);
  const recRef = useRef(null);

  const start = useCallback((speechCode, onText) => {
    if (!SR) return;
    try {
      const rec = new SR();
      rec.lang = speechCode || "en-IN";
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onresult = (e) => {
        const t = e.results?.[0]?.[0]?.transcript || "";
        if (t) onText(t);
      };
      rec.onend = () => setListening(false);
      rec.onerror = () => setListening(false);
      recRef.current = rec;
      setListening(true);
      rec.start();
    } catch {
      setListening(false);
    }
  }, []);

  const stop = useCallback(() => {
    try {
      recRef.current?.stop();
    } catch {
      /* ignore */
    }
    setListening(false);
  }, []);

  return { supported: sttSupported, listening, start, stop };
}
