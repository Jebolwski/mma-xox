import { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom"; // Link EKLENDİ
import { useTranslation } from "react-i18next";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  startAfter,
  DocumentData,
  getCountFromServer,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { usePageTitle } from "../hooks/usePageTitle";

type Row = {
  id: string;
  email: string;
  username: string;
  points: number;
  wins: number;
  losses: number;
  draws: number;
  totalGames: number;
  winRate: number;
  avatarUrl?: string;
};

const PAGE_SIZE = 25;

// YENİ: Google avatar URL'sini yüksek kaliteli versiyona çevir
const getHighQualityAvatarUrl = (url: string | undefined): string => {
  if (!url) return "https://via.placeholder.com/40";
  // Google avatar URL'lerinin sonundaki =s96-c parametresini s300-c olarak değiştir
  return url.replace(/=s\d+-c$/, "=s300-c");
};

export default function WorldRanking() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);
  // ...existing code...

  const [rows, setRows] = useState<Row[]>([]);
  const [supplementaryRows, setSupplementaryRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [languageDropdown, setLanguageDropdown] = useState(false);
  const { t, i18n } = useTranslation();

  usePageTitle(`MMA XOX - ${t("ranking.title")}`);
  // current user rank info
  const [myRank, setMyRank] = useState<number | null>(null);
  const [myRow, setMyRow] = useState<Row | null>(null);

  console.log(myRank, myRow);

  const mapUserDoc = (docSnap: any): Row => {
    const d = docSnap.data() || {};
    const s = d.stats || {};
    return {
      id: docSnap.id,
      email: d.email ?? docSnap.id,
      username: d.username ?? (d.email ? d.email.split("@")[0] : "User"),
      points: Number(s.points ?? 0),
      wins: Number(s.wins ?? 0),
      losses: Number(s.losses ?? 0),
      draws: Number(s.draws ?? 0),
      totalGames: Number(s.totalGames ?? 0),
      winRate: Number(s.winRate ?? 0),
      avatarUrl: d.avatarUrl,
    };
  };

  const fetchPage = async (cursor?: DocumentData | null) => {
    const base = collection(db, "users");
    const q = cursor
      ? query(
          base,
          orderBy("stats.points", "desc"),
          startAfter(cursor),
          limit(PAGE_SIZE),
        )
      : query(base, orderBy("stats.points", "desc"), limit(PAGE_SIZE));
    const snap = await getDocs(q);
    const list = snap.docs.map(mapUserDoc);
    const nextCursor = snap.docs.length
      ? snap.docs[snap.docs.length - 1]
      : null;
    return { list, nextCursor };
  };

  const loadInitial = async () => {
    setLoading(true);
    setError(null);
    try {
      const { list, nextCursor } = await fetchPage(null);
      setRows(list);
      console.log("messi, geliyoruz", currentUser, list);

      // compute my rank if signed in
      if (currentUser) {
        // find my row from docs
        let mine = list.find((r) => r.email === currentUser.email) || null;
        console.log(mine);

        if (mine) {
          // User found in first page (top 25)
          setMyRow(mine);
          setMyRank(list.indexOf(mine) + 1);
          setSupplementaryRows([]); // No supplementary needed
        } else {
          // User not in first page, search through all pages
          let rank = list.length; // Start after first page
          let cursor = nextCursor;
          let found = false;

          while (!found && cursor) {
            const { list: nextList, nextCursor: nextNextCursor } =
              await fetchPage(cursor);
            const foundInPage = nextList.find(
              (r) => r.email === currentUser.email,
            );

            if (foundInPage) {
              const userRank = rank + nextList.indexOf(foundInPage) + 1;
              setMyRow(foundInPage);
              setMyRank(userRank);

              // Get ±1 users around current user
              const myIndex = nextList.indexOf(foundInPage);
              const supplementary: Row[] = [];

              // Add 1 user before (if exists)
              if (myIndex > 0) {
                supplementary.push(nextList[myIndex - 1]);
              } else if (cursor) {
                // If user is first in this page, need to fetch previous page's last user
                // For now, we'll just skip it
              }

              // Add current user
              supplementary.push(foundInPage);

              // Add 1 user after (if exists)
              if (myIndex < nextList.length - 1) {
                supplementary.push(nextList[myIndex + 1]);
              } else if (nextNextCursor) {
                // If user is last in this page, need to fetch next page's first user
                const { list: followingList } = await fetchPage(nextNextCursor);
                if (followingList.length > 0) {
                  supplementary.push(followingList[0]);
                }
              }

              setSupplementaryRows(supplementary);
              found = true;
            } else {
              rank += nextList.length;
              cursor = nextNextCursor;
            }
          }

          if (!found) {
            setMyRow(null);
            setMyRank(null);
            setSupplementaryRows([]);
          }
        }
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load ranking");
    } finally {
      setLoading(false);
    }
  };

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

  const handleExit = async () => {
    navigate(-1);
  };

  useEffect(() => {
    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.email]);

  return (
    <>
      <div
        className={`min-h-[calc(100vh-61px)] w-full relative ${
          theme === "dark"
            ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
            : "bg-gradient-to-br from-blue-400 via-blue-300 to-green-400"
        }`}
      >
        {/* Background sparkles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(24)].map((_, i) => (
            <div
              key={i}
              className={`absolute rounded-full ${
                theme === "dark" ? "bg-yellow-300/80" : "bg-white/90"
              } animate-pulse`}
              style={{
                width: `${Math.random() * 3 + 2}px`,
                height: `${Math.random() * 3 + 2}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 90}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
                opacity: 0.8,
              }}
            />
          ))}
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8 lg:pt-24 pt-40">
          {currentUser && myRank && (
            <div
              className={`mb-6 rounded-xl p-4 border backdrop-blur-md ${
                theme === "dark"
                  ? "bg-slate-800/70 border-slate-700 text-white"
                  : "bg-white/80 border-slate-300 text-black"
              }`}
            >
              <h1 className="text-sm opacity-80 mb-1">
                {t("ranking.yourGlobalRank")}
              </h1>
              <div className="flex items-center justify-between">
                <div className="font-semibold md:text-base text-xs">
                  #{myRank}{" "}
                  {myRow?.username || currentUser.email?.split("@")[0]}
                </div>
                <div className="text-sm">
                  {t("ranking.points")}:{" "}
                  <span className="font-semibold">{myRow?.points ?? "-"}</span>
                </div>
              </div>
            </div>
          )}

          <div
            className={`rounded-2xl overflow-hidden border backdrop-blur-md ${
              theme === "dark"
                ? "bg-slate-800/70 border-slate-700"
                : "bg-white/90 border-slate-300"
            }`}
          >
            <div
              className={`grid grid-cols-5 md:grid-cols-7 gap-2 px-4 py-3 text-xs font-semibold ${
                theme === "dark" ? "text-slate-300" : "text-slate-600"
              }`}
            >
              <div className="w-8">{t("ranking.rank")}</div>
              <div className="w-8 hidden md:block"></div>
              <div className="col-span-2">{t("ranking.player")}</div>
              <div className="text-right">{t("ranking.points")}</div>
              <div className="text-right">{t("ranking.record")}</div>
              <div className="text-right hidden md:block">
                {t("ranking.winRate")}
              </div>
            </div>

            {loading && (
              <div
                className={`p-6 text-center text-sm opacity-70 ${
                  theme === "dark" ? "text-white" : "text-black"
                }`}
              >
                {t("ranking.loading")}
              </div>
            )}

            {/* TOP 25 LEADERBOARD */}
            {!loading &&
              rows.map((r, idx) => {
                const rank = idx + 1;
                const highlight =
                  currentUser &&
                  (r.email === currentUser.email ||
                    r.username === currentUser.email?.split("@")[0]);
                const trophy =
                  rank === 1
                    ? "🥇"
                    : rank === 2
                      ? "🥈"
                      : rank === 3
                        ? "🥉"
                        : null;
                const record = `${r.wins}-${r.losses}-${r.draws}`;
                return (
                  <Link
                    to={`/profile/${r.username}`}
                    key={r.id}
                    className={`grid grid-cols-5 md:grid-cols-7 gap-2 px-4 py-3 text-sm border-t transition-colors duration-200 items-center ${
                      theme === "dark"
                        ? "text-white border-slate-700 hover:bg-slate-700/50"
                        : "text-black border-slate-200 hover:bg-slate-100"
                    } ${
                      highlight
                        ? theme === "dark"
                          ? "bg-indigo-900/30"
                          : "bg-indigo-50"
                        : ""
                    }`}
                  >
                    <div className="font-semibold">#{rank}</div>
                    <div className="items-center justify-center hidden md:flex">
                      {r.avatarUrl ? (
                        <img
                          src={getHighQualityAvatarUrl(r.avatarUrl)}
                          alt="profile picture"
                          className="w-8 h-8 rounded-full object-cover bg-blue-600"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500"></div>
                      )}
                    </div>
                    <div className="col-span-2 truncate flex items-center gap-1">
                      {trophy && (
                        <span
                          className="text-lg"
                          aria-label="trophy"
                        >
                          {trophy}
                        </span>
                      )}
                      <span className="truncate md:text-base text-xs">
                        {r.username}
                      </span>
                    </div>
                    <div className="text-right font-semibold md:text-base text-xs">
                      {r.points}
                    </div>
                    <div className="text-right tabular-nums md:text-base text-xs">
                      {record}
                    </div>
                    <div className="text-right hidden md:block">
                      {r.winRate?.toFixed(1)}%
                    </div>
                  </Link> // YENİ
                );
              })}

            {!loading && rows.length === 0 && (
              <div className="p-6 text-center text-sm opacity-70">
                {t("ranking.noPlayersFound")}
              </div>
            )}

            {/* SUPPLEMENTARY ROWS (±1 around user if outside top 25) */}
            {!loading &&
              supplementaryRows.length > 0 &&
              myRank &&
              myRank > 25 && (
                <>
                  <div
                    className={`px-4 py-2 text-xs font-semibold text-center ${
                      theme === "dark"
                        ? "bg-slate-700/50 text-slate-300"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    · · · · · · · · · ·
                  </div>
                  {supplementaryRows.map((r, idx) => {
                    const indexInSupplementary = supplementaryRows.indexOf(r);
                    let actualRank = (myRank ?? 0) - 1 + indexInSupplementary;
                    const highlight = r.email === currentUser?.email;
                    const trophy =
                      actualRank === 1
                        ? "🥇"
                        : actualRank === 2
                          ? "🥈"
                          : actualRank === 3
                            ? "🥉"
                            : null;
                    const record = `${r.wins}-${r.losses}-${r.draws}`;
                    return (
                      <Link
                        to={`/profile/${r.username}`}
                        key={r.id}
                        className={`grid grid-cols-5 md:grid-cols-7 gap-2 px-4 py-3 text-sm border-t transition-colors duration-200 items-center ${
                          theme === "dark"
                            ? "text-white border-slate-700 hover:bg-slate-700/50"
                            : "text-black border-slate-200 hover:bg-slate-100"
                        } ${
                          highlight
                            ? theme === "dark"
                              ? "bg-indigo-900/30"
                              : "bg-indigo-50"
                            : ""
                        }`}
                      >
                        <div className="font-semibold">#{actualRank}</div>
                        <div className="items-center justify-center hidden md:flex">
                          {r.avatarUrl ? (
                            <img
                              src={getHighQualityAvatarUrl(r.avatarUrl)}
                              alt="profile picture"
                              className="w-8 h-8 rounded-full object-cover bg-blue-600"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500"></div>
                          )}
                        </div>
                        <div className="col-span-2 truncate flex items-center gap-1">
                          {trophy && (
                            <span
                              className="text-lg"
                              aria-label="trophy"
                            >
                              {trophy}
                            </span>
                          )}
                          <span className="truncate md:text-base text-xs">
                            {r.username}
                          </span>
                        </div>
                        <div className="text-right font-semibold md:text-base text-xs">
                          {r.points}
                        </div>
                        <div className="text-right tabular-nums md:text-base text-xs">
                          {record}
                        </div>
                        <div className="text-right hidden md:block">
                          {r.winRate?.toFixed(1)}%
                        </div>
                      </Link>
                    );
                  })}
                </>
              )}
          </div>

          {error && (
            <div className="mt-4 text-center text-sm text-red-500">{error}</div>
          )}
        </div>
      </div>
    </>
  );
}
