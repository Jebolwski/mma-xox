import { useContext, useRef, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { useNavigate, Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
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

const SidebarMenu = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { t, i18n } = useTranslation();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [userData, setUserData] = useState<any>(null);

  // Fetch user data
  useEffect(() => {
    if (currentUser?.email) {
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
  }, [currentUser]);

  // Handle click outside sidebar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onClose();
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleLogin = async () => {
    navigate("/login");
    onClose();
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
  };

  const getLanguageFlag = () => {
    switch (i18n.language) {
      case "tr":
        return trFlag;
      case "pt":
        return ptFlag;
      case "sp":
        return spFlag;
      case "ru":
        return ruFlag;
      case "de":
        return deFlag;
      case "ar":
        return arFlag;
      case "hi":
        return hiFlag;
      case "zh":
        return zhFlag;
      case "ja":
        return jaFlag;
      case "ko":
        return koFlag;
      case "fr":
        return frFlag;
      case "sw":
        return swFlag;
      case "pl":
        return plFlag;
      case "it":
        return itFlag;
      case "nl":
        return nlFlag;
      case "ua":
        return uaFlag;
      default:
        return enFlag;
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-110"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed left-0 top-0 h-full w-80 z-120 transition-transform duration-300 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${
          theme === "dark"
            ? "bg-gradient-to-b from-slate-900 to-slate-800"
            : "bg-gradient-to-b from-slate-50 to-slate-100"
        } border-r ${
          theme === "dark" ? "border-slate-700/50" : "border-slate-200/50"
        } backdrop-blur-md shadow-2xl`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-lg transition-all cursor-pointer ${
            theme === "dark"
              ? "hover:bg-slate-700/50 text-slate-300"
              : "hover:bg-slate-200/50 text-slate-700"
          }`}
        >
          <span className="text-2xl">✕</span>
        </button>

        {/* Sidebar Content */}
        <div className="pt-20 pb-6 px-4 h-full flex flex-col overflow-y-auto">
          {/* Profile Card */}
          {userData && currentUser && (
            <Link
              to={"/profile/" + userData.username}
              onClick={onClose}
              className={`mb-6 p-4 rounded-xl backdrop-blur-md border transition-all ${
                theme === "dark"
                  ? "bg-purple-900/40 border-purple-600/50 hover:bg-purple-800/50 text-white"
                  : "bg-purple-100/40 border-purple-300/50 hover:bg-purple-200/50 text-black"
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={userData.avatarUrl}
                  alt={userData.username}
                  className="w-12 h-12 rounded-full object-cover border-2 border-purple-400/50"
                />
                <div className="flex-1">
                  <p className="font-bold text-sm">{userData.username}</p>
                  <p className="text-xs opacity-75">
                    🏆 {userData.activeTitle}
                  </p>
                </div>
              </div>
              <div className="flex justify-between text-xs opacity-75">
                <span>⭐ {userData.stats?.points || 0}</span>
                <span>
                  📊 {userData.stats?.totalGames || 0} {t("sidebar.games")}
                </span>
              </div>
            </Link>
          )}

          {/* Divider */}
          <div
            className={`my-4 h-px ${
              theme === "dark" ? "bg-slate-700/50" : "bg-slate-200/50"
            }`}
          />

          {/* Theme Toggle */}
          <button
            onClick={() => toggleTheme()}
            className={`w-full py-3 px-4 cursor-pointer rounded-lg mb-2 flex items-center gap-3 transition-all font-medium ${
              theme === "dark"
                ? "bg-slate-700/50 hover:bg-slate-600/50 text-slate-200"
                : "bg-slate-200/50 hover:bg-slate-300/50 text-slate-700"
            }`}
          >
            <span className="text-xl">{theme === "dark" ? "☀️" : "🌙"}</span>
            <span>{t("sidebar.theme")}</span>
          </button>

          {/* Language Selection */}
          <div
            className={`py-3 px-4 rounded-lg mb-2 ${
              theme === "dark"
                ? "bg-slate-700/50 text-white"
                : "bg-slate-200/50 text-black"
            }`}
          >
            <p className="text-sm font-medium mb-3 opacity-75">
              {t("sidebar.language")}
            </p>
            <div className="grid grid-cols-4 gap-2 max-h-34 overflow-y-auto p-1">
              {[
                { code: "en", flag: enFlag },
                { code: "tr", flag: trFlag },
                { code: "pt", flag: ptFlag },
                { code: "sp", flag: spFlag },
                { code: "ru", flag: ruFlag },
                { code: "de", flag: deFlag },
                { code: "ar", flag: arFlag },
                { code: "hi", flag: hiFlag },
                { code: "zh", flag: zhFlag },
                { code: "ja", flag: jaFlag },
                { code: "ko", flag: koFlag },
                { code: "fr", flag: frFlag },
                { code: "sw", flag: swFlag },
                { code: "pl", flag: plFlag },
                { code: "it", flag: itFlag },
                { code: "nl", flag: nlFlag },
                { code: "ua", flag: uaFlag },
              ].map(({ code, flag }) => (
                <button
                  key={code}
                  onClick={() => changeLanguage(code)}
                  className={`w-full aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                    i18n.language === code
                      ? theme === "dark"
                        ? "border-purple-500 ring-2 ring-purple-400"
                        : "border-purple-400 ring-2 ring-purple-300"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={flag}
                    alt={code}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1" />

          {/* Logout Button */}
          {currentUser && (
            <button
              onClick={handleLogout}
              className={`w-full py-3 px-4 rounded-lg flex items-center justify-center cursor-pointer gap-2 transition-all font-medium ${
                theme === "dark"
                  ? "bg-red-900/50 hover:bg-red-800/50 text-red-200"
                  : "bg-red-200/50 hover:bg-red-300/50 text-red-700"
              }`}
            >
              <span className="text-xl">🚪</span>
              <span>{t("sidebar.logout")}</span>
            </button>
          )}
          {/* Login Button */}
          {!currentUser && (
            <button
              onClick={handleLogin}
              className={`w-full py-3 px-4 rounded-lg flex items-center justify-center cursor-pointer gap-2 transition-all font-medium ${
                theme === "dark"
                  ? "bg-green-900/50 hover:bg-green-800/50 text-green-200"
                  : "bg-green-300/50 hover:bg-green-400/50 text-green-700"
              }`}
            >
              <span className="text-xl">🚪</span>
              <span>{t("sidebar.login")}</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default SidebarMenu;
