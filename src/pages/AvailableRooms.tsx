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
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import return_img from "../assets/return.png";

const AvailableRooms = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [guestName, setGuestName] = useState("");
  const [cahRefresh, setCahRefresh] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      const roomsRef = collection(db, "rooms");
      const q = query(roomsRef, where("guest.now", "==", null));
      const querySnapshot = await getDocs(q);
      const roomList: any = [];
      querySnapshot.forEach((doc) => {
        roomList.push({ id: doc.id, ...doc.data() });
      });
      setRooms(roomList);
    };
    fetchRooms();
  }, []);

  const handleRoomClick = (roomId: any) => {
    setSelectedRoom(roomId);
  };

  const handleJoinRoom = async () => {
    if (!guestName) {
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
        guest: { now: guestName },
      });
      navigate(`/room/${selectedRoom}?role=guest&name=${guestName}`);
    } catch (error) {
      toast.error("Failed to join the room!");
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
    console.log("cahRefresh:", false);
    setTimeout(() => {
      setCahRefresh(true);
      console.log("cahRefresh:", true);
    }, 5000);

    const roomsRef = collection(db, "rooms");
    const q = query(roomsRef, where("guest.now", "==", null));
    const querySnapshot = await getDocs(q);
    const roomList: any = [];
    querySnapshot.forEach((doc) => {
      roomList.push({ id: doc.id, ...doc.data() });
    });
    setRooms(roomList);
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
        <div
          className="absolute z-30 top-3 right-3"
          onClick={handleExit}
        >
          <div
            className={`p-1 rounded-lg border border-stone-800 duration-300 cursor-pointer shadow-xl ${
              theme === "dark"
                ? "bg-stone-700 text-stone-200 hover:bg-stone-600"
                : "bg-stone-200 text-stone-800 hover:bg-stone-300"
            }`}
          >
            <div className="flex gap-2">
              <img
                src={return_img}
                className="w-6"
              />
              <p className="font-semibold">Back to menu</p>
            </div>
          </div>
        </div>
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
            className={`mt-16 p-4 rounded-lg border-2 shadow-md relative ${
              theme === "dark"
                ? "bg-stone-600 border-stone-700"
                : "bg-stone-400/50 border-stone-300"
            }`}
            style={{ maxHeight: "85vh", overflowY: "auto" }}
          >
            <div
              className={`flex items-center justify-between mb-2 ${
                theme === "dark" ? "text-white" : "text-black"
              }`}
            >
              <div className="flex items-center gap-3">
                <img
                  src="https://cdn-icons-png.freepik.com/512/921/921676.png"
                  alt="logo"
                  className="w-12 h-12"
                />
                <h1 className="text-3xl font-bold">MMA XOX</h1>
              </div>
            </div>
            <div
              className={`flex justify-between items-center mb-2 ${
                theme === "dark" ? "text-white" : "text-black"
              }`}
            >
              <p className="text-lg font-semibold italic">Available Rooms</p>
              <div
                onClick={handleRefresh}
                className={`duration-200 ${
                  cahRefresh
                    ? "opacity-100 cursor-pointer"
                    : "opacity-20 cursor-not-allowed"
                } `}
                title="Refresh available rooms"
              >
                <img
                  src="https://icons.veryicon.com/png/o/miscellaneous/wasteapp/refresh-348.png"
                  alt="refresh"
                  className="w-8"
                />
              </div>
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
                {rooms.map((room: any) => (
                  <li
                    key={room.id}
                    className={`p-4 rounded-lg shadow-md border cursor-pointer ${
                      theme === "dark"
                        ? "bg-gradient-to-r from-stone-600 to-stone-500 border-stone-700 text-white"
                        : "bg-gradient-to-r from-stone-300 to-stone-200 border-stone-400 text-black"
                    }`}
                    onClick={() => handleRoomClick(room.id)}
                  >
                    <div className="flex gap-2 items-center">
                      <div className="font-semibold flex gap-1 items-center">
                        <img
                          src="https://www.svgrepo.com/show/309807/number-symbol.svg"
                          className="h-4"
                        />
                        Room:
                      </div>
                      {room.id}
                    </div>
                    <div className="flex gap-2 items-center mt-1">
                      <div className="font-semibold flex gap-1 items-center">
                        <img
                          src="https://cdn-icons-png.flaticon.com/512/9131/9131478.png"
                          className="h-4"
                        />
                        Host:
                      </div>
                      {room.host}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* Modal/input alanı scroll dışında */}
          {selectedRoom && (
            <div
              className={`fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black/40 z-50`}
            >
              <div
                className={`p-6 rounded-lg shadow-lg border ${
                  theme === "dark"
                    ? "bg-stone-500 border-stone-700"
                    : "bg-stone-200 border-stone-500"
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
                      ? "bg-stone-600 border-stone-500 text-white"
                      : "bg-stone-200 border-stone-500 text-black"
                  }`}
                />
                <div className="flex w-full justify-between">
                  <button
                    onClick={() => setSelectedRoom(null)}
                    className={`px-4 py-2 rounded-lg font-semibold duration-200 cursor-pointer ${
                      theme === "dark"
                        ? "bg-stone-700 hover:bg-stone-800 text-white"
                        : "bg-stone-400 hover:bg-stone-300 text-black"
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvailableRooms;
