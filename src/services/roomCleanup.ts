import { db } from "../firebase";
import {
    collection, query, where, getDocs, Timestamp, writeBatch,
} from "firebase/firestore";

export const ROOM_TTL_MS = 6 * 60 * 60 * 1000; // 6 saat

export async function cleanupStaleRooms(limit = 50, includeRanked = false) {
    const roomsRef = collection(db, "rooms");
    const threshold = Timestamp.fromMillis(Date.now() - ROOM_TTL_MS);
    console.log(threshold);


    // Casual (herkese açık silinebilir)
    const qCasual = query(
        roomsRef,
        where("isRankedRoom", "==", false),
        where("lastActivityAt", "<", threshold)
    );

    const batch = writeBatch(db);
    let count = 0;

    const s1 = await getDocs(qCasual);
    for (const d of s1.docs) {
        if (count >= limit) break;
        batch.delete(d.ref);
        count++;
    }

    // Ranked (login gerektirir; rules zaten kontrol ediyor)
    if (includeRanked) {
        // in_progress olmayanlar
        const stages = ["waiting", "ready", "finished"]; // index gerekebilir
        for (const st of stages) {
            if (count >= limit) break;
            console.log(st);

            const qRanked = query(
                roomsRef,
                where("isRankedRoom", "==", true),
                where("stage", "==", st),
                where("lastActivityAt", "<", threshold)
            );
            const s2 = await getDocs(qRanked);
            for (const d of s2.docs) {
                if (count >= limit) break;
                batch.delete(d.ref);
                count++;
            }
        }
    }

    if (count > 0) await batch.commit();
    return count;
}