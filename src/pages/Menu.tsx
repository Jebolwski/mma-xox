"use client";

import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { ThemeContext } from "../context/ThemeContext";
import { Link } from "react-router-dom";
import return_img from "../assets/return.png";

const Menu = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);

  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [showJoinFields, setShowJoinFields] = useState(false);
  const [showCreateFields, setShowCreateFields] = useState(false);

  const handleLocalGame = () => {
    navigate("/same-screen");
  };

  const handleAvailableRooms = () => {
    navigate("/available-rooms");
  };

  const handleCreateRoom = async () => {
    if (!playerName) {
      toast.error("Lütfen isminizi girin!");
      return;
    }
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();

    try {
      await setDoc(doc(db, "rooms", newRoomId), {
        host: playerName,
        guest: null,
        turn: "red",
        gameStarted: false,
        createdAt: new Date().toISOString(),
      });

      navigate(`/room/${newRoomId}?role=host&name=${playerName}`);
    } catch (error) {
      toast.error("Oda oluşturulurken bir hata oluştu!");
      console.error(error);
    }
  };

  const handleJoinRoom = async () => {
    if (!playerName || !roomCode) {
      toast.error("Lütfen tüm alanları doldurun!");
      return;
    }

    try {
      const roomRef = doc(db, "rooms", roomCode);
      const roomDoc = await getDoc(roomRef);

      if (!roomDoc.exists()) {
        toast.error("Bu kodda bir oda bulunamadı!");
        return;
      }

      const roomData = roomDoc.data();

      if (roomData.guest !== null) {
        console.log(roomData.guest);
        toast.error("Bu oda dolu! Başka bir oda deneyin.");
        return;
      }

      navigate(`/room/${roomCode}?role=guest&name=${playerName}`);
    } catch (error) {
      toast.error("Odaya katılırken bir hata oluştu!");
      console.error(error);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
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

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
              className="w-6 h-6"
              alt="Light mode"
            />
          ) : (
            <img
              src="https://clipart-library.com/img/1669853.png"
              className="w-6 h-6"
              alt="Dark mode"
            />
          )}
        </div>
      </div>

      <div className="absolute z-30 top-6 right-6">
        <Link
          to="/"
          className={`flex items-center gap-2 px-4 py-3 rounded-full transition-all duration-300 backdrop-blur-md border ${
            theme === "dark"
              ? "bg-slate-800/80 border-slate-600/50 text-slate-200 hover:bg-slate-700/80"
              : "bg-white/80 border-slate-200/50 text-slate-800 hover:bg-white/90"
          } shadow-xl hover:scale-105`}
        >
          <img
            src={return_img || "/placeholder.svg"}
            className="w-5 h-5"
            alt="Return"
          />
          <span className="font-semibold">Back to Home</span>
        </Link>
      </div>

      <div className="flex items-center justify-center min-h-screen p-6">
        <div
          className={`p-8 rounded-2xl shadow-2xl border backdrop-blur-md w-full max-w-md transition-all duration-300 ${
            theme === "dark"
              ? "bg-slate-800/90 border-slate-600/50 text-slate-100"
              : "bg-white/90 border-slate-200/50 text-slate-800"
          }`}
        >
          <ToastContainer
            position="bottom-right"
            theme={theme === "dark" ? "dark" : "light"}
          />

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

          {!showJoinFields && !showCreateFields ? (
            <div className="space-y-4">
              <button
                onClick={handleLocalGame}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 cursor-pointer text-white py-4 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 backdrop-blur-sm"
              >
                Play on Same Screen
              </button>
              <button
                onClick={handleAvailableRooms}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 cursor-pointer text-white py-4 rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 backdrop-blur-sm"
              >
                See Available Rooms
              </button>
              <button
                onClick={() => setShowCreateFields(true)}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 cursor-pointer text-white py-4 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 backdrop-blur-sm"
              >
                Create Room
              </button>
              <button
                onClick={() => setShowJoinFields(true)}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 cursor-pointer text-white py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 backdrop-blur-sm"
              >
                Join Room
              </button>
            </div>
          ) : showCreateFields ? (
            <div className="space-y-4">
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
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateFields(false)}
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
  );
};

export default Menu;
