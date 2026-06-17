import React, { useEffect, useRef, useState } from "react";
import { speechCodeFor, ttsSupported } from "../hooks/useVoice";

// Read-aloud with play / pause / resume / stop controls.
// Pass autoPlay to start speaking as soon as the text appears.
export default function SpeakButton({ text, lang = "en", autoPlay = false }) {
  const [status, setStatus] = useState("idle"); // idle | playing | paused
  const synthRef = useRef(
    typeof window !== "undefined" ? window.speechSynthesis : null
  );

  const play = () => {
    const synth = synthRef.current;
    if (!synth || !text) return;
    synth.cancel();
    const code = speechCodeFor(lang);
    const chunks =
      String(text)
        .replace(/\s+/g, " ")
        .match(/[^.!?।]+[.!?।]*/g) || [String(text)];

    const startSpeaking = () => {
      const voices = synth.getVoices();
      const base = code.split("-")[0].toLowerCase();
      const voice =
        voices.find((v) => v.lang === code) ||
        voices.find((v) => v.lang && v.lang.toLowerCase().startsWith(base)) ||
        null;
      let i = 0;
      const next = () => {
        if (i >= chunks.length) {
          setStatus("idle");
          return;
        }
        const piece = chunks[i].trim();
        i += 1;
        if (!piece) return next();
        const u = new SpeechSynthesisUtterance(piece);
        u.lang = code;
        if (voice) u.voice = voice;
        u.onend = next;
        u.onerror = () => setStatus("idle");
        synth.speak(u);
      };
      next();
    };

    setStatus("playing");
    // Speak immediately if voices are ready; otherwise wait briefly for them.
    if (synth.getVoices().length === 0) {
      let done = false;
      const go = () => {
        if (done) return;
        done = true;
        startSpeaking();
      };
      synth.onvoiceschanged = go;
      setTimeout(go, 300);
    } else {
      setTimeout(startSpeaking, 40);
    }
  };

  const pause = () => {
    synthRef.current?.pause();
    setStatus("paused");
  };
  const resume = () => {
    synthRef.current?.resume();
    setStatus("playing");
  };
  const stop = () => {
    synthRef.current?.cancel();
    setStatus("idle");
  };

  // Auto-play when the text changes (e.g. a fresh voice result), and clean up.
  useEffect(() => {
    const synth = synthRef.current;
    setStatus("idle");
    if (autoPlay && text) {
      const id = setTimeout(play, 150);
      return () => {
        clearTimeout(id);
        synth?.cancel();
      };
    }
    return () => synth?.cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  if (!ttsSupported || !text) return null;

  return (
    <span className="speak-ctrl">
      {status === "idle" && (
        <button type="button" className="listen-btn" onClick={play}>
          🔊 Listen
        </button>
      )}
      {status === "playing" && (
        <button type="button" className="listen-btn" onClick={pause}>
          ⏸ Pause
        </button>
      )}
      {status === "paused" && (
        <button type="button" className="listen-btn" onClick={resume}>
          ▶ Resume
        </button>
      )}
      {status !== "idle" && (
        <button
          type="button"
          className="listen-btn listen-stop"
          onClick={stop}
          title="Stop"
        >
          ✕
        </button>
      )}
    </span>
  );
}
