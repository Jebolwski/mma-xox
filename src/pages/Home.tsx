import { useContext, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { toast } from "react-toastify";
import { usePageTitle } from "../hooks/usePageTitle";
import logo from "../assets/pictures/logo.webp";
import gamepad from "../assets/pictures/gamepad.webp";
import loginIcon from "../assets/pictures/login.webp";
import logoutIcon from "../assets/pictures/logout.webp";

const Home = () => {
  const { theme } = useContext(ThemeContext);
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
    setLanguageDropdown(!languageDropdown);
  };
  usePageTitle(t("home.pageTitle"));

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
        {/* ========== YENİ: Octagon Desen (Arena Zemini) ========== */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0 L55 15 L55 45 L30 60 L5 45 L5 15 Z' fill='none' stroke='%23ef4444' stroke-width='0.5' /%3E%3C/svg%3E")`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* ========== YENİ: Ring Işıkları (Animasyonlu) ========== */}
        <div
          className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-lightSweep"
          style={{ filter: "blur(4px)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-lightSweep"
          style={{ filter: "blur(4px)", animationDelay: "2s" }}
        />

        {/* ========== MEVCUT: Yıldızlar ve Parçacıklar (Geliştirildi) ========== */}
        <div className="absolute inset-0 overflow-hidden flex items-end justify-center">
          {/* Yıldızlar - daha belirgin */}
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

          {/* MEVCUT: Dağ katmanları (aynı kalabilir, sadece opacity ayarı yapıldı) */}
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

          {/* Sis tabakası */}
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

          {/* Parçacıklar */}
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

        {/* ========== ANA İÇERİK ========== */}
        <div className="relative z-10 flex flex-col min-h-[calc(100vh-61px)] items-center justify-center px-3 lg:px-4 pt-20 lg:pt-0 pb-4 lg:pb-2">
          {/* ========== YENİ: Logo Alanı (Gelişmiş Efektler) ========== */}
          <div className="lg:mb-8 mb-6 text-center animate-bounce-slow group">
            <div
              className={`relative inline-block p-4 px-4 rounded-2xl shadow-2xl backdrop-blur-sm border-2 transition-all duration-500
                ${
                  theme === "dark"
                    ? "bg-slate-800/60 border-red-500 shadow-red-500/20 group-hover:shadow-red-500/40"
                    : "bg-white/60 border-red-600 shadow-red-600/20 group-hover:shadow-red-600/40"
                }`}
            >
              {/* Nabız efekti veren halkalar */}
              <div className="absolute inset-0 rounded-2xl border-2 border-red-500/50 animate-ping-slow" />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full animate-pulse" />
              <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-orange-400 rounded-full animate-pulse delay-500" />

              {/* Logo görseli */}
              <div className="flex justify-center">
                <img
                  src={logo}
                  alt="MMA XOX Logo"
                  className="lg:w-22 lg:h-22 w-18 h-18 mb-1"
                  width={88}
                  height={88}
                  loading="lazy"
                  decoding="async"
                />
              </div>

              {/* MMA yazısı */}
              <h2
                className={`text-5xl md:text-8xl font-black tracking-wider transition-all duration-300
                  ${theme === "dark" ? "text-red-400" : "text-red-600"}
                  drop-shadow-lg group-hover:scale-105`}
                style={{
                  textShadow:
                    theme === "dark"
                      ? "4px 4px 0px #7f1d1d, 8px 8px 0px #450a0a"
                      : "4px 4px 0px #dc2626, 8px 8px 0px #991b1b",
                }}
              >
                MMA
              </h2>

              {/* XOX yazısı */}
              <h2
                className={`text-3xl md:text-6xl font-black tracking-widest
                  ${theme === "dark" ? "text-purple-600" : "text-purple-500"}
                  drop-shadow-lg group-hover:scale-105 transition-all duration-300 delay-75`}
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

          {/* ========== YENİ: Açıklama Kartı (Canlı Kenar Işığı) ========== */}
          <div
            className={`max-w-2xl mx-auto lg:mb-10 mb-4 p-4 lg:p-6 rounded-xl backdrop-blur-sm border-2 relative overflow-hidden
              ${
                theme === "dark"
                  ? "bg-slate-800/60 border-slate-600 text-slate-200"
                  : "bg-white/60 border-slate-300 text-slate-700"
              } shadow-xl`}
          >
            {/* Hareketli kenar ışığı */}
            <div className="absolute inset-0 rounded-xl border-2 border-transparent animate-borderGlow" />

            <h1 className="text-2xl md:text-3xl font-bold text-center mb-3">
              <span className="font-bold text-red-500">MMA XOX</span> -{" "}
              {t("home.title")}
            </h1>
            <p className="text-sm md:text-base text-center leading-relaxed mb-3">
              {t("home.description")}
            </p>
            <p
              className={`text-base md:text-lg text-center font-bold
                ${theme === "dark" ? "text-yellow-400" : "text-red-600"}`}
            >
              {t("home.tagline")}
            </p>
          </div>

          {/* ========== YENİ: Butonlar (Daha Çarpıcı) ========== */}
          <div className="flex flex-wrap justify-center lg:gap-4 gap-3">
            {currentUser ? (
              <>
                {/* PLAY butonu */}
                <Link
                  to="/menu"
                  className={`w-fit flex flex-wrap items-center px-10 py-3 text-lg lg:text-2xl font-bold cursor-pointer rounded-xl border-3 
                    transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 active:scale-95
                    ${
                      theme === "dark"
                        ? "bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 border-purple-400 text-white shadow-lg shadow-purple-600/50"
                        : "bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 border-green-300 text-white shadow-lg shadow-green-500/50"
                    }`}
                  style={{
                    textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                  }}
                >
                  <img
                    src={gamepad}
                    alt="Play Game"
                    className="h-7 lg:h-9 mr-2"
                    width={"auto"}
                    height={"auto"}
                    loading="lazy"
                    decoding="async"
                  />
                  {t("home.play")}
                </Link>

                {/* LOGOUT butonu */}
                <button
                  onClick={handleLogout}
                  className={`w-fit flex flex-wrap items-center px-10 py-3 text-lg lg:text-2xl font-bold cursor-pointer rounded-xl border-3 
                    transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 active:scale-95
                    ${
                      theme === "dark"
                        ? "bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 border-blue-400 text-white shadow-lg shadow-blue-600/50"
                        : "bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 border-red-300 text-white shadow-lg shadow-red-500/50"
                    }`}
                  style={{
                    textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                  }}
                >
                  <img
                    src={logoutIcon}
                    alt="Logout"
                    className="h-7 lg:h-9 mr-2"
                    width={"auto"}
                    height={"auto"}
                    loading="lazy"
                    decoding="async"
                  />
                  {t("home.logout")}
                </button>
              </>
            ) : (
              <>
                {/* PLAY AS GUEST butonu */}
                <Link
                  to="/menu"
                  className={`w-fit flex flex-wrap items-center px-10 py-3 text-lg lg:text-2xl font-bold cursor-pointer rounded-xl border-3 
                    transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 active:scale-95
                    ${
                      theme === "dark"
                        ? "bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 border-purple-400 text-white shadow-lg shadow-purple-600/50"
                        : "bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 border-green-300 text-white shadow-lg shadow-green-500/50"
                    }`}
                  style={{
                    textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                  }}
                >
                  <img
                    src={gamepad}
                    alt="Play as Guest"
                    className="h-7 lg:h-9 mr-2"
                    width={36}
                    height={36}
                    loading="lazy"
                    decoding="async"
                  />
                  {t("home.playAsGuest")}
                </Link>

                {/* LOGIN butonu */}
                <Link
                  to="/login"
                  className={`w-fit flex flex-wrap items-center px-10 py-3 text-lg lg:text-2xl font-bold cursor-pointer rounded-xl border-3 
                    transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 active:scale-95
                    ${
                      theme === "dark"
                        ? "bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 border-blue-400 text-white shadow-lg shadow-blue-600/50"
                        : "bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 border-blue-300 text-white shadow-lg shadow-blue-500/50"
                    }`}
                  style={{
                    textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                  }}
                >
                  <img
                    src={loginIcon}
                    alt="Login"
                    className="w-7 lg:w-9 h-7 lg:h-9 mr-2"
                    width={"auto"}
                    height={"auto"}
                    loading="lazy"
                    decoding="async"
                  />
                  {t("home.login")}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
