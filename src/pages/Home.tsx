import { useContext, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { toast } from "react-toastify";
import { usePageTitle } from "../hooks/usePageTitle";
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

  // AdSense ads push
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    }
  }, []);

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
      <div
        className={`relative min-h-[calc(100vh-61px)] overflow-hidden transition-all duration-1000 ${
          theme === "dark"
            ? "bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900"
            : "bg-gradient-to-b from-blue-400 via-blue-300 to-green-400"
        }`}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden flex items-end justify-center">
          {/* Stars / Sky elements */}
          {[...Array(50)].map((_, i) => (
            <div
              key={`star-${i}`}
              className={`absolute w-0.5 h-0.5 ${
                theme === "dark" ? "bg-yellow-200" : "bg-white"
              } rounded-full`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 50}%`,
                opacity: 0.3 + Math.random() * 0.7,
                animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}

          {/* Far Mountains (Background Layer) - Subtle, misty */}
          <svg
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
            style={{ height: "45%", maxWidth: "100vw", width: "100%" }}
            viewBox="0 0 1440 400"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient
                id="farMountainGrad"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  stopColor={theme === "dark" ? "#374151" : "#6B8E6B"}
                />
                <stop
                  offset="100%"
                  stopColor={theme === "dark" ? "#1f2937" : "#4A7B4A"}
                />
              </linearGradient>
            </defs>
            <path
              d="M0,400 L0,280 
               Q60,220 120,260 
               Q180,200 240,180 
               L280,140 
               Q320,100 360,130 
               Q400,160 440,150 
               L520,100 
               Q560,60 600,90 
               Q640,120 680,110 
               L760,70 
               Q800,40 840,60 
               Q880,80 920,70 
               L1000,50 
               Q1040,30 1080,55 
               Q1120,80 1160,65 
               L1240,45 
               Q1280,25 1320,50 
               Q1360,75 1400,60 
               L1440,70 L1440,400 Z"
              fill="url(#farMountainGrad)"
              opacity="0.4"
            />
          </svg>

          {/* Middle Mountains Layer */}
          <svg
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
            style={{ height: "38%", maxWidth: "100vw", width: "100%" }}
            viewBox="0 0 1440 350"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient
                id="midMountainGrad"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  stopColor={theme === "dark" ? "#475569" : "#5B8A5B"}
                />
                <stop
                  offset="50%"
                  stopColor={theme === "dark" ? "#334155" : "#4A7B4A"}
                />
                <stop
                  offset="100%"
                  stopColor={theme === "dark" ? "#1e293b" : "#3A6B3A"}
                />
              </linearGradient>
              {/* Snow caps gradient */}
              <linearGradient
                id="snowGrad"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  stopColor={theme === "dark" ? "#e2e8f0" : "#ffffff"}
                />
                <stop
                  offset="100%"
                  stopColor={theme === "dark" ? "#94a3b8" : "#e0e0e0"}
                  stopOpacity="0"
                />
              </linearGradient>
            </defs>

            {/* Main middle mountain body */}
            <path
              d="M0,350 L0,250 
               Q40,200 80,220 
               Q120,240 160,200 
               L220,150 
               Q260,100 300,140 
               Q340,180 380,160 
               L460,90 
               Q500,50 540,80 
               Q580,110 620,95 
               L700,60 
               Q740,35 780,70 
               Q820,105 860,85 
               L940,55 
               Q980,30 1020,60 
               Q1060,90 1100,75 
               L1180,50 
               Q1220,30 1260,65 
               Q1300,100 1340,80 
               L1400,60 
               Q1420,50 1440,70 
               L1440,350 Z"
              fill="url(#midMountainGrad)"
              opacity="0.6"
            />

            {/* Snow caps on peaks */}
            <path
              d="M460,90 Q480,70 500,50 Q520,70 540,80 L520,85 Q500,75 480,85 Z"
              fill="url(#snowGrad)"
              opacity="0.7"
            />
            <path
              d="M700,60 Q720,40 740,35 Q760,50 780,70 L760,72 Q740,55 720,65 Z"
              fill="url(#snowGrad)"
              opacity="0.7"
            />
            <path
              d="M940,55 Q960,35 980,30 Q1000,45 1020,60 L1000,62 Q980,50 960,58 Z"
              fill="url(#snowGrad)"
              opacity="0.7"
            />
            <path
              d="M1180,50 Q1200,30 1220,30 Q1240,45 1260,65 L1240,67 Q1220,52 1200,55 Z"
              fill="url(#snowGrad)"
              opacity="0.7"
            />
          </svg>

          {/* Near Mountains (Foreground Layer) - Detailed with textures */}
          <svg
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
            style={{ height: "32%", maxWidth: "100vw", width: "100%" }}
            viewBox="0 0 1440 300"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient
                id="nearMountainGrad"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  stopColor={theme === "dark" ? "#4b5563" : "#4A8B4A"}
                />
                <stop
                  offset="40%"
                  stopColor={theme === "dark" ? "#374151" : "#3A7B3A"}
                />
                <stop
                  offset="100%"
                  stopColor={theme === "dark" ? "#1f2937" : "#2A6B2A"}
                />
              </linearGradient>
              <linearGradient
                id="mountainShadow"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop
                  offset="0%"
                  stopColor={theme === "dark" ? "#1f2937" : "#2A5B2A"}
                />
                <stop
                  offset="50%"
                  stopColor={theme === "dark" ? "#374151" : "#3A7B3A"}
                />
                <stop
                  offset="100%"
                  stopColor={theme === "dark" ? "#1f2937" : "#2A5B2A"}
                />
              </linearGradient>
            </defs>

            {/* Main foreground mountain */}
            <path
              d="M0,300 L0,200 
               Q30,170 60,190 
               Q90,210 120,180 
               L180,130 
               Q210,100 240,120 
               Q270,140 300,125 
               L360,90 
               Q390,65 420,85 
               Q450,105 480,95 
               L540,70 
               Q570,50 600,75 
               Q630,100 660,85 
               L720,60 
               Q750,40 780,65 
               Q810,90 840,75 
               L900,55 
               Q930,40 960,60 
               Q990,80 1020,70 
               L1080,50 
               Q1110,35 1140,55 
               Q1170,75 1200,65 
               L1260,50 
               Q1290,40 1320,60 
               Q1350,80 1380,70 
               L1440,80 L1440,300 Z"
              fill="url(#nearMountainGrad)"
            />

            {/* Mountain ridges/details */}

            <path
              d="M540,70 L560,80 L580,68 L600,78 L620,65"
              stroke={theme === "dark" ? "#6b7280" : "#5A9B5A"}
              strokeWidth="1"
              fill="none"
              opacity="0.5"
            />
            <path
              d="M900,55 L920,65 L940,52 L960,62 L980,50"
              stroke={theme === "dark" ? "#6b7280" : "#5A9B5A"}
              strokeWidth="1"
              fill="none"
              opacity="0.5"
            />

            {/* Snow/highlight on foreground peaks */}
            <path
              d="M360,90 Q375,75 390,65 Q405,78 420,85 L408,87 Q393,78 378,88 Z"
              fill={theme === "dark" ? "#cbd5e1" : "#f0f0f0"}
              opacity="0.6"
            />
            <path
              d="M720,60 Q735,45 750,40 Q765,52 780,65 L768,66 Q753,54 738,62 Z"
              fill={theme === "dark" ? "#cbd5e1" : "#f0f0f0"}
              opacity="0.6"
            />
            <path
              d="M1080,50 Q1095,35 1110,35 Q1125,48 1140,55 L1128,56 Q1113,46 1098,52 Z"
              fill={theme === "dark" ? "#cbd5e1" : "#f0f0f0"}
              opacity="0.6"
            />
          </svg>

          {/* Mist/fog layer */}
          <div
            className="absolute bottom-0 left-0 w-full"
            style={{
              height: "15%",
              background:
                theme === "dark"
                  ? "linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.5) 50%, transparent 100%)"
                  : "linear-gradient(to top, rgba(58, 107, 58, 0.8) 0%, rgba(58, 107, 58, 0.3) 50%, transparent 100%)",
            }}
          />

          {/* Floating particles */}
          {[...Array(25)].map((_, i) => (
            <div
              key={`particle-${i}`}
              className={`absolute w-1 h-1 ${
                theme === "dark" ? "bg-yellow-300" : "bg-white"
              } rounded-full`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 60}%`,
                opacity: 0.4 + Math.random() * 0.6,
                animation: `float ${4 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex flex-col min-h-[calc(100vh-61px)] items-center justify-center px-3 lg:px-4 pt-20 lg:pt-0">
          {/* Game Logo */}
          <div className="lg:mb-8 mb-6 text-center animate-bounce-slow">
            <div
              className={`relative inline-block p-4 px-4 rounded-2xl shadow-2xl backdrop-blur-sm border-4 ${
                theme === "dark"
                  ? "bg-slate-800/60 border-red-500 shadow-red-500/20"
                  : "bg-white/60 border-red-600 shadow-red-600/20"
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
            className={`max-w-2xl mx-auto lg:mb-10 mb-4 p-4 lg:p-6 rounded-xl backdrop-blur-sm border-2 ${
              theme === "dark"
                ? "bg-slate-800/60 border-slate-600 text-slate-200"
                : "bg-white/60 border-slate-300 text-slate-700"
            } shadow-xl`}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">
              <span className="font-bold text-red-500">MMA XOX</span> -{" "}
              {t("home.title")}
            </h2>
            <p className="text-sm md:text-base text-center leading-relaxed mb-3">
              {t("home.description")}
            </p>
            <p
              className={`text-base md:text-lg text-center font-bold ${
                theme === "dark" ? "text-yellow-400" : "text-red-600"
              }`}
            >
              {t("home.tagline")}
            </p>
          </div>
          {/* Menu Buttons */}
          <div className="flex flex-wrap justify-center lg:gap-4 gap-3 ">
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
          {/* AdSense Ad */}
          <div className="w-full my-6 px-4 flex justify-center">
            <div style={{ minWidth: "280px", width: "100%", maxWidth: "100%" }}>
              <ins
                className="adsbygoogle"
                style={{ display: "block" }}
                data-ad-client="ca-pub-8479780597628659"
                data-ad-slot="2618909847"
                data-ad-format="auto"
                data-full-width-responsive="true"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
