import { useContext, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import trFlag from "../assets/tr.png";
import enFlag from "../assets/en.jpg";
import ptFlag from "../assets/pt.png";
import spFlag from "../assets/sp.png";
import ruFlag from "../assets/russia_flag.jpg";
import deFlag from "../assets/ge.png";
import arFlag from "../assets/sa.png";
import hiFlag from "../assets/in.png";
import zhFlag from "../assets/ch.png";
import jaFlag from "../assets/jp.png";
import koFlag from "../assets/kr.png";
import light from "../assets/light.png";
import { ThemeContext } from "../context/ThemeContext";
import return_img from "../assets/return.png";
import dark from "../assets/dark.png";
import { useNavigate, useLocation } from "react-router-dom";

const Header = () => {
  const { theme, toggleTheme: contextToggleTheme } = useContext(ThemeContext);
  const toggleTheme = contextToggleTheme;
  const { t, i18n } = useTranslation();
  const [languageDropdown, setLanguageDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
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
    if (location.pathname === "/menu" || location.pathname === "/login") {
      navigate("/");
    } else {
      navigate("/menu");
    }
  };

  return (
    <div className="absolute top-0 left-0 w-full z-50 bg-transparent flex flex-wrap gap-4 justify-between items-center p-4">
      <div>
        <div className="flex items-center gap-3">
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
                src={light}
                className="lg:w-6 lg:h-6 w-5 h-5"
                alt="Light mode"
              />
            ) : (
              <img
                src={dark}
                className="lg:w-6 lg:h-6 w-5 h-5"
                alt="Dark mode"
              />
            )}
          </div>
          <div className="relative">
            <button
              onClick={handleLanguageClick}
              className="lg:w-[50px] lg:h-[50px] w-[46px] h-[46px] bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 border border-slate-500 flex items-center justify-center rounded-full cursor-pointer transition-all hover:scale-110 shadow-blue-300/50 dark:shadow-blue-900/50 duration-300 overflow-hidden"
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
                                      : "English"
                }
                className="w-full h-full rounded-full object-cover"
              />
            </button>

            {/* Dropdown Menu */}
            {languageDropdown && (
              <div
                className={`z-60 w-40 absolute top-14 left-0 rounded-br-xl rounded-tl-xl shadow-xl border overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 z-20 ${
                  theme === "dark"
                    ? "bg-slate-700 text-white border-slate-500/40 shadow-2xl language-dropdown-dark"
                    : "bg-slate-100 text-slate-800 border-slate-500/40 language-dropdown-light"
                }`}
                style={{ height: "200px", overflowY: "auto" }}
              >
                <button
                  onClick={() => changeLanguage("tr")}
                  className={`z-80 flex items-center cursor-pointer gap-3 px-4 py-3 w-full text-left transition-colors ${
                    theme === "dark"
                      ? "hover:bg-blue-200/20 border-b border-slate-500/40"
                      : "hover:bg-blue-100/50 border-b border-slate-500/40"
                  }`}
                >
                  <img
                    src={trFlag}
                    alt="Turkish"
                    className="w-6 h-6 rounded object-cover rounded-full"
                  />
                  <span className="font-medium">Türkçe</span>
                </button>
                <button
                  onClick={() => changeLanguage("en")}
                  className={`flex items-center cursor-pointer gap-3 px-4 py-3 w-full text-left transition-colors ${
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
                  className={`flex items-center cursor-pointer gap-3 px-4 py-3 w-full text-left transition-colors ${
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
                  onClick={() => changeLanguage("sp")}
                  className={`flex items-center cursor-pointer gap-3 px-4 py-3 w-full text-left transition-colors ${
                    theme === "dark"
                      ? "hover:bg-blue-200/20"
                      : "hover:bg-blue-100/50"
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
                  onClick={() => changeLanguage("ko")}
                  className={`flex items-center cursor-pointer gap-3 px-4 py-3 w-full text-left transition-colors ${
                    theme === "dark"
                      ? "hover:bg-blue-200/20"
                      : "hover:bg-blue-100/50"
                  }`}
                >
                  <img
                    src={koFlag}
                    alt="Korean"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="font-medium">한국어</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {location.pathname !== "/" && (
        <div>
          <div
            onClick={handleExit}
            className={`p-2 rounded-full border-2 transition-all duration-300 hover:scale-105 cursor-pointer shadow-xl backdrop-blur-md ${
              theme === "dark"
                ? "bg-slate-800/90 border-slate-600 text-slate-200 hover:bg-slate-700/90"
                : "bg-white/90 border-slate-300 text-slate-700 hover:bg-white"
            }`}
          >
            <div className="flex gap-2">
              <img
                src={return_img || "/placeholder.svg"}
                className="w-6"
              />
              <p className="font-semibold">{t("room.backToMenu")}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
