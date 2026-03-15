import { useState, useEffect, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";

// --- TYPES ---
type GamePhase = "intro" | "game" | "gameover" | "win";
type PanelTab = "cameras" | "enemies" | "logs";

interface Enemy {
  id: string;
  name: string;
  location: string;
  threat: number;
  active: boolean;
  glitchText: string;
  description: string;
  moveTimer: number;
  moved: boolean;
}

interface Camera {
  id: string;
  name: string;
  location: string;
  hasEnemy: boolean;
  static: number;
}

interface LogEntry {
  id: string;
  author: string;
  night: string;
  text: string;
  unlocked: boolean;
}

// --- CONSTANTS ---
const INITIAL_ENEMIES: Enemy[] = [
  {
    id: "bonnie",
    name: "ПРИВЕТ_42",
    location: "CAM-1",
    threat: 2,
    active: true,
    glitchText: "ОН_ВИДИТ_ТЕБЯ",
    description: "Первым покидает сцену. Движется с левой стороны. Не смотри долго.",
    moveTimer: 15,
    moved: false,
  },
  {
    id: "chica",
    name: "ОШИБКА_7",
    location: "CAM-4",
    threat: 1,
    active: true,
    glitchText: "ТЫ_НЕ_ОДИН",
    description: "Медленная, но непредсказуемая. Любит кухню. Издаёт звуки.",
    moveTimer: 25,
    moved: false,
  },
  {
    id: "foxy",
    name: "ПИРАТСКАЯ_БУХТА",
    location: "CAM-2",
    threat: 3,
    active: false,
    glitchText: "БЕГИ",
    description: "Стоит за занавеской. Если не смотришь — бежит. Очень быстро.",
    moveTimer: 20,
    moved: false,
  },
  {
    id: "freddy",
    name: "МАЭСТРО_0",
    location: "CAM-6",
    threat: 4,
    active: true,
    glitchText: "Д_О_Б_Р_О_П_О_Ж_А_Л_О_В_А_Т_Ь",
    description: "Самый опасный. Двигается в темноте. Следит за тобой по камерам.",
    moveTimer: 40,
    moved: false,
  },
];

const CAMERAS: Camera[] = [
  { id: "CAM-1", name: "Главная сцена", location: "СЦЕНА", hasEnemy: true, static: 0 },
  { id: "CAM-2", name: "Пиратская бухта", location: "ПРАВЫЙ КОРИДОР", hasEnemy: false, static: 0 },
  { id: "CAM-3", name: "Западный коридор", location: "ЗАПАД", hasEnemy: false, static: 0 },
  { id: "CAM-4", name: "Подсобка", location: "КУХНЯ", hasEnemy: true, static: 0 },
  { id: "CAM-5", name: "Восточный коридор", location: "ВОСТОК", hasEnemy: false, static: 0 },
  { id: "CAM-6", name: "Зал розыгрышей", location: "ОФИС", hasEnemy: true, static: 0 },
];

const LOGS: LogEntry[] = [
  {
    id: "log1",
    author: "Телефонный Парень",
    night: "Ночь 1",
    text: "Алло! Добро пожаловать на новую работу! Слушай... аниматроники ночью немного... гуляют. Это нормально. Просто следи за камерами. И двери — не забывай про двери.",
    unlocked: true,
  },
  {
    id: "log2",
    author: "Телефонный Парень",
    night: "Ночь 2",
    text: "Так-с... ты выжил. Хорошо. Хочу предупредить — сегодня они... активнее. Не смотри слишком долго в одну камеру. И не открывай... то, что открывать не стоит.",
    unlocked: false,
  },
  {
    id: "log3",
    author: "[ПОВРЕЖДЕНО]",
    night: "Ночь 3",
    text: "█████ видит тебя. Он всегда █████. Ты думаешь, это игра? ЭТО НЕ ИГРА. Беги пока не——",
    unlocked: false,
  },
  {
    id: "log4",
    author: "СИСТЕМА",
    night: "[КЛАССИФИЦИРОВАНО]",
    text: "ПРЕДУПРЕЖДЕНИЕ: Детектор движения зафиксировал 4 аномалии. АНИМАТРОНИКИ НЕ ДОЛЖНЫ ДВИГАТЬСЯ. АНИМАТРОНИКИ ДВИГАЮТСЯ. ВЫ В ОПАСНОСТИ.",
    unlocked: false,
  },
];

// --- GLITCH EFFECT ---
const GlitchText = ({ text, intensity = 1 }: { text: string; intensity?: number }) => {
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
const StaticOverlay = ({ intensity }: { intensity: number }) => {
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

// --- MAIN GAME ---
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
  const [jumpscareVisible, setJumpscareVisible] = useState(false);
  const [currentDialog, setCurrentDialog] = useState(0);
  const [typewriterText, setTypewriterText] = useState("");
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

  const typeText = useCallback((text: string, cb?: () => void) => {
    setTypewriterText("");
    let i = 0;
    const interval = setInterval(() => {
      setTypewriterText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        cb?.();
      }
    }, 40);
  }, []);

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
          setLogs((prev) => prev.map((l, i) => ({ ...l, unlocked: true })));
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

  const currentCam = cameras.find((c) => c.id === selectedCam);
  const camEnemies = enemies.filter((e) => e.location === selectedCam && e.active);

  const threatColor = (t: number) => {
    if (t >= 4) return "#ff0033";
    if (t >= 3) return "#ff6600";
    if (t >= 2) return "#ffcc00";
    return "#00ff88";
  };

  // --- INTRO ---
  if (phase === "intro") {
    return (
      <div className="intro-screen">
        <div className="scanlines" />
        <div className="intro-content">
          <div className="logo-glitch" data-text="FREDDY'S">FREDDY'S</div>
          <div className="logo-sub">ЦИФРОВОЙ УЖАС v.1.0</div>
          <div className="intro-text">
            Добро пожаловать, ночной охранник.<br />
            Ваша смена: с 12:00 до 6:00.<br />
            <span style={{ color: "#ff0033" }}>Следите за камерами. Закрывайте двери.</span><br />
            Они двигаются. Не позволяйте им войти.
          </div>
          <button className="start-btn" onClick={startGame}>
            ▶ НАЧАТЬ СМЕНУ
          </button>
          <div className="power-warning">ВНИМАНИЕ: Ресурс питания ограничен</div>
        </div>
      </div>
    );
  }

  // --- GAME OVER ---
  if (phase === "gameover") {
    return (
      <div className="gameover-screen">
        <div className="scanlines" />
        <div className="go-text" data-text="ОН НАШЁЛ ТЕБЯ">ОН НАШЁЛ ТЕБЯ</div>
        <div className="go-sub">ТЫ НЕ ПЕРЕЖИЛ НОЧЬ</div>
        <div className="go-time">Время: {String(hour + 12).padStart(2, "0")}:00</div>
        <button className="start-btn" onClick={() => {
          setPhase("intro");
          setEnemies(INITIAL_ENEMIES);
          setCameras(CAMERAS);
          setPower(100);
          setTime(0);
          setHour(0);
          setDoorLeft(false);
          setDoorRight(false);
        }}>
          ↺ ПОПРОБОВАТЬ СНОВА
        </button>
      </div>
    );
  }

  // --- WIN ---
  if (phase === "win") {
    return (
      <div className="win-screen">
        <div className="scanlines" />
        <div className="win-text">ТЫ ВЫЖИЛ</div>
        <div className="win-sub">6:00 AM — СМЕНА ОКОНЧЕНА</div>
        <div className="win-msg">Поздравляем. Немногие доживают до рассвета.</div>
        <button className="start-btn" onClick={() => {
          setPhase("intro");
          setEnemies(INITIAL_ENEMIES);
          setCameras(CAMERAS);
          setPower(100);
          setTime(0);
          setHour(0);
          setDoorLeft(false);
          setDoorRight(false);
          setLogs(LOGS);
        }}>
          ▶ СЫГРАТЬ СНОВА
        </button>
      </div>
    );
  }

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
              {/* Doors */}
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
        <div className="control-panel">
          {/* TABS */}
          <div className="tab-bar">
            {(["cameras", "enemies", "logs"] as PanelTab[]).map((t) => (
              <button
                key={t}
                className={`tab-btn ${tab === t ? "tab-active" : ""}`}
                onClick={() => setTab(t)}
              >
                {t === "cameras" ? "📷 КАМЕРЫ" : t === "enemies" ? "👁 УГРОЗЫ" : "📋 ЗАПИСИ"}
              </button>
            ))}
          </div>

          {/* CAMERAS TAB */}
          {tab === "cameras" && (
            <div className="cameras-tab">
              <div className="cam-grid">
                {cameras.map((cam) => (
                  <button
                    key={cam.id}
                    className={`cam-thumb ${selectedCam === cam.id ? "cam-selected" : ""} ${cam.hasEnemy ? "cam-enemy" : ""}`}
                    onClick={() => { setSelectedCam(cam.id); playBeep(800, 0.05, "sine", 0.03); }}
                  >
                    <div className="cam-id">{cam.id}</div>
                    <div className="cam-name">{cam.name}</div>
                    {cam.hasEnemy && <div className="cam-alert">⚠</div>}
                  </button>
                ))}
              </div>
              <div className="cam-view">
                <div className="cam-view-header">
                  <span>{selectedCam} — {currentCam?.name}</span>
                  <span className="rec-dot">● REC</span>
                </div>
                <div className="cam-view-body">
                  <StaticOverlay intensity={Math.random() * 0.3} />
                  <div className="cam-grid-lines" />
                  {camEnemies.length > 0 ? (
                    <div className="enemy-in-cam">
                      {camEnemies.map((e) => (
                        <div key={e.id} className="enemy-cam-entry">
                          <div className="enemy-silhouette">👁</div>
                          <GlitchText text={e.glitchText} intensity={3} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="cam-empty">
                      <div className="cam-empty-text">[ ЗОНА ЧИСТА ]</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ENEMIES TAB */}
          {tab === "enemies" && (
            <div className="enemies-tab">
              {enemies.map((e) => (
                <div key={e.id} className={`enemy-card ${e.moved ? "enemy-moved" : ""}`}>
                  <div className="enemy-header">
                    <span className="enemy-name" style={{ color: threatColor(e.threat) }}>
                      <GlitchText text={e.name} intensity={e.threat > 3 ? 2 : 0.5} />
                    </span>
                    <span className="enemy-loc">📍 {e.location}</span>
                  </div>
                  <div className="threat-bar-row">
                    <span className="threat-label">УГРОЗА</span>
                    <div className="threat-bar">
                      {[1, 2, 3, 4].map((lvl) => (
                        <div
                          key={lvl}
                          className="threat-seg"
                          style={{ background: lvl <= e.threat ? threatColor(e.threat) : "#1a1a1a" }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="enemy-desc">{e.description}</div>
                  {e.moved && <div className="enemy-moved-badge">⚠ ДВИЖЕНИЕ</div>}
                </div>
              ))}
            </div>
          )}

          {/* LOGS TAB */}
          {tab === "logs" && (
            <div className="logs-tab">
              {logs.map((log) => (
                <div key={log.id} className={`log-entry ${!log.unlocked ? "log-locked" : ""}`}>
                  <div className="log-header">
                    <span className="log-night">{log.night}</span>
                    <span className="log-author">{log.author}</span>
                  </div>
                  {log.unlocked ? (
                    <div className="log-text">{log.text}</div>
                  ) : (
                    <div className="log-locked-text">
                      <GlitchText text="[ЗАБЛОКИРОВАНО — ДОЖИВИ ДО ЭТОЙ НОЧИ]" intensity={1} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;