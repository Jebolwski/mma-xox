import { UserInfo } from "firebase/auth";
import {
    handleHostExit,
    handleGuestExitDb,
    handleRankedForfeitDb,
    handleGuestForfeitDb,
} from "./gameFirestore";

// Exit handlers
export const handleExitHandler = async (
    roomId: string,
    playerName: string,
    role: string,
    isExiting: boolean,
    gameState: any,
    currentUser: UserInfo | null,
    isRankedRoom: boolean | undefined,
    setRankedForfeitModal: (value: boolean) => void,
    setGuestExitConfirmModal: (value: boolean) => void,
    setIsExiting: (value: boolean) => void,
    setHasExited: (value: boolean) => void,
    navigate: (path: string) => void,
    toast: any,
    t: any,
): Promise<void> => {
    if (!roomId || !playerName || !role || isExiting) return;

    // Ranked maçta oyun devam ederken host çıkmak isterse modal aç
    if (
        gameState?.isRankedRoom &&
        gameState?.gameStarted &&
        !gameState?.winner &&
        role === "host"
    ) {
        setRankedForfeitModal(true);
        return;
    }

    // Ranked maçta oyun devam ederken guest çıkmak isterse modal aç
    if (
        gameState?.isRankedRoom &&
        gameState?.gameStarted &&
        !gameState?.winner &&
        role === "guest"
    ) {
        setGuestExitConfirmModal(true);
        return;
    }

    setIsExiting(true);

    try {
        if (role === "host") {
            await handleHostExit(roomId, currentUser);
            toast.success(t("room.roomDeleted"));
            setTimeout(() => {
                navigate("/menu");
            }, 1500);
        } else if (role === "guest") {
            setHasExited(true);
            await handleGuestExitDb(roomId, gameState);
            navigate("/menu");
        }
    } catch (error) {
        console.error("Çıkış yapılırken hata oluştu:", error);
        console.error(
            "Hata detayı:",
            error instanceof Error ? error.message : "Bilinmeyen hata",
        );
        toast.error(t("room.exitError"));
        navigate("/menu");
    } finally {
        setIsExiting(false);
    }
};

// Handle ranked forfeit - host loses, guest wins
export const handleRankedForfeitHandler = async (
    roomId: string,
    gameState: any,
    navigate: (path: string) => void,
    toast: any,
    t: any,
    setRankedForfeitModal: (value: boolean) => void,
    setIsExiting: (value: boolean) => void,
): Promise<void> => {
    if (!roomId || !gameState) return;

    setRankedForfeitModal(false);
    setIsExiting(true);

    try {
        await handleRankedForfeitDb(roomId, gameState);
        toast.success(t("room.guestWinsForfeited"));
        navigate("/menu");
    } catch (error) {
        console.error("Forfeit failed:", error);
        toast.error(t("room.forfeitError"));
        setIsExiting(false);
    }
};

// Handle guest forfeit - host wins, guest loses
export const handleGuestForfeitHandler = async (
    roomId: string,
    gameState: any,
    navigate: (path: string) => void,
    toast: any,
    t: any,
    setGuestExitConfirmModal: (value: boolean) => void,
    setIsExiting: (value: boolean) => void,
): Promise<void> => {
    if (!roomId || !gameState) return;

    setGuestExitConfirmModal(false);
    setIsExiting(true);

    try {
        const hostEmail = gameState.hostEmail;
        const guestEmail = gameState.guestEmail;

        if (!hostEmail || !guestEmail) {
            toast.error(t("room.couldNotDeterminePlayers"));
            setIsExiting(false);
            return;
        }

        await handleGuestForfeitDb(roomId, gameState);
        toast.success(t("room.hostWinsForfeited"));
        navigate("/menu");
    } catch (error) {
        console.error("Guest forfeit failed:", error);
        toast.error(t("room.forfeitError"));
        setIsExiting(false);
    }
};
