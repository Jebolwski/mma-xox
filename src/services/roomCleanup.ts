import { db } from "../firebase";
import {
    collection, query, where, getDocs, Timestamp, orderBy, deleteDoc,
} from "firebase/firestore";

export const ROOM_TTL_MINUTES = 10; // 10 minutes
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
    remove = true // true gönderirsen siler
) {
    const roomsRef = collection(db, "rooms");
    const threshold = Timestamp.fromMillis(Date.now() - minutesAgo * 60_000);

    console.log("[cleanup] Starting cleanup for casual rooms");
    console.log(`[cleanup] threshold: ${new Date(threshold.toMillis()).toISOString()}`);

    // Sadece casual (non-ranked) odaları temizle
    const q = query(
        roomsRef,
        where("isRankedRoom", "==", false),
        where("lastActivityAt", "<", threshold),
        orderBy("lastActivityAt", "asc")
    );

    const snap = await getDocs(q);
    console.log(`[cleanup] found ${snap.size} casual rooms older than threshold`);

    let deleted = 0;
    for (const d of snap.docs) {
        const data: any = d.data();
        const ms = toMillis(data?.lastActivityAt);
        const info = ms ? elapsedHM(ms) : null;
        console.log(
            `[cleanup] ${d.id} | stage=${data?.stage ?? "-"} | lastActivityAt=${info?.iso ?? "n/a"} | idle=${info ? `${info.h}h ${info.m}m` : "n/a"}`
        );

        if (remove) {
            try {
                await deleteDoc(d.ref);
                deleted++;
                console.log(`[cleanup] deleted: ${d.id}`);
            } catch (e: any) {
                console.warn(`[cleanup] delete failed: ${d.id}`, e?.code || e);
            }
        }
    }

    if (remove) {
        console.log(`[cleanup] total deleted: ${deleted}/${snap.size}`);
    }
}

// YENİ: Ranked odaları temizle
export async function cleanupStaleRankedRooms(
    minutesAgo = ROOM_TTL_MINUTES,
    remove = true
) {
    const roomsRef = collection(db, "rooms");
    const threshold = Timestamp.fromMillis(Date.now() - minutesAgo * 60_000);

    console.log("[cleanup-ranked] Starting cleanup for ranked rooms");
    console.log(`[cleanup-ranked] threshold: ${new Date(threshold.toMillis()).toISOString()}`);

    // Ranked odaları temizle
    const q = query(
        roomsRef,
        where("isRankedRoom", "==", true),
        where("lastActivityAt", "<", threshold),
        orderBy("lastActivityAt", "asc")
    );

    const snap = await getDocs(q);
    console.log(`[cleanup-ranked] found ${snap.size} ranked rooms older than threshold`);

    let deleted = 0;
    for (const d of snap.docs) {
        const data: any = d.data();
        const ms = toMillis(data?.lastActivityAt);
        const info = ms ? elapsedHM(ms) : null;
        console.log(
            `[cleanup-ranked] ${d.id} | host=${data?.host} | lastActivityAt=${info?.iso ?? "n/a"} | idle=${info ? `${info.h}h ${info.m}m` : "n/a"}`
        );

        if (remove) {
            try {
                await deleteDoc(d.ref);
                deleted++;
                console.log(`[cleanup-ranked] deleted: ${d.id}`);
            } catch (e: any) {
                console.warn(`[cleanup-ranked] delete failed: ${d.id}`, e?.code || e);
            }
        }
    }

    if (remove) {
        console.log(`[cleanup-ranked] total deleted: ${deleted}/${snap.size}`);
    }
}

// Hem casual hem ranked odaları temizle
export async function cleanupAllStaleRooms(minutesAgo = ROOM_TTL_MINUTES) {
    console.log("[cleanup-all] Starting full cleanup (casual + ranked)");

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

    console.log("[cleanup-all] Full cleanup completed");
}