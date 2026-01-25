"use client";

import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ReactGA from "react-ga4";
import { ToastContainer, toast } from "react-toastify";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { ThemeContext } from "../context/ThemeContext";
import return_img from "../assets/return.png";
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
import { useAuth } from "../context/AuthContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { sanitizePlayerName } from "../utils/security";
import light from "../assets/light.png";
import dark from "../assets/dark.png";
import logo from "../assets/logo.png";

const Menu = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { currentUser, logout } = useAuth();
  const [languageDropdown, setLanguageDropdown] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [showJoinFields, setShowJoinFields] = useState(false);
  const [showCreateFields, setShowCreateFields] = useState(false);
  const [showRandomFields, setShowRandomFields] = useState(false);
  const [isRankedRoom, setIsRankedRoom] = useState(false);
  const [showRankedConfirm, setShowRankedConfirm] = useState(false);
  const [showRankedNoRooms, setShowRankedNoRooms] = useState(false);
  const [userUsername, setUserUsername] = useState("");

  useEffect(() => {
    if (currentUser?.email) {
      const userRef = doc(db, "users", currentUser.email);
      getDoc(userRef).then((docSnap) => {
        if (docSnap.exists()) {
          setUserUsername(docSnap.data().username || "");
        }
      });
    }
  }, [currentUser]);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
    setLanguageDropdown(false);
  };

  const getUsernameForUrl = () => {
    return userUsername ? encodeURIComponent(userUsername.toLowerCase()) : "";
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

  usePageTitle(t("menu.title"));

  // Grid görünüm mü? (form ekranlarında max-w-md kalsın)
  const isGrid =
    !showJoinFields &&
    !showCreateFields &&
    !showRandomFields &&
    !showRankedConfirm;

  const tiles = [
    {
      key: "local",
      title: t("menu.playLocal"),
      subtitle: t("menu.playLocally"),
      icon: "🎮",
      gradient: "from-red-500 to-red-600",
      onClick: () => handleLocalGame(),
    },
    {
      key: "random",
      title: t("menu.randomMatch"),
      subtitle: t("menu.casualMatch"),
      icon: "🎲",
      gradient: "from-orange-500 to-orange-600",
      onClick: () => setShowRandomFields(true),
    },
    {
      key: "ranked",
      title: t("menu.playRanked"),
      subtitle: t("menu.competeForPoints"),
      icon: "🏆",
      gradient: "from-yellow-500 to-yellow-600",
      disabled: !currentUser,
      onClick: () => (currentUser ? setShowRankedConfirm(true) : null),
    },
    {
      key: "available",
      title: t("menu.availableRooms"),
      subtitle: t("menu.browseRooms"),
      icon: "🗂️",
      gradient: "from-purple-500 to-purple-600",
      onClick: () => handleAvailableRooms(),
    },
    {
      key: "create",
      title: t("menu.createRoom"),
      subtitle: t("menu.hostNewGame"),
      icon: "➕",
      gradient: "from-green-500 to-green-600",
      onClick: () => setShowCreateFields(true),
    },
    {
      key: "join",
      title: t("menu.joinRoom"),
      subtitle: t("menu.enterRoomCode"),
      icon: "🔑",
      gradient: "from-blue-500 to-blue-600",
      onClick: () => setShowJoinFields(true),
    },
    {
      key: "ranking",
      title: t("ranking.title"),
      subtitle: t("menu.globalLeaderboard"),
      icon: "🌍",
      gradient: "from-indigo-500 to-indigo-600",
      disabled: !currentUser,
      onClick: () => (currentUser ? navigate("/world-ranking") : null),
    },
    {
      key: "friends",
      title: t("friends.title"),
      subtitle: t("menu.requestsInvites"),
      icon: "👥",
      disabled: !currentUser,
      gradient: "from-pink-500 to-pink-600",
      onClick: () => (currentUser ? navigate("/friends") : null),
    },
    // Her zaman göster; login yoksa disabled
    {
      key: "profile",
      title: t("menu.profile"),
      subtitle: t("menu.seeStats"),
      icon: "👤",
      gradient: "from-sky-500 to-sky-600",
      disabled: !currentUser,
      onClick: () =>
        currentUser ? navigate("/profile/" + getUsernameForUrl()) : null, // GÜNCELLENDİ
    },
  ];

  const handleLocalGame = () => {
    navigate("/same-screen");
  };

  const handleAvailableRooms = () => {
    navigate("/available-rooms");
  };

  const handleExit = async () => {
    navigate("/");
  };

  const NAME_MAX = 16;

  // Legacy - now using sanitizePlayerName from utils
  const sanitizeGuestName = (name: string) => {
    return sanitizePlayerName(name).slice(0, NAME_MAX);
  };
  const getPlayerName = () => {
    if (currentUser) {
      // Kullanıcının username'i kullan
      return userUsername || "User";
    }
    return sanitizeGuestName(playerName);
  };

  const handleCreateRoom = async () => {
    const finalPlayerName = getPlayerName();
    if (!currentUser && !finalPlayerName) {
      toast.error(t("menu.enterName"));
      return;
    }

    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();

    try {
      await setDoc(doc(db, "rooms", newRoomId), {
        host: finalPlayerName,
        hostJoinMethod: "create",
        guest: null,
        guestJoinMethod: null,
        isRankedRoom: currentUser ? isRankedRoom : false,
        turn: "red",
        gameStarted: false,
        createdAt: new Date().toISOString(),
      });

      // State'le navigate et - daha güvenli
      navigate(`/room/${newRoomId}`, {
        state: {
          role: "host",
          name: finalPlayerName,
          isRanked: currentUser && isRankedRoom,
        },
      });
    } catch (error) {
      toast.error(t("errors.createRoom"));
      console.error(error);
    }
  };

  const handleJoinRoom = async () => {
    const finalPlayerName = getPlayerName();
    if (!currentUser && !finalPlayerName) {
      toast.error(t("menu.enterName"));
      return;
    }

    if (!roomCode) {
      toast.error(t("menu.enterRoomCodeError"));
      return;
    }

    try {
      const roomRef = doc(db, "rooms", roomCode);
      const roomDoc = await getDoc(roomRef);

      if (!roomDoc.exists()) {
        toast.error(t("menu.roomNotFound"));
        return;
      }

      const roomData = roomDoc.data();

      if (roomData.guest && roomData.guest.now !== null) {
        toast.error(t("menu.roomFull"));
        return;
      }

      // Odaya katıl ve guestJoinMethod'u set et
      await updateDoc(roomRef, {
        guest: { now: finalPlayerName },
        guestJoinMethod: "direct-code", // EKLENDI
      });

      navigate(`/room/${roomCode}`, {
        state: { role: "guest", name: finalPlayerName },
      });
    } catch (error) {
      toast.error(t("errors.joinRoom"));
      console.error(error);
    }
  };

  // Random Match (Puansız) - mevcut fonksiyonu güncelle
  const handleRandomMatch = async () => {
    const finalPlayerName = getPlayerName();
    if (!currentUser && !finalPlayerName) {
      toast.error(t("menu.enterName"));
      return;
    }

    try {
      // Sadece NON-RANKED odaları ara
      const roomsRef = collection(db, "rooms");
      const q = query(
        roomsRef,
        where("guest.now", "==", null), // DOĞRU
        where("isRankedRoom", "==", false),
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast.error(t("menu.noCasualRooms"));
        return;
      }

      // Rastgele bir casual oda seç
      const availableRooms: any[] = [];
      querySnapshot.forEach((doc) => {
        availableRooms.push({ id: doc.id, ...doc.data() });
      });

      const randomRoom =
        availableRooms[Math.floor(Math.random() * availableRooms.length)];

      // Odaya katılırken guestJoinMethod'u set et
      await updateDoc(doc(db, "rooms", randomRoom.id), {
        guest: { now: finalPlayerName },
        guestJoinMethod: "random",
      });

      navigate(`/room/${randomRoom.id}`, {
        state: { role: "guest", name: finalPlayerName },
      });

      // Track event
      ReactGA.event("casual_match_joined", {
        player_name: finalPlayerName,
        opponent: randomRoom.host,
        language: i18n.language,
      });

      toast.success(t("menu.matchedWith", { player: randomRoom.host }));
    } catch (error) {
      toast.error(t("errors.randomMatch"));
      console.error(error);
    }
  };

  // Yeni Ranked Match fonksiyonu
  const handleRankedMatch = async () => {
    const finalPlayerName = getPlayerName();

    try {
      // Sadece RANKED odaları ara
      const roomsRef = collection(db, "rooms");
      const q = query(
        roomsRef,
        where("guest.now", "==", null), // DOĞRU - burada hata vardı
        where("isRankedRoom", "==", true),
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // Oda yoksa modal göster
        setShowRankedNoRooms(true);
        return;
      }

      // Rastgele bir ranked oda seç
      const availableRooms: any[] = [];
      querySnapshot.forEach((doc) => {
        availableRooms.push({ id: doc.id, ...doc.data() });
      });

      const randomRoom =
        availableRooms[Math.floor(Math.random() * availableRooms.length)];

      // Odaya katılırken guestJoinMethod'u set et
      await updateDoc(doc(db, "rooms", randomRoom.id), {
        guest: { now: finalPlayerName },
        guestJoinMethod: "random",
      });

      navigate(`/room/${randomRoom.id}`, {
        state: { role: "guest", name: finalPlayerName },
      });

      // Track event
      ReactGA.event("ranked_match_joined", {
        player_name: finalPlayerName,
        opponent: randomRoom.host,
        language: i18n.language,
      });

      toast.success(t("menu.rankedMatchFound", { player: randomRoom.host }));
    } catch (error) {
      toast.error(t("errors.rankedMatch"));
      console.error(error);
    }
  };

  // Ranked onay fonksiyonu
  const handleRankedConfirm = () => {
    setShowRankedConfirm(false);
    handleRankedMatch();
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success(t("common.logoutSuccess"));
      navigate("/"); // Home'a git
    } catch (error) {
      toast.error(t("errors.logout"));
    }
  };

  return (
    <div className="overflow-x-hidden">
      <ToastContainer
        position="bottom-right"
        theme={theme === "dark" ? "dark" : "light"}
        style={{ zIndex: 9999 }}
      />

      <div
        className="relative w-screen min-h-[calc(100vh-61px)] overflow-x-hidden pb-24 lg:pb-0 pt-[82px]"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div
          className={`absolute inset-0 transition-all duration-1000 ${
            theme === "dark"
              ? "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
              : "bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-50"
          }`}
        />

        <div className="absolute bottom-0 left-0 w-full h-64 overflow-hidden">
          <div
            className={`absolute bottom-0 left-0 w-full h-full transition-all duration-1000 ${
              theme === "dark"
                ? "bg-gradient-to-t from-slate-800/80 to-transparent"
                : "bg-gradient-to-t from-slate-300/60 to-transparent"
            }`}
            style={{
              clipPath:
                "polygon(0% 100%, 0% 60%, 15% 65%, 25% 45%, 35% 55%, 50% 35%, 65% 50%, 80% 30%, 90% 40%, 100% 25%, 100% 100%)",
            }}
          />
          <div
            className={`absolute bottom-0 left-0 w-full h-3/4 transition-all duration-1000 ${
              theme === "dark"
                ? "bg-gradient-to-t from-slate-700/60 to-transparent"
                : "bg-gradient-to-t from-slate-400/40 to-transparent"
            }`}
            style={{
              clipPath:
                "polygon(0% 100%, 0% 80%, 20% 70%, 30% 60%, 45% 65%, 60% 45%, 75% 55%, 85% 40%, 95% 50%, 100% 35%, 100% 100%)",
            }}
          />
        </div>

        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-1 h-1 rounded-full animate-pulse ${
                theme === "dark" ? "bg-purple-400/30" : "bg-indigo-400/40"
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex items-center justify-center p-4">
          <div
            className={`p-8 rounded-2xl shadow-2xl border backdrop-blur-md w-full ${
              isGrid ? "max-w-5xl" : "max-w-md"
            } transition-all duration-300 ${
              theme === "dark"
                ? "bg-slate-800/90 border-slate-600/50 text-slate-100"
                : "bg-white/90 border-slate-200/50 text-slate-800"
            }`}
          >
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="relative">
                <img
                  src={logo}
                  alt="MMA XOX Logo"
                  className="w-16 h-16"
                  style={{
                    filter: "drop-shadow(0 12px 24px #af1f91)",
                  }}
                />
              </div>
              <div>
                <h1
                  className={`text-4xl font-bold bg-gradient-to-r ${
                    theme === "dark"
                      ? "from-purple-400 to-red-600"
                      : "from-purple-600 to-red-600"
                  } bg-clip-text text-transparent`}
                >
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

            {isGrid ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {tiles.map((title) => {
                  const disabled = !!title.disabled;
                  const base =
                    "relative overflow-hidden rounded-2xl h-40 p-5 select-none transition-all";
                  const state = disabled
                    ? "opacity-60 cursor-not-allowed"
                    : "cursor-pointer hover:scale-[1.02] hover:shadow-xl";
                  const bg = `bg-gradient-to-br ${title.gradient}`;
                  return (
                    <div
                      key={title.key}
                      role="button"
                      tabIndex={disabled ? -1 : 0}
                      aria-disabled={disabled}
                      onClick={() => !disabled && title.onClick()}
                      onKeyDown={(e) => {
                        if (!disabled && (e.key === "Enter" || e.key === " ")) {
                          e.preventDefault();
                          title.onClick();
                        }
                      }}
                      className={`${base} ${bg} ${state} shadow-lg`}
                    >
                      {/* üst parlama */}
                      <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/10 blur-2xl" />

                      {/* DO-NOT-CROSS band (yalnızca disabled kartlarda) */}
                      {disabled && (
                        <div className="absolute inset-0 z-20 grid place-items-center pointer-events-none">
                          <div className="w-[180%] rotate-12">
                            <div
                              className={`flex items-center justify-center py-2 text-[10px] sm:text-xs md:text-sm font-extrabold uppercase tracking-widest text-black shadow-xl border border-black/40 text-white`}
                              style={{
                                background:
                                  "repeating-linear-gradient(135deg,#facc15 0px,#facc15 12px,#111 12px,#111 24px)",
                              }}
                            >
                              {t("menu.loginRequired")}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* içerik */}
                      <div className="flex h-full flex-col justify-between relative z-10">
                        <div className="text-3xl drop-shadow-sm">
                          {title.icon}
                        </div>
                        <div>
                          <div className="text-white font-extrabold text-xl leading-tight">
                            {title.title}
                          </div>
                          <div className="text-white/90 text-sm">
                            {title.subtitle}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : showRandomFields ? (
              <div className="space-y-4">
                {/* Sadece guest kullanıcılar için isim input'u göster */}
                {!currentUser && (
                  <div>
                    <input
                      type="text"
                      placeholder={t("menu.yourName")}
                      value={playerName}
                      onChange={(e) => {
                        const value = e.target.value;
                        try {
                          setPlayerName(
                            sanitizePlayerName(value).slice(0, NAME_MAX),
                          );
                        } catch {
                          // Allow empty string when user deletes everything
                          setPlayerName("");
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleRandomMatch();
                        }
                      }}
                      maxLength={NAME_MAX}
                      className={`w-full px-4 py-3 rounded-xl border backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 ${
                        theme === "dark"
                          ? "bg-slate-700/80 border-slate-600/50 text-white placeholder-slate-400 focus:ring-purple-500/50"
                          : "bg-white/80 border-slate-300/50 text-slate-800 placeholder-slate-500 focus:ring-indigo-500/50"
                      }`}
                    />
                    <div
                      className={`mt-1 text-right text-xs ${
                        theme === "dark" ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      {playerName.length}/{NAME_MAX}
                    </div>
                  </div>
                )}

                {/* Giriş yapmış kullanıcılar için bilgi göster */}
                {currentUser && (
                  <div
                    className={`w-full px-4 py-3 rounded-xl border backdrop-blur-sm ${
                      theme === "dark"
                        ? "bg-slate-700/80 border-slate-600/50 text-white"
                        : "bg-white/80 border-slate-300/50 text-slate-800"
                    }`}
                  >
                    <span className="text-sm">
                      {t("menu.playingAs")} <strong>{getPlayerName()}</strong>
                    </span>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowRandomFields(false)}
                    className={`w-1/2 py-3 rounded-xl font-semibold transition-all cursor-pointer duration-300 backdrop-blur-sm ${
                      theme === "dark"
                        ? "bg-slate-600/80 text-white hover:bg-slate-500/80"
                        : "bg-slate-500/80 text-white hover:bg-slate-600/80"
                    } hover:scale-105`}
                  >
                    {t("menu.back")}
                  </button>
                  <button
                    onClick={handleRandomMatch}
                    className="w-1/2 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-semibold cursor-pointer hover:from-orange-600 hover:to-orange-700 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                  >
                    {t("menu.findMatch")}
                  </button>
                </div>
              </div>
            ) : showCreateFields ? (
              <div className="space-y-4">
                {/* Sadece guest kullanıcılar için isim input'u göster */}
                {!currentUser && (
                  <div>
                    <input
                      type="text"
                      placeholder={t("menu.yourName")}
                      value={playerName}
                      onChange={(e) => {
                        const value = e.target.value;
                        try {
                          setPlayerName(
                            sanitizePlayerName(value).slice(0, NAME_MAX),
                          );
                        } catch {
                          // Allow empty string when user deletes everything
                          setPlayerName("");
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleCreateRoom();
                        }
                      }}
                      maxLength={NAME_MAX}
                      className={`w-full px-4 py-3 rounded-xl border backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 ${
                        theme === "dark"
                          ? "bg-slate-700/80 border-slate-600/50 text-white placeholder-slate-400 focus:ring-purple-500/50"
                          : "bg-white/80 border-slate-300/50 text-slate-800 placeholder-slate-500 focus:ring-indigo-500/50"
                      }`}
                    />
                    <div
                      className={`mt-1 text-right text-xs ${
                        theme === "dark" ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      {playerName.length}/{NAME_MAX}
                    </div>
                  </div>
                )}

                {/* Giriş yapmış kullanıcılar için bilgi göster */}
                {currentUser && (
                  <div
                    className={`w-full px-4 py-3 rounded-xl border backdrop-blur-sm ${
                      theme === "dark"
                        ? "bg-slate-700/80 border-slate-600/50 text-white"
                        : "bg-white/80 border-slate-300/50 text-slate-800"
                    }`}
                  >
                    <span className="text-sm">
                      {t("menu.creatingAs")}{" "}
                      <strong>{sanitizePlayerName(getPlayerName())}</strong>
                    </span>
                  </div>
                )}

                {/* Ranked Room Checkbox - Sadece giriş yapmış kullanıcılar için */}
                {currentUser && (
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isRankedRoom}
                        onChange={(e) => setIsRankedRoom(e.target.checked)}
                        className={`appearance-none w-5 h-5 border-2 rounded-md transition-all duration-200
              focus:outline-none
              checked:bg-gradient-to-br
              checked:from-green-500 checked:to-green-600
              checked:border-green-600
              border-slate-400
              ${
                theme === "dark"
                  ? "dark:border-slate-600 bg-slate-900"
                  : "bg-white"
              }`}
                      />
                      <span
                        className={`
              w-5 h-5 absolute pointer-events-none
              flex items-center justify-center
              text-white
              text-sm
              peer-checked:opacity-100
              opacity-0
              transition
            `}
                        style={{ marginLeft: "2px" }}
                      >
                        ✓
                      </span>
                      <span className="text-sm font-medium">
                        {t("menu.rankedRoomCheckbox")}
                      </span>
                    </label>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowCreateFields(false);
                      setIsRankedRoom(false); // Reset checkbox
                    }}
                    className={`w-1/2 py-3 rounded-xl font-semibold transition-all cursor-pointer duration-300 backdrop-blur-sm ${
                      theme === "dark"
                        ? "bg-slate-600/80 text-white hover:bg-slate-500/80"
                        : "bg-slate-500/80 text-white hover:bg-slate-600/80"
                    } hover:scale-105`}
                  >
                    {t("menu.back")}
                  </button>
                  <button
                    onClick={handleCreateRoom}
                    className="w-1/2 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-semibold cursor-pointer hover:from-green-600 hover:to-green-700 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                  >
                    {t("menu.createRoom")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Sadece guest kullanıcılar için isim input'u göster */}
                {!currentUser && (
                  <div>
                    <input
                      type="text"
                      placeholder={t("menu.yourName")}
                      value={playerName}
                      onChange={(e) => {
                        const value = e.target.value;
                        try {
                          setPlayerName(
                            sanitizePlayerName(value).slice(0, NAME_MAX),
                          );
                        } catch {
                          // Allow empty string when user deletes everything
                          setPlayerName("");
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && roomCode) {
                          handleJoinRoom();
                        }
                      }}
                      maxLength={NAME_MAX}
                      className={`w-full px-4 py-3 rounded-xl border backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 ${
                        theme === "dark"
                          ? "bg-slate-700/80 border-slate-600/50 text-white placeholder-slate-400 focus:ring-purple-500/50"
                          : "bg-white/80 border-slate-300/50 text-slate-800 placeholder-slate-500 focus:ring-indigo-500/50"
                      }`}
                    />
                    <div
                      className={`mt-1 text-right text-xs ${
                        theme === "dark" ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      {playerName.length}/{NAME_MAX}
                    </div>
                  </div>
                )}

                {/* Giriş yapmış kullanıcılar için bilgi göster */}
                {currentUser && (
                  <div
                    className={`w-full px-4 py-3 rounded-xl border backdrop-blur-sm ${
                      theme === "dark"
                        ? "bg-slate-700/80 border-slate-600/50 text-white"
                        : "bg-white/80 border-slate-300/50 text-slate-800"
                    }`}
                  >
                    <span className="text-sm">
                      Joining as:{" "}
                      <strong>{sanitizePlayerName(getPlayerName())}</strong>
                    </span>
                  </div>
                )}

                <input
                  type="text"
                  placeholder={t("menu.roomCode")}
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleJoinRoom();
                    }
                  }}
                  className={`w-full px-4 py-3 rounded-xl border backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 ${
                    theme === "dark"
                      ? "bg-slate-700/80 border-slate-600/50 text-white placeholder-slate-400 focus:ring-purple-500/50"
                      : "bg-white/80 border-slate-300/50 text-slate-800 placeholder-slate-500 focus:ring-indigo-500/50"
                  }`}
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowJoinFields(false)}
                    className={`w-1/2 py-3 rounded-xl font-semibold cursor-pointer transition-all duration-300 backdrop-blur-sm ${
                      theme === "dark"
                        ? "bg-slate-600/80 text-white hover:bg-slate-500/80"
                        : "bg-slate-500/80 text-white hover:bg-slate-600/80"
                    } hover:scale-105`}
                  >
                    {t("menu.back")}
                  </button>
                  <button
                    onClick={handleJoinRoom}
                    className="w-1/2 bg-gradient-to-r from-blue-500 to-blue-600 cursor-pointer text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                  >
                    {t("menu.joinRoom")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* YENİ RANKED CONFIRMATION MODAL */}
      {showRankedConfirm && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div
            className={`p-8 rounded-2xl shadow-2xl border-4 backdrop-blur-md transition-all duration-300 max-w-md w-full mx-4 ${
              theme === "dark"
                ? "bg-slate-800/95 border-yellow-500 shadow-yellow-500/30"
                : "bg-white/95 border-yellow-600 shadow-yellow-600/30"
            }`}
          >
            <div className="text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h2
                className={`text-2xl font-bold mb-4 ${
                  theme === "dark" ? "text-slate-200" : "text-slate-700"
                }`}
              >
                {t("menu.rankedTitle")}
              </h2>
              <p
                className={`mb-6 ${
                  theme === "dark" ? "text-slate-300" : "text-slate-600"
                }`}
                dangerouslySetInnerHTML={{
                  __html: t("menu.rankedMessage"),
                }}
              />
              <div
                className={`p-4 rounded-lg mb-6 ${
                  theme === "dark"
                    ? "bg-slate-700/50 border border-slate-600"
                    : "bg-slate-100 border border-slate-300"
                }`}
              >
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>{t("menu.rankedWin")}</span>
                    <span className="text-green-500 font-semibold">
                      {t("menu.rankedWinPoints")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("menu.rankedLoss")}</span>
                    <span className="text-red-500 font-semibold">
                      {t("menu.rankedLossPoints")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("menu.rankedDraw")}</span>
                    <span className="text-yellow-500 font-semibold">
                      {t("menu.rankedDrawPoints")}
                    </span>
                  </div>
                </div>
              </div>
              <p
                className={`text-sm mb-6 ${
                  theme === "dark" ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {t("menu.sureToProceeed")}
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowRankedConfirm(false)}
                className={`flex-1 py-3 rounded-xl font-bold cursor-pointer transition-all duration-200 hover:scale-105 ${
                  theme === "dark"
                    ? "bg-slate-700 hover:bg-slate-600 text-slate-200 border-2 border-slate-600"
                    : "bg-slate-400 hover:bg-slate-500 text-white border-2 border-slate-300"
                }`}
              >
                {t("menu.back")}
              </button>
              <button
                onClick={handleRankedConfirm}
                className="flex-1 py-3 rounded-xl cursor-pointer font-bold transition-all duration-200 hover:scale-105 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white shadow-lg shadow-yellow-600/30"
              >
                {t("menu.letGo")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RANKED NO ROOMS MODAL */}
      {showRankedNoRooms && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div
            className={`p-8 rounded-2xl shadow-2xl border-4 backdrop-blur-md transition-all duration-300 max-w-md w-full mx-4 ${
              theme === "dark"
                ? "bg-slate-800/95 border-orange-500 shadow-orange-500/30"
                : "bg-white/95 border-orange-600 shadow-orange-600/30"
            }`}
          >
            <div className="text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h2
                className={`text-2xl font-bold mb-4 ${
                  theme === "dark" ? "text-slate-200" : "text-slate-700"
                }`}
              >
                {t("menu.noRoomsTitle")}
              </h2>
              <p
                className={`mb-6 ${
                  theme === "dark" ? "text-slate-300" : "text-slate-600"
                }`}
              >
                {t("menu.noRoomsMessage")}
              </p>
              <p
                className={`text-sm mb-6 ${
                  theme === "dark" ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {t("menu.othersCanJoin")}
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowRankedNoRooms(false)}
                className={`flex-1 py-3 rounded-xl font-bold cursor-pointer transition-all duration-200 hover:scale-105 ${
                  theme === "dark"
                    ? "bg-slate-700 hover:bg-slate-600 text-slate-200 border-2 border-slate-600"
                    : "bg-slate-400 hover:bg-slate-500 text-white border-2 border-slate-300"
                }`}
              >
                {t("menu.back")}
              </button>
              <button
                onClick={() => {
                  setShowRankedNoRooms(false);
                  setIsRankedRoom(true);
                  setShowCreateFields(true);
                }}
                className="flex-1 py-3 rounded-xl cursor-pointer font-bold transition-all duration-200 hover:scale-105 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-600/30"
              >
                {t("menu.createRoom")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;
