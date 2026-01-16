import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ThemeContext } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../firebase";
import trFlag from "../assets/tr.png";
import enFlag from "../assets/en.jpg";
import { toast, ToastContainer } from "react-toastify";
import return_img from "../assets/return.png";
import {
  doc,
  setDoc,
  query,
  collection,
  where,
  getDocs,
} from "firebase/firestore";
import { usePageTitle } from "../hooks/usePageTitle";
import { db } from "../firebase";
import light from "../assets/light.png";
import dark from "../assets/dark.png";
import logo from "../assets/logo.png";

const Login = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { signInWithGoogle } = useAuth();

  usePageTitle(t("auth.loginTitle"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [languageDropdown, setLanguageDropdown] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
    setLanguageDropdown(false);
  };
  const handleLogin = async (e: any) => {
    e.preventDefault();

    if (isSignUp) {
      // Sign up: email, password, username zorunlu
      if (!email || !password || !username) {
        toast.error(t("auth.fillAllFields"));
        return;
      }
    } else {
      // Sign in: email, password zorunlu
      if (!email || !password) {
        toast.error(t("auth.fillAllFields"));
        return;
      }
    }

    setLoading(true);
    try {
      if (isSignUp) {
        // Sign up işlemi - kullanıcı tarafından girilen username kullan
        const desiredUsername = username.toLowerCase().trim();

        // Username validasyonu
        if (desiredUsername.length < 3) {
          toast.error(t("auth.usernameShort"));
          setLoading(false);
          return;
        }

        if (!/^[a-z0-9_-]+$/.test(desiredUsername)) {
          toast.error(t("auth.usernameInvalid"));
          setLoading(false);
          return;
        }

        // before creating user, ensure username is unique
        const usernameQuery = query(
          collection(db, "users"),
          where("username", "==", desiredUsername)
        );
        const usernameSnap = await getDocs(usernameQuery);
        if (!usernameSnap.empty) {
          toast.error(t("auth.usernameTaken"));
          setLoading(false);
          return;
        }

        const result = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        // Firestore'a kullanıcı profili oluştur (Doküman ID'si olarak email kullanılıyor)
        const userRef = doc(db, "users", result.user.email!);

        // Yeni kullanıcı için oluşturulacak eksiksiz profil verisi
        const newUserProfile = {
          email: result.user.email,
          username: desiredUsername,
          lastUsernameChangeAt: new Date().toISOString(), // YENİ: Son username değişikliği tarihi

          // Kişiselleştirme ve Başarım Alanları
          avatarUrl:
            "https://preview.redd.it/the-new-discord-default-profile-pictures-v0-tbhgxr7adj7f1.png?width=1024&auto=webp&s=d64e0fdfeac749167246780dcc5e82915c6d7b70", // Varsayılan avatar yolu
          activeTitle: "Arena Rookie", // Varsayılan unvan
          unlockedTitles: ["Arena Rookie"], // Kazanılan unvanlar listesi
          achievements: {}, // Başlangıçta boş başarım nesnesi

          // İstatistikler
          stats: {
            points: 100,
            totalGames: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            winRate: 0,
          },

          createdAt: new Date().toISOString(),
        };

        await setDoc(userRef, newUserProfile);

        toast.success(t("auth.signupSuccess"));
      } else {
        // Sign in işlemi
        await signInWithEmailAndPassword(auth, email, password);
        toast.success(t("auth.loginSuccess"));
      }
      navigate("/menu");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
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

  const handleGoogleLogin = async () => {
    setSocialLoading(true);
    try {
      await signInWithGoogle();
      navigate("/menu");
      toast.success(t("auth.loginSuccess"));
    } catch (error: any) {
      if (error.code === "auth/popup-closed-by-user") {
        toast.error("Google login canceled");
      } else {
        toast.error(error.message);
      }
    } finally {
      setSocialLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      toast.error(t("auth.enterEmailAddress"));
      return;
    }

    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast.success(t("auth.resetSuccess"));
      setShowForgotPassword(false);
      setResetEmail("");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div
      className={`min-h-[calc(100vh-61px)] relative overflow-hidden transition-all duration-1000 ${
        theme === "dark"
          ? "bg-gradient-to-br from-stone-900 via-indigo-900 to-stone-800"
          : "bg-gradient-to-br from-stone-200 via-indigo-200 to-stone-300"
      }`}
    >
      <ToastContainer
        position="bottom-right"
        theme={theme === "dark" ? "dark" : "light"}
      />

      {/* Main Content */}
      <div className="flex items-center justify-center p-6">
        <div
          className={`mt-16 p-8 rounded-2xl shadow-2xl border backdrop-blur-md w-full max-w-md transition-all duration-300 ${
            theme === "dark"
              ? "bg-slate-800/90 border-slate-600/50 text-slate-100"
              : "bg-white/90 border-slate-200/50 text-slate-800"
          }`}
        >
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="MMA XOX"
                className="w-12 h-12 drop-shadow-lg"
              />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  MMA XOX
                </h1>
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  {t("auth.ultimateTicTacToe")}
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleLogin}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium mb-2">
                {t("auth.email")}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 ${
                  theme === "dark"
                    ? "bg-slate-700/80 border-slate-600/50 text-white placeholder-slate-400 focus:ring-purple-500/50"
                    : "bg-white/80 border-slate-300/50 text-slate-800 placeholder-slate-500 focus:ring-indigo-500/50"
                }`}
                placeholder={t("auth.emailPlaceholder")}
              />
            </div>
            {/* YENİ: Username input - sadece sign up sırasında göster */}
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t("auth.username")}
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 ${
                    theme === "dark"
                      ? "bg-slate-700/80 border-slate-600/50 text-white placeholder-slate-400 focus:ring-purple-500/50"
                      : "bg-white/80 border-slate-300/50 text-slate-800 placeholder-slate-500 focus:ring-indigo-500/50"
                  }`}
                  placeholder={t("auth.usernamePlaceholder")}
                />
                <p className="text-xs mt-1 text-slate-500">
                  {t("auth.usernameValidation")}
                </p>
              </div>
            )}{" "}
            <div>
              <label className="block text-sm font-medium mb-2">
                {t("auth.password")}
              </label>
              <input
                type="password"
                value={password}
                autoComplete="password"
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 ${
                  theme === "dark"
                    ? "bg-slate-700/80 border-slate-600/50 text-white placeholder-slate-400 focus:ring-purple-500/50"
                    : "bg-white/80 border-slate-300/50 text-slate-800 placeholder-slate-500 focus:ring-indigo-500/50"
                }`}
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                loading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:scale-105 cursor-pointer hover:shadow-xl"
              } ${
                isSignUp
                  ? "bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                  : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              } text-white shadow-lg`}
            >
              {loading
                ? "Loading..."
                : isSignUp
                ? t("auth.signup")
                : t("auth.login")}
            </button>
          </form>

          {/* Social Login Divider */}
          {!isSignUp && (
            <>
              <div className="mt-8 flex items-center gap-4">
                <div
                  className={`flex-1 h-px ${
                    theme === "dark" ? "bg-slate-600/50" : "bg-slate-300/50"
                  }`}
                ></div>
                <span
                  className={`text-sm ${
                    theme === "dark" ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  Or continue with
                </span>
                <div
                  className={`flex-1 h-px ${
                    theme === "dark" ? "bg-slate-600/50" : "bg-slate-300/50"
                  }`}
                ></div>
              </div>

              {/* Google Login Button */}
              <button
                onClick={handleGoogleLogin}
                disabled={socialLoading}
                type="button"
                className={`w-full mt-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 border-2 ${
                  socialLoading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:scale-102 cursor-pointer hover:shadow-lg"
                } ${
                  theme === "dark"
                    ? "bg-slate-700/50 border-slate-600 hover:bg-slate-700/80 text-white"
                    : "bg-white/50 border-slate-300 hover:bg-white/80 text-slate-800"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>{socialLoading ? "Connecting..." : "Google"}</span>
              </button>
            </>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setEmail("");
                setPassword("");
                setUsername(""); // Reset username field
              }}
              className={`text-sm hover:underline transition-colors cursor-pointer duration-200 ${
                theme === "dark"
                  ? "text-purple-400 hover:text-purple-300"
                  : "text-indigo-600 hover:text-indigo-500"
              }`}
            >
              {isSignUp ? t("auth.haveAccount") : t("auth.noAccount")}
            </button>
          </div>

          {/* Şifremi Unuttum Butonu - Sign In modu için */}
          {!isSignUp && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowForgotPassword(true)}
                className={`text-sm cursor-pointer transition-colors duration-200 ${
                  theme === "dark"
                    ? "text-slate-400 hover:text-slate-300"
                    : "text-slate-600 hover:text-slate-500"
                }`}
              >
                {t("auth.forgotPassword")}
              </button>
            </div>
          )}

          <div className="mt-8 text-center">
            <button
              onClick={() => navigate("/")}
              className={`text-sm px-4 py-2 rounded-lg cursor-pointer transition-all duration-300 ${
                theme === "dark"
                  ? "text-slate-400 hover:text-slate-300 hover:bg-slate-700/50"
                  : "text-slate-600 hover:text-slate-500 hover:bg-slate-200/50"
              }`}
            >
              {t("auth.backToHome")}
            </button>
          </div>
        </div>
      </div>

      {/* Şifremi Unuttum Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-6">
          <div
            className={`p-8 rounded-2xl shadow-2xl shadow-indigo-900/50 border backdrop-blur-md w-full max-w-md transition-all duration-300 ${
              theme === "dark"
                ? "bg-slate-800/90 border-slate-600/50 text-slate-100"
                : "bg-white/90 border-slate-200/50 text-slate-800"
            }`}
          >
            <h2 className="text-2xl font-bold mb-6 text-center">
              {t("auth.resetPassword")}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t("auth.enterEmailAddress")}
                </label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !resetLoading) {
                      handleForgotPassword();
                    }
                  }}
                  className={`w-full px-4 py-3 rounded-xl border backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 ${
                    theme === "dark"
                      ? "bg-slate-700/80 border-slate-600/50 text-white placeholder-slate-400 focus:ring-purple-500/50"
                      : "bg-white/80 border-slate-300/50 text-slate-800 placeholder-slate-500 focus:ring-indigo-500/50"
                  }`}
                  placeholder={t("auth.emailPlaceholder")}
                />
              </div>

              <p
                className={`text-sm ${
                  theme === "dark" ? "text-slate-400" : "text-slate-600"
                }`}
              >
                {t("auth.resetEmailDescription")}
              </p>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmail("");
                  }}
                  disabled={resetLoading}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    resetLoading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:scale-105 cursor-pointer"
                  } ${
                    theme === "dark"
                      ? "bg-slate-700 hover:bg-slate-600 text-slate-200 border-2 border-slate-600"
                      : "bg-slate-400 hover:bg-slate-500 text-white border-2 border-slate-300"
                  }`}
                >
                  {t("auth.cancel")}
                </button>
                <button
                  onClick={handleForgotPassword}
                  disabled={resetLoading}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    resetLoading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:scale-105 cursor-pointer hover:shadow-xl"
                  } bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg`}
                >
                  {resetLoading ? "Sending..." : t("auth.sendResetLink")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
