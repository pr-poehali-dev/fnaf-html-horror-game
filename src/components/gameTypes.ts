// --- TYPES ---
export type GamePhase = "intro" | "game" | "gameover" | "win";
export type PanelTab = "cameras" | "enemies" | "logs";

export interface Enemy {
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

export interface Camera {
  id: string;
  name: string;
  location: string;
  hasEnemy: boolean;
  static: number;
}

export interface LogEntry {
  id: string;
  author: string;
  night: string;
  text: string;
  unlocked: boolean;
}

// --- CONSTANTS ---
export const INITIAL_ENEMIES: Enemy[] = [
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

export const CAMERAS: Camera[] = [
  { id: "CAM-1", name: "Главная сцена", location: "СЦЕНА", hasEnemy: true, static: 0 },
  { id: "CAM-2", name: "Пиратская бухта", location: "ПРАВЫЙ КОРИДОР", hasEnemy: false, static: 0 },
  { id: "CAM-3", name: "Западный коридор", location: "ЗАПАД", hasEnemy: false, static: 0 },
  { id: "CAM-4", name: "Подсобка", location: "КУХНЯ", hasEnemy: true, static: 0 },
  { id: "CAM-5", name: "Восточный коридор", location: "ВОСТОК", hasEnemy: false, static: 0 },
  { id: "CAM-6", name: "Зал розыгрышей", location: "ОФИС", hasEnemy: true, static: 0 },
];

export const LOGS: LogEntry[] = [
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
