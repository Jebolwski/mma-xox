import {
    doc,
    getDoc,
    updateDoc,
    increment,
    arrayUnion,
    Firestore,
} from "firebase/firestore";

type ToastFunction = {
    success: (message: string) => void;
    error: (message: string) => void;
};

type TranslationFunction = (key: string, options?: any) => string;

/**
 * Updates player stats for ranked matches
 * Handles achievements and titles unlocking
 */
export const updatePlayerStats = async (
    db: Firestore,
    gameState: any,
    currentUser: any,
    winner: "red" | "blue" | "draw",
    toast: ToastFunction,
    t: TranslationFunction,
) => {
    // 🚩 FORFEIT CHECK: Eğer forfeit olmuşsa, stats zaten transaction'da güncellendi, skip et
    if (gameState?.isForfeited) {
        return;
    }

    if (!gameState?.isRankedRoom) {
        return;
    }

    const hostEmail = gameState.hostEmail;
    const guestEmail = gameState.guestEmail;

    if (!hostEmail || !guestEmail) {
        console.error("❌ Host or guest email is missing for ranked match.");
        return;
    }

    // 🔑 Current user'ın kim olduğunu belirle
    const isHost = currentUser?.email === hostEmail;
    const isGuest = currentUser?.email === guestEmail;

    if (!isHost && !isGuest) {
        console.error("❌ Current user is neither host nor guest.");
        return;
    }

    const hostIsWinner = winner === "red";
    const guestIsWinner = winner === "blue";

    try {
        if (isHost) {
            // 🏠 HOST: Sadece kendi stats'ını güncelle
            const hostRef = doc(db, "users", hostEmail);
            const hostDoc = await getDoc(hostRef);

            if (!hostDoc.exists()) {
                throw "Host profile could not be found.";
            }

            const hostProfile = hostDoc.data();
            const hostNewAchievements = { ...hostProfile.achievements };
            const hostNewUnlockedTitles = [];

            if (hostIsWinner) {
                if (!hostProfile.achievements.firstWin) {
                    hostNewAchievements.firstWin = new Date().toISOString();
                    hostNewUnlockedTitles.push("First Blood");
                    toast.success(t("room.firstBloodUnlocked"));
                }
                const newWinCount = (hostProfile.stats.wins || 0) + 1;
                if (newWinCount >= 10 && !hostProfile.achievements.tenWins) {
                    hostNewAchievements.tenWins = new Date().toISOString();
                    hostNewUnlockedTitles.push("Arena Master");
                    toast.success(t("room.arenaManagerUnlocked"));
                }
            }

            await updateDoc(hostRef, {
                "stats.points": increment(
                    hostIsWinner ? 15 : winner === "draw" ? 2 : -5,
                ),
                "stats.wins": increment(hostIsWinner ? 1 : 0),
                "stats.losses": increment(guestIsWinner ? 1 : 0),
                "stats.draws": increment(winner === "draw" ? 1 : 0),
                "stats.totalGames": increment(1),
                achievements: hostNewAchievements,
                unlockedTitles: arrayUnion(...hostNewUnlockedTitles),
            }).then(() => {
                updateWinRates(db, hostEmail, guestEmail);
            });

            toast.success(t("room.rankedMatchCompleted"));
        } else if (isGuest) {
            // 👥 GUEST: Sadece kendi stats'ını güncelle
            const guestRef = doc(db, "users", guestEmail);
            const guestDoc = await getDoc(guestRef);

            if (!guestDoc.exists()) {
                throw "Guest profile could not be found.";
            }

            const guestProfile = guestDoc.data();
            const guestNewAchievements = { ...guestProfile.achievements };
            const guestNewUnlockedTitles = [];

            if (guestIsWinner) {
                if (!guestProfile.achievements.firstWin) {
                    guestNewAchievements.firstWin = new Date().toISOString();
                    guestNewUnlockedTitles.push("First Blood");
                    toast.success(t("room.firstBloodUnlocked"));
                }
                const newWinCount = (guestProfile.stats.wins || 0) + 1;
                if (newWinCount >= 10 && !guestProfile.achievements.tenWins) {
                    guestNewAchievements.tenWins = new Date().toISOString();
                    guestNewUnlockedTitles.push("Arena Master");
                    toast.success(t("room.arenaManagerUnlocked"));
                }
            }

            await updateDoc(guestRef, {
                "stats.points": increment(
                    guestIsWinner ? 15 : winner === "draw" ? 2 : -5,
                ),
                "stats.wins": increment(guestIsWinner ? 1 : 0),
                "stats.losses": increment(hostIsWinner ? 1 : 0),
                "stats.draws": increment(winner === "draw" ? 1 : 0),
                "stats.totalGames": increment(1),
                achievements: guestNewAchievements,
                unlockedTitles: arrayUnion(...guestNewUnlockedTitles),
            }).then(() => {
                updateWinRates(db, hostEmail, guestEmail);
            });

            toast.success(t("room.rankedMatchCompleted"));
        }
    } catch (error) {
        console.error("❌ Failed to update player stats:", error);
        toast.error(t("room.failedUpdateStats"));
    }
};

/**
 * Updates win rates for both players
 */
export const updateWinRates = async (
    db: Firestore,
    hostEmail: string,
    guestEmail: string,
) => {
    try {
        const hostDoc = await getDoc(doc(db, "users", hostEmail));
        if (hostDoc.exists()) {
            const hostStats = hostDoc.data().stats;
            const hostWinRate =
                hostStats.totalGames > 0
                    ? (hostStats.wins / hostStats.totalGames) * 100
                    : 0;

            await updateDoc(doc(db, "users", hostEmail), {
                "stats.winRate": Math.round(hostWinRate * 100) / 100,
            });
        }

        const guestDoc = await getDoc(doc(db, "users", guestEmail));
        if (guestDoc.exists()) {
            const guestStats = guestDoc.data().stats;
            const guestWinRate =
                guestStats.totalGames > 0
                    ? (guestStats.wins / guestStats.totalGames) * 100
                    : 0;

            await updateDoc(doc(db, "users", guestEmail), {
                "stats.winRate": Math.round(guestWinRate * 100) / 100,
            });
        }
    } catch (error) {
        console.error("Win rate güncelleme hatası:", error);
    }
};
