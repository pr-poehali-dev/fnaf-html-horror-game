import { Enemy, Camera, LogEntry, INITIAL_ENEMIES, CAMERAS, LOGS } from "@/components/gameTypes";

interface IntroScreenProps {
  onStart: () => void;
}

export const IntroScreen = ({ onStart }: IntroScreenProps) => (
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
      <button className="start-btn" onClick={onStart}>
        ▶ НАЧАТЬ СМЕНУ
      </button>
      <div className="power-warning">ВНИМАНИЕ: Ресурс питания ограничен</div>
    </div>
  </div>
);

interface GameOverScreenProps {
  hour: number;
  onReset: () => void;
}

export const GameOverScreen = ({ hour, onReset }: GameOverScreenProps) => (
  <div className="gameover-screen">
    <div className="scanlines" />
    <div className="go-text" data-text="ОН НАШЁЛ ТЕБЯ">ОН НАШЁЛ ТЕБЯ</div>
    <div className="go-sub">ТЫ НЕ ПЕРЕЖИЛ НОЧЬ</div>
    <div className="go-time">Время: {String(hour + 12).padStart(2, "0")}:00</div>
    <button className="start-btn" onClick={onReset}>
      ↺ ПОПРОБОВАТЬ СНОВА
    </button>
  </div>
);

interface WinScreenProps {
  onReset: () => void;
}

export const WinScreen = ({ onReset }: WinScreenProps) => (
  <div className="win-screen">
    <div className="scanlines" />
    <div className="win-text">ТЫ ВЫЖИЛ</div>
    <div className="win-sub">6:00 AM — СМЕНА ОКОНЧЕНА</div>
    <div className="win-msg">Поздравляем. Немногие доживают до рассвета.</div>
    <button className="start-btn" onClick={onReset}>
      ▶ СЫГРАТЬ СНОВА
    </button>
  </div>
);
