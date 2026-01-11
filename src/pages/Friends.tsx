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
  setDoc,
  getDoc,
  getDocs,
} from "firebase/firestore";
import { useTranslation } from "react-i18next";
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
import trFlag from "../assets/tr.png";
import enFlag from "../assets/en.jpg";
import dark from "../assets/dark.png";
import light from "../assets/light.png";

type Req = {
  id: string;
  fromEmail: string;
  toEmail: string;
  status: string;
  createdAt?: string;
};

export default function Friends() {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const me = currentUser?.email || "";
  const [incoming, setIncoming] = useState<Req[]>([]);
  const [sent, setSent] = useState<Req[]>([]);
  const [friends, setFriends] = useState<string[]>([]);
  const [docFriends, setDocFriends] = useState<string[]>([]);
  const [acceptedFriends, setAcceptedFriends] = useState<string[]>([]);
  const [addUsername, setAddUsername] = useState("");
  const [friendsUsernames, setFriendsUsernames] = useState<{
    [email: string]: string;
  }>({});

  const [friendsLoading, setFriendsLoading] = useState(true);
  const [docLoaded, setDocLoaded] = useState(false);
  const [acceptedLoaded, setAcceptedLoaded] = useState(false);
  const [languageDropdown, setLanguageDropdown] = useState(false);

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

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
    setLanguageDropdown(false);
  };

  const handleLanguageClick = () => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(min-width: 768px)").matches
    ) {
      // Desktop / md+ -> open dropdown
      setLanguageDropdown(!languageDropdown);
    } else {
      // Mobile -> toggle language directly
      const newLang = i18n.language === "tr" ? "en" : "tr";
      changeLanguage(newLang);
    }
  };

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
    navigate(-1);
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

    // Friends'lerin username'lerini çek
    const fetchUsernames = async () => {
      const usernames: { [email: string]: string } = {};
      for (const email of merged) {
        try {
          const userDoc = await getDoc(doc(db, "users", email));
          if (userDoc.exists()) {
            usernames[email] = userDoc.data().username || email.split("@")[0];
          } else {
            usernames[email] = email.split("@")[0];
          }
        } catch {
          usernames[email] = email.split("@")[0];
        }
      }
      setFriendsUsernames(usernames);
    };

    fetchUsernames();
    if (docLoaded && acceptedLoaded) setFriendsLoading(false);
  }, [docFriends, acceptedFriends, docLoaded, acceptedLoaded]);

  const canUse = useMemo(() => !!me, [me]);

  return (
    <div
      className={`min-h-[calc(100vh-61px)] w-full relative ${
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

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-10 lg:pt-24 pt-32">
        {!canUse && (
          <div
            className={`rounded-xl p-4 mb-6 border text-center ${
              theme === "dark"
                ? "bg-slate-800/70 border-slate-700 text-white"
                : "bg-white/80 border-slate-300 text-slate-800"
            }`}
          >
            {t("friends.pleaseLoginToUseFriends")}
          </div>
        )}

        {canUse && (
          <div className="grid md:grid-cols-3 gap-6">
            <div
              className={`rounded-xl p-4 border ${
                theme === "dark"
                  ? "bg-slate-800/70 border-slate-700 text-white"
                  : "bg-white/80 border-slate-300 text-slate-800"
              }`}
            >
              <div className="font-semibold mb-3">{t("friends.addFriend")}</div>
              <input
                type="text"
                placeholder={t("friends.usernameLabel")}
                value={addUsername}
                onChange={(e) => setAddUsername(e.target.value.trim())}
                className={`w-full px-3 py-2 rounded-lg border mb-3 ${
                  theme === "dark"
                    ? "bg-slate-900 border-slate-700 text-white"
                    : "bg-white border-slate-300"
                }`}
              />
              <button
                onClick={async () => {
                  try {
                    if (!addUsername) {
                      toast.error(t("friends.pleaseEnterUsername"));
                      return;
                    }

                    // Username'den email'i bul
                    const q = query(
                      collection(db, "users"),
                      where("username", "==", addUsername)
                    );
                    const result = await getDocs(q);

                    if (result.empty) {
                      toast.error(t("friends.usernameNotFound"));
                      return;
                    }

                    const friendEmail = result.docs[0].id;
                    await sendFriendRequest(me, friendEmail);
                    setAddUsername("");
                    toast.success(t("friends.friendRequestSent"));
                  } catch (e: any) {
                    toast.error(e.message || t("friends.failedToSendRequest"));
                  }
                }}
                className={`w-full py-2 rounded-lg font-semibold cursor-pointer ${
                  theme === "dark"
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                    : "bg-indigo-500 hover:bg-indigo-600 text-white"
                }`}
              >
                {t("friends.sendRequest")}
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
              <div className="font-semibold mb-3">{t("friends.incoming")}</div>
              {incoming.length === 0 && (
                <div className="text-sm opacity-70">
                  {t("friends.noIncomingRequests")}
                </div>
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
                      {t("friends.accept")}
                    </button>
                    <button
                      onClick={() => declineFriendRequest(r.id)}
                      className="px-3 py-1 rounded-lg bg-slate-500 text-white text-sm cursor-pointer"
                    >
                      {t("friends.decline")}
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
              <div className="font-semibold mb-3">{t("friends.sent")}</div>
              {sent.length === 0 && (
                <div className="text-sm opacity-70">
                  {t("friends.noPendingRequests")}
                </div>
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
                    {t("friends.cancel")}
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
            <div className="font-semibold mb-3">
              {t("friends.friendsList")} ({friends.length})
            </div>
            {friendsLoading && (
              <div className="flex items-center gap-2 text-sm opacity-70">
                <span className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                {t("friends.loadingFriends")}
              </div>
            )}
            {!friendsLoading && friends.length === 0 && (
              <div className="text-sm opacity-70">
                {t("friends.noFriendsYet")}
              </div>
            )}
            {!friendsLoading && friends.length > 0 && (
              <div className="space-y-2">
                {friends.map((e) => (
                  <div
                    key={e}
                    className="flex items-center justify-between py-2 border-b last:border-none border-slate-600/30"
                  >
                    <div
                      className="truncate cursor-pointer hover:text-indigo-500 transition"
                      onClick={() =>
                        navigate(
                          `/profile/${encodeURIComponent(
                            (
                              friendsUsernames[e] || e.split("@")[0]
                            ).toLowerCase()
                          )}`
                        )
                      }
                    >
                      {(friendsUsernames[e] || e.split("@")[0]).slice(0, 14)}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          navigate(
                            `/available-rooms?invite=${encodeURIComponent(e)}`
                          )
                        }
                        className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-sm cursor-pointer"
                      >
                        {t("friends.invite")}
                      </button>
                      <button
                        onClick={() => removeFriend(me, e)}
                        className="px-3 py-1 rounded-lg bg-red-600 text-white text-sm cursor-pointer"
                      >
                        {t("friends.remove")}
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
