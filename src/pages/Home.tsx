import { useContext, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { toast } from "react-toastify";
import { usePageTitle } from "../hooks/usePageTitle";
import { Helmet } from "react-helmet-async";
import trFlag from "../assets/tr.png";
import enFlag from "../assets/en.jpg";
import ptFlag from "../assets/pt.png";
import light from "../assets/light.png";
import dark from "../assets/dark.png";
import logo from "../assets/logo.png";

const Home = () => {
  const { theme, toggleTheme: contextToggleTheme } = useContext(ThemeContext);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [username, setUsername] = useState<string | null>(null);
  const [languageDropdown, setLanguageDropdown] = useState(false);
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
    setLanguageDropdown(false);
  };
  const handleLanguageClick = () => {
    // Always open dropdown since we have 3 languages now
    setLanguageDropdown(!languageDropdown);
  };
  usePageTitle(t("home.pageTitle"));

  const toggleTheme = contextToggleTheme;

  // Firestore'dan username'i çek
  useEffect(() => {
    if (currentUser?.email) {
      const fetchUsername = async () => {
        try {
          const q = query(
            collection(db, "users"),
            where("email", "==", currentUser.email),
          );
          const snap = await getDocs(q);
          if (!snap.empty) {
            setUsername(snap.docs[0].data().username);
          }
        } catch (error) {
          console.error("Error fetching username:", error);
        }
      };
      fetchUsername();
    }
  }, [currentUser?.email]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success(t("home.logoutSuccess"));
    } catch (error) {
      toast.error(t("errors.logout"));
    }
  };

  return (
    <>
      <Helmet>
        <title>MMA XOX - Ultimate Tic Tac Toe Game with MMA Fighters</title>
        <meta
          name="description"
          content="Play MMA XOX - The ultimate online tic tac toe game featuring real MMA fighters. Play locally or multiplayer, create rooms, and compete with friends."
        />
        <meta
          name="robots"
          content="index, follow"
        />
      </Helmet>
      <div
        className={`relative min-h-[calc(100vh-61px)] overflow-hidden transition-all duration-1000 ${
          theme === "dark"
            ? "bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900"
            : "bg-gradient-to-b from-blue-400 via-blue-300 to-green-400"
        }`}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Mountains */}
          <div
            className={`absolute bottom-0 left-0 w-full h-64 ${
              theme === "dark" ? "bg-slate-700" : "bg-green-600"
            } clip-path-mountain opacity-80`}
            style={{
              clipPath:
                "polygon(0% 100%, 15% 60%, 25% 80%, 35% 40%, 50% 70%, 65% 30%, 80% 60%, 100% 50%, 100% 100%)",
            }}
          />

          {/* Floating particles */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-1 h-1 ${
                theme === "dark" ? "bg-yellow-300" : "bg-white"
              } rounded-full animate-pulse`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 60}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex flex-col min-h-[calc(100vh-61px)] items-center justify-center px-3 lg:px-4 pt-12 lg:pt-0">
          {/* Game Logo */}
          <div className="lg:mb-8 mb-6 text-center animate-bounce-slow">
            <div
              className={`relative inline-block p-4 px-4 rounded-2xl shadow-2xl backdrop-blur-md border-4 ${
                theme === "dark"
                  ? "bg-slate-800/90 border-red-500 shadow-red-500/20"
                  : "bg-white/90 border-red-600 shadow-red-600/20"
              }`}
            >
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full animate-pulse" />
              <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-orange-400 rounded-full animate-pulse delay-500" />
              <div className="flex justify-center">
                <img
                  src={logo}
                  alt="logo"
                  className="lg:w-22 lg:h-22 w-18 h-18 mb-1"
                />
              </div>
              <h1
                className={`text-5xl md:text-8xl font-black tracking-wider ${
                  theme === "dark" ? "text-red-400" : "text-red-600"
                } drop-shadow-lg`}
                style={{
                  textShadow:
                    theme === "dark"
                      ? "4px 4px 0px #7f1d1d, 8px 8px 0px #450a0a"
                      : "4px 4px 0px #dc2626, 8px 8px 0px #991b1b",
                }}
              >
                MMA
              </h1>
              <h2
                className={`text-3xl md:text-6xl font-black tracking-widest ${
                  theme === "dark" ? "text-purple-600" : "text-purple-500"
                } drop-shadow-lg`}
                style={{
                  textShadow:
                    theme === "dark"
                      ? "3px 3px 0px #5607a1, 6px 6px 0px #3a0e64"
                      : "3px 3px 0px #5706d9, 6px 6px 0px #2a0966",
                }}
              >
                XOX
              </h2>
            </div>
          </div>

          <div
            className={`max-w-2xl mx-auto lg:mb-10 mb-4 p-4 lg:p-6 rounded-xl backdrop-blur-md border-2 ${
              theme === "dark"
                ? "bg-slate-800/80 border-slate-600 text-slate-200"
                : "bg-white/80 border-slate-300 text-slate-700"
            } shadow-xl`}
          >
            <p className="text-base md:text-xl text-center leading-relaxed">
              <span className="font-bold text-red-500">MMA XOX</span>{" "}
              {t("home.title")}
            </p>
            <p className="text-sm md:text-lg text-center mt-2 lg:mt-4 opacity-90">
              {t("home.description")}
            </p>
            <p
              className={`text-base md:text-xl text-center mt-2 lg:mt-4 font-bold ${
                theme === "dark" ? "text-yellow-400" : "text-red-600"
              }`}
            >
              {t("home.tagline")}
            </p>
          </div>

          {/* Menu Buttons */}
          <div className="flex flex-wrap justify-center lg:gap-4 gap-3 max-w-md">
            {currentUser ? (
              // Giriş yapmış kullanıcı için PLAY ve LOGOUT butonları
              <>
                <div
                  onClick={() => navigate("/menu")}
                  className={`w-fit px-10 py-3 text-lg lg:text-2xl font-bold cursor-pointer rounded-xl border-4 duration-200 hover:scale-102 active:scale-95 ${
                    theme === "dark"
                      ? "bg-purple-600 hover:bg-purple-700 border-purple-400 text-white shadow-lg shadow-purple-600/30"
                      : "bg-green-500 hover:bg-green-600 border-green-300 text-white shadow-lg shadow-green-500/30"
                  }`}
                  style={{
                    textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                  }}
                >
                  🎮 {t("home.play")}
                </div>

                <div
                  onClick={handleLogout}
                  className={`w-fit px-10 py-3 text-lg lg:text-2xl font-bold cursor-pointer rounded-xl border-4 duration-200 hover:scale-102 active:scale-95 ${
                    theme === "dark"
                      ? "bg-blue-600 hover:bg-blue-700 border-blue-400 text-white shadow-lg shadow-blue-600/30"
                      : "bg-red-500 hover:bg-red-600 border-red-300 text-white shadow-lg shadow-red-500/30"
                  }`}
                  style={{
                    textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                  }}
                >
                  🚪 {t("home.logout")}
                </div>
              </>
            ) : (
              // Giriş yapmamış kullanıcı için PLAY AS GUEST ve LOGIN butonları
              <>
                <div
                  onClick={() => navigate("/menu")}
                  className={`w-fit px-10 py-3 text-lg lg:text-2xl font-bold cursor-pointer rounded-xl border-4 transition-all duration-200 hover:scale-102 active:scale-95 ${
                    theme === "dark"
                      ? "bg-purple-600 hover:bg-purple-700 border-purple-400 text-white shadow-lg shadow-purple-600/30"
                      : "bg-green-500 hover:bg-green-600 border-green-300 text-white shadow-lg shadow-green-500/30"
                  }`}
                  style={{
                    textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                  }}
                >
                  🎮 {t("home.playAsGuest")}
                </div>

                <div
                  onClick={() => navigate("/login")}
                  className={`w-fit px-10 py-3 text-lg lg:text-2xl font-bold cursor-pointer rounded-xl border-4 transition-all duration-200 hover:scale-102 active:scale-95 ${
                    theme === "dark"
                      ? "bg-blue-600 hover:bg-blue-700 border-blue-400 text-white shadow-lg shadow-blue-600/30"
                      : "bg-blue-500 hover:bg-blue-600 border-blue-300 text-white shadow-lg shadow-blue-500/30"
                  }`}
                  style={{
                    textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                  }}
                >
                  🔐 {t("home.login")}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
