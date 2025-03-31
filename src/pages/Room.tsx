import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  runTransaction,
} from "firebase/firestore";
import { db } from "../firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import return_img from "../assets/return.png";
import { Link } from "react-router-dom";
import fighters_url from "../assets/data/fighters.json";
import Filters from "../logic/filters";
import { Fighter } from "../interfaces/Fighter";

const Room = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role");
  const playerName = searchParams.get("name");
  const [theme, setTheme] = useState("dark");
  const [gameState, setGameState] = useState<any>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [fighters, setFighters] = useState<Fighter[]>([]);
  const [filters, setFilters] = useState<any>(null);
  const [filtersSelected, setFiltersSelected] = useState<any[]>([]);
  const [hasExited, setHasExited] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [positionsFighters, setPositionsFighters] = useState({
    position03: [],
    position04: [],
    position05: [],
    position13: [],
    position14: [],
    position15: [],
    position23: [],
    position24: [],
    position25: [],
  });

  useEffect(() => {
    document.title = "MMA XOX - Online Game";
  }, []);

  useEffect(() => {
    if (!roomId) return;

    console.log(
      "Ana snapshot listener başlatıldı - roomId:",
      roomId,
      "role:",
      role
    );
    const roomRef = doc(db, "rooms", roomId);
    const unsubscribe = onSnapshot(roomRef, (doc) => {
      console.log("Ana snapshot tetiklendi - doc exists:", doc.exists());
      if (doc.exists()) {
        const newData = doc.data();
        console.log("Ana snapshot - Room değişikliği:", {
          host: newData.host,
          guest: newData.guest,
          gameStarted: newData.gameStarted,
          gameEnded: newData.gameEnded,
          turn: newData.turn,
          winner: newData.winner,
          positions: Object.keys(newData.positions || {}).length,
        });

        setGameState(newData);
      } else {
        console.log("Ana snapshot - Oda silinmiş");
        if (role === "guest") {
          toast.info("Host oyundan çıktı!");
          setTimeout(() => {
            navigate("/");
          }, 1500);
        }
      }
    });

    return () => {
      console.log("Ana snapshot listener temizlendi");
      unsubscribe();
    };
  }, [roomId, role]);

  useEffect(() => {
    if (role === "host" && !gameState) {
      console.log("Host initialize effect tetiklendi");
      const initializeGame = async () => {
        const roomRef = doc(db, "rooms", roomId!);
        const f = Filters();
        const difficulty = "MEDIUM";
        const timerLength = "30";

        console.log("Host odayı oluşturuyor - roomId:", roomId);
        await setDoc(roomRef, {
          host: playerName,
          guest: null,
          turn: "red",
          difficulty,
          timerLength,
          gameStarted: false,
          positions: {},
          filters: f.medium,
        });
        console.log("Host oda oluşturma tamamlandı");
      };

      initializeGame();
    }
  }, [roomId, role, playerName]);

  useEffect(() => {
    if (
      role === "guest" &&
      gameState &&
      gameState?.guest == null &&
      !hasExited
    ) {
      console.log("Guest join effect tetiklendi");
      const joinGame = async () => {
        const roomRef = doc(db, "rooms", roomId!);
        console.log("Guest odaya katılıyor - playerName:", playerName);
        await updateDoc(roomRef, {
          guest: playerName,
        });
        console.log("Guest odaya katılma tamamlandı");
      };

      joinGame();
    }
  }, [gameState, role, playerName, roomId, hasExited]);

  const filterByName = (name: string) => {
    if (name.length > 3) {
      let filteredFighters = fighters_url.filter((fighter) => {
        return fighter.Fighter.toLowerCase().includes(name.toLowerCase());
      });
      setFighters(filteredFighters);
    }
  };

  const checkWinner = (positions: any) => {
    const board = [
      [
        positions.position03?.bg,
        positions.position13?.bg,
        positions.position23?.bg,
      ],
      [
        positions.position04?.bg,
        positions.position14?.bg,
        positions.position24?.bg,
      ],
      [
        positions.position05?.bg,
        positions.position15?.bg,
        positions.position25?.bg,
      ],
    ];

    const winPatterns = [
      // Yatay Kazanma
      [
        [0, 0],
        [0, 1],
        [0, 2],
      ],
      [
        [1, 0],
        [1, 1],
        [1, 2],
      ],
      [
        [2, 0],
        [2, 1],
        [2, 2],
      ],

      // Dikey Kazanma
      [
        [0, 0],
        [1, 0],
        [2, 0],
      ],
      [
        [0, 1],
        [1, 1],
        [2, 1],
      ],
      [
        [0, 2],
        [1, 2],
        [2, 2],
      ],

      // Çapraz Kazanma
      [
        [0, 0],
        [1, 1],
        [2, 2],
      ],
      [
        [0, 2],
        [1, 1],
        [2, 0],
      ],
    ];

    for (let pattern of winPatterns) {
      const [a, b, c] = pattern;
      const cellA = board[a[0]][a[1]];
      const cellB = board[b[0]][b[1]];
      const cellC = board[c[0]][c[1]];

      if (
        cellA &&
        cellB &&
        cellC &&
        cellA !== "from-stone-700 to-stone-800" &&
        cellA !== "from-stone-200 to-stone-300" &&
        cellA === cellB &&
        cellB === cellC
      ) {
        return cellA.includes("red") ? "red" : "blue";
      }
    }

    // Beraberlik kontrolü
    const isBoardFull = Object.values(positions).every(
      (pos: any) =>
        pos?.bg &&
        pos.bg !== "from-stone-700 to-stone-800" &&
        pos.bg !== "from-stone-200 to-stone-300"
    );

    if (isBoardFull) {
      return "draw";
    }

    return null;
  };

  const updateBox = async (fighter: Fighter) => {
    if (!gameState || !selected) return;

    const roomRef = doc(db, "rooms", roomId!);
    const newPositions = { ...gameState.positions };

    // Sadece gerekli bilgileri saklayalım
    newPositions[selected] = {
      url:
        fighter.Picture === "Unknown"
          ? "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png"
          : fighter.Picture,
      text: fighter.Fighter,
      bg:
        gameState.turn === "red"
          ? "from-red-800 to-red-900"
          : "from-blue-800 to-blue-900",
    };

    const winner = checkWinner(newPositions);
    const updates: any = {
      positions: newPositions,
      turn: gameState.turn === "red" ? "blue" : "red",
    };

    if (winner) {
      updates.winner = winner;
      updates.gameEnded = true;
    }

    try {
      await updateDoc(roomRef, updates);
      setSelected(null);
    } catch (error) {
      console.error("Pozisyon güncellenirken hata:", error);
      toast.error("Pozisyon güncellenirken bir hata oluştu!");
    }
  };

  const startGame = async () => {
    if (!roomId) return;

    const roomRef = doc(db, "rooms", roomId);
    const f = Filters();
    const difficulty = "MEDIUM"; // Varsayılan zorluk
    const timerLength = "30"; // Varsayılan süre

    await updateDoc(roomRef, {
      gameStarted: true,
      difficulty,
      timerLength,
      filters: f.medium,
    });
  };

  const handleExit = async () => {
    if (!roomId || !playerName || !role || isExiting) return;

    setIsExiting(true);
    const roomRef = doc(db, "rooms", roomId);

    try {
      if (role === "host") {
        // Host çıkarsa odayı tamamen sil
        console.log("Host çıkış işlemi başladı");
        console.log("Room ID:", roomId);

        // Transaction içinde silme işlemini gerçekleştir
        await runTransaction(db, async (transaction) => {
          // Önce odayı kontrol et
          const roomDoc = await transaction.get(roomRef);

          if (!roomDoc.exists()) {
            console.log("Oda zaten silinmiş");
            return;
          }

          // Odayı sil
          transaction.delete(roomRef);
          console.log("Silme işlemi transaction'a eklendi");
        });

        // Toast mesajını göster ve 1.5 saniye sonra yönlendir
        toast.success("Oda başarıyla silindi!");
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else if (role === "guest") {
        // Guest çıkarsa sadece guest'i null yap
        setHasExited(true); // Guest'in çıkış yaptığını işaretle
        await updateDoc(roomRef, {
          guest: null,
        });
        console.log(`${playerName} (guest) oyundan çıktı.`);
        navigate("/");
      }
    } catch (error) {
      console.error("Çıkış yapılırken hata oluştu:", error);
      console.error(
        "Hata detayı:",
        error instanceof Error ? error.message : "Bilinmeyen hata"
      );
      toast.error("Çıkış yapılırken bir hata oluştu!");
      // Hata durumunda da ana sayfaya yönlendir
      navigate("/");
    } finally {
      setIsExiting(false);
    }
  };

  if (!gameState) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-2xl">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div
      className={`w-screen h-screen ${
        theme === "dark" ? "bg-stone-800" : "bg-stone-200"
      }`}
    >
      <ToastContainer
        position="bottom-right"
        theme="dark"
      />

      {/* Tema değiştirme butonu */}
      <div className="absolute z-30 top-3 left-3">
        <div
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className={`p-1 rounded-full cursor-pointer shadow-xl ${
            theme === "dark"
              ? "bg-stone-700 border-stone-800"
              : "bg-stone-300 border-stone-400"
          } border`}
        >
          <img
            src={
              theme === "dark"
                ? "https://clipart-library.com/images/6iypd9jin.png"
                : "https://clipart-library.com/img/1669853.png"
            }
            className="w-8"
            alt="theme"
          />
        </div>
      </div>

      {/* Geri dönüş butonu */}
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

      {/* Oyun alanı */}
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-2xl mb-4">Oda Kodu: {roomId}</div>

        {gameState.gameStarted && !gameState.gameEnded ? (
          <div className="flex flex-col items-center">
            <div className="mb-4">
              <p
                className={`text-xl font-semibold ${
                  gameState.turn === "red" ? "text-red-500" : "text-blue-500"
                }`}
              >
                Sıra:{" "}
                {gameState.turn === "red" ? gameState.host : gameState.guest}
              </p>
            </div>

            {/* Filtreler */}
            <div className="flex gap-[2px] mb-4">
              {gameState.filters &&
                gameState.filters
                  .slice(0, 3)
                  .map((filter: any, index: number) => (
                    <div
                      key={index}
                      className={`xl:w-44 xl:h-44 md:w-32 md:h-32 sm:w-24 sm:h-24 w-20 h-20 border ${
                        theme === "dark"
                          ? "border-stone-600 bg-stone-800"
                          : "border-stone-400 bg-stone-300"
                      } rounded-lg text-center flex items-center justify-center p-1`}
                    >
                      <div>
                        <div className="flex items-center justify-center">
                          {filter.filter_image ? (
                            <img
                              src={filter.filter_image}
                              className="xl:w-12 lg:w-10 md:w-9 w-7 rounded-md"
                              alt={filter.filter_text}
                            />
                          ) : (
                            <h2 className="text-red-500 font-bold xl:text-3xl lg:text-xl text-lg italic">
                              {filter.filter_no_image_text}
                            </h2>
                          )}
                        </div>
                        <p
                          className={`font-semibold xl:pt-2 pt-1 xl:text-base md:text-lg sm:text-sm text-[12px] ${
                            theme === "dark" ? "text-white" : "text-black"
                          }`}
                        >
                          {filter.filter_text}
                        </p>
                      </div>
                    </div>
                  ))}
            </div>

            {/* Oyun tahtası */}
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(gameState.positions).map(
                ([position, data]: [string, any]) => (
                  <div
                    key={position}
                    onClick={() => {
                      if (gameState.turn === "red" && role === "host") {
                        setSelected(position);
                      } else if (
                        gameState.turn === "blue" &&
                        role === "guest"
                      ) {
                        setSelected(position);
                      } else {
                        toast.info("Sıra sizde değil!");
                      }
                    }}
                    className={`xl:w-44 xl:h-44 md:w-32 md:h-32 sm:w-24 sm:h-24 w-20 h-20 cursor-pointer border ${
                      theme === "dark" ? "border-stone-600" : "border-stone-400"
                    } rounded-lg shadow-md bg-gradient-to-b ${
                      data?.bg ||
                      (theme === "dark"
                        ? "from-stone-700 to-stone-800"
                        : "from-stone-200 to-stone-300")
                    } text-center flex items-center justify-center`}
                  >
                    <div>
                      <div className="flex justify-center">
                        <img
                          src={
                            data?.url ||
                            "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png"
                          }
                          className="xl:w-12 lg:w-10 md:w-9 w-6"
                          alt={data?.text || ""}
                        />
                      </div>
                      <p className="font-semibold xl:text-lg lg:text-base md:text-sm text-xs mt-1 leading-[15px]">
                        {data?.text || ""}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Dövüşçü seçim alanı */}
            {selected && (
              <div
                className={`absolute bottom-0 w-full p-4 ${
                  theme === "dark"
                    ? "bg-stone-700 border-stone-600"
                    : "bg-stone-200 border-stone-400"
                } rounded-lg border shadow-lg`}
              >
                <input
                  type="text"
                  onChange={(e) => filterByName(e.target.value)}
                  placeholder="Dövüşçü ara..."
                  className="w-full px-4 py-2 rounded-lg bg-white text-black mb-4"
                />
                <div className="h-48 overflow-y-auto">
                  {fighters.map((fighter: Fighter, index: number) => (
                    <div
                      key={index}
                      onClick={() => updateBox(fighter)}
                      className={`flex items-center gap-4 p-2 mb-2 rounded-lg cursor-pointer ${
                        theme === "dark"
                          ? "bg-stone-600 text-white"
                          : "bg-stone-300 text-black"
                      }`}
                    >
                      <img
                        src={
                          fighter.Picture === "Unknown"
                            ? "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png"
                            : fighter.Picture
                        }
                        className="w-12 h-12 rounded-full"
                        alt={fighter.Fighter}
                      />
                      <span>{fighter.Fighter}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : gameState.gameEnded ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Oyun Bitti!</h2>
            <p className="text-xl mb-4">
              {gameState.winner === "draw"
                ? "Beraberlik!"
                : `${
                    gameState.winner === "red"
                      ? gameState.host
                      : gameState.guest
                  } Kazandı!`}
            </p>
            <button
              onClick={() => {
                const roomRef = doc(db, "rooms", roomId!);
                updateDoc(roomRef, {
                  gameStarted: false,
                  gameEnded: false,
                  winner: null,
                  positions: {},
                  turn: "red",
                });
              }}
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
            >
              Tekrar Oyna
            </button>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-xl mb-4">
              {role === "host" ? "Oda Oluşturuldu" : "Odaya Katıldınız"}
            </h2>
            {role === "host" && (
              <button
                onClick={startGame}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
              >
                Oyunu Başlat
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Room;
