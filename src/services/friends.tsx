import {
  addDoc,
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  updateDoc,
  where,
  arrayUnion,
  arrayRemove,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";

export async function sendFriendRequest(fromEmail: string, toEmail: string) {
  if (!fromEmail || !toEmail) throw new Error("Invalid emails");
  if (fromEmail === toEmail) throw new Error("You cannot add yourself");

  // Zaten arkadaş mı?
  const fromRef = doc(db, "users", fromEmail);
  const fromSnap = await getDoc(fromRef);
  const friends: string[] = fromSnap.data()?.friends || [];
  if (friends.includes(toEmail)) throw new Error("Already friends");

  // Açık bekleyen istek var mı?
  const q = query(
    collection(db, "friendRequests"),
    where("fromEmail", "==", fromEmail),
    where("toEmail", "==", toEmail),
    where("status", "==", "pending")
  );
  const existing = await getDocs(q);
  if (!existing.empty) throw new Error("Request already sent");

  await addDoc(collection(db, "friendRequests"), {
    fromEmail,
    toEmail,
    status: "pending",
    createdAt: new Date().toISOString(),
  });
}

// ...existing code...
export async function acceptFriendRequest(
  reqId: string,
  fromEmail: string,
  toEmail: string
) {
  const reqRef = doc(db, "friendRequests", reqId);
  await updateDoc(reqRef, { status: "accepted" });

  // users dokümanları yoksa oluştur + friends'e ekle
  await setDoc(
    doc(db, "users", fromEmail),
    { email: fromEmail, friends: arrayUnion(toEmail) },
    { merge: true }
  );
  await setDoc(
    doc(db, "users", toEmail),
    { email: toEmail, friends: arrayUnion(fromEmail) },
    { merge: true }
  );
}

export async function declineFriendRequest(reqId: string) {
  const reqRef = doc(db, "friendRequests", reqId);
  await updateDoc(reqRef, { status: "declined" });
}

export async function cancelFriendRequest(reqId: string) {
  const reqRef = doc(db, "friendRequests", reqId);
  await updateDoc(reqRef, { status: "cancelled" });
}

export async function removeFriend(aEmail: string, bEmail: string) {
  const a = (aEmail || "").trim().toLowerCase();
  const b = (bEmail || "").trim().toLowerCase();

  // 1) Accepted friendRequests'leri iki yönde de bul ve sil
  const col = collection(db, "friendRequests");
  const q1 = query(
    col,
    where("fromEmail", "==", a),
    where("toEmail", "==", b),
    where("status", "==", "accepted")
  );
  const q2 = query(
    col,
    where("fromEmail", "==", b),
    where("toEmail", "==", a),
    where("status", "==", "accepted")
  );

  const [s1, s2] = await Promise.all([getDocs(q1), getDocs(q2)]);
  const all = [...s1.docs, ...s2.docs];
  await Promise.all(all.map((d) => deleteDoc(d.ref)));

  // 2) (Opsiyonel) users.{friends} temizliği – kullanıyorsan tut
  try {
    await updateDoc(doc(db, "users", a), { friends: arrayRemove(b) });
  } catch {}
  try {
    await updateDoc(doc(db, "users", b), { friends: arrayRemove(a) });
  } catch {}
}
