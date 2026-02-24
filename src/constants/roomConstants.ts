// roomConstants.ts - Room sayfası için sabitler ve varsayılan değerler

import trFlag from "../assets/tr.png";
import enFlag from "../assets/en.jpg";
import ptFlag from "../assets/pt.png";
import spFlag from "../assets/sp.png";
import ruFlag from "../assets/russia_flag.jpg";
import deFlag from "../assets/ge.png";
import arFlag from "../assets/sa.png";
import hiFlag from "../assets/in.png";
import zhFlag from "../assets/ch.png";
import jaFlag from "../assets/jp.png";
import koFlag from "../assets/kr.png";
import frFlag from "../assets/fr.png";
import swFlag from "../assets/sw.png";
import plFlag from "../assets/pl.png";
import unknown_fighter from "../assets/unknown.png";

// Language flags mapping
export const LANGUAGE_FLAGS = {
    tr: trFlag,
    en: enFlag,
    pt: ptFlag,
    es: spFlag,
    ru: ruFlag,
    de: deFlag,
    ar: arFlag,
    hi: hiFlag,
    zh: zhFlag,
    ja: jaFlag,
    ko: koFlag,
    fr: frFlag,
    sw: swFlag,
    pl: plFlag,
};

// Default fighter data
export const DEFAULT_FIGHTER = {
    url: unknown_fighter,
    text: "",
    bg: "from-stone-300/70 to-stone-500/70",
};

// Game difficulty levels
export const DIFFICULTY_LEVELS = {
    EASY: "EASY",
    MEDIUM: "MEDIUM",
    HARD: "HARD",
};

// Timer options
export const TIMER_OPTIONS = {
    NONE: "-2",
    THIRTY: "30",
    FORTY_FIVE: "45",
    SIXTY: "60",
};

// Game states
export const GAME_STATES = {
    NOT_STARTED: "not_started",
    WAITING_FOR_GUEST: "waiting_for_guest",
    BOTH_READY: "both_ready",
    IN_PROGRESS: "in_progress",
    FINISHED: "finished",
};

// Position mapping for fighters
export const FIGHTER_POSITIONS = {
    position03: { row: 0, col: 3 },
    position04: { row: 0, col: 4 },
    position05: { row: 0, col: 5 },
    position13: { row: 1, col: 3 },
    position14: { row: 1, col: 4 },
    position15: { row: 1, col: 5 },
    position23: { row: 2, col: 3 },
    position24: { row: 2, col: 4 },
    position25: { row: 2, col: 5 },
};

// Initial fighter state mapping
export const INITIAL_FIGHTER_STATE = {
    fighter00: DEFAULT_FIGHTER,
    fighter01: DEFAULT_FIGHTER,
    fighter02: DEFAULT_FIGHTER,
    fighter10: DEFAULT_FIGHTER,
    fighter11: DEFAULT_FIGHTER,
    fighter12: DEFAULT_FIGHTER,
    fighter20: DEFAULT_FIGHTER,
    fighter21: DEFAULT_FIGHTER,
    fighter22: DEFAULT_FIGHTER,
};

// Timeout constants (milliseconds)
export const TIMEOUTS = {
    OPPONENT_HEARTBEAT_CHECK: 15000, // 15 seconds
    HEARTBEAT_INTERVAL: 5000, // 5 seconds
    OPPONENT_TIMEOUT: 15000, // 15 seconds to consider opponent disconnected
    FORFEIT_CLEANUP: 2000, // 2 seconds before rematch
};

// Ranked game settings
export const RANKED_SETTINGS = {
    DEFAULT_TIMER: "30",
    DEFAULT_DIFFICULTY: "MEDIUM",
    WIN_POINTS: 15,
    DRAW_POINTS: 2,
    LOSS_POINTS: -5,
};
