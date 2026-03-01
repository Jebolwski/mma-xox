import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { ThemeContext } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext"; // EKLENDI
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import number from "../assets/number.svg";
import return_img from "../assets/return.png";
import trFlag from "../assets/tr.png";
import enFlag from "../assets/en.jpg";
import user_logo from "../assets/user.png";
// import refresh from "../assets/refresh.png";
import {
  logStaleRoomsByLastActivity,
  cleanupAllStaleRooms,
} from "../services/roomCleanup";
import { usePageTitle } from "../hooks/usePageTitle";
import light from "../assets/light.png";
import dark from "../assets/dark.png";

const AvailableRooms = () => {
  const [languageDropdown, setLanguageDropdown] = useState(false);
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
    setLanguageDropdown(false);
  };
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { t, i18n } = useTranslation();
  const { currentUser } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [guestName, setGuestName] = useState("");
  // const [cahRefresh, setCahRefresh] = useState(true);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const NAME_MAX = 16;
  const sanitizeName = (name: string) =>
    (name || "").trim().replace(/\s+/g, " ").slice(0, NAME_MAX);

  // Kullanıcı adını otomatik al
  const getPlayerName = () => {
    if (currentUser) {
      // Giriş yapmış kullanıcı için email'den username al
      const base = currentUser.email?.split("@")[0] || "User";
      return sanitizeName(base);
    }
    // Guest kullanıcı için manuel girilen ismi kullan
    return sanitizeName(guestName);
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

  usePageTitle(t("menu.availableRoomsTitle"));

  useEffect(() => {
    setLoading(true);
    const roomsRef = collection(db, "rooms");
    const q = query(
      roomsRef,
      where("guest.now", "==", null),
      where("isRankedRoom", "==", false),
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: Record<string, unknown>[] = [];
        snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
        // Eğer kullanıcı giriş yapmışsa, kendi oluşturduğu odaları gösterme
        const filteredRooms = currentUser
          ? list.filter((room: any) => room.hostEmail !== currentUser.email)
          : list;
        setRooms(filteredRooms as never[]);
        setLoading(false);
      },
      (err) => {
        console.error("rooms subscribe failed:", err);
        toast.error(t("room.listenRoomsFailed"));
        setLoading(false);
      },
    );
    return () => unsub();
  }, [currentUser]);

  useEffect(() => {
    // oturum başına bir kere dene
    const last = Number(localStorage.getItem("cleanupAt") || 0);

    if (Date.now() - last > 2 * 60 * 1000) {
      // 2 dk throttling
      // Hem casual hem ranked odaları temizle
      cleanupAllStaleRooms();
      localStorage.setItem("cleanupAt", String(Date.now()));
    }
  }, [currentUser]);

  // const handleRoomClick = (roomId: any) => {
  //   setSelectedRoom(roomId);
  // };

  const handleJoinRoom = async () => {
    const finalPlayerName = getPlayerName();

    // Guest kullanıcı için isim kontrolü
    if (!currentUser && !finalPlayerName) {
      toast.error(t("room.enterNameError"));
      return;
    }

    if (!selectedRoom || typeof selectedRoom !== "string") {
      toast.error(t("room.noRoomSelected"));
      return;
    }

    try {
      const roomRef = doc(db, "rooms", selectedRoom);
      const roomDoc = await getDoc(roomRef);
      const currentGuest = roomDoc.data()?.guest;
      await updateDoc(roomRef, {
        guest: { prev: currentGuest?.now || null, now: finalPlayerName },
        guestJoinMethod: "available-rooms", // EKLENDI
      });
      navigate(`/room/${selectedRoom}`, {
        state: { role: "guest", name: finalPlayerName },
      });
    } catch {
      toast.error(t("room.joinRoomFailed"));
    }
  };

  // Eğer giriş yapmış kullanıcıysa direkt join et
  const handleDirectJoin = async (roomId: string) => {
    if (currentUser) {
      const finalPlayerName = getPlayerName();
      try {
        const roomRef = doc(db, "rooms", roomId);
        const roomDoc = await getDoc(roomRef);
        const currentGuest = roomDoc.data()?.guest;
        await updateDoc(roomRef, {
          guest: { prev: currentGuest?.now || null, now: finalPlayerName },
          guestJoinMethod: "available-rooms",
        });
        navigate(`/room/${roomId}`, {
          state: { role: "guest", name: finalPlayerName },
        });
      } catch {
        toast.error(t("room.joinRoomFailed"));
      }
    } else {
      setSelectedRoom(roomId);
    }
  };

  const handleExit = async () => {
    navigate(-1);
  };

  // const handleRefresh = async () => {
  //   if (!cahRefresh) {
  //     toast.error("Please wait 5 seconds before refreshing again!");
  //     return;
  //   }
  //   setCahRefresh(false);
  //   setLoading(true);
  //   setTimeout(() => {
  //     setCahRefresh(true);
  //   }, 5000);

  //   // Liste zaten canlı; refresh ile sadece temizlik tetikle
  //   logStaleRoomsByLastActivity().catch(() => {});
  // };

  const SkeletonRoom = () => (
    <div
      className={`p-4 rounded-lg shadow-md border cursor-pointer animate-pulse ${
        theme === "dark"
          ? "bg-slate-800/90 border-slate-600 text-slate-200"
          : "bg-white/90 border-slate-300 text-slate-700"
      }`}
    >
      <div
        className={`h-4 w-1/3 rounded mb-2 ${
          theme === "dark" ? "bg-slate-600" : "bg-slate-300"
        }`}
      ></div>
      <div
        className={`h-4 w-1/2 rounded ${
          theme === "dark" ? "bg-slate-600" : "bg-slate-300"
        }`}
      ></div>
    </div>
  );

  return (
    <div
      className={`min-h-[calc(100vh-61px)] relative overflow-hidden transition-all duration-1000 ${
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
      <ToastContainer
        position="bottom-right"
        theme={theme === "dark" ? "dark" : "light"}
      />

      {/* Main Content */}
      <div className="relative z-10 flex justify-center items-center min-h-[calc(100vh-61px)] px-4">
        <div
          className={`mt-8 p-6 rounded-2xl border-4 shadow-2xl backdrop-blur-sm transition-all duration-300 ${
            theme === "dark"
              ? "bg-slate-800/60 border-red-500 shadow-red-500/20"
              : "bg-white/60 border-red-600 shadow-red-600/20"
          }`}
          style={{
            maxHeight: "85vh",
            overflowY: "auto",
            maxWidth: "400px",
            width: "100%",
          }}
        >
          <div
            className={`flex items-center justify-between mb-4 ${
              theme === "dark" ? "text-slate-200" : "text-slate-700"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={logo}
                  alt="logo"
                  className="w-12 h-12"
                />
              </div>
              <div>
                <h1
                  className={`text-2xl font-black tracking-wider ${
                    theme === "dark" ? "text-red-400" : "text-red-600"
                  } drop-shadow-lg`}
                  style={{
                    textShadow:
                      theme === "dark"
                        ? "2px 2px 0px #7f1d1d, 4px 4px 0px #450a0a"
                        : "2px 2px 0px #dc2626, 4px 4px 0px #991b1b",
                  }}
                >
                  MMA
                </h1>
                <h2
                  className={`text-xl font-black tracking-widest ${
                    theme === "dark" ? "text-purple-400" : "text-purple-600"
                  } drop-shadow-lg -mt-1`}
                  style={{
                    textShadow:
                      theme === "dark"
                        ? "1px 1px 0px #7007a1, 2px 2px 0px #5b1271"
                        : "1px 1px 0px #8506d9, 2px 2px 0px #570e92",
                  }}
                >
                  XOX
                </h2>
              </div>
            </div>
          </div>

          {/* <div
            className={`flex justify-between items-center mb-4 ${
              theme === "dark" ? "text-slate-200" : "text-slate-700"
            }`}
          >
            <p className="text-xl font-bold italic">Available Rooms</p>
            <div
              onClick={handleRefresh}
              className={`p-2 rounded-lg transition-all duration-200 ${
                cahRefresh
                  ? `cursor-pointer hover:scale-110 ${
                      theme === "dark"
                        ? "hover:bg-slate-700/50"
                        : "hover:bg-slate-200/50"
                    }`
                  : "opacity-20 cursor-not-allowed"
              }`}
              title="Refresh available rooms"
            >
              <img
                src={refresh}
                alt="refresh"
                className="w-8"
              />
            </div>
          </div> */}

          {loading ? (
            <ul className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <li key={i}>
                  <SkeletonRoom />
                </li>
              ))}
            </ul>
          ) : rooms.length === 0 ? (
            <div
              className={`text-center py-8 px-4 rounded-xl border-2 border-dashed ${
                theme === "dark"
                  ? "text-slate-300 border-slate-600"
                  : "text-slate-600 border-slate-400"
              }`}
            >
              <p className="text-lg font-semibold">
                {t("room.noAvailableRooms")}
              </p>
              <p className="text-sm opacity-75 mt-1">
                {t("room.checkBackLater")}
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {rooms.map((room: any) => (
                <li
                  key={room.id}
                  className={`p-4 rounded-xl shadow-lg border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer backdrop-blur-sm ${
                    theme === "dark"
                      ? "bg-slate-700/80 border-slate-600 text-slate-200 hover:bg-slate-600/80 hover:border-slate-500"
                      : "bg-white/80 border-slate-300 text-slate-700 hover:bg-white hover:border-slate-400"
                  }`}
                  onClick={() => handleDirectJoin(room.id)} // DEĞİŞTİRİLDİ
                >
                  <div className="flex gap-2 items-center">
                    <div className="font-semibold flex gap-2 items-center">
                      <img
                        src={number}
                        className="h-4"
                      />
                      {t("room.roomLabel")}
                    </div>
                    <span
                      className={`font-mono ${
                        theme === "dark" ? "text-yellow-400" : "text-red-600"
                      }`}
                    >
                      {room.id}
                    </span>
                  </div>
                  <div className="flex gap-2 items-center mt-2">
                    <div className="font-semibold flex gap-2 items-center">
                      <img
                        src={user_logo}
                        className="h-4"
                      />
                      {t("room.hostLabel")}
                    </div>
                    <span
                      className={`font-semibold ${
                        theme === "dark" ? "text-green-400" : "text-green-600"
                      }`}
                    >
                      {room.host}
                    </span>
                  </div>

                  {/* Giriş yapmış kullanıcı için bilgi göster */}
                  {currentUser && (
                    <div className="mt-2 text-xs opacity-75">
                      {t("room.clickToJoinAs")}{" "}
                      <strong>{getPlayerName()}</strong>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Modal sadece guest kullanıcılar için görünür */}
        {selectedRoom && !currentUser && (
          <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
            <div
              className={`p-8 rounded-2xl shadow-2xl border-4 backdrop-blur-md transition-all duration-300 animate-bounce-slow ${
                theme === "dark"
                  ? "bg-slate-800/95 border-red-500 shadow-red-500/30"
                  : "bg-white/95 border-red-600 shadow-red-600/30"
              }`}
            >
              <div
                className={`mb-4 text-xl text-center font-bold ${
                  theme === "dark" ? "text-slate-200" : "text-slate-700"
                }`}
              >
                {t("room.joiningRoom")}{" "}
                <span
                  className={`${
                    theme === "dark" ? "text-red-400" : "text-red-600"
                  } font-mono`}
                >
                  {selectedRoom}
                </span>
              </div>
              <input
                type="text"
                placeholder={t("room.enterName")}
                value={guestName}
                onChange={(e) =>
                  setGuestName(e.target.value.slice(0, NAME_MAX))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleJoinRoom();
                  }
                }}
                maxLength={NAME_MAX}
                className={`mb-1 px-4 py-3 rounded-xl border-2 w-full outline-none transition-all duration-200 focus:scale-105 ${
                  theme === "dark"
                    ? "bg-slate-700/80 border-slate-600 text-slate-200 focus:border-red-400 placeholder-slate-400"
                    : "bg-white/80 border-slate-300 text-slate-700 focus:border-red-500 placeholder-slate-500"
                }`}
              />
              <div
                className={`mb-4 -mt-1 text-right text-xs ${
                  theme === "dark" ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {guestName.length}/{NAME_MAX}
              </div>
              <div className="flex w-full justify-between gap-4">
                <button
                  onClick={() => setSelectedRoom(null)}
                  className={`px-6 py-3 rounded-xl font-bold cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 ${
                    theme === "dark"
                      ? "bg-slate-700 hover:bg-slate-600 text-slate-200 border-2 border-slate-600"
                      : "bg-slate-400 hover:bg-slate-500 text-white border-2 border-slate-300"
                  }`}
                >
                  {t("common.cancel")}
                </button>
                <button
                  onClick={handleJoinRoom}
                  className={`px-6 py-3 rounded-xl font-bold cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 ${
                    theme === "dark"
                      ? "bg-green-600 hover:bg-green-500 text-white border-2 border-green-500 shadow-lg shadow-green-600/30"
                      : "bg-green-500 hover:bg-green-600 text-white border-2 border-green-400 shadow-lg shadow-green-500/30"
                  }`}
                  style={{
                    textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
                  }}
                >
                  {t("room.joinRoom")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailableRooms;
