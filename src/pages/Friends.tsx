import { useContext, useEffect, useMemo, useState } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  collection,
  onSnapshot,
  query,
  where,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { ToastContainer, toast } from "react-toastify";

import {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  cancelFriendRequest,
  removeFriend,
} from "../services/friends";
import return_img from "../assets/return.png";

type Req = {
  id: string;
  fromEmail: string;
  toEmail: string;
  status: string;
  createdAt?: string;
};

export default function Friends() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const me = currentUser?.email || "";
  const [incoming, setIncoming] = useState<Req[]>([]);
  const [sent, setSent] = useState<Req[]>([]);
  const [friends, setFriends] = useState<string[]>([]);
  const [docFriends, setDocFriends] = useState<string[]>([]);
  const [acceptedFriends, setAcceptedFriends] = useState<string[]>([]);
  const [addEmail, setAddEmail] = useState("");

  const [friendsLoading, setFriendsLoading] = useState(true);
  const [docLoaded, setDocLoaded] = useState(false);
  const [acceptedLoaded, setAcceptedLoaded] = useState(false);

  // Yıldızları bir kez üret (re-render'da zıplamasın)
  const stars = useMemo(
    () =>
      Array.from({ length: 72 }).map(() => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 1 + Math.random() * 2.5,
        delay: `${(Math.random() * 3).toFixed(2)}s`,
        duration: `${(2 + Math.random() * 3).toFixed(2)}s`,
        opacity: 0.35 + Math.random() * 0.45,
      })),
    []
  );

  useEffect(() => {
    if (!currentUser?.email) return;
    const ensure = async () => {
      await setDoc(
        doc(db, "users", currentUser.email!),
        { email: currentUser.email, friends: [] },
        { merge: true }
      );
    };
    ensure();
  }, [currentUser?.email]);

  const handleExit = async () => {
    navigate("/menu");
  };

  // Realtime incoming/sent
  useEffect(() => {
    if (!me) return;
    const qIn = query(
      collection(db, "friendRequests"),
      where("toEmail", "==", me),
      where("status", "==", "pending")
    );
    const unsubIn = onSnapshot(qIn, (snap) => {
      setIncoming(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    });

    const qOut = query(
      collection(db, "friendRequests"),
      where("fromEmail", "==", me),
      where("status", "==", "pending")
    );
    const unsubOut = onSnapshot(qOut, (snap) => {
      setSent(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    });

    return () => {
      unsubIn();
      unsubOut();
    };
  }, [me]);

  // me değişince loading'i tekrar aç
  useEffect(() => {
    setFriendsLoading(true);
    setDocLoaded(false);
    setAcceptedLoaded(false);
    setFriends([]);
    setDocFriends([]);
    setAcceptedFriends([]);
  }, [me]);

  // Friends list (users/{email}.friends)
  useEffect(() => {
    if (!me) return;
    const ref = doc(db, "users", me);
    const unsub = onSnapshot(ref, (snap) => {
      const list: string[] = (snap.data()?.friends as string[]) || [];
      setDocFriends(list);
      setDocLoaded(true);
    });
    return () => unsub();
  }, [me]);

  // Accepted friendRequests -> iki yönden topla
  useEffect(() => {
    if (!me) return;
    const qAcceptedOut = query(
      collection(db, "friendRequests"),
      where("fromEmail", "==", me),
      where("status", "==", "accepted")
    );
    const qAcceptedIn = query(
      collection(db, "friendRequests"),
      where("toEmail", "==", me),
      where("status", "==", "accepted")
    );

    let out: string[] = [];
    let inn: string[] = [];
    let outLoaded = false;
    let inLoaded = false;

    const mergeLocal = () => {
      const uniq = Array.from(new Set([...out, ...inn]));
      setAcceptedFriends(uniq);
    };

    const unsubA = onSnapshot(qAcceptedOut, (snap) => {
      out = snap.docs.map((d) => (d.data() as any).toEmail as string);
      outLoaded = true;
      mergeLocal();
      if (outLoaded && inLoaded) setAcceptedLoaded(true);
    });
    const unsubB = onSnapshot(qAcceptedIn, (snap) => {
      inn = snap.docs.map((d) => (d.data() as any).fromEmail as string);
      inLoaded = true;
      mergeLocal();
      if (outLoaded && inLoaded) setAcceptedLoaded(true);
    });

    return () => {
      unsubA();
      unsubB();
    };
  }, [me]);

  // İki kaynağı birleştir ve friends'e yaz
  useEffect(() => {
    const merged = Array.from(new Set([...docFriends, ...acceptedFriends]));
    setFriends(merged);
    if (docLoaded && acceptedLoaded) setFriendsLoading(false);
  }, [docFriends, acceptedFriends, docLoaded, acceptedLoaded]);

  const canUse = useMemo(() => !!me, [me]);

  return (
    <div
      className={`min-h-screen w-full relative ${
        theme === "dark"
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
          : "bg-gradient-to-br from-blue-400 via-blue-300 to-green-400"
      }`}
    >
      <ToastContainer
        position="bottom-right"
        theme="dark"
      />
      {/* Background stars & soft glows */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* soft glows */}
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl opacity-20 bg-indigo-400" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-20 bg-emerald-400" />
        {/* stars */}
        {stars.map((s, i) => (
          <span
            key={i}
            className={`absolute rounded-full ${
              theme === "dark" ? "bg-white/90" : "bg-white/90"
            } animate-pulse`}
            style={{
              width: `${s.size}px`,
              height: `${s.size}px`,
              left: `${s.left}%`,
              top: `${s.top}%`,
              opacity: s.opacity,
              animationDelay: s.delay as any,
              animationDuration: s.duration as any,
            }}
          />
        ))}
      </div>

      <div className="absolute z-30 top-6 left-6">
        <div
          onClick={toggleTheme}
          className={`p-3 rounded-full cursor-pointer transition-all duration-300 backdrop-blur-md border ${
            theme === "dark"
              ? "bg-slate-800/80 border-slate-600/50 hover:bg-slate-700/80"
              : "bg-white/80 border-slate-200/50 hover:bg-white/90"
          } shadow-xl hover:scale-110`}
        >
          {theme === "dark" ? (
            <img
              src="https://clipart-library.com/images/6iypd9jin.png"
              className="lg:w-6 lg:h-6 w-5 h-5"
              alt="Light mode"
            />
          ) : (
            <img
              src="https://clipart-library.com/img/1669853.png"
              className="lg:w-6 lg:h-6 w-5 h-5"
              alt="Dark mode"
            />
          )}
        </div>
      </div>

      <div
        className="absolute z-30 top-6 right-6"
        onClick={handleExit}
      >
        <div
          className={`p-2 rounded-full border-2 transition-all duration-300 hover:scale-105 cursor-pointer shadow-xl backdrop-blur-md ${
            theme === "dark"
              ? "bg-slate-800/90 border-slate-600 text-slate-200 hover:bg-slate-700/90"
              : "bg-white/90 border-slate-300 text-slate-700 hover:bg-white"
          }`}
        >
          <div className="flex gap-2 items-center">
            <img
              src={return_img || "/placeholder.svg"}
              className="w-6"
            />
            <p className="font-semibold">Back to menu</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-10">
        <h1
          className={`text-2xl font-bold text-center mb-8 ${
            theme === "dark" ? "text-white" : "text-slate-800"
          }`}
        >
          Friends
        </h1>

        {!canUse && (
          <div
            className={`rounded-xl p-4 mb-6 border text-center ${
              theme === "dark"
                ? "bg-slate-800/70 border-slate-700 text-white"
                : "bg-white/80 border-slate-300 text-slate-800"
            }`}
          >
            Please login to use friends.
          </div>
        )}

        {canUse && (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Add Friend */}
            <div
              className={`rounded-xl p-4 border ${
                theme === "dark"
                  ? "bg-slate-800/70 border-slate-700 text-white"
                  : "bg-white/80 border-slate-300 text-slate-800"
              }`}
            >
              <div className="font-semibold mb-3">Add friend</div>
              <input
                type="email"
                placeholder="friend@example.com"
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value.trim())}
                className={`w-full px-3 py-2 rounded-lg border mb-3 ${
                  theme === "dark"
                    ? "bg-slate-900 border-slate-700 text-white"
                    : "bg-white border-slate-300"
                }`}
              />
              <button
                onClick={async () => {
                  try {
                    await sendFriendRequest(me, addEmail);
                    setAddEmail("");
                    toast.success("Friend request sent");
                  } catch (e: any) {
                    alert(e.message || "Failed");
                  }
                }}
                className={`w-full py-2 rounded-lg font-semibold cursor-pointer ${
                  theme === "dark"
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                    : "bg-indigo-500 hover:bg-indigo-600 text-white"
                }`}
              >
                Send request
              </button>
            </div>

            {/* Incoming */}
            <div
              className={`rounded-xl p-4 border ${
                theme === "dark"
                  ? "bg-slate-800/70 border-slate-700 text-white"
                  : "bg-white/80 border-slate-300 text-slate-800"
              }`}
            >
              <div className="font-semibold mb-3">Incoming</div>
              {incoming.length === 0 && (
                <div className="text-sm opacity-70">No incoming requests</div>
              )}
              {incoming.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between py-2 border-b last:border-none border-slate-600/30"
                >
                  <div className="truncate">{r.fromEmail}</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        acceptFriendRequest(r.id, r.fromEmail, r.toEmail)
                      }
                      className="px-3 py-1 rounded-lg bg-green-600 text-white text-sm cursor-pointer"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => declineFriendRequest(r.id)}
                      className="px-3 py-1 rounded-lg bg-slate-500 text-white text-sm cursor-pointer"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Sent */}
            <div
              className={`rounded-xl p-4 border ${
                theme === "dark"
                  ? "bg-slate-800/70 border-slate-700 text-white"
                  : "bg-white/80 border-slate-300 text-slate-800"
              }`}
            >
              <div className="font-semibold mb-3">Sent</div>
              {sent.length === 0 && (
                <div className="text-sm opacity-70">No pending requests</div>
              )}
              {sent.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between py-2 border-b last:border-none border-slate-600/30"
                >
                  <div className="truncate">{r.toEmail}</div>
                  <button
                    onClick={() => cancelFriendRequest(r.id)}
                    className="px-3 py-1 rounded-lg bg-slate-500 text-white text-sm cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Friends list */}
        {canUse && (
          <div
            className={`mt-8 rounded-xl p-4 border ${
              theme === "dark"
                ? "bg-slate-800/70 border-slate-700 text-white"
                : "bg-white/80 border-slate-300 text-slate-800"
            }`}
          >
            <div className="font-semibold mb-3">Friends ({friends.length})</div>
            {friendsLoading && (
              <div className="flex items-center gap-2 text-sm opacity-70">
                <span className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                Loading friends...
              </div>
            )}
            {!friendsLoading && friends.length === 0 && (
              <div className="text-sm opacity-70">No friends yet</div>
            )}
            {!friendsLoading && friends.length > 0 && (
              <div className="space-y-2">
                {friends.map((e) => (
                  <div
                    key={e}
                    className="flex items-center justify-between py-2 border-b last:border-none border-slate-600/30"
                  >
                    <div className="truncate">{e}</div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          navigate(
                            `/available-rooms?invite=${encodeURIComponent(e)}`
                          )
                        }
                        className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-sm cursor-pointer"
                      >
                        Invite
                      </button>
                      <button
                        onClick={() => removeFriend(me, e)}
                        className="px-3 py-1 rounded-lg bg-red-600 text-white text-sm cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
