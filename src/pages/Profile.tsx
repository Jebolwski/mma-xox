import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom"; // useParams EKLENDİ
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { ToastContainer, toast } from "react-toastify";
import return_img from "../assets/return.png";
import { usePageTitle } from "../hooks/usePageTitle";
import { updatePassword } from "firebase/auth";

// --- YENİ: Profil veri yapısı arayüzü ---
interface UserProfile {
  username: string;
  email: string;
  avatarUrl: string;
  activeTitle: string;
  unlockedTitles: string[];
  lastUsernameChangeAt?: string; // YENİ: Son username değişikliği tarihi
  stats: {
    points: number;
    totalGames: number;
    wins: number;
    losses: number;
    draws: number;
    winRate: number;
  };
  achievements: Record<string, string>;
  createdAt: string;
}

// --- YENİ: Başarım tanımları ---
const achievementsList = {
  firstWin: { name: "First Blood", description: "Get your first ranked win." },
  tenWins: { name: "Arena Master", description: "Win 10 ranked matches." },
  flawlessVictory: {
    name: "Flawless Victory",
    description: "Win a match without making any mistakes.",
  },
};

const Profile = () => {
  const navigate = useNavigate();
  const { username } = useParams<{ username: string }>(); // YENİ: URL'den username'i al
  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);
  // --- GÜNCELLENDİ: State'i tek bir profile nesnesi olarak tut ---
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [tiersOpen, setTiersOpen] = useState(false);
  const [titlesOpen, setTitlesOpen] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showChangeUsername, setShowChangeUsername] = useState(false); // YENİ
  const [newUsername, setNewUsername] = useState(""); // YENİ
  const [usernameLoading, setUsernameLoading] = useState(false); // YENİ
  const [canChangeUsername, setCanChangeUsername] = useState(true); // YENİ

  // YENİ: Kendi profilimiz mi diye kontrol et
  const isMyProfile = profile ? currentUser?.email === profile.email : false;

  usePageTitle("MMA XOX - Profile");

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
      note: "For beginners.",
    },
    {
      name: "Silver",
      min: 100,
      max: 299,
      icon: "🥈",
      color: "from-gray-300 to-gray-500",
      note: "Basic experience.",
    },
    {
      name: "Gold",
      min: 300,
      max: 599,
      icon: "🥇",
      color: "from-yellow-400 to-yellow-600",
      note: "Advanced player.",
    },
    {
      name: "Diamond",
      min: 600,
      max: Infinity,
      icon: "💎",
      color: "from-cyan-400 to-blue-600",
      note: "Top tier.",
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
    if (!username) {
      navigate("/menu");
      return;
    }

    const fetchUserProfile = async () => {
      try {
        // Username'le sorgu yap
        // NOTE: 'username' field'ının Firestore'da indexed olduğundan emin ol
        const q = query(
          collection(db, "users"),
          where("username", "==", username)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const data = snap.docs[0].data() as UserProfile;
          setProfile(data);

          // YENİ: Username değişim hakkını kontrol et
          const lastChange = data.lastUsernameChangeAt
            ? new Date(data.lastUsernameChangeAt)
            : null;
          const now = new Date();
          const twoDotsInMs = 2 * 24 * 60 * 60 * 1000; // 2 günü milisaniyeye çevir

          if (lastChange) {
            const timeDiff = now.getTime() - lastChange.getTime();
            if (timeDiff < twoDotsInMs) {
              setCanChangeUsername(false);
            } else {
              setCanChangeUsername(true);
            }
          } else {
            // İlk kez açılıyorsa değiştirebilir
            setCanChangeUsername(true);
          }

          return;
        }

        // not found
        console.error("User profile not found for username:", username);
        toast.error("Could not find the profile.");
        setProfile(null);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [username, navigate]);

  // --- YENİ: Unvan değiştirme fonksiyonu ---
  const handleTitleChange = async (newTitle: string) => {
    if (!currentUser?.email || !profile || profile.activeTitle === newTitle)
      return;

    const userRef = doc(db, "users", currentUser.email);
    try {
      await updateDoc(userRef, { activeTitle: newTitle });
      setProfile((prev) => (prev ? { ...prev, activeTitle: newTitle } : null));
      toast.success("Title updated!");
      setTitlesOpen(false);
    } catch (error) {
      toast.error("Failed to update title.");
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !currentPassword || !confirmPassword) {
      toast.error("Please fill all password fields!");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match!");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters!");
      return;
    }

    if (newPassword === currentPassword) {
      toast.error("New password must be different from current password!");
      return;
    }

    setPasswordLoading(true);
    try {
      if (!currentUser) {
        toast.error("Not authenticated!");
        return;
      }

      // Şifreyi güncelle
      await updatePassword(currentUser, newPassword);
      toast.success("Password changed successfully!");
      setShowChangePassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      if (error.code === "auth/weak-password") {
        toast.error("Password is too weak!");
      } else if (error.code === "auth/wrong-password") {
        toast.error("Current password is incorrect!");
      } else {
        toast.error(error.message);
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  // YENİ: Username değiştirme fonksiyonu
  const handleChangeUsername = async () => {
    if (!newUsername || !currentUser?.email || !profile) {
      toast.error("Invalid input!");
      return;
    }

    const desiredUsername = newUsername.toLowerCase().trim();

    // Validation
    if (desiredUsername.length < 3) {
      toast.error("Username must be at least 3 characters!");
      return;
    }

    if (desiredUsername.length > 14) {
      toast.error("Username cannot be longer than 14 characters!");
      return;
    }

    if (!/^[a-z0-9_-]+$/.test(desiredUsername)) {
      toast.error(
        "Username can only contain letters, numbers, underscore and dash!"
      );
      return;
    }

    if (desiredUsername === profile.username) {
      toast.error("New username must be different from current!");
      return;
    }

    // 2 gün kontrolü
    if (!canChangeUsername) {
      const lastChange = new Date(profile.lastUsernameChangeAt || "");
      const nextChange = new Date(
        lastChange.getTime() + 2 * 24 * 60 * 60 * 1000
      );
      const daysLeft = Math.ceil(
        (nextChange.getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000)
      );
      toast.error(`You can change username again in ${daysLeft} days!`);
      return;
    }

    setUsernameLoading(true);
    try {
      // Check if new username is already taken
      const usernameQuery = query(
        collection(db, "users"),
        where("username", "==", desiredUsername)
      );
      const usernameSnap = await getDocs(usernameQuery);
      if (!usernameSnap.empty) {
        toast.error("Username already taken. Try another.");
        setUsernameLoading(false);
        return;
      }

      // Update username
      const userRef = doc(db, "users", currentUser.email);
      await updateDoc(userRef, {
        username: desiredUsername,
        lastUsernameChangeAt: new Date().toISOString(),
      });

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              username: desiredUsername,
              lastUsernameChangeAt: new Date().toISOString(),
            }
          : null
      );

      toast.success("Username changed successfully!");
      setShowChangeUsername(false);
      setNewUsername("");
      setCanChangeUsername(false);

      // 2 saniye sonra profil sayfasına yönlendir (yeni username ile)
      setTimeout(() => {
        navigate(`/profile/${desiredUsername}`);
      }, 2000);
    } catch (error) {
      console.error("Error changing username:", error);
      toast.error("Failed to change username!");
    } finally {
      setUsernameLoading(false);
    }
  };

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

  // --- GÜNCELLENDİ: Artık !profile kontrolü yapılıyor ---
  if (!profile) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          theme === "dark"
            ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
            : "bg-gradient-to-br from-blue-400 via-blue-300 to-green-400"
        }`}
      >
        <div
          className={
            theme == "dark"
              ? "text-2xl text-white font-semibold"
              : "text-2xl text-black font-semibold"
          }
        >
          Failed to load profile
        </div>
      </div>
    );
  }

  // --- GÜNCELLENDİ: Değişkenler profile'dan alınıyor ---
  const level = calculateLevel(profile.stats.points);
  const progress = calculateProgress(profile.stats.points);
  const nextLevelInfo = getNextLevelPoints(profile.stats.points);

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
            <p className="font-semibold">Go Back</p>
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
          {/* --- GÜNCELLENDİ: Header --- */}
          <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-4 mb-4">
              <img
                src={profile.avatarUrl}
                alt="avatar"
                className="w-20 h-20 rounded-full hidden sm:block border-4 border-red-500"
              />
              <div>
                <h1 className="text-3xl font-bold">
                  {profile.username.slice(0, 14)}
                </h1>
                <div
                  onClick={() => isMyProfile && setTitlesOpen(true)} // GÜNCELLENDİ: Sadece kendi profilinde tıkla
                  className={`text-lg flex items-center gap-2 justify-center font-semibold transition-transform ${
                    isMyProfile
                      ? "cursor-pointer hover:scale-105"
                      : "cursor-default"
                  } ${
                    theme === "dark" ? "text-yellow-400" : "text-yellow-600"
                  }`}
                >
                  <p>{profile.activeTitle}</p>
                  {/* GÜNCELLENDİ: Sadece kendi profilinde kalemi göster */}
                  {isMyProfile && <span className="text-sm">✏️</span>}
                </div>
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

          {/* Şifremi Değiştir Butonu - Sadece kendi profilinde göster */}
          {isMyProfile && (
            <div className="text-center mb-8 space-y-3">
              <button
                onClick={() => setShowChangeUsername(true)}
                className={`block w-full px-6 py-2 cursor-pointer rounded-lg font-semibold transition-all duration-300 ${
                  theme === "dark"
                    ? "bg-blue-700/80 hover:bg-blue-600 text-slate-100 border border-blue-600"
                    : "bg-blue-200/80 hover:bg-blue-300 text-slate-800 border border-blue-300"
                } hover:scale-105`}
              >
                {canChangeUsername
                  ? "👤 Change Username"
                  : "👤 Change Username (2 days cooldown)"}
              </button>
              <button
                onClick={() => setShowChangePassword(true)}
                className={`block w-full px-6 py-2 cursor-pointer rounded-lg font-semibold transition-all duration-300 ${
                  theme === "dark"
                    ? "bg-slate-700/80 hover:bg-slate-600 text-slate-100 border border-slate-600"
                    : "bg-slate-200/80 hover:bg-slate-300 text-slate-800 border border-slate-300"
                } hover:scale-105`}
              >
                🔐 Change Password
              </button>
            </div>
          )}

          {/* --- GÜNCELLENDİ: Points ve Stats Grid (profile.stats kullanımı) --- */}
          <div className="text-center mb-8">
            <div
              className={`inline-block px-8 py-4 rounded-xl border-2 ${
                theme === "dark"
                  ? "bg-slate-700/50 border-slate-600"
                  : "bg-slate-100/50 border-slate-300"
              }`}
            >
              <div className="text-4xl font-bold text-yellow-500">
                {profile.stats.points}
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div
              className={`text-center p-4 rounded-xl border ${
                theme === "dark"
                  ? "bg-slate-700/30 border-slate-600"
                  : "bg-slate-100/30 border-slate-300"
              }`}
            >
              <div className="text-2xl font-bold text-blue-500">
                {profile.stats.totalGames}
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
                {profile.stats.wins}
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
                {profile.stats.losses}
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
                {profile.stats.draws}
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
          {profile.stats.totalGames > 0 && (
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
                    {profile.stats.winRate.toFixed(1)}%
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
            Member since: {new Date(profile.createdAt).toLocaleDateString()}
          </div>

          {/* --- YENİ: Başarımlar Bölümü --- */}
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-4 text-center">Achievements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(achievementsList).map(([key, value]) => (
                <div
                  key={key}
                  className={`p-4 rounded-lg border ${
                    profile.achievements[key] ? "opacity-100" : "opacity-40"
                  } ${
                    theme === "dark"
                      ? "bg-slate-700/50 border-slate-600"
                      : "bg-slate-100/50 border-slate-300"
                  }`}
                >
                  <h3 className="font-bold text-md">
                    {value.name} {profile.achievements[key] ? "🏆" : "🔒"}
                  </h3>
                  <p className="text-sm">{value.description}</p>
                  {profile.achievements[key] && (
                    <p className="text-xs text-green-400 mt-1">
                      Unlocked:{" "}
                      {new Date(profile.achievements[key]).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
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
              See rank levels
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
              <div className="relative z-10 flex min-h-screen items-center justify-center p-4 lg:mt-0 mt-5">
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
                    <h3 className="text-xl font-semibold">Rank Levels</h3>
                    <button
                      onClick={() => setTiersOpen(false)}
                      className={`px-3 py-1 cursor-pointer duration-200 rounded-md text-sm ${
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

          {/* --- YENİ: Unvan Seçme Modalı --- */}
          {titlesOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 rounded-xl"
              onClick={() => setTitlesOpen(false)}
            >
              <div
                className={`relative z-10 p-6 rounded-xl w-full max-w-md ${
                  theme === "dark" ? "bg-slate-800" : "bg-white"
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">Select a Title</h3>
                  <button
                    onClick={() => setTitlesOpen(false)}
                    className={`px-2 py-1 rounded-lg font-semibold text-sm cursor-pointer transition ${
                      theme === "dark"
                        ? "bg-slate-700 hover:bg-slate-600 text-slate-200"
                        : "bg-slate-200 hover:bg-slate-300 text-slate-800"
                    }`}
                  >
                    ✕
                  </button>
                </div>
                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                  {profile.unlockedTitles.map((title) => (
                    <button
                      key={title}
                      onClick={() => handleTitleChange(title)}
                      disabled={profile.activeTitle === title}
                      className={`w-full p-3 rounded-lg cursor-pointer text-left font-semibold transition ${
                        profile.activeTitle === title
                          ? "bg-green-600 text-white cursor-not-allowed"
                          : theme === "dark"
                          ? "bg-slate-700 hover:bg-slate-600"
                          : "bg-slate-200 hover:bg-slate-300"
                      }`}
                    >
                      {title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Şifre Değiştirme Modal - Sadece kendi profilime bakıyorsam göster */}
      {showChangePassword && isMyProfile && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-6">
          <div
            className={`p-8 rounded-2xl shadow-2xl border backdrop-blur-md w-full max-w-md transition-all duration-300 ${
              theme === "dark"
                ? "bg-slate-800/90 border-slate-600/50 text-slate-100"
                : "bg-white/90 border-slate-200/50 text-slate-800"
            }`}
          >
            <h2 className="text-2xl font-bold mb-6 text-center">
              Change Password
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 ${
                    theme === "dark"
                      ? "bg-slate-700/80 border-slate-600/50 text-white placeholder-slate-400 focus:ring-purple-500/50"
                      : "bg-white/80 border-slate-300/50 text-slate-800 placeholder-slate-500 focus:ring-indigo-500/50"
                  }`}
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 ${
                    theme === "dark"
                      ? "bg-slate-700/80 border-slate-600/50 text-white placeholder-slate-400 focus:ring-purple-500/50"
                      : "bg-white/80 border-slate-300/50 text-slate-800 placeholder-slate-500 focus:ring-indigo-500/50"
                  }`}
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !passwordLoading) {
                      handleChangePassword();
                    }
                  }}
                  className={`w-full px-4 py-3 rounded-xl border backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 ${
                    theme === "dark"
                      ? "bg-slate-700/80 border-slate-600/50 text-white placeholder-slate-400 focus:ring-purple-500/50"
                      : "bg-white/80 border-slate-300/50 text-slate-800 placeholder-slate-500 focus:ring-indigo-500/50"
                  }`}
                  placeholder="••••••••"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowChangePassword(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  disabled={passwordLoading}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    passwordLoading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:scale-105 cursor-pointer"
                  } ${
                    theme === "dark"
                      ? "bg-slate-700 hover:bg-slate-600 text-slate-200 border-2 border-slate-600"
                      : "bg-slate-400 hover:bg-slate-500 text-white border-2 border-slate-300"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={passwordLoading}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    passwordLoading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:scale-105 cursor-pointer hover:shadow-xl"
                  } bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg`}
                >
                  {passwordLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* YENİ: Change Username Modal */}
      {showChangeUsername && isMyProfile && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-6">
          <div
            className={`p-8 rounded-2xl shadow-2xl border backdrop-blur-md w-full max-w-md transition-all duration-300 ${
              theme === "dark"
                ? "bg-slate-800/90 border-slate-600/50 text-slate-100"
                : "bg-white/90 border-slate-200/50 text-slate-800"
            }`}
          >
            <h2 className="text-2xl font-bold mb-2 text-center">
              Change Username
            </h2>
            {!canChangeUsername && (
              <p className="text-center text-sm text-orange-500 mb-4">
                ⏳ You can change username again in 2 days
              </p>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  New Username
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  disabled={!canChangeUsername || usernameLoading}
                  maxLength={14}
                  className={`w-full px-4 py-3 rounded-xl border backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 ${
                    theme === "dark"
                      ? "bg-slate-700/80 border-slate-600/50 text-white placeholder-slate-400 focus:ring-blue-500/50"
                      : "bg-white/80 border-slate-300/50 text-slate-800 placeholder-slate-500 focus:ring-blue-500/50"
                  } ${
                    !canChangeUsername || usernameLoading
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  placeholder="New Username"
                />
                <p className="text-xs mt-1 text-slate-500">
                  3-14 characters, letters, numbers, underscore and dash allowed
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowChangeUsername(false);
                    setNewUsername("");
                  }}
                  disabled={usernameLoading}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    usernameLoading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:scale-105 cursor-pointer"
                  } ${
                    theme === "dark"
                      ? "bg-slate-700 hover:bg-slate-600 text-slate-200 border-2 border-slate-600"
                      : "bg-slate-400 hover:bg-slate-500 text-white border-2 border-slate-300"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangeUsername}
                  disabled={usernameLoading || !canChangeUsername}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    usernameLoading || !canChangeUsername
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:scale-105 cursor-pointer hover:shadow-xl"
                  } bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg`}
                >
                  {usernameLoading ? "Updating..." : "Update Username"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
