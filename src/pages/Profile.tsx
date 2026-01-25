import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom"; // useParams EKLENDİ
import { useTranslation } from "react-i18next";
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
import { Helmet } from "react-helmet-async";
import { updatePassword } from "firebase/auth";
import light from "../assets/light.png";
import dark from "../assets/dark.png";
import trFlag from "../assets/tr.png";
import enFlag from "../assets/en.jpg";

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
  firstWin: {
    name: "profile.firstBlood",
    description: "profile.firstBloodDesc",
  },
  tenWins: {
    name: "profile.arenaMaster",
    description: "profile.arenamasterDesc",
  },
  flawlessVictory: {
    name: "profile.flawlessVictory",
    description: "profile.flawlessVictoryDesc",
  },
};

const Profile = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { username } = useParams<{ username: string }>(); // YENİ: URL'den username'i al
  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);
  // --- GÜNCELLENDİ: State'i tek bir profile nesnesi olarak tut ---
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [languageDropdown, setLanguageDropdown] = useState(false);
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
      note: t("profile.bronzeNote"),
    },
    {
      name: "Silver",
      min: 100,
      max: 299,
      icon: "🥈",
      color: "from-gray-300 to-gray-500",
      note: t("profile.silverNote"),
    },
    {
      name: "Gold",
      min: 300,
      max: 599,
      icon: "🥇",
      color: "from-yellow-400 to-yellow-600",
      note: t("profile.goldNote"),
    },
    {
      name: "Diamond",
      min: 600,
      max: Infinity,
      icon: "💎",
      color: "from-cyan-400 to-blue-600",
      note: t("profile.diamondNote"),
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
          where("username", "==", username),
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
        toast.error(t("profile.profileNotFound"));
        setProfile(null);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast.error(t("profile.loadProfileFailed"));
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
      toast.success(t("profile.titleUpdated"));
      setTitlesOpen(false);
    } catch (error) {
      toast.error(t("profile.titleUpdateFailed"));
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !currentPassword || !confirmPassword) {
      toast.error(t("profile.fillPasswordFields"));
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(t("profile.passwordsDontMatch"));
      return;
    }

    if (newPassword.length < 6) {
      toast.error(t("profile.passwordTooShort"));
      return;
    }

    if (newPassword === currentPassword) {
      toast.error(t("profile.passwordMustDiffer"));
      return;
    }

    setPasswordLoading(true);
    try {
      if (!currentUser) {
        toast.error(t("profile.notAuthenticated"));
        return;
      }

      // Şifreyi güncelle
      await updatePassword(currentUser, newPassword);
      toast.success(t("profile.passwordChanged"));
      setShowChangePassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      if (error.code === "auth/weak-password") {
        toast.error(t("profile.passwordTooWeak"));
      } else if (error.code === "auth/wrong-password") {
        toast.error(t("profile.incorrectPassword"));
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
      toast.error(t("profile.invalidInput"));
      return;
    }

    const desiredUsername = newUsername.toLowerCase().trim();

    // Validation
    if (desiredUsername.length < 3) {
      toast.error(t("profile.usernameTooShort"));
      return;
    }

    if (desiredUsername.length > 14) {
      toast.error(t("profile.usernameTooLong"));
      return;
    }

    if (!/^[a-z0-9_-]+$/.test(desiredUsername)) {
      toast.error(t("profile.usernameInvalidChars"));
      return;
    }

    if (desiredUsername === profile.username) {
      toast.error(t("profile.usernameMustDiffer"));
      return;
    }

    // 2 gün kontrolü
    if (!canChangeUsername) {
      const lastChange = new Date(profile.lastUsernameChangeAt || "");
      const nextChange = new Date(
        lastChange.getTime() + 2 * 24 * 60 * 60 * 1000,
      );
      const daysLeft = Math.ceil(
        (nextChange.getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000),
      );
      toast.error(t("profile.usernameCooldown", { days: daysLeft }));
      return;
    }

    setUsernameLoading(true);
    try {
      // Check if new username is already taken
      const usernameQuery = query(
        collection(db, "users"),
        where("username", "==", desiredUsername),
      );
      const usernameSnap = await getDocs(usernameQuery);
      if (!usernameSnap.empty) {
        toast.error(t("profile.usernameTaken"));
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
          : null,
      );

      toast.success(t("profile.usernameChanged"));
      setShowChangeUsername(false);
      setNewUsername("");
      setCanChangeUsername(false);

      // 2 saniye sonra profil sayfasına yönlendir (yeni username ile)
      setTimeout(() => {
        navigate(`/profile/${desiredUsername}`);
      }, 2000);
    } catch (error) {
      console.error("Error changing username:", error);
      toast.error(t("profile.failedChangeUsername"));
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
          {t("profile.loading")}
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
          {t("profile.failed")}
        </div>
      </div>
    );
  }

  // --- GÜNCELLENDİ: Değişkenler profile'dan alınıyor ---
  const level = calculateLevel(profile.stats.points);
  const progress = calculateProgress(profile.stats.points);
  const nextLevelInfo = getNextLevelPoints(profile.stats.points);

  return (
    <>
      <Helmet>
        <title>Profile - MMA XOX</title>
        <meta
          name="description"
          content="View your MMA XOX profile, stats, achievements, and ranked standing."
        />
        <meta
          name="robots"
          content="noindex, follow"
        />
      </Helmet>
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

        {/* Main Content */}
        <div className="relative z-10 flex justify-center items-center min-h-screen p-6">
          <div
            className={`max-w-2xl w-full rounded-2xl backdrop-blur-md border-4 shadow-2xl p-8 ${
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
                    ? t("profile.changeUsername")
                    : t("profile.changeUsernameDisabled")}
                </button>
                <button
                  onClick={() => setShowChangePassword(true)}
                  className={`block w-full px-6 py-2 cursor-pointer rounded-lg font-semibold transition-all duration-300 ${
                    theme === "dark"
                      ? "bg-slate-700/80 hover:bg-slate-600 text-slate-100 border border-slate-600"
                      : "bg-slate-200/80 hover:bg-slate-300 text-slate-800 border border-slate-300"
                  } hover:scale-105`}
                >
                  {t("profile.changePassword")}
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
                  {t("profile.totalPoints")}
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
                  {t("profile.totalGames")}
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
                  {t("ranking.wins")}
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
                  {t("ranking.losses")}
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
                  {t("ranking.draws")}
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
                    {t("profile.winRate")}{" "}
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
              {t("profile.memberSince")}{" "}
              {new Date(profile.createdAt).toLocaleDateString()}
            </div>

            {/* --- YENİ: Başarımlar Bölümü --- */}
            <div className="mt-6">
              <h2 className="text-xl font-bold mb-4 text-center">
                {t("profile.achievements")}
              </h2>
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
                      {t(value.name)} {profile.achievements[key] ? "🏆" : "🔒"}
                    </h3>
                    <p className="text-sm">{t(value.description)}</p>
                    {profile.achievements[key] && (
                      <p className="text-xs text-green-400 mt-1">
                        {t("profile.unlocked")}{" "}
                        {new Date(
                          profile.achievements[key],
                        ).toLocaleDateString()}
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
                {t("profile.seeRankLevels")}
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
                      <h3 className="text-xl font-semibold">
                        {t("profile.rankLevels")}
                      </h3>
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
                                {t("profile.pointsRange")}
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
                    <h3 className="text-xl font-bold">
                      {t("profile.selectTitle")}
                    </h3>
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
                {t("profile.changePassword")}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t("profile.currentPassword")}
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
                    {t("profile.newPassword")}
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
                    {t("profile.confirmNewPassword")}
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
                    {t("common.cancel")}
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
                    {passwordLoading
                      ? t("profile.updating")
                      : t("profile.updatePassword")}
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
                {t("profile.changeUsername")}
              </h2>
              {!canChangeUsername && (
                <p className="text-center text-sm text-orange-500 mb-4">
                  {t("profile.cooldownMessage")}
                </p>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t("profile.newUsername")}
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
                    {t("profile.usernameHint")}
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
                    {t("common.cancel")}
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
                    {usernameLoading
                      ? t("profile.updating")
                      : t("profile.updateUsername")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Profile;
