import { useState, useEffect } from "react";

// --- GLITCH TEXT ---
export const GlitchText = ({ text, intensity = 1 }: { text: string; intensity?: number }) => {
  const [glitched, setGlitched] = useState(false);
  useEffect(() => {
    if (intensity <= 0) return;
    const interval = setInterval(() => {
      if (Math.random() < 0.15 * intensity) {
        setGlitched(true);
        setTimeout(() => setGlitched(false), 80 + Math.random() * 150);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [intensity]);

  return (
    <span className={glitched ? "glitch-active" : ""} data-text={text}>
      {glitched ? text.replace(/[аеёиоуыьъАЕЁИОУЫЬЪA-Za-z]/g, (c) => Math.random() > 0.5 ? c : "█") : text}
    </span>
  );
};

// --- STATIC OVERLAY ---
export const StaticOverlay = ({ intensity }: { intensity: number }) => {
  if (intensity <= 0) return null;
  return (
    <div
      className="absolute inset-0 pointer-events-none z-10 mix-blend-overlay"
      style={{ opacity: intensity * 0.4 }}
    >
      <div className="static-noise w-full h-full" />
    </div>
  );
};
