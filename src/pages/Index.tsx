import { useState, useEffect, useRef, useCallback } from "react";
import { GamePhase, PanelTab, Enemy, Camera, LogEntry, INITIAL_ENEMIES, CAMERAS, LOGS } from "@/components/gameTypes";
import { GlitchText } from "@/components/GameEffects";
import { IntroScreen, GameOverScreen, WinScreen } from "@/components/GameScreens";
import { ControlPanel } from "@/components/ControlPanel";

const Index = () => {
  const [phase, setPhase] = useState<GamePhase>("intro");
  const [tab, setTab] = useState<PanelTab>("cameras");
  const [selectedCam, setSelectedCam] = useState("CAM-1");
  const [enemies, setEnemies] = useState<Enemy[]>(INITIAL_ENEMIES);
  const [cameras, setCameras] = useState<Camera[]>(CAMERAS);
  const [logs, setLogs] = useState<LogEntry[]>(LOGS);
  const [power, setPower] = useState(100);
  const [time, setTime] = useState(0);
  const [hour, setHour] = useState(0);
  const [doorLeft, setDoorLeft] = useState(false);
  const [doorRight, setDoorRight] = useState(false);
  const [globalGlitch, setGlobalGlitch] = useState(0);
  const [showCamPanel, setShowCamPanel] = useState(false);
  const [warningText, setWarningText] = useState("");
  const [nightText, setNightText] = useState("НОЧЬ 1");

  const audioCtx = useRef<AudioContext | null>(null);
  const gameInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const getAudioCtx = () => {
    if (!audioCtx.current) {
      audioCtx.current = new AudioContext();
    }
    return audioCtx.current;
  };

  const playBeep = useCallback((freq: number, dur: number, type: OscillatorType = "sine", vol = 0.1) => {
    try {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      osc.start();
      osc.stop(ctx.currentTime + dur);
    } catch (_e) { void _e; }
  }, []);

  const playAmbient = useCallback(() => {
    try {
      const ctx = getAudioCtx();
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.015;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 400;
      source.connect(filter);
      filter.connect(ctx.destination);
      source.start();
    } catch (_e) { void _e; }
  }, []);

  const playDoor = useCallback((open: boolean) => {
    playBeep(open ? 120 : 80, 0.3, "sawtooth", 0.15);
  }, [playBeep]);

  const playScream = useCallback(() => {
    try {
      const ctx = getAudioCtx();
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(100 + Math.random() * 800, ctx.currentTime);
          osc.frequency.linearRampToValueAtTime(50, ctx.currentTime + 0.5);
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
          osc.start();
          osc.stop(ctx.currentTime + 0.6);
        }, i * 100);
      }
    } catch (_e) { void _e; }
  }, []);

  const triggerGlitch = useCallback((intensity: number, duration: number) => {
    setGlobalGlitch(intensity);
    setTimeout(() => setGlobalGlitch(0), duration);
  }, []);

  const resetGame = () => {
    setPhase("intro");
    setEnemies(INITIAL_ENEMIES);
    setCameras(CAMERAS);
    setPower(100);
    setTime(0);
    setHour(0);
    setDoorLeft(false);
    setDoorRight(false);
    setLogs(LOGS);
  };

  const startGame = () => {
    playAmbient();
    playBeep(440, 0.5, "sine", 0.05);
    setPhase("game");
    setShowCamPanel(true);
  };

  // Game loop
  useEffect(() => {
    if (phase !== "game") return;

    gameInterval.current = setInterval(() => {
      setTime((t) => {
        const newTime = t + 1;
        const newHour = Math.floor(newTime / 30);
        setHour(newHour);

        if (newHour >= 6) {
          setPhase("win");
          setLogs((prev) => prev.map((l) => ({ ...l, unlocked: true })));
          return newTime;
        }

        setNightText(`${newHour + 12}:00`);

        // Power drain
        setPower((p) => {
          const drain = 0.3 + (doorLeft ? 0.5 : 0) + (doorRight ? 0.5 : 0);
          const newPower = Math.max(0, p - drain);
          if (newPower <= 0) {
            triggerGlitch(3, 500);
            setWarningText("ПИТАНИЕ ОТКЛЮЧЕНО");
          }
          return newPower;
        });

        // Random glitch
        if (Math.random() < 0.05) {
          triggerGlitch(2, 300);
          playBeep(80, 0.1, "sawtooth", 0.05);
        }

        // Enemy movement
        setEnemies((prev) =>
          prev.map((e) => {
            if (!e.active) return e;
            const camList = ["CAM-1", "CAM-2", "CAM-3", "CAM-4", "CAM-5", "CAM-6", "OFFICE"];
            if (newTime % e.moveTimer === 0 && Math.random() < 0.4) {
              const idx = camList.indexOf(e.location);
              const nextIdx = Math.min(idx + 1, camList.length - 1);
              const newLoc = camList[nextIdx];
              if (newLoc === "OFFICE" && !doorLeft && !doorRight) {
                triggerGlitch(5, 1000);
                playScream();
                setTimeout(() => setPhase("gameover"), 800);
              }
              if (newLoc === "OFFICE") {
                setWarningText("⚠ ОН ЗДЕСЬ ⚠");
              }
              triggerGlitch(1, 200);
              playBeep(150, 0.1, "square", 0.08);
              return { ...e, location: newLoc, moved: true };
            }
            return { ...e, moved: false };
          })
        );

        // Unlock logs
        if (newHour >= 2) setLogs((prev) => prev.map((l, i) => i === 1 ? { ...l, unlocked: true } : l));
        if (newHour >= 4) setLogs((prev) => prev.map((l, i) => i === 2 ? { ...l, unlocked: true } : l));

        // Random warnings
        const warnings = ["ДВИЖЕНИЕ ОБНАРУЖЕНО", "ПРОВЕРЬ ДВЕРИ", "ОН СМОТРИТ НА ТЕБЯ", ""];
        if (Math.random() < 0.03) setWarningText(warnings[Math.floor(Math.random() * warnings.length)]);

        return newTime;
      });
    }, 1000);

    return () => { if (gameInterval.current) clearInterval(gameInterval.current); };
  }, [phase, doorLeft, doorRight, triggerGlitch, playScream, playBeep]);

  // Update camera enemies
  useEffect(() => {
    setCameras((prev) =>
      prev.map((cam) => ({
        ...cam,
        hasEnemy: enemies.some((e) => e.location === cam.id && e.active),
        static: Math.random() < 0.1 ? Math.random() : cam.static * 0.8,
      }))
    );
  }, [enemies]);

  // --- SCREENS ---
  if (phase === "intro") return <IntroScreen onStart={startGame} />;
  if (phase === "gameover") return <GameOverScreen hour={hour} onReset={resetGame} />;
  if (phase === "win") return <WinScreen onReset={resetGame} />;

  // --- GAME ---
  return (
    <div className={`game-root ${globalGlitch > 0 ? "glitch-screen" : ""}`}>
      <div className="scanlines" />
      {globalGlitch > 2 && <div className="jumpscare-flash" />}

      {/* TOP BAR */}
      <div className="top-bar">
        <div className="top-title">
          <GlitchText text="СИСТЕМА НАБЛЮДЕНИЯ" intensity={globalGlitch} />
        </div>
        <div className="top-time">{nightText}</div>
        <div className="top-power">
          <span style={{ color: power < 20 ? "#ff0033" : "#00ff88" }}>
            ⚡ {Math.floor(power)}%
          </span>
          <div className="power-bar">
            <div
              className="power-fill"
              style={{
                width: `${power}%`,
                background: power < 20 ? "#ff0033" : power < 50 ? "#ffcc00" : "#00ff88",
              }}
            />
          </div>
        </div>
        {warningText && (
          <div className="warning-badge">
            <GlitchText text={warningText} intensity={2} />
          </div>
        )}
      </div>

      {/* MAIN CONTENT */}
      <div className="main-grid">
        {/* LEFT: OFFICE VIEW */}
        <div className="office-panel">
          <div className="office-view">
            <div className="office-bg">
              <div className="office-label">ОФИС — ВЫ ЗДЕСЬ</div>
              <div className="doors-row">
                <div className="door-section">
                  <div className={`door-visual ${doorLeft ? "door-closed" : "door-open"}`}>
                    <div className="door-inner">{doorLeft ? "█████" : "     "}</div>
                  </div>
                  <button
                    className={`door-btn ${doorLeft ? "door-active" : ""}`}
                    onClick={() => { setDoorLeft((d) => !d); playDoor(!doorLeft); }}
                  >
                    {doorLeft ? "🔒 ЛЕВО" : "🚪 ЛЕВО"}
                  </button>
                </div>
                <div className="office-center-view">
                  <div className="vent-icon">⚠</div>
                  <div className="desk-text">[ СТОЛ ОХРАНЫ ]</div>
                  <div className="cam-toggle" onClick={() => setShowCamPanel((v) => !v)}>
                    📷 {showCamPanel ? "СКРЫТЬ" : "КАМЕРЫ"}
                  </div>
                </div>
                <div className="door-section">
                  <div className={`door-visual ${doorRight ? "door-closed" : "door-open"}`}>
                    <div className="door-inner">{doorRight ? "█████" : "     "}</div>
                  </div>
                  <button
                    className={`door-btn ${doorRight ? "door-active" : ""}`}
                    onClick={() => { setDoorRight((d) => !d); playDoor(!doorRight); }}
                  >
                    {doorRight ? "🔒 ПРАВО" : "🚪 ПРАВО"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: CONTROL PANEL */}
        <ControlPanel
          tab={tab}
          onTabChange={setTab}
          cameras={cameras}
          enemies={enemies}
          logs={logs}
          selectedCam={selectedCam}
          onSelectCam={setSelectedCam}
          onCamClick={(id) => { setSelectedCam(id); playBeep(800, 0.05, "sine", 0.03); }}
        />
      </div>
    </div>
  );
};

export default Index;
