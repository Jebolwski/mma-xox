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
      where("isRankedRoom", "==", false)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: Record<string, unknown>[] = [];
        snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
        setRooms(list as never[]);
        setLoading(false);
      },
      (err) => {
        console.error("rooms subscribe failed:", err);
        toast.error("Failed to listen rooms.");
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

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
      toast.error("Please enter your name!");
      return;
    }

    if (!selectedRoom || typeof selectedRoom !== "string") {
      toast.error("No room selected!");
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
      toast.error("Failed to join the room!");
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
        toast.error("Failed to join the room!");
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

      <ToastContainer
        position="bottom-right"
        theme={theme === "dark" ? "dark" : "light"}
      />

      {/* Main Content */}
      <div className="relative z-10 flex justify-center items-center min-h-[calc(100vh-61px)] px-4">
        <div
          className={`mt-8 p-6 rounded-2xl border-4 shadow-2xl backdrop-blur-md transition-all duration-300 ${
            theme === "dark"
              ? "bg-slate-800/90 border-red-500 shadow-red-500/20"
              : "bg-white/90 border-red-600 shadow-red-600/20"
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
                    theme === "dark" ? "text-yellow-400" : "text-yellow-600"
                  } drop-shadow-lg -mt-1`}
                  style={{
                    textShadow:
                      theme === "dark"
                        ? "1px 1px 0px #a16207, 2px 2px 0px #713f12"
                        : "1px 1px 0px #d97706, 2px 2px 0px #92400e",
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
