import React, { useEffect, useRef, useState } from "react";
import { speechCodeFor, ttsSupported } from "../hooks/useVoice";

// Read-aloud with play / pause / resume / stop, robust across browsers:
// - chunks long text so it doesn't get cut off
// - keep-alive resume() loop works around Chrome pausing long speech
// - shows a clear message when the device has no voice for the language
export default function SpeakButton({ text, lang = "en", autoPlay = false }) {
  const [status, setStatus] = useState("idle"); // idle | playing | paused | novoice
  const synthRef = useRef(
    typeof window !== "undefined" ? window.speechSynthesis : null
  );
  const keepAlive = useRef(null);

  const clearKeepAlive = () => {
    if (keepAlive.current) {
      clearInterval(keepAlive.current);
      keepAlive.current = null;
    }
  };

  const play = () => {
    const synth = synthRef.current;
    if (!synth || !text) return;
    synth.cancel();
    clearKeepAlive();

    const code = speechCodeFor(lang);
    const base = code.split("-")[0].toLowerCase();

    const begin = () => {
      const voices = synth.getVoices();
      const voice =
        voices.find((v) => v.lang === code) ||
        voices.find((v) => v.lang && v.lang.toLowerCase().startsWith(base)) ||
        null;

      if (!voice) {
        setStatus("novoice");
        return;
      }

      const chunks =
        String(text)
          .replace(/\s+/g, " ")
          .match(/[^.!?।]+[.!?।]*/g) || [String(text)];
      let i = 0;
      const next = () => {
        if (i >= chunks.length) {
          clearKeepAlive();
          setStatus("idle");
          return;
        }
        const piece = chunks[i].trim();
        i += 1;
        if (!piece) return next();
        const u = new SpeechSynthesisUtterance(piece);
        u.lang = code;
        u.voice = voice;
        u.onend = next;
        u.onerror = () => {
          clearKeepAlive();
          setStatus("idle");
        };
        synth.speak(u);
      };

      setStatus("playing");
      // Chrome stops long speech after ~15s; nudging resume keeps it going.
      keepAlive.current = setInterval(() => {
        if (synth.speaking && !synth.paused) synth.resume();
      }, 9000);
      next();
    };

    if (synth.getVoices().length === 0) {
      let done = false;
      const go = () => {
        if (done) return;
        done = true;
        begin();
      };
      synth.onvoiceschanged = go;
      setTimeout(go, 400);
    } else {
      begin();
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
    clearKeepAlive();
    setStatus("idle");
  };

  useEffect(() => {
    const synth = synthRef.current;
    setStatus("idle");
    if (autoPlay && text) {
      const id = setTimeout(play, 150);
      return () => {
        clearTimeout(id);
        clearKeepAlive();
        synth?.cancel();
      };
    }
    return () => {
      clearKeepAlive();
      synth?.cancel();
    };
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
      {(status === "playing" || status === "paused") && (
        <button
          type="button"
          className="listen-btn listen-stop"
          onClick={stop}
          title="Stop"
        >
          ✕
        </button>
      )}
      {status === "novoice" && (
        <span className="listen-novoice">
          🔇 No read-aloud voice for this language on this device.
        </span>
      )}
    </span>
  );
}
