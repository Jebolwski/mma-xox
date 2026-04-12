import { db } from "../firebase";
import {
    collection, query, where, getDocs, Timestamp, orderBy, deleteDoc,
} from "firebase/firestore";

// Room'ların TTL süresi (5 dakika sonra silinecek)
export const ROOM_TTL_MINUTES = 5;
export const ROOM_TTL_MS = ROOM_TTL_MINUTES * 60 * 1000;

// Firestore Timestamp'ı millisecond'a dönüştür
// Eğer zaten number ise olduğu gibi döndür, Timestamp nesnesi ise toMillis() çağır
const toMillis = (ts: any): number | null => {
    if (!ts) return null;
    if (typeof ts.toMillis === "function") return ts.toMillis();
    if (typeof ts === "number") return ts;
    return null;
};

// Tüm eski room'ları sil (casual ve ranked farketmez)
// @param minutesAgo: Bu kaç dakika önceki room'ları sil (varsayılan: 5 dakika)
export async function cleanupAllStaleRooms(minutesAgo = ROOM_TTL_MINUTES) {
    const roomsRef = collection(db, "rooms");
    // Eşikteki timestamp'ı hesapla (şimdi - minutesAgo dakika)
    const threshold = Timestamp.fromMillis(Date.now() - minutesAgo * 60_000);

    // Tüm room'ları query et: sadece lastActivityAt < threshold
    // isRankedRoom kontrol etmiyoruz, herkes silebilsin
    const q = query(
        roomsRef,
        where("lastActivityAt", "<", threshold),
        orderBy("lastActivityAt", "asc")
    );

    try {
        const snap = await getDocs(q);
        let deleted = 0;

        // Her eski room'u işle
        for (const d of snap.docs) {
            try {
                // Önce: Room'daki tüm messages'ı sil
                const messagesRef = collection(db, "rooms", d.id, "messages");
                const msgSnap = await getDocs(messagesRef);
                for (const msgDoc of msgSnap.docs) {
                    await deleteDoc(msgDoc.ref);
                }
                // Sonra: Room'u kendisini sil
                await deleteDoc(d.ref);
                deleted++;
            } catch (e: any) {
                console.warn(`[cleanup] delete failed: ${d.id}`, e?.code || e);
            }
        }

        // console.log(`[cleanup] ${deleted} room(s) deleted`);
    } catch (e) {
        console.error("[cleanup] Cleanup failed:", e);
    }
}