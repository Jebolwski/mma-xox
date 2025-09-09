import React, { useContext, useEffect, useState } from "react";
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
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AvailableRooms = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [guestName, setGuestName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      const roomsRef = collection(db, "rooms");
      const q = query(roomsRef, where("guest.now", "==", null));
      const querySnapshot = await getDocs(q);
      const roomList = [];
      querySnapshot.forEach((doc) => {
        roomList.push({ id: doc.id, ...doc.data() });
      });
      setRooms(roomList);
    };
    fetchRooms();
  }, []);

  const handleRoomClick = (roomId) => {
    setSelectedRoom(roomId);
  };

  const handleJoinRoom = async () => {
    if (!guestName) {
      toast.error("Please enter your name!");
      return;
    }
    try {
      const roomRef = doc(db, "rooms", selectedRoom);
      await updateDoc(roomRef, {
        guest: { now: guestName },
      });
      navigate(`/room/${selectedRoom}?role=guest&name=${guestName}`);
    } catch (error) {
      toast.error("Failed to join the room!");
    }
  };

  return (
    <div
      className={`w-[100vw] h-[100vh] ${
        theme === "dark" ? "bg-stone-800" : "bg-stone-200"
      }`}
    >
      <ToastContainer
        position="bottom-right"
        theme="dark"
      />
      <div>
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
        <div className="flex w-full h-full justify-center">
          <div
            className={`mt-16 p-4 rounded-lg ${
              theme === "dark" ? "bg-stone-700" : "bg-stone-300"
            }`}
            style={{ maxHeight: "85vh", overflowY: "auto" }} // scroll ekledik
          >
            <div
              className={`flex items-center justify-center mb-6 ${
                theme === "dark" ? "text-white" : "text-black"
              }`}
            >
              <img
                src="https://cdn-icons-png.freepik.com/512/921/921676.png"
                alt="logo"
                className="w-12 h-12 mr-3"
              />
              <h1 className="text-3xl font-bold">MMA XOX</h1>
            </div>
            {rooms.length === 0 ? (
              <p
                className={
                  theme === "dark"
                    ? "text-white text-center"
                    : "text-black text-center"
                }
              >
                No available rooms.
              </p>
            ) : (
              <ul className="space-y-4">
                {rooms.map((room) => (
                  <li
                    key={room.id}
                    className={`p-4 rounded-lg shadow-md border cursor-pointer ${
                      theme === "dark"
                        ? "bg-stone-600 border-stone-700 text-white"
                        : "bg-stone-400 border-stone-500 text-black"
                    }`}
                    onClick={() => handleRoomClick(room.id)}
                  >
                    <div>
                      <span className="font-semibold">Room Code:</span>{" "}
                      {room.id}
                    </div>
                    <div>
                      <span className="font-semibold">Host:</span> {room.host}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {/* Modal veya input alanı */}
            {selectedRoom && (
              <div
                className={`mt-6 flex flex-col items-center p-2 rounded-md shadow-md border ${
                  theme === "dark"
                    ? "bg-stone-600 border-stone-700"
                    : "bg-stone-400 border-stone-500"
                }`}
              >
                <div
                  className={`mb-2 text-lg text-center font-semibold ${
                    theme === "dark" ? "text-white" : "text-black"
                  }`}
                >
                  Joining Room:{" "}
                  <span className="text-red-500">{selectedRoom}</span>
                </div>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className={`mb-2 px-4 py-2 rounded-lg border w-full outline-none ${
                    theme === "dark"
                      ? "bg-stone-500 border-stone-500 text-white"
                      : "bg-stone-300 border-stone-400 text-black"
                  }`}
                />
                <div className="flex w-full justify-between">
                  <button
                    onClick={() => setSelectedRoom(null)}
                    className={`px-4 py-2 rounded-lg font-semibold duration-200 cursor-pointer ${
                      theme === "dark"
                        ? "bg-stone-700 hover:bg-stone-800 text-white"
                        : "bg-stone-500 hover:bg-stone-300 text-black"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleJoinRoom}
                    className={`px-4 py-2 rounded-lg cursor-pointer duration-200 font-semibold ${
                      theme === "dark"
                        ? "bg-green-700 hover:bg-green-600 text-white"
                        : "bg-green-500 hover:bg-green-600 text-white"
                    }`}
                  >
                    Join Room
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailableRooms;
