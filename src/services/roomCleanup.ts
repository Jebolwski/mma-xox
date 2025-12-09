import { db } from "../firebase";
import {
    collection, query, where, getDocs, Timestamp, orderBy, deleteDoc,
} from "firebase/firestore";

export const ROOM_TTL_MINUTES = 5; // 10 minutes
export const ROOM_TTL_MS = ROOM_TTL_MINUTES * 60 * 1000;

// Helper: Firestore Timestamp/number'dan ms çıkar
const toMillis = (ts: any): number | null => {
    if (!ts) return null;
    if (typeof ts.toMillis === "function") return ts.toMillis();
    if (typeof ts === "number") return ts;
    return null;
};

// Helper: lastMs -> şimdiye kadar geçen süre (h, m)
const elapsedHM = (lastMs: number) => {
    const diff = Date.now() - lastMs;
    const h = Math.floor(diff / 3_600_000);
    const m = Math.floor((diff % 3_600_000) / 60_000);
    return { h, m, iso: new Date(lastMs).toISOString() };
};

export async function logStaleRoomsByLastActivity(
    minutesAgo = ROOM_TTL_MINUTES,
    remove = true
) {
    const roomsRef = collection(db, "rooms");
    const threshold = Timestamp.fromMillis(Date.now() - minutesAgo * 60_000);


    const q = query(
        roomsRef,
        where("isRankedRoom", "==", false),
        where("lastActivityAt", "<", threshold),
        orderBy("lastActivityAt", "asc")
    );

    const snap = await getDocs(q);

    let deleted = 0;
    for (const d of snap.docs) {
        const data: any = d.data();
        const ms = toMillis(data?.lastActivityAt);
        const info = ms ? elapsedHM(ms) : null;

        if (remove) {
            try {
                await deleteDoc(d.ref);
                deleted++;
            } catch (e: any) {
                console.warn(`[cleanup] delete failed: ${d.id}`, e?.code || e);
            }
        }
    }

    if (remove) {
    }
}

export async function cleanupStaleRankedRooms(
    minutesAgo = ROOM_TTL_MINUTES,
    remove = true
) {
    const roomsRef = collection(db, "rooms");
    const threshold = Timestamp.fromMillis(Date.now() - minutesAgo * 60_000);


    const q = query(
        roomsRef,
        where("isRankedRoom", "==", true),
        where("lastActivityAt", "<", threshold),
        orderBy("lastActivityAt", "asc")
    );

    const snap = await getDocs(q);

    let deleted = 0;
    for (const d of snap.docs) {
        const data: any = d.data();
        const ms = toMillis(data?.lastActivityAt);
        const info = ms ? elapsedHM(ms) : null;


        if (remove) {
            try {
                await deleteDoc(d.ref);
                deleted++;
            } catch (e: any) {
            }
        }
    }

    if (remove) {
    }
}

export async function cleanupAllStaleRooms(minutesAgo = ROOM_TTL_MINUTES) {

    try {
        await logStaleRoomsByLastActivity(minutesAgo, true);
    } catch (e) {
        console.error("[cleanup-all] Casual cleanup failed:", e);
    }

    try {
        await cleanupStaleRankedRooms(minutesAgo, true);
    } catch (e) {
        console.error("[cleanup-all] Ranked cleanup failed:", e);
    }

}