"use client";

import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
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
import { useAuth } from "../context/AuthContext";

const Menu = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { currentUser, logout } = useAuth(); // EKLENDI

  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [showJoinFields, setShowJoinFields] = useState(false);
  const [showCreateFields, setShowCreateFields] = useState(false);
  const [showRandomFields, setShowRandomFields] = useState(false);
  const [isRankedRoom, setIsRankedRoom] = useState(false); // EKLENDI
  const [showRankedConfirm, setShowRankedConfirm] = useState(false); // EKLENDI

  // Grid görünüm mü? (form ekranlarında max-w-md kalsın)
  const isGrid =
    !showJoinFields &&
    !showCreateFields &&
    !showRandomFields &&
    !showRankedConfirm;

  const tiles = [
    {
      key: "local",
      title: "Same Screen",
      subtitle: "Play locally",
      icon: "🎮",
      gradient: "from-red-500 to-red-600",
      onClick: () => handleLocalGame(),
    },
    {
      key: "random",
      title: "Random Match",
      subtitle: "Casual",
      icon: "🎲",
      gradient: "from-orange-500 to-orange-600",
      onClick: () => setShowRandomFields(true),
    },
    {
      key: "ranked",
      title: "Ranked",
      subtitle: currentUser ? "Compete for points" : "Login required",
      icon: "🏆",
      gradient: "from-yellow-500 to-yellow-600",
      disabled: !currentUser,
      onClick: () => (currentUser ? setShowRankedConfirm(true) : null),
    },
    {
      key: "available",
      title: "Available Rooms",
      subtitle: "Browse public rooms",
      icon: "🗂️",
      gradient: "from-purple-500 to-purple-600",
      onClick: () => handleAvailableRooms(),
    },
    {
      key: "create",
      title: "Create Room",
      subtitle: "Host a new game",
      icon: "➕",
      gradient: "from-green-500 to-green-600",
      onClick: () => setShowCreateFields(true),
    },
    {
      key: "join",
      title: "Join Room",
      subtitle: "Enter room code",
      icon: "🔑",
      gradient: "from-blue-500 to-blue-600",
      onClick: () => setShowJoinFields(true),
    },
    {
      key: "ranking",
      title: "World Ranking",
      subtitle: "Global leaderboard",
      icon: "🌍",
      gradient: "from-indigo-500 to-indigo-600",
      onClick: () => navigate("/world-ranking"),
    },
    {
      key: "friends",
      title: "Friends",
      subtitle: currentUser ? "Requests & invites" : "Login required",
      icon: "👥",
      disabled: !currentUser,
      gradient: "from-pink-500 to-pink-600",
      onClick: () => (currentUser ? navigate("/friends") : null),
    },
    // Her zaman göster; login yoksa disabled
    {
      key: "profile",
      title: "My Profile",
      subtitle: currentUser
        ? currentUser.email?.split("@")[0] || "User"
        : "Login required",
      icon: "👤",
      gradient: "from-sky-500 to-sky-600",
      disabled: !currentUser,
      onClick: () => (currentUser ? navigate("/profile") : null),
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

  // Kullanıcı adını otomatik al
  const getPlayerName = () => {
    if (currentUser) {
      // Giriş yapmış kullanıcı için email'den username al
      return currentUser.email?.split("@")[0] || "User";
    }
    // Guest kullanıcı için manuel girilen ismi kullan
    return playerName;
  };

  const handleCreateRoom = async () => {
    const finalPlayerName = getPlayerName();

    if (!currentUser && !playerName) {
      toast.error("Please enter your name!");
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

      // URL'e ranked bilgisini ekle
      const rankedParam = currentUser && isRankedRoom ? "&ranked=true" : "";
      navigate(
        `/room/${newRoomId}?role=host&name=${finalPlayerName}${rankedParam}`
      );
    } catch (error) {
      toast.error("An error occurred while creating the room!");
      console.error(error);
    }
  };

  const handleJoinRoom = async () => {
    const finalPlayerName = getPlayerName();

    if (!currentUser && !playerName) {
      toast.error("Please enter your name!");
      return;
    }

    if (!roomCode) {
      toast.error("Please enter room code!");
      return;
    }

    try {
      const roomRef = doc(db, "rooms", roomCode);
      const roomDoc = await getDoc(roomRef);

      if (!roomDoc.exists()) {
        toast.error("No room found with this code!");
        return;
      }

      const roomData = roomDoc.data();

      if (roomData.guest && roomData.guest.now !== null) {
        toast.error("This room is full! Please try another room.");
        return;
      }

      // Odaya katıl ve guestJoinMethod'u set et
      await updateDoc(roomRef, {
        guest: { now: finalPlayerName },
        guestJoinMethod: "direct-code", // EKLENDI
      });

      navigate(`/room/${roomCode}?role=guest&name=${finalPlayerName}`);
    } catch (error) {
      toast.error("An error occurred while joining the room!");
      console.error(error);
    }
  };

  // Random Match (Puansız) - mevcut fonksiyonu güncelle
  const handleRandomMatch = async () => {
    const finalPlayerName = getPlayerName();

    if (!currentUser && !playerName) {
      toast.error("Please enter your name!");
      return;
    }

    try {
      // Sadece NON-RANKED odaları ara
      const roomsRef = collection(db, "rooms");
      const q = query(
        roomsRef,
        where("guest.now", "==", null), // DOĞRU
        where("isRankedRoom", "==", false)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast.error("No available casual rooms found!");
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

      navigate(`/room/${randomRoom.id}?role=guest&name=${finalPlayerName}`);
      toast.success(`You got matched with ${randomRoom.host}!`);
    } catch (error) {
      toast.error("An error occurred while finding a random match!");
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
        where("isRankedRoom", "==", true)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast.error("No available ranked rooms found!");
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

      navigate(`/room/${randomRoom.id}?role=guest&name=${finalPlayerName}`);
      toast.success(`Ranked match found! Playing against ${randomRoom.host}!`);
    } catch (error) {
      toast.error("An error occurred while finding a ranked match!");
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
      toast.success("Logged out successfully!");
      navigate("/"); // Home'a git
    } catch (error) {
      toast.error("Failed to logout");
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
        className="relative w-screen min-h-[100svh] overflow-x-hidden pb-24 lg:pb-0"
        style={{ WebkitOverflowScrolling: "touch", minHeight: "100dvh" }}
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

        {/* Back Button / User Info - Sağ üstte */}
        <div className="absolute z-30 top-6 right-6">
          {currentUser ? (
            // Giriş yapmış kullanıcı için username ve logout
            <div className="flex flex-wrap justify-end items-center gap-3">
              <div
                onClick={() => navigate("/profile")}
                className={`px-4 py-2 rounded-xl backdrop-blur-md border cursor-pointer ${
                  theme === "dark"
                    ? "bg-slate-800/80 border-slate-600/50 text-white"
                    : "bg-white/80 border-slate-200/50 text-slate-800"
                } shadow-lg`}
              >
                <span className="text-sm font-medium">
                  👤 {currentUser.email?.split("@")[0] || "User"}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className={`px-4 py-2 bg-red-600/70 rounded-xl cursor-pointer backdrop-blur-md border transition-all duration-300 ${
                  theme === "dark"
                    ? "border-red-500/50 text-white hover:bg-red-600/80"
                    : "border-red-400/50 text-white hover:bg-red-600/80"
                } shadow-lg`}
              >
                <div className="flex gap-2">
                  <img
                    src={return_img || "/placeholder.svg"}
                    className="lg:w-6 w-5"
                  />
                  <p className="lg:block hidden">Logout</p>
                </div>
              </button>
            </div>
          ) : (
            // Giriş yapmamış kullanıcı için back to home butonu
            <div
              onClick={handleExit}
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
                <p className="font-semibold">Back to home</p>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle - Sol üstte kalacak */}
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

        <div className="relative z-10 flex items-center justify-center min-h-full p-6">
          <div
            className={`p-8 rounded-2xl shadow-2xl border backdrop-blur-md w-full mt-24 ${
              isGrid ? "max-w-5xl" : "max-w-md"
            } transition-all duration-300 ${
              theme === "dark"
                ? "bg-slate-800/90 border-slate-600/50 text-slate-100"
                : "bg-white/90 border-slate-200/50 text-slate-800"
            }`}
          >
            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                <img
                  src="https://cdn-icons-png.freepik.com/512/921/921676.png"
                  alt="MMA XOX Logo"
                  className="w-16 h-16 mr-4"
                />
                <div
                  className={`absolute -inset-1 rounded-full blur-sm ${
                    theme === "dark" ? "bg-purple-500/20" : "bg-indigo-500/20"
                  }`}
                />
              </div>
              <div>
                <h1
                  className={`text-4xl font-bold bg-gradient-to-r ${
                    theme === "dark"
                      ? "from-purple-400 to-pink-400"
                      : "from-indigo-600 to-purple-600"
                  } bg-clip-text text-transparent`}
                >
                  MMA XOX
                </h1>
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  Ultimate Tic-Tac-Toe
                </p>
              </div>
            </div>

            {isGrid ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {tiles.map((t) => {
                  const disabled = !!t.disabled;
                  const base =
                    "relative overflow-hidden rounded-2xl h-40 p-5 select-none transition-all";
                  const state = disabled
                    ? "opacity-60 cursor-not-allowed"
                    : "cursor-pointer hover:scale-[1.02] hover:shadow-xl";
                  const bg = `bg-gradient-to-br ${t.gradient}`;
                  return (
                    <div
                      key={t.key}
                      role="button"
                      tabIndex={disabled ? -1 : 0}
                      aria-disabled={disabled}
                      onClick={() => !disabled && t.onClick()}
                      onKeyDown={(e) => {
                        if (!disabled && (e.key === "Enter" || e.key === " ")) {
                          e.preventDefault();
                          t.onClick();
                        }
                      }}
                      className={`${base} ${bg} ${state} shadow-lg`}
                    >
                      {/* üst parlama */}
                      <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/10 blur-2xl" />
                      {/* içerik */}
                      <div className="flex h-full flex-col justify-between">
                        <div className="text-3xl drop-shadow-sm">{t.icon}</div>
                        <div>
                          <div className="text-white font-extrabold text-xl leading-tight">
                            {t.title}
                          </div>
                          <div className="text-white/90 text-sm">
                            {t.subtitle}
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
                  <input
                    type="text"
                    placeholder="Your name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 ${
                      theme === "dark"
                        ? "bg-slate-700/80 border-slate-600/50 text-white placeholder-slate-400 focus:ring-purple-500/50"
                        : "bg-white/80 border-slate-300/50 text-slate-800 placeholder-slate-500 focus:ring-indigo-500/50"
                    }`}
                  />
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
                      Playing as: <strong>{getPlayerName()}</strong>
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
                    Back
                  </button>
                  <button
                    onClick={handleRandomMatch}
                    className="w-1/2 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-semibold cursor-pointer hover:from-orange-600 hover:to-orange-700 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                  >
                    Find Match
                  </button>
                </div>
              </div>
            ) : showCreateFields ? (
              <div className="space-y-4">
                {/* Sadece guest kullanıcılar için isim input'u göster */}
                {!currentUser && (
                  <input
                    type="text"
                    placeholder="Your name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 ${
                      theme === "dark"
                        ? "bg-slate-700/80 border-slate-600/50 text-white placeholder-slate-400 focus:ring-purple-500/50"
                        : "bg-white/80 border-slate-300/50 text-slate-800 placeholder-slate-500 focus:ring-indigo-500/50"
                    }`}
                  />
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
                      Creating room as: <strong>{getPlayerName()}</strong>
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
                        🏆 Ranked Room (Only for ranked matches)
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
                    Back
                  </button>
                  <button
                    onClick={handleCreateRoom}
                    className="w-1/2 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-semibold cursor-pointer hover:from-green-600 hover:to-green-700 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                  >
                    Create Room
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Sadece guest kullanıcılar için isim input'u göster */}
                {!currentUser && (
                  <input
                    type="text"
                    placeholder="Your name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 ${
                      theme === "dark"
                        ? "bg-slate-700/80 border-slate-600/50 text-white placeholder-slate-400 focus:ring-purple-500/50"
                        : "bg-white/80 border-slate-300/50 text-slate-800 placeholder-slate-500 focus:ring-indigo-500/50"
                    }`}
                  />
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
                      Joining as: <strong>{getPlayerName()}</strong>
                    </span>
                  </div>
                )}

                <input
                  type="text"
                  placeholder="Room code"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
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
                    Back
                  </button>
                  <button
                    onClick={handleJoinRoom}
                    className="w-1/2 bg-gradient-to-r from-blue-500 to-blue-600 cursor-pointer text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                  >
                    Join Room
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
                Ranked Match
              </h2>
              <p
                className={`mb-6 ${
                  theme === "dark" ? "text-slate-300" : "text-slate-600"
                }`}
              >
                You're about to enter a <strong>ranked match</strong> where your
                points will be affected based on the result.
              </p>
              <div
                className={`p-4 rounded-lg mb-6 ${
                  theme === "dark"
                    ? "bg-slate-700/50 border border-slate-600"
                    : "bg-slate-100 border border-slate-300"
                }`}
              >
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>🏅 Win:</span>
                    <span className="text-green-500 font-semibold">
                      +10 points
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>❌ Loss:</span>
                    <span className="text-red-500 font-semibold">
                      -3 points
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>🤝 Draw:</span>
                    <span className="text-yellow-500 font-semibold">
                      +2 points
                    </span>
                  </div>
                </div>
              </div>
              <p
                className={`text-sm mb-6 ${
                  theme === "dark" ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Are you sure you want to proceed?
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowRankedConfirm(false)}
                className={`flex-1 py-3 rounded-xl font-bold transition-all duration-200 hover:scale-105 ${
                  theme === "dark"
                    ? "bg-slate-700 hover:bg-slate-600 text-slate-200 border-2 border-slate-600"
                    : "bg-slate-400 hover:bg-slate-500 text-white border-2 border-slate-300"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleRankedConfirm}
                className="flex-1 py-3 rounded-xl font-bold transition-all duration-200 hover:scale-105 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white shadow-lg shadow-yellow-600/30"
              >
                Let's Go! 🚀
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;
