import { useState, useRef, useCallback, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
    doc,
    getDoc,
    updateDoc,
    arrayUnion,
    Timestamp,
    increment,
    serverTimestamp,
    runTransaction,
    collection,
    query,
    where,
    getDocs,
} from "firebase/firestore";
import { db } from "../firebase";
import { ROOM_TTL_MS } from "../services/roomCleanup";
import { Fighter, FilterDifficulty } from "../interfaces/Fighter";
import Filters from "../logic/filters";
import { toast } from "react-toastify";

/**
 * useGameRoom Hook - Tüm game logic ve state management
 * Room.tsx'nin UI'dan ayrı olarak bulunması gereken tüm mantığı içerir
 */
export const useGameRoom = (t: any, roleParam: string, playerName: string, isRanked: boolean, currentUser: any) => {
    const { roomId } = useParams();
    const location = useLocation();

    // ===== STATE DECLARATIONS =====
    const [gameState, setGameState] = useState<any>(null);
    const [guest, setGuest] = useState<any>(null);
    const [turn, setTurn] = useState<string | null>(null);
    const [gameStarted, setGameStarted] = useState<boolean>(false);
    const [filters, setFilters] = useState<any>();
    const [selected, setSelected] = useState<any>();
    const [showConfetti, setShowConfetti] = useState(false);
    const [muted, setMuted] = useState<boolean>(() => {
        try {
            return JSON.parse(localStorage.getItem("muted") || "false");
        } catch {
            return false;
        }
    });
    const [guestForfeitModal, setGuestForfeitModal] = useState(false);
    const [hostForfeitModal, setHostForfeitModal] = useState(false);
    const [rankedForfeitModal, setRankedForfeitModal] = useState(false);
    const [guestForfeitVictoryModal, setGuestForfeitVictoryModal] = useState(false);
    const [guestExitConfirmModal, setGuestExitConfirmModal] = useState(false);
    const [showWaitingGuest, setShowWaitingGuest] = useState(false);
    const [userUsername, setUserUsername] = useState("");
    const [languageDropdown, setLanguageDropdown] = useState(false);
    const [hasExited, setHasExited] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const [filtersSelected, setFiltersSelected] = useState<any>([]);
    const [pushFirestore, setPushFirestore] = useState<any>(false);
    const [fighters, setFighters] = useState<Fighter[]>([]);
    const [difficulty, setDifficulty] = useState("MEDIUM");
    const [timerLength, setTimerLength] = useState("-2");

    // Fighter state declarations
    const [fighter00, setFighter00] = useState<any>(null);
    const [fighter01, setFighter01] = useState<any>(null);
    const [fighter02, setFighter02] = useState<any>(null);
    const [fighter10, setFighter10] = useState<any>(null);
    const [fighter11, setFighter11] = useState<any>(null);
    const [fighter12, setFighter12] = useState<any>(null);
    const [fighter20, setFighter20] = useState<any>(null);
    const [fighter21, setFighter21] = useState<any>(null);
    const [fighter22, setFighter22] = useState<any>(null);

    const [positionsFighters, setPositionsFighters] = useState<any>({
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

    const prevGuestNow = useRef<string | null>(null);

    const stateRole = (location.state as any)?.role;
    const statePlayerName = (location.state as any)?.name;
    const stateIsRanked = (location.state as any)?.isRanked;
    const role = stateRole || roleParam;

    const isRankedRoom = (gameState?.isRankedRoom ?? isRanked) === true;

    // ===== HELPER FUNCTIONS =====

    const playSfx = (src: string) => {
        if (muted) return;
        try {
            const a = new Audio(src);
            a.volume = 0.9;
            a.play();
        } catch { }
    };

    // Note: updatePlayerStats, switchTurn, resetTimerFirestore, changeLanguage, handleLanguageClick
    // are implemented in Room.tsx with detailed logic, so we don't redefine them here

    // ===== LOAD USERNAME =====
    useEffect(() => {
        if (currentUser?.email) {
            const userRef = doc(db, "users", currentUser.email);
            getDoc(userRef).then((docSnap) => {
                if (docSnap.exists()) {
                    setUserUsername(docSnap.data().username || "");
                }
            });
        }
    }, [currentUser?.email]);

    // ===== SAVE MUTED PREFERENCE =====
    useEffect(() => {
        try {
            localStorage.setItem("muted", JSON.stringify(muted));
        } catch { }
    }, [muted]);

    // Return all state and functions
    return {
        // State
        gameState,
        setGameState,
        guest,
        setGuest,
        turn,
        setTurn,
        gameStarted,
        setGameStarted,
        filters,
        setFilters,
        selected,
        setSelected,
        showConfetti,
        setShowConfetti,
        muted,
        setMuted,
        guestForfeitModal,
        setGuestForfeitModal,
        hostForfeitModal,
        setHostForfeitModal,
        rankedForfeitModal,
        setRankedForfeitModal,
        guestForfeitVictoryModal,
        setGuestForfeitVictoryModal,
        guestExitConfirmModal,
        setGuestExitConfirmModal,
        showWaitingGuest,
        setShowWaitingGuest,
        userUsername,
        languageDropdown,
        setLanguageDropdown,
        hasExited,
        setHasExited,
        isExiting,
        setIsExiting,
        filtersSelected,
        setFiltersSelected,
        pushFirestore,
        setPushFirestore,
        fighters,
        setFighters,
        difficulty,
        setDifficulty,
        timerLength,
        setTimerLength,
        fighter00, setFighter00,
        fighter01, setFighter01,
        fighter02, setFighter02,
        fighter10, setFighter10,
        fighter11, setFighter11,
        fighter12, setFighter12,
        fighter20, setFighter20,
        fighter21, setFighter21,
        fighter22, setFighter22,
        positionsFighters,
        setPositionsFighters,
        prevGuestNow,
        isRankedRoom,
        role,
        roomId,
        // Functions
        playSfx,
    };
};
