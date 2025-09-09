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

      if (roomData.guest.now !== null) {
        console.log(roomData.guest);
        toast.error("Bu oda dolu! Başka bir oda deneyin.");
        return;
      }

      // Oda boşsa ve bulunduysa odaya katıl
      navigate(`/room/${roomCode}?role=guest&name=${playerName}`);
    } catch (error) {
      toast.error("Odaya katılırken bir hata oluştu!");
      console.error(error);
    }
  };

  return (
    <div
      className={`w-screen h-screen ${
        theme === "dark" ? "bg-stone-800" : "bg-stone-200"
      } flex items-center justify-center`}
    >
      <div
        className={`p-8 rounded-lg shadow-xl border w-96 ${
          theme === "dark"
            ? "bg-stone-700 border-stone-600 text-stone-200"
            : "bg-stone-300 border-stone-400 text-stone-800"
        }`}
      >
        <ToastContainer
          position="bottom-right"
          theme="dark"
        />
        <div className="absolute z-30 text-red-500 top-3 left-3">
          {theme === "dark" ? (
            <div
              onClick={toggleTheme}
              className="p-1 rounded-full bg-stone-700 border border-stone-800 cursor-pointer shadow-xl"
            >
              <img
                src="https://clipart-library.com/images/6iypd9jin.png"
                className="w-8"
              />
            </div>
          ) : (
            <div
              onClick={toggleTheme}
              className="p-1 rounded-full bg-stone-300 border border-stone-400 cursor-pointer shadow-xl"
            >
              <img
                src="https://clipart-library.com/img/1669853.png"
                className="w-8"
              />
            </div>
          )}
        </div>
        <div className="absolute z-30 top-3 right-3">
          <div
            className={`p-1 rounded-lg border border-stone-800 duration-300 cursor-pointer shadow-xl ${
              theme === "dark"
                ? "bg-stone-700 text-stone-200 hover:bg-stone-600"
                : "bg-stone-200 text-stone-800 hover:bg-stone-300"
            }`}
          >
            <Link
              to={"/"}
              className="flex gap-2"
            >
              <img
                src={return_img}
                className="w-6"
              />
              <p className="font-semibold">Back to home</p>
            </Link>
          </div>
        </div>
        <div className="flex items-center justify-center mb-6">
          <img
            src="https://cdn-icons-png.freepik.com/512/921/921676.png"
            alt="logo"
            className="w-12 h-12 mr-3"
          />
          <h1 className="text-3xl font-bold">MMA XOX</h1>
        </div>

        {!showJoinFields && !showCreateFields ? (
          <div className="space-y-4">
            <button
              onClick={handleLocalGame}
              className="w-full bg-red-500 cursor-pointer text-white py-3 rounded-lg font-semibold hover:bg-red-600 duration-200"
            >
              Play on Same Screen
            </button>
            <button
              onClick={handleAvailableRooms}
              className="w-full bg-purple-500 cursor-pointer text-white py-3 rounded-lg font-semibold hover:bg-purple-600 duration-200"
            >
              See Avaliable Rooms
            </button>
            <button
              onClick={() => setShowCreateFields(true)}
              className="w-full bg-green-500 cursor-pointer text-white py-3 rounded-lg font-semibold hover:bg-green-600 duration-200"
            >
              Create Room
            </button>
            <button
              onClick={() => setShowJoinFields(true)}
              className="w-full bg-blue-500 cursor-pointer text-white py-3 rounded-lg font-semibold hover:bg-blue-600 duration-200"
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
              className={`${
                theme == "dark"
                  ? "bg-stone-600 border-stone-500 text-white"
                  : "bg-stone-200 border-stone-400 text-black"
              } w-full px-4 py-2 rounded-lg border focus:outline-none focus:border-stone-400`}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowCreateFields(false)}
                className={`${
                  theme == "dark"
                    ? "bg-stone-600 text-white"
                    : "bg-stone-500 text-white"
                } w-1/2 cursor-pointer py-2 rounded-lg font-semibold hover:bg-stone-600 transition`}
              >
                Back
              </button>
              <button
                onClick={handleCreateRoom}
                className="w-1/2 bg-green-500 cursor-pointer text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition"
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
              className={`${
                theme == "dark"
                  ? "bg-stone-600 border-stone-500 text-white"
                  : "bg-stone-200 border-stone-400 text-black"
              } w-full px-4 py-2 rounded-lg border focus:outline-none focus:border-stone-400`}
            />
            <input
              type="text"
              placeholder="Room code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className={`${
                theme == "dark"
                  ? "bg-stone-600 border-stone-500 text-white"
                  : "bg-stone-200 border-stone-400 text-black"
              } w-full px-4 py-2 rounded-lg border focus:outline-none focus:border-stone-400`}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowJoinFields(false)}
                className={`${
                  theme == "dark"
                    ? "bg-stone-600 text-white"
                    : "bg-stone-500 text-white"
                } w-1/2 cursor-pointer py-2 rounded-lg font-semibold hover:bg-stone-600 transition`}
              >
                Back
              </button>
              <button
                onClick={handleJoinRoom}
                className="w-1/2 bg-blue-500 cursor-pointer text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition"
              >
                Join Room
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
