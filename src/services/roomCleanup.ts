import { db } from "../firebase";
import {
    collection, query, where, getDocs, Timestamp, orderBy, limit as qLimit,
    deleteDoc,
} from "firebase/firestore";

export const ROOM_TTL_HOURS = 1; // 1 hour
export const ROOM_TTL_MS = ROOM_TTL_HOURS * 60 * 60 * 1000;

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
    max = 50,
    hoursAgo = ROOM_TTL_MS / 3_600_000,
    remove = true // true gönderirsen siler
) {
    const roomsRef = collection(db, "rooms");
    const threshold = Timestamp.fromMillis(Date.now() - hoursAgo * 3_600_000);

    console.log("CLSAJHDLASHCDALSCŞD");


    console.log(`[preview] threshold: ${new Date(threshold.toMillis()).toISOString()}`);

    // Sadece lastActivityAt'a göre filtrele
    const q = query(
        roomsRef,
        where("isRankedRoom", "==", false), // guest için şart
        where("lastActivityAt", "<", threshold),
        orderBy("lastActivityAt", "asc")
    );


    const snap = await getDocs(q);
    console.log(`[preview] found ${snap.size} rooms older than threshold`);

    let deleted = 0;
    for (const d of snap.docs) {
        const data: any = d.data();
        const ms = toMillis(data?.lastActivityAt);
        const info = ms ? elapsedHM(ms) : null;
        console.log(
            `[preview] ${d.id} | ranked=${!!data?.isRankedRoom} | stage=${data?.stage ?? "-"} | lastActivityAt=${info?.iso ?? "n/a"} | idle=${info ? `${info.h}h ${info.m}m` : "n/a"}`
        );

        console.log(remove, "allah allah");

        if (remove) {
            try {
                await deleteDoc(d.ref);
                deleted++;
                console.log(`[preview] deleted: ${d.id}`);
            } catch (e: any) {
                console.warn(`[preview] delete failed: ${d.id}`, e?.code || e);
            }
        }
    }

    if (remove) {
        console.log(`[preview] total deleted: ${deleted}/${snap.size}`);
    }
}