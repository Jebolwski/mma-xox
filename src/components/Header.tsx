import { useContext, useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import SidebarMenu from "./SidebarMenu";
import trFlag from "../assets/pictures/flags/tr.webp";
import enFlag from "../assets/pictures/flags/en.webp";
import ptFlag from "../assets/pictures/flags/pt.webp";
import spFlag from "../assets/pictures/flags/sp.webp";
import ruFlag from "../assets/pictures/flags/russia_flag.webp";
import deFlag from "../assets/pictures/flags/ge.webp";
import arFlag from "../assets/pictures/flags/sa.webp";
import hiFlag from "../assets/pictures/flags/in.webp";
import zhFlag from "../assets/pictures/flags/ch.webp";
import jaFlag from "../assets/pictures/flags/jp.webp";
import koFlag from "../assets/pictures/flags/kr.webp";
import frFlag from "../assets/pictures/flags/fr.webp";
import swFlag from "../assets/pictures/flags/sw.webp";
import plFlag from "../assets/pictures/flags/pl.webp";
import itFlag from "../assets/pictures/flags/it.webp";
import nlFlag from "../assets/pictures/flags/nl.webp";
import uaFlag from "../assets/pictures/flags/ua_flag.webp";
import { ThemeContext } from "../context/ThemeContext";
import return_img from "../assets/pictures/return.webp";
import { useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";

const Header = ({
  muted,
  setMuted,
}: {
  muted?: boolean;
  setMuted?: (m: boolean | ((prev: boolean) => boolean)) => void;
} = {}) => {
  const { theme, toggleTheme: contextToggleTheme } = useContext(ThemeContext);
  const toggleTheme = contextToggleTheme;
  const { t, i18n } = useTranslation();
  const { currentUser } = useAuth();
  const [languageDropdown, setLanguageDropdown] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setLanguageDropdown(false);
      }
    };

    if (languageDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [languageDropdown]);

  useEffect(() => {
    if (currentUser?.email && location.pathname !== "/") {
      const fetchUserData = async () => {
        try {
          const userRef = doc(db, "users", currentUser.email);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
      fetchUserData();
    }
  }, [currentUser, location]);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
    setLanguageDropdown(false);
  };
  const handleLanguageClick = () => {
    // Always open dropdown since we have 4 languages now
    setLanguageDropdown(!languageDropdown);
  };

  const handleExit = () => {
    navigate(-1);
  };

  return (
    <div>
      <SidebarMenu
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="absolute top-0 left-0 w-full z-50 bg-transparent flex flex-wrap gap-4 justify-between items-center lg:p-4 p-3">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          {/* Mobile: Hamburger Menu */}
          {true && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`md:hidden rounded-lg transition-all cursor-pointer w-[44px] h-[44px] ${
                theme === "dark"
                  ? "bg-slate-800/80 border border-slate-600/50 hover:bg-slate-700/80 text-slate-200"
                  : "bg-white/80 border border-slate-200/50 hover:bg-white/90 text-slate-700"
              }`}
            >
              <span className="text-2xl">≡</span>
            </button>
          )}

          {/* Desktop: Theme and Language */}
          <div className="hidden md:flex items-center gap-3">
            <div
              onClick={toggleTheme}
              className={`p-3 w-[50px] h-[50px] flex items-center justify-center rounded-full cursor-pointer transition-all duration-300 backdrop-blur-md border ${
                theme === "dark"
                  ? "bg-slate-800/80 border-slate-600/50 hover:bg-slate-700/80"
                  : "bg-white/80 border-slate-200/50 hover:bg-white/90"
              } shadow-xl hover:scale-110`}
            >
              {theme === "dark" ? (
                <p className="text-2xl">☀️</p>
              ) : (
                <p className="text-2xl">🌙 </p>
              )}
            </div>
            <div
              className="relative"
              ref={dropdownRef}
            >
              <button
                onClick={handleLanguageClick}
                className="lg:w-[50px] lg:h-[50px] w-[46px] h-[46px] bg-gradient-to-br from-blue-100/75 to-cyan-100/75 dark:from-blue-900/75 dark:to-cyan-900/75 border border-slate-500 flex items-center justify-center rounded-full cursor-pointer transition-all hover:scale-110 shadow-blue-300/50 dark:shadow-blue-900/50 duration-300 overflow-hidden"
                title="Change Language"
              >
                <img
                  src={
                    i18n.language === "tr"
                      ? trFlag
                      : i18n.language === "pt"
                        ? ptFlag
                        : i18n.language === "sp"
                          ? spFlag
                          : i18n.language === "ru"
                            ? ruFlag
                            : i18n.language === "de"
                              ? deFlag
                              : i18n.language === "ar"
                                ? arFlag
                                : i18n.language === "hi"
                                  ? hiFlag
                                  : i18n.language === "zh"
                                    ? zhFlag
                                    : i18n.language === "ja"
                                      ? jaFlag
                                      : i18n.language === "ko"
                                        ? koFlag
                                        : i18n.language === "fr"
                                          ? frFlag
                                          : i18n.language === "sw"
                                            ? swFlag
                                            : i18n.language === "pl"
                                              ? plFlag
                                              : i18n.language === "it"
                                                ? itFlag
                                                : i18n.language === "nl"
                                                  ? nlFlag
                                                  : i18n.language === "ua"
                                                    ? uaFlag
                                                    : enFlag
                  }
                  alt={
                    i18n.language === "tr"
                      ? "Turkish"
                      : i18n.language === "pt"
                        ? "Portuguese"
                        : i18n.language === "sp"
                          ? "Spanish"
                          : i18n.language === "ru"
                            ? "Russian"
                            : i18n.language === "de"
                              ? "German"
                              : i18n.language === "ar"
                                ? "Arabic"
                                : i18n.language === "hi"
                                  ? "Hindi"
                                  : i18n.language === "zh"
                                    ? "Chinese Simplified"
                                    : i18n.language === "ja"
                                      ? "Japanese"
                                      : i18n.language === "ko"
                                        ? "Korean"
                                        : i18n.language === "fr"
                                          ? "French"
                                          : i18n.language === "sw"
                                            ? "Swedish"
                                            : i18n.language === "pl"
                                              ? "Polish"
                                              : i18n.language === "it"
                                                ? "Italian"
                                                : i18n.language === "nl"
                                                  ? "Dutch"
                                                  : i18n.language === "ua"
                                                    ? "Ukrainian"
                                                    : "English"
                  }
                  className="w-full h-full rounded-full object-cover"
                />
              </button>

              {/* Dropdown Menu */}
              {languageDropdown && (
                <div
                  className={`z-60 w-40 absolute top-14 left-0 rounded-tr-xl rounded-bl-xl border backdrop-blur-md overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 z-20 ${
                    theme === "dark"
                      ? "bg-gradient-to-r from-slate-700/50 to-slate-800/50 text-white border-slate-500/40 shadow-2xl language-dropdown-dark"
                      : "bg-gradient-to-r from-slate-100/75 to-slate-300/75 text-slate-800 border-slate-500/40 language-dropdown-light"
                  }`}
                  style={{ height: "195px", overflowY: "auto" }}
                >
                  <button
                    onClick={() => changeLanguage("en")}
                    className={`z-80 flex items-center cursor-pointer gap-3 px-4 py-3 w-full text-left transition-colors border-b ${
                      theme === "dark"
                        ? "hover:bg-blue-200/20 border-b border-slate-500/40"
                        : "hover:bg-blue-100/50 border-b border-slate-500/40"
                    }`}
                  >
                    <img
                      src={enFlag}
                      alt="English"
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="font-medium">English</span>
                  </button>
                  <button
                    onClick={() => changeLanguage("pt")}
                    className={`flex items-center cursor-pointer gap-3 px-4 py-3 w-full text-left transition-colors border-b ${
                      theme === "dark"
                        ? "hover:bg-blue-200/20 border-b border-slate-500/40"
                        : "hover:bg-blue-100/50 border-b border-slate-500/40"
                    }`}
                  >
                    <img
                      src={ptFlag}
                      alt="Portuguese"
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="font-medium">Português</span>
                  </button>
                  <button
                    onClick={() => changeLanguage("ru")}
                    className={`flex items-center cursor-pointer gap-3 px-4 py-3 w-full text-left transition-colors border-b ${
                      theme === "dark"
                        ? "hover:bg-blue-200/20 border-b border-slate-500/40"
                        : "hover:bg-blue-100/50 border-b border-slate-500/40"
                    }`}
                  >
                    <img
                      src={ruFlag}
                      alt="Russian"
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="font-medium">Русский</span>
                  </button>
                  <button
                    onClick={() => changeLanguage("sp")}
                    className={`flex items-center cursor-pointer gap-3 px-4 py-3 w-full text-left transition-colors border-b ${
                      theme === "dark"
                        ? "hover:bg-blue-200/20 border-b border-slate-500/40"
                        : "hover:bg-blue-100/50 border-b border-slate-500/40"
                    }`}
                  >
                    <img
                      src={spFlag}
                      alt="Spanish"
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="font-medium">Español</span>
                  </button>
                  <button
                    onClick={() => changeLanguage("tr")}
                    className={`flex items-center cursor-pointer gap-3 px-4 py-3 w-full text-left transition-colors border-b ${
                      theme === "dark"
                        ? "hover:bg-blue-200/20 border-b border-slate-500/40"
                        : "hover:bg-blue-100/50 border-b border-slate-500/40"
                    }`}
                  >
                    <img
                      src={trFlag}
                      alt="Turkish"
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="font-medium">Türkçe</span>
                  </button>
                  <button
                    onClick={() => changeLanguage("ja")}
                    className={`flex items-center cursor-pointer gap-3 px-4 py-3 w-full text-left transition-colors border-b ${
                      theme === "dark"
                        ? "hover:bg-blue-200/20 border-b border-slate-500/40"
                        : "hover:bg-blue-100/50 border-b border-slate-500/40"
                    }`}
                  >
                    <img
                      src={jaFlag}
                      alt="Japanese"
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="font-medium">日本語</span>
                  </button>
                  <button
                    onClick={() => changeLanguage("fr")}
                    className={`flex items-center cursor-pointer gap-3 px-4 py-3 w-full text-left transition-colors border-b ${
                      theme === "dark"
                        ? "hover:bg-blue-200/20 border-b border-slate-500/40"
                        : "hover:bg-blue-100/50 border-b border-slate-500/40"
                    }`}
                  >
                    <img
                      src={frFlag}
                      alt="French"
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="font-medium">Français</span>
                  </button>
                  <button
                    onClick={() => changeLanguage("de")}
                    className={`flex items-center cursor-pointer gap-3 px-4 py-3 w-full text-left transition-colors border-b ${
                      theme === "dark"
                        ? "hover:bg-blue-200/20 border-b border-slate-500/40"
                        : "hover:bg-blue-100/50 border-b border-slate-500/40"
                    }`}
                  >
                    <img
                      src={deFlag}
                      alt="German"
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="font-medium">Deutsch</span>
                  </button>
                  <button
                    onClick={() => changeLanguage("pl")}
                    className={`flex items-center cursor-pointer gap-3 px-4 py-3 w-full text-left transition-colors border-b ${
                      theme === "dark"
                        ? "hover:bg-blue-200/20 border-b border-slate-500/40"
                        : "hover:bg-blue-100/50 border-b border-slate-500/40"
                    }`}
                  >
                    <img
                      src={plFlag}
                      alt="Polish"
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="font-medium">Polski</span>
                  </button>
                  <button
                    onClick={() => changeLanguage("ko")}
                    className={`flex items-center cursor-pointer gap-3 px-4 py-3 w-full text-left transition-colors border-b ${
                      theme === "dark"
                        ? "hover:bg-blue-200/20 border-b border-slate-500/40"
                        : "hover:bg-blue-100/50 border-b border-slate-500/40"
                    }`}
                  >
                    <img
                      src={koFlag}
                      alt="Korean"
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="font-medium">한국어</span>
                  </button>
                  <button
                    onClick={() => changeLanguage("sw")}
                    className={`flex items-center cursor-pointer gap-3 px-4 py-3 w-full text-left transition-colors border-b ${
                      theme === "dark"
                        ? "hover:bg-blue-200/20 border-b border-slate-500/40"
                        : "hover:bg-blue-100/50 border-b border-slate-500/40"
                    }`}
                  >
                    <img
                      src={swFlag}
                      alt="Swedish"
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="font-medium">Svenska</span>
                  </button>
                  <button
                    onClick={() => changeLanguage("zh")}
                    className={`flex items-center cursor-pointer gap-3 px-4 py-3 w-full text-left transition-colors border-b ${
                      theme === "dark"
                        ? "hover:bg-blue-200/20 border-b border-slate-500/40"
                        : "hover:bg-blue-100/50 border-b border-slate-500/40"
                    }`}
                  >
                    <img
                      src={zhFlag}
                      alt="Chinese Simplified"
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="font-medium">中文</span>
                  </button>
                  <button
                    onClick={() => changeLanguage("nl")}
                    className={`flex items-center cursor-pointer gap-3 px-4 py-3 w-full text-left transition-colors border-b ${
                      theme === "dark"
                        ? "hover:bg-blue-200/20 border-b border-slate-500/40"
                        : "hover:bg-blue-100/50 border-b border-slate-500/40"
                    }`}
                  >
                    <img
                      src={nlFlag}
                      alt="Dutch"
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="font-medium">Nederlands</span>
                  </button>
                  <button
                    onClick={() => changeLanguage("it")}
                    className={`flex items-center cursor-pointer gap-3 px-4 py-3 w-full text-left transition-colors border-b ${
                      theme === "dark"
                        ? "hover:bg-blue-200/20 border-b border-slate-500/40"
                        : "hover:bg-blue-100/50 border-b border-slate-500/40"
                    }`}
                  >
                    <img
                      src={itFlag}
                      alt="Italian"
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="font-medium">Italiano</span>
                  </button>
                  <button
                    onClick={() => changeLanguage("ar")}
                    className={`flex items-center cursor-pointer gap-3 px-4 py-3 w-full text-left transition-colors border-b ${
                      theme === "dark"
                        ? "hover:bg-blue-200/20 border-b border-slate-500/40"
                        : "hover:bg-blue-100/50 border-b border-slate-500/40"
                    }`}
                  >
                    <img
                      src={arFlag}
                      alt="Arabic"
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="font-medium">العربية</span>
                  </button>
                  <button
                    onClick={() => changeLanguage("ua")}
                    className={`flex items-center cursor-pointer gap-3 px-4 py-3 w-full text-left transition-colors border-b ${
                      theme === "dark"
                        ? "hover:bg-blue-200/20 border-b border-slate-500/40"
                        : "hover:bg-blue-100/50 border-b border-slate-500/40"
                    }`}
                  >
                    <img
                      src={uaFlag}
                      alt="Ukrainian"
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="font-medium">Українська</span>
                  </button>
                  <button
                    onClick={() => changeLanguage("hi")}
                    className={`flex items-center cursor-pointer gap-3 px-4 py-3 w-full text-left transition-colors border-b ${
                      theme === "dark"
                        ? "hover:bg-blue-200/20 border-b border-slate-500/40"
                        : "hover:bg-blue-100/50 border-b border-slate-500/40"
                    }`}
                  >
                    <img
                      src={hiFlag}
                      alt="Hindi"
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="font-medium">हिन्दी</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Section */}
        {location.pathname !== "/" && (
          <div className="z-30 flex items-center gap-3">
            {muted !== undefined && setMuted && (
              <button
                onClick={() => setMuted((m: any) => !m)}
                aria-pressed={muted}
                aria-label={muted ? "Unmute sounds" : "Mute sounds"}
                title={muted ? "Unmute" : "Mute"}
                className={`p-2 rounded-full border-2 transition-all duration-300 hover:scale-105 cursor-pointer shadow-md backdrop-blur-md ${
                  theme === "dark"
                    ? "bg-slate-800/90 border-slate-600 text-slate-200 hover:bg-slate-700/90"
                    : "bg-white/90 border-slate-300 text-slate-700 hover:bg-white"
                }`}
              >
                <span className="text-xl">{muted ? "🔇" : "🔊"}</span>
              </button>
            )}
            {userData &&
              currentUser &&
              (location.pathname == "/menu" ||
                location.pathname == "/friends" ||
                location.pathname == "/world-ranking" ||
                location.pathname == "/available-rooms") && (
                <Link
                  to={"/profile/" + userData.username}
                  className={`hidden md:flex items-center gap-2 px-3 py-1 rounded-xl backdrop-blur-md border transition-all duration-300 ${
                    theme === "dark"
                      ? "bg-slate-900/40 border-slate-600/50 hover:bg-slate-800/50 text-white"
                      : "bg-slate-100/40 border-slate-300/50 hover:bg-slate-200/50 text-black"
                  }`}
                >
                  {userData.avatarUrl ? (
                    <img
                      src={userData.avatarUrl}
                      alt={userData.username}
                      className="w-10 h-10 rounded-full object-cover border border-slate-400/50 bg-blue-600"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border border-slate-400/50"></div>
                  )}
                  <div className="flex flex-col text-xs sm:text-sm gap-0.5">
                    <span className="font-bold">{userData.username}</span>
                    <div className="flex gap-3 flex-wrap">
                      <span className="text-xs opacity-75">
                        🏆 {userData.activeTitle}
                      </span>
                      <span className="text-xs opacity-75">
                        ⭐ {userData.stats?.points || 0}
                      </span>
                    </div>
                  </div>
                </Link>
              )}
            <div
              onClick={handleExit}
              className={`p-2 rounded-full border-2 transition-all duration-300 hover:scale-105 cursor-pointer shadow-md backdrop-blur-md ${
                theme === "dark"
                  ? "bg-slate-800/90 border-slate-600 text-slate-200 hover:bg-slate-700/90"
                  : "bg-white/90 border-slate-300 text-slate-700 hover:bg-white"
              }`}
            >
              <div className="flex gap-2 items-center">
                <img
                  src={return_img || "/placeholder.svg"}
                  alt="go back"
                  className={`w-6 ${theme === "dark" ? "invert" : ""}`}
                />
                <p className="font-semibold">{t("room.backToMenu")}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
