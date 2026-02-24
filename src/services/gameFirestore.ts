import {
    doc,
    updateDoc,
    getDoc,
    runTransaction,
    serverTimestamp,
    Timestamp,
    increment,
} from "firebase/firestore";
import { db } from "../firebase";
import { ROOM_TTL_MS } from "./roomCleanup";
import { Fighter } from "../interfaces/Fighter";

/**
 * Reset timer to original value
 */
export const resetTimerFirestore = async (
    roomId: string,
    gameState: any,
): Promise<void> => {
    if (!roomId || !gameState) return;

    const roomRef = doc(db, "rooms", roomId);
    const roomDoc = await getDoc(roomRef);
    const originalTimer = roomDoc.data()?.timer || 30;

    await updateDoc(roomRef, {
        timerLength: originalTimer,
        lastActivityAt: serverTimestamp(),
        expireAt: Timestamp.fromMillis(Date.now() + ROOM_TTL_MS),
    });
};

/**
 * Switch turn between red and blue
 */
export const switchTurn = async (
    roomId: string,
    gameState: any,
): Promise<void> => {
    if (!roomId) return;

    const roomRef = doc(db, "rooms", roomId);

    await updateDoc(roomRef, {
        turn: gameState.turn == "red" ? "blue" : "red",
        lastActivityAt: serverTimestamp(),
        expireAt: Timestamp.fromMillis(Date.now() + ROOM_TTL_MS),
    });
};

/**
 * Start a new game
 */
export const startGameDb = async (
    roomId: string,
    timerLength: string,
    difficulty: string,
    customTimerLength?: string,
    filtersSelected?: any[],
    positionsFighters?: any,
): Promise<void> => {
    if (!roomId) return;

    const roomRef = doc(db, "rooms", roomId);
    const roomSnap = await getDoc(roomRef);

    if (roomSnap.exists()) {
        const data = roomSnap.data();
        const hasFighters =
            data.fighter00?.text || data.fighter01?.text || data.fighter02?.text;
        if (hasFighters && data.gameStarted) {
            return;
        }
    }

    const finalTimerLength = customTimerLength || timerLength;
    const updatePayload: any = {
        gameStarted: true,
        difficulty: difficulty,
        timerLength: finalTimerLength,
        lastActivityAt: serverTimestamp(),
        expireAt: Timestamp.fromMillis(Date.now() + ROOM_TTL_MS),
    };

    // Add filters if provided (casual/ranked flow)
    if (filtersSelected !== undefined) {
        updatePayload.filtersSelected = filtersSelected;
    }
    if (positionsFighters !== undefined) {
        updatePayload.positionsFighters = positionsFighters;
    }

    await updateDoc(roomRef, updatePayload);
};

/**
 * Start a new ranked match (reset for rematch)
 */
export const startNewRankedMatchDb = async (
    roomId: string,
    unknown_fighter: string,
): Promise<void> => {
    if (!roomId) return;

    const roomRef = doc(db, "rooms", roomId);

    await updateDoc(roomRef, {
        gameStarted: false,
        gameEnded: false,
        winner: null,
        turn: "red",
        timerLength: "30",
        difficulty: "MEDIUM",
        filtersSelected: [],
        positionsFighters: {},
        hostReady: false,
        guestReady: false,
        hostWantsRematch: false,
        guestWantsRematch: false,
        fighter00: {
            url: unknown_fighter,
            text: "",
            bg: "from-stone-300/70 to-stone-500/70",
        },
        fighter01: {
            url: unknown_fighter,
            text: "",
            bg: "from-stone-300/70 to-stone-500/70",
        },
        fighter02: {
            url: unknown_fighter,
            text: "",
            bg: "from-stone-300/70 to-stone-500/70",
        },
        fighter10: {
            url: unknown_fighter,
            text: "",
            bg: "from-stone-300/70 to-stone-500/70",
        },
        fighter11: {
            url: unknown_fighter,
            text: "",
            bg: "from-stone-300/70 to-stone-500/70",
        },
        fighter12: {
            url: unknown_fighter,
            text: "",
            bg: "from-stone-300/70 to-stone-500/70",
        },
        fighter20: {
            url: unknown_fighter,
            text: "",
            bg: "from-stone-300/70 to-stone-500/70",
        },
        fighter21: {
            url: unknown_fighter,
            text: "",
            bg: "from-stone-300/70 to-stone-500/70",
        },
        fighter22: {
            url: unknown_fighter,
            text: "",
            bg: "from-stone-300/70 to-stone-500/70",
        },
        statsUpdated: false,
        lastActivityAt: serverTimestamp(),
        expireAt: Timestamp.fromMillis(Date.now() + ROOM_TTL_MS),
    });
};

/**
 * Restart a game
 */
export const restartGameDb = async (
    roomId: string,
    unknown_fighter: string,
): Promise<void> => {
    if (!roomId) return;

    const roomRef = doc(db, "rooms", roomId);

    await updateDoc(roomRef, {
        gameStarted: false,
        gameEnded: false,
        winner: null,
        turn: "red",
        timerLength: "-2",
        filtersSelected: [],
        positionsFighters: {},
        statsUpdated: false,
        fighter00: {
            url: unknown_fighter,
            text: "",
            bg: "from-stone-300/70 to-stone-500/70",
        },
        fighter01: {
            url: unknown_fighter,
            text: "",
            bg: "from-stone-300/70 to-stone-500/70",
        },
        fighter02: {
            url: unknown_fighter,
            text: "",
            bg: "from-stone-300/70 to-stone-500/70",
        },
        fighter10: {
            url: unknown_fighter,
            text: "",
            bg: "from-stone-300/70 to-stone-500/70",
        },
        fighter11: {
            url: unknown_fighter,
            text: "",
            bg: "from-stone-300/70 to-stone-500/70",
        },
        fighter12: {
            url: unknown_fighter,
            text: "",
            bg: "from-stone-300/70 to-stone-500/70",
        },
        fighter20: {
            url: unknown_fighter,
            text: "",
            bg: "from-stone-300/70 to-stone-500/70",
        },
        fighter21: {
            url: unknown_fighter,
            text: "",
            bg: "from-stone-300/70 to-stone-500/70",
        },
        fighter22: {
            url: unknown_fighter,
            text: "",
            bg: "from-stone-300/70 to-stone-500/70",
        },
    });
};

/**
 * Update a fighter box selection
 */
export const updateBoxDb = async (
    roomId: string,
    selected: string,
    fighter: Fighter,
    positionsFighters: any,
    picture: string,
    name: string,
    gameState: any,
    guest: string,
): Promise<boolean> => {
    if (!roomId) return false;

    const roomRef = doc(db, "rooms", roomId);

    const fighterMap: { [key: string]: keyof typeof positionsFighters } = {
        fighter00: "position03",
        fighter01: "position13",
        fighter02: "position23",
        fighter10: "position04",
        fighter11: "position14",
        fighter12: "position24",
        fighter20: "position05",
        fighter21: "position15",
        fighter22: "position25",
    };

    if (!fighterMap[selected]) return false;

    const positionKey = fighterMap[selected];

    const positionArray: any[] = (positionsFighters && positionsFighters[positionKey]) || [];

    // Support both arrays of IDs (numbers) and arrays of fighter objects
    const isValid = positionArray.some((item: any) => {
        if (item == null) return false;
        if (typeof item === "number") return item === fighter.Id;
        if (typeof item === "string") return String(item) === String(fighter.Id);
        if (typeof item === "object") {
            // Common shaped properties: Id or fighterId
            if (Object.prototype.hasOwnProperty.call(item, "Id")) return item.Id === fighter.Id;
            if (Object.prototype.hasOwnProperty.call(item, "fighterId")) return item.fighterId === fighter.Id;
        }
        return false;
    });

    if (!isValid) {
        await updateDoc(roomRef, {
            timerLength: gameState.timerLength || gameState.timer || "-2",
            turn: gameState.turn === "red" ? "blue" : "red",
            lastActivityAt: serverTimestamp(),
            expireAt: Timestamp.fromMillis(Date.now() + ROOM_TTL_MS),
        });
        return false;
    }

    const bgColor =
        gameState.turn === "red"
            ? "from-red-800 to-red-900"
            : "from-blue-800 to-blue-900";

    await updateDoc(roomRef, {
        [selected]: {
            url: picture,
            text: name,
            bg: bgColor,
            fighterId: fighter.Id,
        },
        guest: { prev: gameState?.guest.now, now: guest },
        timerLength: gameState.timerLength || gameState.timer || "-2",
        turn: gameState.turn === "red" ? "blue" : "red",
        lastActivityAt: serverTimestamp(),
        expireAt: Timestamp.fromMillis(Date.now() + ROOM_TTL_MS),
    });

    return true;
};

/**
 * Update Firestore when a winner is detected
 */
export const updateWinnerDb = async (
    roomId: string,
    winner: "red" | "blue" | "draw",
): Promise<void> => {
    if (!roomId) return;

    const roomRef = doc(db, "rooms", roomId);

    if (winner === "draw") {
        await updateDoc(roomRef, {
            winner: "draw",
            gameStarted: false,
        });
    } else {
        await updateDoc(roomRef, {
            winner: winner,
        });
    }
};

/**
 * Handle host exit from game
 */
export const handleHostExit = async (
    roomId: string,
    currentUser: any,
): Promise<void> => {
    const roomRef = doc(db, "rooms", roomId);

    if (currentUser) {
        await runTransaction(db, async (transaction) => {
            const roomDoc = await transaction.get(roomRef);

            if (!roomDoc.exists()) {
                return;
            }

            transaction.delete(roomRef);
        });
    }
};

/**
 * Handle guest exit from game
 */
export const handleGuestExitDb = async (
    roomId: string,
    gameState: any,
): Promise<void> => {
    const roomRef = doc(db, "rooms", roomId);

    await updateDoc(roomRef, {
        guest: { prev: gameState.guest.now || null, now: null },
        gameStarted: false,
    });
};

/**
 * Handle ranked forfeit - host loses, guest wins
 */
export const handleRankedForfeitDb = async (
    roomId: string,
    gameState: any,
): Promise<void> => {
    const roomRef = doc(db, "rooms", roomId);
    const hostRef = doc(db, "users", gameState.hostEmail);
    const guestRef = doc(db, "users", gameState.guestEmail);

    await runTransaction(db, async (transaction) => {
        transaction.update(roomRef, {
            winner: "guest",
            forfeit: true,
            gameStarted: false,
            filtersSelected: [],
            positionsFighters: {},
        });

        transaction.update(hostRef, {
            "stats.totalGames": increment(1),
            "stats.losses": increment(1),
        });

        transaction.update(guestRef, {
            "stats.totalGames": increment(1),
            "stats.wins": increment(1),
            "stats.points": increment(15),
        });
    });

    // Delete room in background
    runTransaction(db, async (transaction) => {
        try {
            const roomDoc = await transaction.get(roomRef);
            if (roomDoc.exists()) {
                transaction.delete(roomRef);
            }
        } catch (err) {
            console.warn("Room deletion failed:", err);
        }
    }).catch((err) => console.warn("Room deletion error:", err));
};

/**
 * Handle guest forfeit - host wins, guest loses
 */
export const handleGuestForfeitDb = async (
    roomId: string,
    gameState: any,
): Promise<void> => {
    const hostEmail = gameState.hostEmail;
    const guestEmail = gameState.guestEmail;

    const hostRef = doc(db, "users", hostEmail);
    const guestRef = doc(db, "users", guestEmail);
    const roomRef = doc(db, "rooms", roomId);

    await runTransaction(db, async (transaction) => {
        const hostDoc = await transaction.get(hostRef);
        const guestDoc = await transaction.get(guestRef);

        if (!hostDoc.exists() || !guestDoc.exists()) {
            throw new Error("User documents not found");
        }

        const hostStats = hostDoc.data()?.stats || {
            totalGames: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            points: 0,
            winRate: 0,
        };
        const guestStats = guestDoc.data()?.stats || {
            totalGames: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            points: 0,
            winRate: 0,
        };

        const newHostStats = {
            totalGames: hostStats.totalGames + 1,
            wins: hostStats.wins + 1,
            losses: hostStats.losses,
            draws: hostStats.draws,
            points: hostStats.points + 15,
            winRate:
                ((hostStats.wins + 1) / (hostStats.totalGames + 1)) * 100 || 0,
        };

        const newGuestStats = {
            totalGames: guestStats.totalGames + 1,
            wins: guestStats.wins,
            losses: guestStats.losses + 1,
            draws: guestStats.draws,
            points: Math.max(0, guestStats.points - 5),
            winRate: (guestStats.wins / (guestStats.totalGames + 1)) * 100 || 0,
        };

        transaction.update(hostRef, { stats: newHostStats });
        transaction.update(guestRef, { stats: newGuestStats });

        transaction.update(roomRef, {
            winner: "red",
            forfeit: true,
            gameStarted: false,
            filtersSelected: [],
            positionsFighters: {},
            statsUpdated: true,
            lastActivityAt: serverTimestamp(),
            expireAt: Timestamp.fromMillis(Date.now() + ROOM_TTL_MS),
        });
    });

    // Delete room in background
    runTransaction(db, async (transaction) => {
        try {
            const roomDoc = await transaction.get(roomRef);
            if (roomDoc.exists()) {
                transaction.delete(roomRef);
            }
        } catch (err) {
            console.warn("Room deletion failed:", err);
        }
    }).catch((err) => console.warn("Room deletion error:", err));
};
