import { PanelTab, Camera, Enemy, LogEntry } from "@/components/gameTypes";
import { GlitchText, StaticOverlay } from "@/components/GameEffects";

const threatColor = (t: number) => {
  if (t >= 4) return "#ff0033";
  if (t >= 3) return "#ff6600";
  if (t >= 2) return "#ffcc00";
  return "#00ff88";
};

interface ControlPanelProps {
  tab: PanelTab;
  onTabChange: (t: PanelTab) => void;
  cameras: Camera[];
  enemies: Enemy[];
  logs: LogEntry[];
  selectedCam: string;
  onSelectCam: (id: string) => void;
  onCamClick: (id: string) => void;
}

export const ControlPanel = ({
  tab,
  onTabChange,
  cameras,
  enemies,
  logs,
  selectedCam,
  onSelectCam,
  onCamClick,
}: ControlPanelProps) => {
  const currentCam = cameras.find((c) => c.id === selectedCam);
  const camEnemies = enemies.filter((e) => e.location === selectedCam && e.active);

  return (
    <div className="control-panel">
      {/* TABS */}
      <div className="tab-bar">
        {(["cameras", "enemies", "logs"] as PanelTab[]).map((t) => (
          <button
            key={t}
            className={`tab-btn ${tab === t ? "tab-active" : ""}`}
            onClick={() => onTabChange(t)}
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
                onClick={() => onCamClick(cam.id)}
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
  );
};

export default ControlPanel;
