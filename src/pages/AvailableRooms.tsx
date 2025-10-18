import { useContext, useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { ThemeContext } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext"; // EKLENDI
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import return_img from "../assets/return.png";
import refresh from "../assets/refresh.png";
import { logStaleRoomsByLastActivity } from "../services/roomCleanup";
import { usePageTitle } from "../hooks/usePageTitle";

const AvailableRooms = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { currentUser } = useAuth(); // EKLENDI
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [guestName, setGuestName] = useState("");
  const [cahRefresh, setCahRefresh] = useState(true);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Kullanıcı adını otomatik al
  const getPlayerName = () => {
    if (currentUser) {
      // Giriş yapmış kullanıcı için email'den username al
      return currentUser.email?.split("@")[0] || "User";
    }
    // Guest kullanıcı için manuel girilen ismi kullan
    return guestName;
  };

  usePageTitle("MMA XOX - Available Rooms");

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      const roomsRef = collection(db, "rooms");
      const q = query(
        roomsRef,
        where("guest.now", "==", null), // DOĞRU
        where("isRankedRoom", "==", false)
      );
      const querySnapshot = await getDocs(q);
      const roomList: any = [];
      querySnapshot.forEach((doc) => {
        roomList.push({ id: doc.id, ...doc.data() });
      });
      setRooms(roomList);
      setLoading(false);
    };
    fetchRooms();
  }, []);

  useEffect(() => {
    // oturum başına bir kere dene
    const last = Number(localStorage.getItem("cleanupAt") || 0);

    if (Date.now() - last > 0.1 * 60 * 1000) {
      // 5 dk throttling
      logStaleRoomsByLastActivity();
      localStorage.setItem("cleanupAt", String(Date.now()));
    }
  }, [currentUser]);

  // const handleRoomClick = (roomId: any) => {
  //   setSelectedRoom(roomId);
  // };

  const handleJoinRoom = async () => {
    const finalPlayerName = getPlayerName();

    // Guest kullanıcı için isim kontrolü
    if (!currentUser && !guestName) {
      toast.error("Please enter your name!");
      return;
    }

    if (!selectedRoom || typeof selectedRoom !== "string") {
      toast.error("No room selected!");
      return;
    }

    try {
      const roomRef = doc(db, "rooms", selectedRoom);
      await updateDoc(roomRef, {
        guest: { now: finalPlayerName },
        guestJoinMethod: "available-rooms", // EKLENDI
      });
      navigate(`/room/${selectedRoom}?role=guest&name=${finalPlayerName}`);
    } catch (error) {
      toast.error("Failed to join the room!");
    }
  };

  // Eğer giriş yapmış kullanıcıysa direkt join et
  const handleDirectJoin = async (roomId: string) => {
    if (currentUser) {
      const finalPlayerName = getPlayerName();
      try {
        const roomRef = doc(db, "rooms", roomId);
        await updateDoc(roomRef, {
          guest: { now: finalPlayerName },
          guestJoinMethod: "available-rooms", // EKLENDI
        });
        navigate(`/room/${roomId}?role=guest&name=${finalPlayerName}`);
      } catch (error) {
        toast.error("Failed to join the room!");
      }
    } else {
      // Guest kullanıcı için modal aç
      setSelectedRoom(roomId);
    }
  };

  const handleExit = async () => {
    navigate("/menu");
  };

  const handleRefresh = async () => {
    if (!cahRefresh) {
      toast.error("Please wait 5 seconds before refreshing again!");
      return;
    }
    setCahRefresh(false);
    setLoading(true);
    setTimeout(() => {
      setCahRefresh(true);
    }, 5000);

    const roomsRef = collection(db, "rooms");
    const q = query(
      roomsRef,
      where("guest.now", "==", null),
      where("isRankedRoom", "==", false) // EKLENDI - ranked odaları gösterme
    );
    const querySnapshot = await getDocs(q);
    const roomList: any = [];
    querySnapshot.forEach((doc) => {
      roomList.push({ id: doc.id, ...doc.data() });
    });
    setRooms(roomList);
    setLoading(false);
  };

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
      className={`min-h-screen relative overflow-hidden transition-all duration-1000 ${
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

      {/* Theme Toggle */}
      <div className="absolute z-30 top-6 left-6">
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
              src="https://clipart-library.com/images/6iypd9jin.png"
              className="lg:w-6 lg:h-6 w-5 h-5"
              alt="Light mode"
            />
          ) : (
            <img
              src="https://clipart-library.com/img/1669853.png"
              className="lg:w-6 lg:h-6 w-5 h-5"
              alt="Dark mode"
            />
          )}
        </div>
      </div>

      {/* Back Button */}
      <div
        className="absolute z-30 top-6 right-6"
        onClick={handleExit}
      >
        <div
          className={`p-2 rounded-full border-2 transition-all duration-300 hover:scale-105 cursor-pointer shadow-xl backdrop-blur-md ${
            theme === "dark"
              ? "bg-slate-800/90 border-slate-600 text-slate-200 hover:bg-slate-700/90"
              : "bg-white/90 border-slate-300 text-slate-700 hover:bg-white"
          }`}
        >
          <div className="flex gap-2 items-center">
            <img
              src={return_img || "/placeholder.svg"}
              className="w-6"
            />
            <p className="font-semibold">Back to menu</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex justify-center items-center min-h-screen px-4">
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
                  src="https://cdn-icons-png.freepik.com/512/921/921676.png"
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

          <div
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
          </div>

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
              <p className="text-lg font-semibold">No available rooms.</p>
              <p className="text-sm opacity-75 mt-1">
                Check back later or create a new room!
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
                        src="https://www.svgrepo.com/show/309807/number-symbol.svg"
                        className="h-4"
                      />
                      Room:
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
                        src="https://cdn-icons-png.flaticon.com/512/9131/9131478.png"
                        className="h-4"
                      />
                      Host:
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
                      Click to join as: <strong>{getPlayerName()}</strong>
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
                Joining Room:{" "}
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
                placeholder="Enter your name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className={`mb-4 px-4 py-3 rounded-xl border-2 w-full outline-none transition-all duration-200 focus:scale-105 ${
                  theme === "dark"
                    ? "bg-slate-700/80 border-slate-600 text-slate-200 focus:border-red-400 placeholder-slate-400"
                    : "bg-white/80 border-slate-300 text-slate-700 focus:border-red-500 placeholder-slate-500"
                }`}
              />
              <div className="flex w-full justify-between gap-4">
                <button
                  onClick={() => setSelectedRoom(null)}
                  className={`px-6 py-3 rounded-xl font-bold cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 ${
                    theme === "dark"
                      ? "bg-slate-700 hover:bg-slate-600 text-slate-200 border-2 border-slate-600"
                      : "bg-slate-400 hover:bg-slate-500 text-white border-2 border-slate-300"
                  }`}
                >
                  Cancel
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
                  Join Room
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
