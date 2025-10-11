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
  await updateDoc(doc(db, "users", aEmail), { friends: arrayRemove(bEmail) });
  await updateDoc(doc(db, "users", bEmail), { friends: arrayRemove(aEmail) });
}
