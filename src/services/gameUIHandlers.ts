import { doc, updateDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { Timestamp } from "firebase/firestore";
import unknown_fighter from "../assets/unknown.png";
import Filters from "../logic/filters";
import { Fighter } from "../interfaces/Fighter";
import { filterByName } from "./gameLogic";
import {
    restartGameDb,
    startGameDb,
    startNewRankedMatchDb,
    updateBoxDb,
} from "./gameFirestore";
import { ROOM_TTL_MS } from "../services/roomCleanup";
import { getFiltersHandler } from "./gameFilters";

// Language handlers
export const changeLanguageHandler = (
    lang: string,
    i18n: any,
    setLanguageDropdown: (value: boolean) => void,
) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
    setLanguageDropdown(false);
};

export const handleLanguageClickHandler = (
    i18n: any,
    languageDropdown: boolean,
    setLanguageDropdown: (value: boolean) => void,
    changeLanguageFn: (lang: string) => void,
) => {
    if (
        typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(min-width: 768px)").matches
    ) {
        // Desktop / md+ -> open dropdown
        setLanguageDropdown(!languageDropdown);
    } else {
        // Mobile -> toggle language directly
        const newLang = i18n.language === "tr" ? "en" : "tr";
        changeLanguageFn(newLang);
    }
};

// Game start handlers
export const startGameHandler = async (
    roomId: string,
    timerLength: string,
    difficulty: string,
    customTimerLength: string | undefined,
    filters: any,
    setFilters: (value: any) => void,
    setGameStarted: (value: boolean) => void,
    setPushFirestore: (value: boolean) => void,
) => {
    const f = Filters();

    if (difficulty === "EASY") {
        setFilters(f.easy);
    } else if (difficulty === "MEDIUM") {
        setFilters(f.medium);
    } else {
        setFilters(f.hard);
    }

    setGameStarted(true);

    // Prepare payload: use precomputed if available (ranked), otherwise generate for casual
    let payload = filters && (filters as any)._payload;
    let filtersArg = undefined;
    let positionsArg = undefined;

    if (!payload || !payload.filters_arr) {
        // Casual flow: generate filters immediately to write to DB immediately
        try {
            payload = await getFiltersHandler(
                filters,
                difficulty,
                setFilters,
                () => { }, // setPositionsFighters - noop here, will be set via Firestore snapshot
                () => { }, // setFiltersSelected - noop here
            );
        } catch (err) {
            console.warn("startGameHandler: casual filter generation failed:", err);
        }
    }

    // Prepare data for immediate DB write
    if (payload && payload.filters_arr && payload.newPositions) {
        filtersArg = payload.filters_arr.map(({ filter_fighters, ...rest }: any) => rest);

        positionsArg = {};
        positionsArg.position03 = (payload.newPositions.position03 || []).map((fighter: Fighter) => fighter.Id);
        positionsArg.position04 = (payload.newPositions.position04 || []).map((fighter: Fighter) => fighter.Id);
        positionsArg.position05 = (payload.newPositions.position05 || []).map((fighter: Fighter) => fighter.Id);
        positionsArg.position13 = (payload.newPositions.position13 || []).map((fighter: Fighter) => fighter.Id);
        positionsArg.position14 = (payload.newPositions.position14 || []).map((fighter: Fighter) => fighter.Id);
        positionsArg.position15 = (payload.newPositions.position15 || []).map((fighter: Fighter) => fighter.Id);
        positionsArg.position23 = (payload.newPositions.position23 || []).map((fighter: Fighter) => fighter.Id);
        positionsArg.position24 = (payload.newPositions.position24 || []).map((fighter: Fighter) => fighter.Id);
        positionsArg.position25 = (payload.newPositions.position25 || []).map((fighter: Fighter) => fighter.Id);
    }

    // Call database function - now includes filters if available
    await startGameDb(roomId, timerLength, difficulty, customTimerLength, filtersArg, positionsArg);

    // For ranked: write payload if it exists (though startGameDb should have already done it)
    // For casual: filters were already written in startGameDb, so no need for secondary write
    try {
        if (payload && payload.filters_arr && payload.newPositions && filtersArg && positionsArg) {
            // Filters were already written in startGameDb, so we're done
            if (!filtersArg) {
                // Should not reach here, but safety check
                const roomRef = doc(db, "rooms", roomId);
                await updateDoc(roomRef, {
                    filtersSelected: filtersArg,
                    positionsFighters: positionsArg,
                });
            }
        }
    } catch (err) {
        console.warn("startGameHandler: could not persist filters payload:", err);
    }

    setPushFirestore(false); // Don't need secondary write since we included filters in startGameDb
};

export const startNewRankedMatchHandler = async (
    roomId: string,
    setGameStarted: (value: boolean) => void,
    setShowConfetti: (value: boolean) => void,
    toast: any,
    t: any,
) => {
    // Call database function
    await startNewRankedMatchDb(roomId, unknown_fighter);

    // Local state'leri de sıfırla
    setGameStarted(false);
    setShowConfetti(false);

    toast.success(t("room.newRankedMatch"));
};

// Restart game handler
export const restartGameHandler = async (
    roomId: string,
    setGameStarted: (value: boolean) => void,
    setFiltersSelected: (value: any[]) => void,
    setPushFirestore: (value: boolean) => void,
    setPositionsFighters: (value: any) => void,
    setFilters: (value: null) => void,
    setFighter00: (value: any) => void,
    setFighter01: (value: any) => void,
    setFighter02: (value: any) => void,
    setFighter10: (value: any) => void,
    setFighter11: (value: any) => void,
    setFighter12: (value: any) => void,
    setFighter20: (value: any) => void,
    setFighter21: (value: any) => void,
    setFighter22: (value: any) => void,
    setTurn: (value: string) => void,
) => {
    // Call database function
    await restartGameDb(roomId, unknown_fighter);

    // local state'leri de sıfırla
    setGameStarted(false);
    setFiltersSelected([]);
    setPushFirestore(false);
    setPositionsFighters({
        position03: {},
        position04: {},
        position05: {},
        position13: {},
        position14: {},
        position15: {},
        position23: {},
        position24: {},
        position25: {},
    });

    setFilters(null);
    const defaultFighter = {
        url: unknown_fighter,
        text: "",
        bg: "from-stone-300/70 to-stone-500/70",
    };

    setFighter00(defaultFighter);
    setFighter01(defaultFighter);
    setFighter02(defaultFighter);
    setFighter10(defaultFighter);
    setFighter11(defaultFighter);
    setFighter12(defaultFighter);
    setFighter20(defaultFighter);
    setFighter21(defaultFighter);
    setFighter22(defaultFighter);
    setTurn("red");
};

// Fighter selection handlers
export const filterByNameHandler = (
    name: string,
    fighters_url: Fighter[],
    setFighters: (value: Fighter[]) => void,
) => {
    const results = filterByName(name, fighters_url);
    setFighters(results);
};

export const toggleFighterPickHandler = (
    role: string,
    turn: string,
    toast: any,
    t: any,
) => {
    if (role === "host" && turn === "blue") {
        toast.error(t("room.opponentsTurn"));
        return;
    } else if (role === "guest" && turn === "red") {
        toast.error(t("room.opponentsTurn"));
        return;
    }
    const div = document.querySelector(".select-fighter");
    div?.classList.toggle("hidden");
};

export const resetInputHandler = () => {
    const input: any = document.querySelector(".input-fighter");
    input.value = "";
};

export const updateBoxHandler = async (
    fighter: Fighter,
    roomId: string,
    selected: string,
    positionsFighters: any,
    gameState: any,
    guest: string | null,
    role: string,
    turn: string,
    toast: any,
    t: any,
    playSfx: (src: string) => void,
    setFighter00: (value: any) => void,
    setFighter01: (value: any) => void,
    setFighter02: (value: any) => void,
    setFighter10: (value: any) => void,
    setFighter11: (value: any) => void,
    setFighter12: (value: any) => void,
    setFighter20: (value: any) => void,
    setFighter21: (value: any) => void,
    setFighter22: (value: any) => void,
    setTurn: (value: string) => void,
    toggleFighterPickFn: () => void,
    resetInputFn: () => void,
    notifyFn: () => void,
    correct: string,
    wrong: string,
    setSelected: (value: string | null) => void,
): Promise<void> => {
    const picture =
        fighter.Picture === "Unknown" ? unknown_fighter : fighter.Picture;
    const name = fighter.Fighter;

    if (role === "host" && turn === "blue") {
        toast.error(t("room.opponentsTurn"));
        return;
    } else if (role === "guest" && turn === "red") {
        toast.error(t("room.opponentsTurn"));
        return;
    }

    const isValid = await updateBoxDb(
        roomId,
        selected,
        fighter,
        positionsFighters,
        picture,
        name,
        gameState,
        guest,
    );

    if (!isValid) {
        notifyFn();
        playSfx(wrong); // ❌ Yanlış seçim sesi
    } else {
        const bgColor =
            turn === "red" ? "from-red-800 to-red-900" : "from-blue-800 to-blue-900";

        const setterMap: { [key: string]: Function } = {
            fighter00: setFighter00,
            fighter01: setFighter01,
            fighter02: setFighter02,
            fighter10: setFighter10,
            fighter11: setFighter11,
            fighter12: setFighter12,
            fighter20: setFighter20,
            fighter21: setFighter21,
            fighter22: setFighter22,
        };

        setterMap[selected]({ url: picture, text: name, bg: bgColor });
        playSfx(correct); // ✅ Doğru seçim sesi
    }

    setTurn(turn === "red" ? "blue" : "red");
    toggleFighterPickFn();
    resetInputFn();
    setSelected(null);
};

export const notifyHandler = (toast: any, t: any) => {
    toast.error(t("room.fighterRequirements"));
};
