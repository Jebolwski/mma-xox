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
import eye_closed from "../assets/eye_closed.svg";
import eye_open from "../assets/eye_open.svg";

const Login = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { signInWithGoogle, signInWithTwitter } = useAuth();

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
  const [showPassword, setShowPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

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
          where("username", "==", desiredUsername),
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
          password,
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
        toast.error(t("auth.googleLoginCanceled"));
      } else {
        toast.error(error.message);
      }
    } finally {
      setSocialLoading(false);
    }
  };

  const handleTwitterLogin = async () => {
    setSocialLoading(true);
    try {
      await signInWithTwitter();
      navigate("/menu");
      toast.success(t("auth.loginSuccess"));
    } catch (error: any) {
      if (error.code === "auth/popup-closed-by-user") {
        toast.error(t("auth.twitterLoginCanceled"));
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
                  maxLength={16}
                  minLength={3}
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
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  autoComplete="password"
                  minLength={6}
                  maxLength={24}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 pr-12 ${
                    theme === "dark"
                      ? "bg-slate-700/80 border-slate-600/50 text-white placeholder-slate-400 focus:ring-purple-500/50"
                      : "bg-white/80 border-slate-300/50 text-slate-800 placeholder-slate-500 focus:ring-indigo-500/50"
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 cursor-pointer rounded transition-all duration-200 ${
                    theme === "dark"
                      ? "text-slate-400 hover:text-slate-300 hover:bg-slate-600/50"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                  }`}
                  title={
                    showPassword
                      ? t("auth.hidePassword") || "Hide password"
                      : t("auth.showPassword") || "Show password"
                  }
                >
                  {showPassword ? (
                    <img
                      src={eye_open}
                      className={`w-6 ${theme === "dark" ? "invert" : ""}`}
                      alt="Hide password"
                    />
                  ) : (
                    <img
                      src={eye_closed}
                      className={`w-6 ${theme === "dark" ? "invert" : ""}`}
                      alt="Hide password"
                    />
                  )}
                </button>
              </div>
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
                    : "hover:scale-101 cursor-pointer hover:shadow-lg"
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
                <span>
                  {socialLoading ? t("auth.connecting") : t("auth.google")}
                </span>
              </button>

              {/* Twitter Login Button */}
              <button
                onClick={handleTwitterLogin}
                disabled={socialLoading}
                type="button"
                className={`w-full mt-3 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 border-2 ${
                  socialLoading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:scale-101 cursor-pointer hover:shadow-lg"
                } bg-black/80 border-black hover:bg-black text-white`}
              >
                <svg
                  width="1200"
                  height="1227"
                  className="w-5 h-5"
                  viewBox="0 0 1200 1227"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z"
                    fill="white"
                  />
                </svg>
                <span>
                  {socialLoading ? t("auth.connecting") : t("auth.twitter")}
                </span>
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
                <div className="relative">
                  <input
                    type={showResetPassword ? "text" : "password"}
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !resetLoading) {
                        handleForgotPassword();
                      }
                    }}
                    className={`w-full px-4 py-3 rounded-xl border backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 pr-12 ${
                      theme === "dark"
                        ? "bg-slate-700/80 border-slate-600/50 text-white placeholder-slate-400 focus:ring-purple-500/50"
                        : "bg-white/80 border-slate-300/50 text-slate-800 placeholder-slate-500 focus:ring-indigo-500/50"
                    }`}
                    placeholder={t("auth.emailPlaceholder")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-all duration-200 ${
                      theme === "dark"
                        ? "text-slate-400 hover:text-slate-300 hover:bg-slate-600/50"
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                    }`}
                  >
                    {showResetPassword ? (
                      <svg
                        className={`w-5 h-5 ${
                          theme === "dark" ? "text-white" : "text-slate-700"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 5C7.58 5 3.73 7.61 2.01 11.59c-.72 1.34-.72 2.88 0 4.22 1.72 3.98 5.57 6.59 10.99 6.59s9.27-2.61 10.99-6.59c.72-1.34.72-2.88 0-4.22C21.27 7.61 17.42 5 12 5zm0 9c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" />
                      </svg>
                    ) : (
                      <svg
                        className={`w-5 h-5 ${
                          theme === "dark" ? "text-white" : "text-slate-700"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M11.83 9L15.29 12.46c.04-.3.07-.59.07-.9 0-1.66-1.34-3-3-3-.31 0-.59.03-.89.07L11.83 9zm7.08-2.32c.78.84 1.46 1.86 2.01 3.02.72 1.34.72 2.88 0 4.22-.6 1.4-1.39 2.5-2.29 3.27L20.9 21 19.47 19.57l-9-9L6.63 3.98 8.07 2.56l13.84 13.85zM12 4C6.58 4 2.73 6.61 1.01 10.59c-.72 1.34-.72 2.88 0 4.22C2.73 19.39 6.58 22 12 22c.04 0 .09 0 .13 0l-3.13-3.13c-.15-.02-.3-.03-.46-.03-1.66 0-3-1.34-3-3 0-.16.01-.31.03-.46L3.5 15.5C3.18 14.97 3.02 14.4 3.02 13.85c0-.55.16-1.12.48-1.65.6-1.4 1.39-2.5 2.29-3.27L5.1 3 6.53 4.44 4.9 6.07c.63-.57 1.31-1.08 2.05-1.52L6.2 2.5 7.64 4l5.36 5.36z" />
                      </svg>
                    )}
                  </button>
                </div>
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
