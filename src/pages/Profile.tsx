import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { ToastContainer, toast } from "react-toastify";
import return_img from "../assets/return.png";

interface UserStats {
  points: number;
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  level: string;
  createdAt: string;
  lastActive: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tiersOpen, setTiersOpen] = useState(false);

  useEffect(() => {
    if (!tiersOpen) return;
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && setTiersOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tiersOpen]);

  // Basit rank kademeleri (puan aralıkları ve ikonlar)
  const RANK_TIERS = [
    {
      name: "Bronze",
      min: 0,
      max: 99,
      icon: "🥉",
      color: "from-orange-400 to-orange-600",
      note: "Yeni başlayanlar için.",
    },
    {
      name: "Silver",
      min: 100,
      max: 299,
      icon: "🥈",
      color: "from-gray-300 to-gray-500",
      note: "Temel deneyim sahibi.",
    },
    {
      name: "Gold",
      min: 300,
      max: 599,
      icon: "🥇",
      color: "from-yellow-400 to-yellow-600",
      note: "İleri seviye oyuncu.",
    },
    {
      name: "Diamond",
      min: 600,
      max: Infinity,
      icon: "💎",
      color: "from-cyan-400 to-blue-600",
      note: "En yüksek kademe.",
    },
  ];

  // Level hesaplama fonksiyonu
  const calculateLevel = (points: number) => {
    const tier = RANK_TIERS.slice()
      .reverse()
      .find((tier) => points >= tier.min);
    return tier || RANK_TIERS[0];
  };

  // Progress bar hesaplama
  const calculateProgress = (points: number) => {
    const tier = RANK_TIERS.slice()
      .reverse()
      .find((tier) => points >= tier.min);
    if (!tier) return 0;
    const { min, max } = tier;
    return ((points - min) / (max - min)) * 100;
  };

  // Sonraki level için gerekli puan
  const getNextLevelPoints = (points: number) => {
    const tier = RANK_TIERS.slice()
      .reverse()
      .find((tier) => points >= tier.min);
    if (!tier) return "Max Level";
    const nextTier = RANK_TIERS[RANK_TIERS.indexOf(tier) - 1];
    if (!nextTier) return "Max Level";
    return `${nextTier.min - points} points to ${nextTier.name}`;
  };

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    const fetchUserStats = async () => {
      try {
        const userRef = doc(db, "users", currentUser.email!);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          // İlk kez giriş yapan kullanıcı için varsayılan stats oluştur
          const defaultStats: UserStats = {
            points: 100,
            totalGames: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            winRate: 0,
            level: "Silver",
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString(),
          };

          await setDoc(userRef, {
            email: currentUser.email,
            username: currentUser.email?.split("@")[0] || "User",
            stats: defaultStats,
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString(),
          });

          setUserStats(defaultStats);
        } else {
          const userData = userDoc.data();
          setUserStats(userData.stats);
        }
      } catch (error) {
        console.error("Error fetching user stats:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [currentUser, navigate]);

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          theme === "dark"
            ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
            : "bg-gradient-to-br from-blue-400 via-blue-300 to-green-400"
        }`}
      >
        <div
          className={`text-2xl font-semibold animate-pulse ${
            theme === "dark" ? "text-white" : "text-slate-800"
          }`}
        >
          Loading Profile...
        </div>
      </div>
    );
  }

  if (!userStats) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          theme === "dark"
            ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
            : "bg-gradient-to-br from-blue-400 via-blue-300 to-green-400"
        }`}
      >
        <div className="text-2xl font-semibold">Failed to load profile</div>
      </div>
    );
  }

  const level = calculateLevel(userStats.points);
  const progress = calculateProgress(userStats.points);
  const nextLevelInfo = getNextLevelPoints(userStats.points);

  return (
    <div
      className={`min-h-screen relative overflow-hidden transition-all duration-1000 ${
        theme === "dark"
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
          : "bg-gradient-to-br from-blue-400 via-blue-300 to-green-400"
      }`}
    >
      <ToastContainer
        position="bottom-right"
        theme={theme === "dark" ? "dark" : "light"}
      />

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 ${
              theme === "dark" ? "bg-blue-300" : "bg-white"
            } rounded-full animate-pulse`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Theme Toggle */}
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

      {/* Back Button */}
      <div className="absolute z-30 top-6 right-6">
        <div
          onClick={() => navigate("/menu")}
          className={`p-2 rounded-full border-2 transition-all duration-300 hover:scale-105 cursor-pointer shadow-xl backdrop-blur-md ${
            theme === "dark"
              ? "bg-slate-800/90 border-slate-600 text-slate-200 hover:bg-slate-700/90"
              : "bg-white/90 border-slate-300 text-slate-700 hover:bg-white"
          }`}
        >
          <div className="flex gap-2 items-center">
            <img
              src={return_img}
              className="w-6"
              alt="Back"
            />
            <p className="font-semibold">Back to Menu</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex justify-center items-center min-h-screen p-6">
        <div
          className={`max-w-2xl w-full rounded-2xl backdrop-blur-md border-4 shadow-2xl p-8 lg:mt-8 mt-20 ${
            theme === "dark"
              ? "bg-slate-800/90 border-slate-600 text-white"
              : "bg-white/90 border-slate-300 text-slate-800"
          }`}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-3 mb-4">
              <div className="text-6xl">👤</div>
              <div>
                <h1 className="text-3xl font-bold">
                  {currentUser?.email?.split("@")[0]}
                </h1>
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  {currentUser?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Level Badge */}
          <div className="text-center mb-8">
            <div
              className={`inline-block px-6 py-3 rounded-2xl bg-gradient-to-r ${level.color} text-white shadow-lg`}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{level.icon}</span>
                <span className="text-xl font-bold">{level.name}</span>
              </div>
            </div>
            <div className="mt-4">
              <div
                className={`w-full bg-gray-300 rounded-full h-3 ${
                  theme === "dark" ? "bg-slate-700" : ""
                }`}
              >
                <div
                  className={`h-3 rounded-full bg-gradient-to-r ${level.color} transition-all duration-1000`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p
                className={`text-sm mt-2 ${
                  theme === "dark" ? "text-slate-400" : "text-slate-600"
                }`}
              >
                {nextLevelInfo}
              </p>
            </div>
          </div>

          {/* Points */}
          <div className="text-center mb-8">
            <div
              className={`inline-block px-8 py-4 rounded-xl border-2 ${
                theme === "dark"
                  ? "bg-slate-700/50 border-slate-600"
                  : "bg-slate-100/50 border-slate-300"
              }`}
            >
              <div className="text-4xl font-bold text-yellow-500">
                {userStats.points}
              </div>
              <div
                className={`text-sm ${
                  theme === "dark" ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Total Points
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div
              className={`text-center p-4 rounded-xl border ${
                theme === "dark"
                  ? "bg-slate-700/30 border-slate-600"
                  : "bg-slate-100/30 border-slate-300"
              }`}
            >
              <div className="text-2xl font-bold text-blue-500">
                {userStats.totalGames}
              </div>
              <div
                className={`text-xs ${
                  theme === "dark" ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Total Games
              </div>
            </div>

            <div
              className={`text-center p-4 rounded-xl border ${
                theme === "dark"
                  ? "bg-slate-700/30 border-slate-600"
                  : "bg-slate-100/30 border-slate-300"
              }`}
            >
              <div className="text-2xl font-bold text-green-500">
                {userStats.wins}
              </div>
              <div
                className={`text-xs ${
                  theme === "dark" ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Wins
              </div>
            </div>

            <div
              className={`text-center p-4 rounded-xl border ${
                theme === "dark"
                  ? "bg-slate-700/30 border-slate-600"
                  : "bg-slate-100/30 border-slate-300"
              }`}
            >
              <div className="text-2xl font-bold text-red-500">
                {userStats.losses}
              </div>
              <div
                className={`text-xs ${
                  theme === "dark" ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Losses
              </div>
            </div>

            <div
              className={`text-center p-4 rounded-xl border ${
                theme === "dark"
                  ? "bg-slate-700/30 border-slate-600"
                  : "bg-slate-100/30 border-slate-300"
              }`}
            >
              <div className="text-2xl font-bold text-yellow-500">
                {userStats.draws}
              </div>
              <div
                className={`text-xs ${
                  theme === "dark" ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Draws
              </div>
            </div>
          </div>

          {/* Win Rate */}
          {userStats.totalGames > 0 && (
            <div className="text-center">
              <div
                className={`inline-block px-6 py-3 rounded-xl border ${
                  theme === "dark"
                    ? "bg-slate-700/30 border-slate-600"
                    : "bg-slate-100/30 border-slate-300"
                }`}
              >
                <div className="text-lg font-semibold">
                  Win Rate:{" "}
                  <span className="text-green-500">
                    {userStats.winRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Member Since */}
          <div
            className={`text-center mt-6 text-sm ${
              theme === "dark" ? "text-slate-400" : "text-slate-600"
            }`}
          >
            Member since: {new Date(userStats.createdAt).toLocaleDateString()}
          </div>

          {/* Rank kademeleri butonu (modal açar) */}
          <div className="mt-8 text-center">
            <button
              onClick={() => setTiersOpen(true)}
              className={`px-5 py-2 rounded-lg cursor-pointer font-semibold shadow-md transition ${
                theme === "dark"
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                  : "bg-indigo-500 hover:bg-indigo-600 text-white"
              }`}
            >
              Rank kademelerini gör
            </button>
          </div>

          {/* Rank Modal */}
          {tiersOpen && (
            <div className="fixed inset-0 z-50">
              {/* Arkaplan (tüm sayfayı kapla) */}
              <div
                className={`absolute inset-0 rounded-xl ${
                  theme === "dark" ? "bg-black/70" : "bg-black/40"
                }`}
                onClick={() => setTiersOpen(false)}
              />

              {/* Merkezleyici katman */}
              <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
                {/* İçerik kutusu */}
                <div
                  role="dialog"
                  aria-modal="true"
                  className={`w-full max-w-3xl rounded-2xl -mt-42 border shadow-2xl ${
                    theme === "dark"
                      ? "bg-slate-800 border-slate-700 text-slate-100"
                      : "bg-white border-slate-300 text-slate-800"
                  } max-h-[85vh] overflow-y-auto`}
                >
                  <div className="flex justify-between items-center p-5 pb-3 sticky top-0 bg-inherit">
                    <h3 className="text-xl font-semibold">Rank Kademeleri</h3>
                    <button
                      onClick={() => setTiersOpen(false)}
                      className={`px-3 py-1 cursor-pointer rounded-md text-sm ${
                        theme === "dark"
                          ? "bg-slate-700 hover:bg-slate-600"
                          : "bg-slate-200 hover:bg-slate-300"
                      }`}
                      aria-label="Close"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="p-5 pt-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {RANK_TIERS.map((tier) => (
                        <div
                          key={tier.name}
                          className={`rounded-xl p-3 border ${
                            theme === "dark"
                              ? "bg-slate-800/70 border-slate-700"
                              : "bg-white/80 border-slate-300"
                          }`}
                        >
                          {/* Başlık: ikon + küçük nötr etiket (İngilizce) */}
                          <div className="flex flex-col items-center gap-2">
                            <div
                              className={`w-12 h-12 rounded-full grid place-items-center text-xl text-white shadow-md bg-gradient-to-br ${tier.color}`}
                            >
                              <span>{tier.icon}</span>
                            </div>
                            <div
                              className={`text-[11px] font-medium tracking-wider uppercase ${
                                theme === "dark"
                                  ? "text-slate-300"
                                  : "text-slate-600"
                              }`}
                            >
                              {tier.name}
                            </div>
                          </div>

                          {/* İçerik */}
                          <div
                            className={`mt-3 text-sm text-center ${
                              theme === "dark"
                                ? "text-slate-300"
                                : "text-slate-700"
                            }`}
                          >
                            <div>
                              Points range:
                              <span className="font-semibold">
                                {" "}
                                {tier.max === Infinity
                                  ? `${tier.min}+`
                                  : `${tier.min}–${tier.max}`}
                              </span>
                            </div>
                            <div
                              className={`text-xs mt-1 ${
                                theme === "dark"
                                  ? "text-slate-400"
                                  : "text-slate-600"
                              }`}
                            >
                              {tier.note}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
