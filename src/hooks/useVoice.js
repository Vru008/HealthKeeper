import { useRef, useState, useCallback } from "react";

// Three primary languages. `code` is sent to the AI; `speech` is the BCP-47 tag
// used by the browser Speech APIs.
export const LANGUAGES = [
  { code: "en", label: "English", speech: "en-IN" },
  { code: "hi", label: "हिन्दी", speech: "hi-IN" },
  { code: "gu", label: "ગુજરાતી", speech: "gu-IN" },
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

const pickVoice = (speechCode) => {
  const voices = window.speechSynthesis.getVoices();
  const base = speechCode.split("-")[0].toLowerCase();
  return (
    voices.find((v) => v.lang === speechCode) ||
    voices.find((v) => v.lang && v.lang.toLowerCase().startsWith(base)) ||
    null
  );
};

// Read text aloud — chunked by sentence and queued, which avoids Chrome's
// "stops after a few seconds / ignores speak right after cancel" quirks.
export function speak(text, speechCode = "en-IN") {
  if (!ttsSupported || !text) return;
  const synth = window.speechSynthesis;
  synth.cancel();

  const chunks =
    String(text)
      .replace(/\s+/g, " ")
      .match(/[^.!?।]+[.!?।]*/g) || [String(text)];

  const run = () => {
    const voice = pickVoice(speechCode);
    let i = 0;
    const next = () => {
      if (i >= chunks.length) return;
      const piece = chunks[i].trim();
      i += 1;
      if (!piece) return next();
      const u = new SpeechSynthesisUtterance(piece);
      u.lang = speechCode;
      if (voice) u.voice = voice;
      u.onend = next;
      u.onerror = next;
      synth.speak(u);
    };
    next();
  };

  // Voices can load asynchronously the first time.
  if (synth.getVoices().length === 0) {
    let started = false;
    const go = () => {
      if (started) return;
      started = true;
      run();
    };
    synth.onvoiceschanged = go;
    setTimeout(go, 250);
  } else {
    setTimeout(run, 60);
  }
}

export function stopSpeaking() {
  if (ttsSupported) window.speechSynthesis.cancel();
}

// Hook for one-shot speech-to-text ("recording").
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
