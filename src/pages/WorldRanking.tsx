import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
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
import return_img from "../assets/return.png";

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
};

const PAGE_SIZE = 25;

export default function WorldRanking() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);
  // ...existing code...

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<DocumentData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // current user rank info
  const [myRank, setMyRank] = useState<number | null>(null);
  const [myRow, setMyRow] = useState<Row | null>(null);

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
    };
  };

  const fetchPage = async (cursor?: DocumentData | null) => {
    const base = collection(db, "users");
    const q = cursor
      ? query(
          base,
          orderBy("stats.points", "desc"),
          startAfter(cursor),
          limit(PAGE_SIZE)
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
      setLastDoc(nextCursor);

      // compute my rank if signed in
      if (currentUser) {
        // find my row from docs, or fetch my doc if not in the first page
        const mine = list.find((r) => r.email === currentUser.email) || null;
        setMyRow(mine || null);

        // rank = count(users with points > myPoints) + 1
        // if user doc might not exist, skip
        const myPoints = mine?.points;
        if (myPoints != null) {
          const base = collection(db, "users");
          const countSnap = await getCountFromServer(
            query(base, where("stats.points", ">", myPoints))
          );
          setMyRank(countSnap.data().count + 1);
        } else {
          setMyRank(null);
        }
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load ranking");
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!lastDoc || loadingMore) return;
    setLoadingMore(true);
    try {
      const { list, nextCursor } = await fetchPage(lastDoc);
      setRows((prev) => [...prev, ...list]);
      setLastDoc(nextCursor);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleExit = async () => {
    navigate("/menu");
  };

  useEffect(() => {
    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.email]);

  return (
    <div
      className={`min-h-screen w-full relative ${
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

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center mb-10">
          <h1
            className={`text-2xl font-bold ${
              theme === "dark" ? "text-white" : "text-slate-800"
            }`}
          >
            World Ranking
          </h1>
        </div>

        {currentUser && myRank && (
          <div
            className={`mb-6 rounded-xl p-4 border ${
              theme === "dark"
                ? "bg-slate-800/70 border-slate-700 text-white"
                : "bg-white/80 border-slate-300 text-black"
            }`}
          >
            <div className="text-sm opacity-80 mb-1">Your global rank</div>
            <div className="flex items-center justify-between">
              <div className="font-semibold">
                #{myRank} {myRow?.username || currentUser.email?.split("@")[0]}
              </div>
              <div className="text-sm">
                Points:{" "}
                <span className="font-semibold">{myRow?.points ?? "-"}</span>
              </div>
            </div>
          </div>
        )}

        <div
          className={`rounded-2xl overflow-hidden border ${
            theme === "dark"
              ? "bg-slate-800/80 border-slate-700"
              : "bg-white/90 border-slate-300"
          }`}
        >
          <div
            className={`grid grid-cols-6 gap-2 px-4 py-3 text-xs font-semibold ${
              theme === "dark" ? "text-slate-300" : "text-slate-600"
            }`}
          >
            <div>#</div>
            <div className="col-span-2">Player</div>
            <div className="text-right">Points</div>
            <div className="text-right">Record</div>
            <div className="text-right">Win Rate</div>
          </div>

          {loading && (
            <div
              className={`p-6 text-center text-sm opacity-70 ${
                theme === "dark" ? "text-white" : "text-black"
              }`}
            >
              Loading...
            </div>
          )}

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
                <div
                  key={r.id}
                  className={`grid grid-cols-6 gap-2 px-4 py-3 text-sm border-t ${
                    theme === "dark"
                      ? "text-white border-slate-700"
                      : "text-black border-slate-200"
                  } ${
                    highlight
                      ? theme === "dark"
                        ? "bg-indigo-900/30"
                        : "bg-indigo-50"
                      : ""
                  }`}
                >
                  <div className="font-semibold">#{rank}</div>
                  <div className="col-span-2 truncate flex items-center gap-2">
                    {trophy && (
                      <span
                        className="text-lg"
                        aria-label="trophy"
                      >
                        {trophy}
                      </span>
                    )}
                    <span className="truncate">{r.username}</span>
                  </div>
                  <div className="text-right font-semibold">{r.points}</div>
                  <div className="text-right tabular-nums">{record}</div>
                  <div className="text-right">{r.winRate?.toFixed(1)}%</div>
                </div>
              );
            })}

          {!loading && rows.length === 0 && (
            <div className="p-6 text-center text-sm opacity-70">
              No players found.
            </div>
          )}
        </div>

        {/* Load more */}
        <div className="flex justify-center py-6">
          <button
            disabled={!lastDoc || loadingMore}
            onClick={loadMore}
            className={`px-4 py-2 rounded-lg font-semibold ${
              theme === "dark"
                ? "bg-slate-700 hover:bg-slate-600 text-white disabled:bg-slate-600/60"
                : "bg-white/90 hover:bg-white text-slate-800 border border-slate-300 disabled:opacity-60"
            } ${lastDoc && !loadingMore ? "cursor-pointer" : "cursor-default"}`}
            aria-disabled={!lastDoc || loadingMore}
            aria-busy={loadingMore}
          >
            {lastDoc
              ? loadingMore
                ? "Loading..."
                : "Load more"
              : "End of list"}
          </button>
        </div>

        {error && (
          <div className="mt-4 text-center text-sm text-red-500">{error}</div>
        )}
      </div>
    </div>
  );
}
