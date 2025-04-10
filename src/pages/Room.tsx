import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  collection,
  onSnapshot,
  query,
  doc,
  setDoc,
  updateDoc,
  documentId,
  runTransaction,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import return_img from "../assets/return.png";
//import { Link } from "react-router-dom";
import fighters_url from "../assets/data/fighters.json";
import Filters from "../logic/filters";
import { Fighter, FilterDifficulty } from "../interfaces/Fighter";

const Room = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role");
  const playerName = searchParams.get("name");
  const [theme, setTheme] = useState("dark");
  const [gameState, setGameState] = useState<any>(null);
  const [guest, setGuest] = useState<string | null>(null);
  const [turn, setTurn] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [filters, setFilters]: any = useState();
  const [selected, setSelected]: any = useState();
  const [fighter00, setFighter00]: any = useState({
    url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
    text: "",
    bg:
      theme === "dark"
        ? "from-stone-700 to-stone-800"
        : "from-stone-300 to-stone-400",
  });
  const [fighter01, setFighter01]: any = useState({
    url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
    text: "",
    bg:
      theme === "dark"
        ? "from-stone-700 to-stone-800"
        : "from-stone-300 to-stone-400",
  });
  const [fighter02, setFighter02]: any = useState({
    url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
    text: "",
    bg:
      theme === "dark"
        ? "from-stone-700 to-stone-800"
        : "from-stone-300 to-stone-400",
  });
  const [fighter10, setFighter10]: any = useState({
    url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
    text: "",
    bg:
      theme === "dark"
        ? "from-stone-700 to-stone-800"
        : "from-stone-300 to-stone-400",
  });
  const [fighter11, setFighter11]: any = useState({
    url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
    text: "",
    bg:
      theme === "dark"
        ? "from-stone-700 to-stone-800"
        : "from-stone-300 to-stone-400",
  });
  const [fighter12, setFighter12]: any = useState({
    url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
    text: "",
    bg:
      theme === "dark"
        ? "from-stone-700 to-stone-800"
        : "from-stone-300 to-stone-400",
  });
  const [fighter20, setFighter20]: any = useState({
    url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
    text: "",
    bg:
      theme === "dark"
        ? "from-stone-700 to-stone-800"
        : "from-stone-300 to-stone-400",
  });
  const [fighter21, setFighter21]: any = useState({
    url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
    text: "",
    bg:
      theme === "dark"
        ? "from-stone-700 to-stone-800"
        : "from-stone-300 to-stone-400",
  });
  const [fighter22, setFighter22]: any = useState({
    url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
    text: "",
    bg:
      theme === "dark"
        ? "from-stone-700 to-stone-800"
        : "from-stone-300 to-stone-400",
  });
  const [filtersSelected, setFiltersSelected]: any = useState([]);
  const [pushFirestore, setPushFirestore]: any = useState(false);
  const [fighters, setFighters] = useState<Fighter[]>([]);
  const [positionsFighters, setPositionsFighters]: any = useState({
    position03: {},
    position04: {},
    position05: {},
    position13: {},
    position14: {},
    position15: {},
    position23: {},
    position24: {},
    position25: {},
  });
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [timerLength, setTimerLength] = useState("-2");
  const [hasExited, setHasExited] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    document.title = "MMA XOX - Online Game";
  }, []);

  useEffect(() => {
    if (!roomId) return;

    const collectionRef = collection(db, "rooms");
    const q = query(collectionRef, where(documentId(), "==", roomId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        console.log("Belge bulunamadı");
        if (role === "guest") {
          toast.info("Host oyundan çıktı!");
          setTimeout(() => {
            navigate("/");
          }, 1500);
        }
        return;
      }

      const updatedData: any = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        positions: Object.keys(doc.data().positions || {}).length,
      }))[0];

      //if (role === "host") {
      //  if (guest == null && updatedData?.guest != null) {
      //    toast.success(updatedData?.guest + " oyuna katıldı!");
      //  } else if (guest != null && updatedData?.guest == null) {
      //    toast.success(guest + " oyundan çıktı!");
      //  }
      //}

      //firestore'daki sadece idli olan fightersPositions'ı fighters_url'den alan fonksiyon
      const getFightersByPositions = (positionsFighters: any) => {
        let updatedPositions: any = {};

        // Her bir pozisyon için
        Object.keys(positionsFighters).forEach((position) => {
          // O pozisyondaki fighter ID'lerini al
          const fighterIds = positionsFighters[position];

          // Bu ID'lere sahip fighterları fighters_url'den bul
          const fighters = fighterIds
            .map((fighterId: number) =>
              fighters_url.find((fighter) => fighter.Id === fighterId)
            )
            .filter(Boolean); // undefined olanları filtrele

          // Bulunan fighterları pozisyona ata
          updatedPositions[position] = fighters;
        });

        return updatedPositions;
      };

      if (updatedData.positionsFighters) {
        setPositionsFighters(
          getFightersByPositions(updatedData.positionsFighters)
        );
      }

      setGuest(updatedData?.guest);
      setGameState(updatedData);
    });

    return () => {
      unsubscribe();
    };
  }, [roomId, role]);

  useEffect(() => {
    if (role === "host" && !gameState) {
      const initializeGame = async () => {
        const roomRef = doc(db, "rooms", roomId!);
        await setDoc(roomRef, {
          host: playerName,
          guest: null,
          turn: "red",
          gameStarted: false,
          filtersSelected: [],
          fighter00: {
            url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
            text: "",
            bg:
              theme === "dark"
                ? "from-stone-700 to-stone-800"
                : "from-stone-300 to-stone-400",
          },
          fighter01: {
            url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
            text: "",
            bg:
              theme === "dark"
                ? "from-stone-700 to-stone-800"
                : "from-stone-300 to-stone-400",
          },
          fighter02: {
            url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
            text: "",
            bg:
              theme === "dark"
                ? "from-stone-700 to-stone-800"
                : "from-stone-300 to-stone-400",
          },
          fighter10: {
            url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
            text: "",
            bg:
              theme === "dark"
                ? "from-stone-700 to-stone-800"
                : "from-stone-300 to-stone-400",
          },
          fighter11: {
            url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
            text: "",
            bg:
              theme === "dark"
                ? "from-stone-700 to-stone-800"
                : "from-stone-300 to-stone-400",
          },
          fighter12: {
            url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
            text: "",
            bg:
              theme === "dark"
                ? "from-stone-700 to-stone-800"
                : "from-stone-300 to-stone-400",
          },
          fighter20: {
            url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
            text: "",
            bg:
              theme === "dark"
                ? "from-stone-700 to-stone-800"
                : "from-stone-300 to-stone-400",
          },
          fighter21: {
            url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
            text: "",
            bg:
              theme === "dark"
                ? "from-stone-700 to-stone-800"
                : "from-stone-300 to-stone-400",
          },
          fighter22: {
            url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
            text: "",
            bg:
              theme === "dark"
                ? "from-stone-700 to-stone-800"
                : "from-stone-300 to-stone-400",
          },
        });
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
      const joinGame = async () => {
        const roomRef = doc(db, "rooms", roomId!);
        await updateDoc(roomRef, {
          guest: playerName,
        });
      };

      joinGame();
    }
  }, [gameState, role, playerName, roomId, hasExited]);

  useEffect(() => {
    if (!roomId) return;

    const updateGameState = async () => {
      try {
        await getFilters();

        const roomRef = doc(db, "rooms", roomId);
        const updatedDataFilters = filtersSelected.map(
          ({ filter_fighters, ...rest }: any) => rest
        );

        let updatedDataPositionFighters: any = {};

        updatedDataPositionFighters.position03 =
          positionsFighters.position03.map((fighter: Fighter) => fighter.Id);
        updatedDataPositionFighters.position04 =
          positionsFighters.position04.map((fighter: Fighter) => fighter.Id);
        updatedDataPositionFighters.position05 =
          positionsFighters.position05.map((fighter: Fighter) => fighter.Id);
        updatedDataPositionFighters.position13 =
          positionsFighters.position13.map((fighter: Fighter) => fighter.Id);
        updatedDataPositionFighters.position14 =
          positionsFighters.position14.map((fighter: Fighter) => fighter.Id);
        updatedDataPositionFighters.position15 =
          positionsFighters.position15.map((fighter: Fighter) => fighter.Id);
        updatedDataPositionFighters.position23 =
          positionsFighters.position23.map((fighter: Fighter) => fighter.Id);
        updatedDataPositionFighters.position24 =
          positionsFighters.position24.map((fighter: Fighter) => fighter.Id);
        updatedDataPositionFighters.position25 =
          positionsFighters.position25.map((fighter: Fighter) => fighter.Id);

        await updateDoc(roomRef, {
          gameStarted: gameStarted,
          difficulty: difficulty,
          timerLength: timerLength,
          filtersSelected: updatedDataFilters,
          positionsFighters: updatedDataPositionFighters,
          turn: "red",
          gameEnded: false,
          winner: null,
        });
      } catch (error) {
        console.error("Firestore güncelleme hatası:", error);
      }
    };

    if (gameStarted) {
      updateGameState();
    }
  }, [pushFirestore]);

  useEffect(() => {
    if (filters != undefined) {
      getFilters();
    }
  }, [filters]);

  useEffect(() => {
    const winner = checkWinner();

    if (winner) {
      alert(winner);
      return;
    }
  }, [gameState]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (gameState?.gameStarted == true) {
        if (!roomId) return;

        const roomRef = doc(db, "rooms", roomId);
        if (timerLength != "-2") {
          if (gameState.timerLength <= 0) {
            updateDoc(roomRef, {
              timerLength: timerLength,
              turn: gameState.turn == "red" ? "blue" : "red",
            });
          } else {
            updateDoc(roomRef, {
              timerLength: gameState.timerLength - 1,
            });
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState]);

  const resetTimerFirestore = async () => {
    if (!roomId) return;

    const roomRef = doc(db, "rooms", roomId);

    await updateDoc(roomRef, {
      timerLength: timerLength,
    });
  };

  const switchTurn = async () => {
    if (!roomId) return;

    const roomRef = doc(db, "rooms", roomId);

    await updateDoc(roomRef, {
      turn: gameState.turn == "red" ? "blue" : "red",
    });
  };

  const startGame = async () => {
    if (!roomId) return;

    let f: FilterDifficulty = Filters();

    if (difficulty == "EASY") {
      setFilters(f.easy);
    } else if (difficulty == "MEDIUM") {
      setFilters(f.medium);
    } else {
      setFilters(f.hard);
    }

    setGameStarted(true);
  };

  const getFilters = async () => {
    let isDone: boolean = false;
    let finish = 0;

    while (!isDone && finish < 1500) {
      finish += 1;
      let filters_arr: any = [];
      while (filters_arr.length < 6) {
        let random_index = Math.floor(Math.random() * filters.length);
        if (!filters_arr.includes(filters[random_index])) {
          filters_arr.push(filters[random_index]);
        }
      }

      if (!filters_arr[3] || !filters_arr[4] || !filters_arr[5]) {
        console.error(
          "HATA: filters_arr[3], filters_arr[4] veya filters_arr[5] undefined!"
        );
        continue;
      }

      let newPositions = { ...positionsFighters }; // Yeni state nesnesi oluştur

      for (let i = 0; i < 3; i++) {
        let intersection3 =
          filters_arr[i]?.filter_fighters?.filter((fighter1: Fighter) =>
            filters_arr[3]?.filter_fighters?.some(
              (fighter2: Fighter) => fighter1.Id === fighter2.Id
            )
          ) || [];

        let intersection4 =
          filters_arr[i]?.filter_fighters?.filter((fighter1: Fighter) =>
            filters_arr[4]?.filter_fighters?.some(
              (fighter2: Fighter) => fighter1.Id === fighter2.Id
            )
          ) || [];

        let intersection5 =
          filters_arr[i]?.filter_fighters?.filter((fighter1: Fighter) =>
            filters_arr[5]?.filter_fighters?.some(
              (fighter2: Fighter) => fighter1.Id === fighter2.Id
            )
          ) || [];

        if (
          intersection3.length < 2 ||
          intersection4.length < 2 ||
          intersection5.length < 2
        ) {
          break;
        }

        if (i === 0) {
          newPositions.position03 = intersection3;
          newPositions.position04 = intersection4;
          newPositions.position05 = intersection5;
        } else if (i === 1) {
          newPositions.position13 = intersection3;
          newPositions.position14 = intersection4;
          newPositions.position15 = intersection5;
        } else if (i === 2) {
          newPositions.position23 = intersection3;
          newPositions.position24 = intersection4;
          newPositions.position25 = intersection5;
        }

        if (i === 2) {
          isDone = true;
          break;
        }
      }

      if (isDone) {
        setPositionsFighters(newPositions);
        setFiltersSelected(filters_arr);
        setPushFirestore(true);
        break;
      }
    }
  };

  const filterByName = (name: string) => {
    if (name.length > 3) {
      let filteredFighters = fighters_url.filter((fighter) => {
        return fighter.Fighter.toLowerCase().includes(name.toLowerCase());
      });
      setFighters(filteredFighters);
    }
  };

  const toggleFighterPick = () => {
    if (role == "host" && gameState.turn == "blue") {
      toast.error("Its your opponents turn!");
      return;
    } else if (role == "guest" && gameState.turn == "red") {
      toast.error("Its your opponents turn!");
      return;
    }
    let div = document.querySelector(".select-fighter");
    div?.classList.toggle("hidden");
  };

  const restartGame = async () => {
    if (!roomId) return;

    const roomRef = doc(db, "rooms", roomId);

    await updateDoc(roomRef, {
      gameStarted: false,
      gameEnded: false,
      winner: null,
      turn: "red",
      timerLength: "-2",
      filtersSelected: [],
      positionsFighters: {},
      fighter00: {
        url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
        text: "",
        bg:
          theme === "dark"
            ? "from-stone-700 to-stone-800"
            : "from-stone-300 to-stone-400",
      },
      fighter01: {
        url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
        text: "",
        bg:
          theme === "dark"
            ? "from-stone-700 to-stone-800"
            : "from-stone-300 to-stone-400",
      },
      fighter02: {
        url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
        text: "",
        bg:
          theme === "dark"
            ? "from-stone-700 to-stone-800"
            : "from-stone-300 to-stone-400",
      },
      fighter10: {
        url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
        text: "",
        bg:
          theme === "dark"
            ? "from-stone-700 to-stone-800"
            : "from-stone-300 to-stone-400",
      },
      fighter11: {
        url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
        text: "",
        bg:
          theme === "dark"
            ? "from-stone-700 to-stone-800"
            : "from-stone-300 to-stone-400",
      },
      fighter12: {
        url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
        text: "",
        bg:
          theme === "dark"
            ? "from-stone-700 to-stone-800"
            : "from-stone-300 to-stone-400",
      },
      fighter20: {
        url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
        text: "",
        bg:
          theme === "dark"
            ? "from-stone-700 to-stone-800"
            : "from-stone-300 to-stone-400",
      },
      fighter21: {
        url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
        text: "",
        bg:
          theme === "dark"
            ? "from-stone-700 to-stone-800"
            : "from-stone-300 to-stone-400",
      },
      fighter22: {
        url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
        text: "",
        bg:
          theme === "dark"
            ? "from-stone-700 to-stone-800"
            : "from-stone-300 to-stone-400",
      },
    });

    // local state'leri de sıfırla
    setGameStarted(false);
    setFiltersSelected([]);
    setPushFirestore(false);
    setPositionsFighters({
      position03: {},
      position04: {},
      position05: {},
      position13: {},
      position14: {},
      position15: {},
      position23: {},
      position24: {},
      position25: {},
    });
    setFilters(null);
    setFighter00({ url: "", text: "", bg: "" });
    setFighter01({ url: "", text: "", bg: "" });
    setFighter02({ url: "", text: "", bg: "" });
    setFighter10({ url: "", text: "", bg: "" });
    setFighter11({ url: "", text: "", bg: "" });
    setFighter12({ url: "", text: "", bg: "" });
    setFighter20({ url: "", text: "", bg: "" });
    setFighter21({ url: "", text: "", bg: "" });
    setFighter22({ url: "", text: "", bg: "" });
    setTurn("red");
  };

  const updateBox = async (fighter: Fighter) => {
    let picture =
      fighter.Picture === "Unknown"
        ? "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png"
        : fighter.Picture;
    let name = fighter.Fighter;

    console.log(name);

    if (role == "host" && gameState.turn == "blue") {
      toast.error("Its your opponents turn!");
      return;
    } else if (role == "guest" && gameState.turn == "red") {
      toast.error("Its your opponents turn!");
      return;
    }

    if (!roomId) return;

    const roomRef = doc(db, "rooms", roomId);

    const fighterMap: { [key: string]: keyof typeof positionsFighters } = {
      fighter00: "position03",
      fighter01: "position13",
      fighter02: "position23",
      fighter10: "position04",
      fighter11: "position14",
      fighter12: "position24",
      fighter20: "position05",
      fighter21: "position15",
      fighter22: "position25",
    };

    if (!fighterMap[selected]) return;

    const positionKey = fighterMap[selected];
    if (!positionsFighters[positionKey].includes(fighter)) {
      notify();
      await updateDoc(roomRef, {
        turn: gameState.turn === "red" ? "blue" : "red",
      });
    } else {
      const bgColor =
        turn === "red"
          ? "from-red-800 to-red-900"
          : "from-blue-800 to-blue-900";

      const setterMap: { [key: string]: Function } = {
        fighter00: setFighter00,
        fighter01: setFighter01,
        fighter02: setFighter02,
        fighter10: setFighter10,
        fighter11: setFighter11,
        fighter12: setFighter12,
        fighter20: setFighter20,
        fighter21: setFighter21,
        fighter22: setFighter22,
      };

      setterMap[selected]({ url: picture, text: name, bg: bgColor });

      await updateDoc(roomRef, {
        [selected]: {
          // selected değişkenini key olarak kullan (fighter01, fighter02 vs.)
          url: picture,
          text: name,
          bg:
            gameState.turn === "red"
              ? "from-red-800 to-red-900"
              : "from-blue-800 to-blue-900",
          fighterId: fighter.Id,
        },
        turn: gameState.turn === "red" ? "blue" : "red",
      });
    }

    setTurn(turn === "red" ? "blue" : "red");
    //setTimer(timerLength);
    toggleFighterPick();
    resetInput();
    //setFigters([]);
  };

  const resetInput = () => {
    let input: any = document.querySelector(".input-fighter");
    input.value = "";
  };

  const checkWinner = () => {
    if (!gameState) {
      return;
    }
    const board = [
      [
        gameState?.fighter00.bg,
        gameState?.fighter01.bg,
        gameState?.fighter02.bg,
      ],
      [
        gameState?.fighter10.bg,
        gameState?.fighter11.bg,
        gameState?.fighter12.bg,
      ],
      [
        gameState?.fighter20.bg,
        gameState?.fighter21.bg,
        gameState?.fighter22.bg,
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

    // 🎯 Kazanan var mı kontrol et
    for (let pattern of winPatterns) {
      const [a, b, c] = pattern;
      const cellA = board[a[0]][a[1]];
      const cellB = board[b[0]][b[1]];
      const cellC = board[c[0]][c[1]];

      if (
        cellA !== "from-stone-700 to-stone-800" &&
        cellA !== "from-stone-200 to-stone-300" && // Boş değilse
        cellA === cellB &&
        cellB === cellC
      ) {
        return cellA.includes("red")
          ? gameState.host + " Wins!"
          : gameState.guest + " Wins!";
      }
    }

    // 🎯 Beraberlik kontrolü
    const isBoardFull = board
      .flat()
      .every(
        (cell) =>
          cell !== "from-stone-700 to-stone-800" &&
          cell !== "from-stone-200 to-stone-300"
      );

    if (isBoardFull) {
      return "Draw!"; // Beraberlik durumu
    }

    return null; // Oyun devam ediyor
  };

  const handleExit = async () => {
    if (!roomId || !playerName || !role || isExiting) return;

    setIsExiting(true);
    const roomRef = doc(db, "rooms", roomId);

    try {
      if (role === "host") {
        // Host çıkarsa odayı tamamen sil

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

  const notify = () => toast.error("Fighter doesnt meet the requirements.");

  if (!gameState) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-2xl">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div
      className={`${
        theme === "dark" ? "bg-stone-800" : "bg-stone-200"
      } min-h-[100vh]`}
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
      <div
        className={`flex flex-col items-center justify-center h-full ${
          theme == "dark" ? "text-white" : "text-black"
        }`}
      >
        <div className="w-fit">
          <div className="text-2xl mb-4">Oda Kodu: {roomId}</div>
          <p>turn : {turn}</p>
          <div className="text-center">
            <h2 className="text-xl mb-4">
              {role === "host" ? "Oda Oluşturuldu" : "Odaya Katıldınız"}
            </h2>
            <div className="my-5">
              <p>guest: {gameState.guest}</p>
              <p>host: {gameState.host}</p>
            </div>
            <div
              className={`${
                gameState?.gameStarted == true ? "flex" : "hidden"
              } justify-between items-center gap-3 flex-wrap text-right pt-2`}
            >
              <div
                onClick={() => {
                  restartGame();
                }}
                className={`${
                  theme === "dark"
                    ? "bg-stone-600 border-stone-500 text-stone-200"
                    : "bg-stone-300 border-stone-400 text-stone-800"
                } bg-stone-300 cursor-pointer flex gap-4 text-red-600 xl:text-base text-sm border border-stone-400 font-semibold w-fit px-5 py-1 rounded-lg shadow-xl`}
              >
                Restart Game
              </div>
              <div>
                {gameState?.gameStarted == true &&
                parseInt(gameState?.timerLength) >= 0 ? (
                  <p
                    className={`xl:text-xl md:block hidden lg:text-lg text-base text-center font-semibold ${
                      gameState?.turn == "red"
                        ? "text-red-500"
                        : "text-blue-500"
                    }`}
                  >
                    {gameState.timerLength} seconds
                  </p>
                ) : (
                  <p>ank mesi</p>
                )}
              </div>
              {gameState?.turn == "red" ? (
                <div
                  className={`${
                    theme === "dark"
                      ? "bg-stone-600 border-stone-500 text-red-400"
                      : "bg-stone-300 border-stone-400 text-red-600"
                  } bg-stone-300 flex gap-4 xl:text-base text-sm border border-stone-400 font-semibold w-fit px-5 py-1 rounded-lg shadow-xl`}
                >
                  <p>
                    Turn :{" "}
                    {gameState.turn == "red" ? gameState.host : gameState.guest}
                  </p>
                  <div
                    onClick={() => {
                      if (role == "host") {
                        switchTurn();
                        resetTimerFirestore();
                      } else {
                        toast.error("Its not your turn!");
                      }
                    }}
                    className={`${
                      theme === "dark"
                        ? "bg-stone-500 border-stone-700 text-stone-200"
                        : "bg-gradient-to-b from-stone-300 to-stone-400 border-stone-400 text-stone-900"
                    } cursor-pointer xl:text-base text-sm px-2 rounded-xl shadow-lg border`}
                  >
                    Skip
                  </div>
                </div>
              ) : (
                <div
                  className={`${
                    theme === "dark"
                      ? "bg-stone-600 border-stone-500 text-blue-400"
                      : "bg-stone-300 border-stone-400 text-blue-600"
                  } bg-stone-300 flex gap-4 xl:text-base text-sm border border-stone-400 font-semibold w-fit px-5 py-1 rounded-lg shadow-xl`}
                >
                  <p>
                    Turn :{" "}
                    {gameState.turn == "red" ? gameState.host : gameState.guest}
                  </p>
                  <div
                    onClick={() => {
                      if (role == "guest") {
                        switchTurn();
                        resetTimerFirestore();
                      } else {
                        toast.error("Its not your turn!");
                      }
                    }}
                    className={`${
                      theme === "dark"
                        ? "bg-stone-500 border-stone-700 text-stone-200"
                        : "bg-gradient-to-b from-stone-300 to-stone-400 border-stone-400 text-stone-900"
                    } cursor-pointer xl:text-base text-sm px-2 rounded-xl shadow-lg border`}
                  >
                    Skip
                  </div>
                </div>
              )}
            </div>
            {role === "host" &&
              gameState.guest != null &&
              gameState?.gameStarted == false && (
                <div className="absolute w-full h-full top-0 left-0">
                  <div className="flex w-full h-full justify-center items-center bg-[#00000092]">
                    <div className="z-30 from-stone-600 to-stone-700 bg-gradient-to-b border-2 border-stone-500 rounded-lg p-5 px-10">
                      <div className="flex gap-3 mb-5 items-center">
                        <img
                          src="https://cdn-icons-png.freepik.com/512/921/921676.png"
                          alt="logo"
                          className="w-10"
                        />
                        <h1 className="font-semibold text-2xl">MMA XOX</h1>
                      </div>
                      <div className="mb-4">
                        <h2 className="font-semibold text-lg">
                          CHOOSE DIFFICULTY
                        </h2>
                        <select
                          value={difficulty}
                          onChange={(e) => setDifficulty(e.target.value)}
                          className="text-stone-900 shadow-lg mt-1 focus:outline-0 cursor-pointer border border-stone-500 bg-gradient-to-r from-stone-300 to-stone-400 font-semibold rounded-lg px-2"
                        >
                          <option value="EASY">EASY</option>
                          <option value="MEDIUM">MEDIUM</option>
                          <option value="HARD">HARD</option>
                        </select>
                      </div>
                      <div className="mb-3">
                        <h2 className="font-semibold text-lg">TIMER</h2>
                        <select
                          value={timerLength}
                          onChange={(e) => setTimerLength(e.target.value)}
                          className="text-stone-900 shadow-lg mt-1 focus:outline-0 cursor-pointer border border-stone-500 bg-gradient-to-r from-stone-300 to-stone-400 font-semibold rounded-lg px-2"
                        >
                          <option value="-2">No time limit</option>
                          <option value="20">20 Seconds</option>
                          <option value="30">30 Seconds</option>
                          <option value="40">40 Seconds</option>
                        </select>
                      </div>
                      <button
                        onClick={() => {
                          if (gameState.guest != null) {
                            startGame();
                          } else {
                            toast.info("Oyuna katılımcı bulunamadı!");
                          }
                        }}
                        className={`bg-green-500 mt-3 duration-200 text-white px-6 py-1 rounded-lg hover:bg-green-600 ${
                          gameState.guest == null
                            ? "opacity-70"
                            : "opacity-100 cursor-pointer"
                        }`}
                      >
                        Oyunu Başlat
                      </button>
                    </div>
                  </div>
                </div>
              )}
          </div>
          {gameState?.gameStarted ? (
            <div
              className={`${
                theme === "dark"
                  ? "bg-stone-500 text-stone-200 border-stone-600"
                  : "bg-stone-300 text-stone-700 border-stone-400"
              } rounded-lg border relative h-fit mt-3 shadow-xl`}
            >
              <div
                className={`${
                  gameState.winner == null ? "hidden" : "absolute"
                } ${
                  theme === "dark" ? "bg-[#00000061]" : "bg-[#ffffff61]"
                }  rounded-lg w-full h-full`}
              >
                <div className="flex justify-center mt-12">
                  <div
                    className={`${
                      theme === "dark"
                        ? "bg-stone-800 border-stone-700"
                        : "bg-stone-300 border-stone-400"
                    } border-2 w-72 lg:px-6 lg:py-4 px-4 py-2 rounded-lg shadow-lg`}
                  >
                    <p className="xl:text-2xl text-center lg:text-xl text-lg font-semibold">
                      Game Finished!
                    </p>
                    {gameState.winner == "Red" ? (
                      <>
                        <p className="text-red-500 font-semibold text-xl mt-4 text-center">
                          Red Wins!
                        </p>
                      </>
                    ) : gameState.winner == "Blue" ? (
                      <>
                        <p className="text-blue-500 font-semibold text-xl mt-4 text-center">
                          Blue Wins!
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-stone-100 font-semibold text-xl mt-4 text-center">
                          Draw!
                        </p>
                      </>
                    )}
                    <div className="flex justify-center">
                      <button
                        onClick={restartGame}
                        className={`bg-gradient-to-r cursor-pointer ${
                          theme === "dark"
                            ? "from-stone-500 to-stone-700 text-white border-stone-600"
                            : "from-stone-300 to-stone-400 text-black border-stone-400"
                        } border text-lg font-semibold px-3 py-1 rounded-lg shadow-lg mt-5`}
                      >
                        Play Again
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`flex gap-[2px] text-white`}>
                <div
                  className={`xl:w-44 xl:h-44 md:w-32 md:h-32 sm:w-24 sm:h-24 w-20 h-20 border ${
                    theme === "dark"
                      ? "border-stone-600 bg-neutral-900"
                      : "border-stone-500 bg-neutral-400"
                  } rounded-lg text-center flex items-center justify-center`}
                >
                  <div>
                    <div className="flex items-center justify-center">
                      <img
                        src="https://cdn-icons-png.freepik.com/512/921/921676.png"
                        className="xl:w-12 lg:w-10 md:w-9 w-7 rounded-md"
                      />
                    </div>
                    <p
                      className={`font-semibold xl:pt-2 pt-1 xl:text-base md:text-lg sm:text-sm text-[12px] ${
                        theme === "dark" ? "text-white" : "text-white"
                      }`}
                    >
                      MMA XOX
                    </p>
                  </div>
                </div>
                <div
                  className={`xl:w-44 xl:h-44 md:w-32 md:h-32 sm:w-24 sm:h-24 w-20 h-20 border ${
                    theme === "dark"
                      ? "border-stone-600 bg-stone-800"
                      : "border-stone-400 bg-stone-300"
                  } rounded-lg text-center flex items-center justify-center p-1`}
                >
                  {gameState != null &&
                  gameState?.filtersSelected.length > 0 ? (
                    <div>
                      <div className="flex items-center justify-center">
                        {gameState?.filtersSelected[0].filter_image != null ? (
                          <img
                            src={gameState?.filtersSelected[0].filter_image}
                            className="xl:w-12 lg:w-10 md:w-9 w-7 rounded-md"
                          />
                        ) : (
                          <h2 className="text-red-500 font-bold xl:text-3xl lg:text-xl text-lg italic">
                            {gameState?.filtersSelected[0].filter_no_image_text}
                          </h2>
                        )}
                      </div>
                      <p
                        className={`font-semibold xl:pt-2 pt-1 xl:text-base md:text-lg sm:text-sm text-[12px] ${
                          theme === "dark" ? "text-white" : "text-black"
                        }`}
                      >
                        {gameState?.filtersSelected[0].filter_text}
                      </p>
                    </div>
                  ) : (
                    <p>Loading...</p>
                  )}
                </div>
                <div
                  className={`xl:w-44 xl:h-44 md:w-32 md:h-32 sm:w-24 sm:h-24 w-20 h-20 border ${
                    theme === "dark"
                      ? "border-stone-600 bg-stone-800"
                      : "border-stone-400 bg-stone-300"
                  } rounded-lg text-center flex items-center justify-center p-1`}
                >
                  {gameState?.filtersSelected.length > 0 ? (
                    <div>
                      <div className="flex items-center justify-center">
                        {gameState?.filtersSelected[1].filter_image != null ? (
                          <img
                            src={gameState?.filtersSelected[1].filter_image}
                            className="xl:w-12 lg:w-10 md:w-9 w-7 rounded-md"
                          />
                        ) : (
                          <h2 className="text-red-500 font-bold xl:text-3xl lg:text-xl text-lg italic">
                            {gameState?.filtersSelected[1].filter_no_image_text}
                          </h2>
                        )}
                      </div>
                      <p
                        className={`font-semibold xl:pt-2 pt-1 xl:text-base md:text-lg sm:text-sm text-[12px] ${
                          theme === "dark" ? "text-white" : "text-black"
                        }`}
                      >
                        {gameState?.filtersSelected[1].filter_text}
                      </p>
                    </div>
                  ) : (
                    <p>Loading...</p>
                  )}
                </div>
                <div
                  className={`xl:w-44 xl:h-44 md:w-32 md:h-32 sm:w-24 sm:h-24 w-20 h-20 border ${
                    theme === "dark"
                      ? "border-stone-600 bg-stone-800"
                      : "border-stone-400 bg-stone-300"
                  } rounded-lg text-center flex items-center justify-center p-1`}
                >
                  {gameState?.filtersSelected.length > 0 ? (
                    <div>
                      <div className="flex items-center justify-center">
                        {gameState?.filtersSelected[2].filter_image != null ? (
                          <img
                            src={gameState?.filtersSelected[2].filter_image}
                            className="xl:w-12 lg:w-10 md:w-9 w-7 rounded-md"
                          />
                        ) : (
                          <h2 className="text-red-500 font-bold xl:text-3xl lg:text-xl text-lg italic">
                            {gameState?.filtersSelected[2].filter_no_image_text}
                          </h2>
                        )}
                      </div>
                      <p
                        className={`font-semibold xl:pt-2 pt-1 xl:text-base md:text-lg sm:text-sm text-[12px] ${
                          theme === "dark" ? "text-white" : "text-black"
                        }`}
                      >
                        {gameState?.filtersSelected[2].filter_text}
                      </p>
                    </div>
                  ) : (
                    <p>Loading...</p>
                  )}
                </div>
              </div>
              <div className={`flex gap-[2px] text-white`}>
                <div
                  className={`xl:w-44 xl:h-44 md:w-32 md:h-32 sm:w-24 sm:h-24 w-20 h-20 border ${
                    theme === "dark"
                      ? "border-stone-600 bg-stone-800"
                      : "border-stone-400 bg-stone-300"
                  } rounded-lg text-center flex items-center justify-center p-1`}
                >
                  {gameState?.filtersSelected.length > 0 ? (
                    <div>
                      <div className="flex items-center justify-center">
                        {gameState?.filtersSelected[3].filter_image != null ? (
                          <img
                            src={gameState?.filtersSelected[3].filter_image}
                            className="xl:w-12 lg:w-10 md:w-9 w-7 rounded-md"
                          />
                        ) : (
                          <h2 className="text-red-500 font-bold xl:text-3xl lg:text-xl text-lg italic">
                            {gameState?.filtersSelected[3].filter_no_image_text}
                          </h2>
                        )}
                      </div>
                      <p
                        className={`font-semibold xl:pt-2 pt-1 xl:text-base md:text-lg sm:text-sm text-[12px] ${
                          theme === "dark" ? "text-white" : "text-black"
                        }`}
                      >
                        {gameState?.filtersSelected[3].filter_text}
                      </p>
                    </div>
                  ) : (
                    <p>Loading...</p>
                  )}
                </div>
                <div
                  onClick={() => {
                    if (
                      gameState.fighter00.bg ===
                        "from-stone-700 to-stone-800" ||
                      "from-stone-200 to-stone-300"
                    ) {
                      toggleFighterPick();
                      setSelected("fighter00");
                    } else {
                      toast.info("Fighter already selected.");
                    }
                  }}
                  className={`xl:w-44 xl:h-44 md:w-32 md:h-32 sm:w-24 sm:h-24 w-20 h-20 cursor-pointer border ${
                    theme === "dark" ? "border-stone-600" : "border-stone-400"
                  } rounded-lg shadow-md bg-gradient-to-b ${
                    gameState.fighter00.bg
                  } text-center flex items-center justify-center`}
                >
                  <div>
                    <div className="flex justify-center">
                      <img
                        src={gameState.fighter00.url}
                        className="xl:w-12 lg:w-10 md:w-9 w-6"
                      />
                    </div>
                    <p className="font-semibold xl:text-lg lg:text-base md:text-sm text-xs mt-1 leading-[15px]">
                      {gameState.fighter00.text}
                    </p>
                  </div>
                </div>
                <div
                  onClick={() => {
                    if (
                      gameState.fighter01.bg ===
                        "from-stone-700 to-stone-800" ||
                      "from-stone-200 to-stone-300"
                    ) {
                      toggleFighterPick();
                      setSelected("fighter01");
                    } else {
                      toast.info("Fighter already selected.");
                    }
                  }}
                  className={`xl:w-44 xl:h-44 md:w-32 md:h-32 sm:w-24 sm:h-24 w-20 h-20 cursor-pointer border ${
                    theme === "dark" ? "border-stone-600" : "border-stone-400"
                  } rounded-lg shadow-md bg-gradient-to-b ${
                    gameState.fighter01.bg
                  } text-center flex items-center justify-center`}
                >
                  <div>
                    <div className="flex justify-center">
                      <img
                        src={gameState.fighter01.url}
                        className="xl:w-12 lg:w-10 md:w-9 w-6"
                      />
                    </div>
                    <p className="font-semibold xl:text-lg lg:text-base md:text-sm text-xs mt-1 leading-[15px]">
                      {gameState.fighter01.text}
                    </p>
                  </div>
                </div>
                <div
                  onClick={() => {
                    if (
                      gameState.fighter02.bg ===
                        "from-stone-700 to-stone-800" ||
                      "from-stone-200 to-stone-300"
                    ) {
                      toggleFighterPick();
                      setSelected("fighter02");
                    } else {
                      toast.info("Fighter already selected.");
                    }
                  }}
                  className={`xl:w-44 xl:h-44 md:w-32 md:h-32 sm:w-24 sm:h-24 w-20 h-20 cursor-pointer border ${
                    theme === "dark" ? "border-stone-600" : "border-stone-400"
                  } rounded-lg shadow-md bg-gradient-to-b ${
                    gameState.fighter02.bg
                  } text-center flex items-center justify-center`}
                >
                  <div>
                    <div className="flex justify-center">
                      <img
                        src={gameState.fighter02.url}
                        className="xl:w-12 lg:w-10 md:w-9 w-6"
                      />
                    </div>
                    <p className="font-semibold xl:text-lg lg:text-base md:text-sm text-xs mt-1 leading-[15px]">
                      {gameState.fighter02.text}
                    </p>
                  </div>
                </div>
              </div>
              <div className={`flex gap-[2px] text-white`}>
                <div
                  className={`xl:w-44 xl:h-44 md:w-32 md:h-32 sm:w-24 sm:h-24 w-20 h-20 border ${
                    theme === "dark"
                      ? "border-stone-600 bg-stone-800"
                      : "border-stone-400 bg-stone-300"
                  } rounded-lg text-center flex items-center justify-center p-1`}
                >
                  {gameState?.filtersSelected.length > 0 ? (
                    <div>
                      <div className="flex items-center justify-center">
                        {gameState?.filtersSelected[4].filter_image != null ? (
                          <img
                            src={gameState?.filtersSelected[4].filter_image}
                            className="xl:w-12 lg:w-10 md:w-9 w-7 rounded-md"
                          />
                        ) : (
                          <h2 className="text-red-500 font-bold xl:text-3xl lg:text-xl text-lg italic">
                            {gameState?.filtersSelected[4].filter_no_image_text}
                          </h2>
                        )}
                      </div>
                      <p
                        className={`font-semibold xl:pt-2 pt-1 xl:text-base md:text-lg sm:text-sm text-[12px] ${
                          theme === "dark" ? "text-white" : "text-black"
                        }`}
                      >
                        {gameState?.filtersSelected[4].filter_text}
                      </p>
                    </div>
                  ) : (
                    <p>Loading...</p>
                  )}
                </div>
                <div
                  onClick={() => {
                    if (
                      gameState.fighter10.bg ===
                        "from-stone-700 to-stone-800" ||
                      "from-stone-200 to-stone-300"
                    ) {
                      toggleFighterPick();
                      setSelected("fighter10");
                    } else {
                      toast.info("Fighter already selected.");
                    }
                  }}
                  className={`xl:w-44 xl:h-44 md:w-32 md:h-32 sm:w-24 sm:h-24 w-20 h-20 cursor-pointer border ${
                    theme === "dark" ? "border-stone-600" : "border-stone-400"
                  } rounded-lg shadow-md bg-gradient-to-b ${
                    gameState.fighter10.bg
                  } text-center flex items-center justify-center`}
                >
                  <div>
                    <div className="flex justify-center">
                      <img
                        src={gameState.fighter10.url}
                        className="xl:w-12 lg:w-10 md:w-9 w-6"
                      />
                    </div>
                    <p className="font-semibold xl:text-lg lg:text-base md:text-sm text-xs mt-1 leading-[15px]">
                      {gameState.fighter10.text}
                    </p>
                  </div>
                </div>
                <div
                  onClick={() => {
                    if (
                      gameState.fighter11.bg ===
                        "from-stone-700 to-stone-800" ||
                      "from-stone-200 to-stone-300"
                    ) {
                      toggleFighterPick();
                      setSelected("fighter11");
                    } else {
                      toast.info("Fighter already selected.");
                    }
                  }}
                  className={`xl:w-44 xl:h-44 md:w-32 md:h-32 sm:w-24 sm:h-24 w-20 h-20 cursor-pointer border ${
                    theme === "dark" ? "border-stone-600" : "border-stone-400"
                  } rounded-lg shadow-md bg-gradient-to-b ${
                    gameState.fighter11.bg
                  } text-center flex items-center justify-center`}
                >
                  <div>
                    <div className="flex justify-center">
                      <img
                        src={gameState.fighter11.url}
                        className="xl:w-12 lg:w-10 md:w-9 w-6"
                      />
                    </div>
                    <p className="font-semibold xl:text-lg lg:text-base md:text-sm text-xs mt-1 leading-[15px]">
                      {gameState.fighter11.text}
                    </p>
                  </div>
                </div>
                <div
                  onClick={() => {
                    if (
                      gameState.fighter12.bg ===
                        "from-stone-700 to-stone-800" ||
                      "from-stone-200 to-stone-300"
                    ) {
                      toggleFighterPick();
                      setSelected("fighter12");
                    } else {
                      toast.info("Fighter already selected.");
                    }
                  }}
                  className={`xl:w-44 xl:h-44 md:w-32 md:h-32 sm:w-24 sm:h-24 w-20 h-20 cursor-pointer border ${
                    theme === "dark" ? "border-stone-600" : "border-stone-400"
                  } rounded-lg shadow-md bg-gradient-to-b ${
                    gameState.fighter12.bg
                  } text-center flex items-center justify-center`}
                >
                  <div>
                    <div className="flex justify-center">
                      <img
                        src={gameState.fighter12.url}
                        className="xl:w-12 lg:w-10 md:w-9 w-6"
                      />
                    </div>
                    <p className="font-semibold xl:text-lg lg:text-base md:text-sm text-xs mt-1 leading-[15px]">
                      {gameState.fighter12.text}
                    </p>
                  </div>
                </div>
              </div>
              <div className={`flex gap-[2px] text-white`}>
                <div
                  className={`xl:w-44 xl:h-44 md:w-32 md:h-32 sm:w-24 sm:h-24 w-20 h-20 border ${
                    theme === "dark"
                      ? "border-stone-600 bg-stone-800"
                      : "border-stone-400 bg-stone-300"
                  } rounded-lg text-center flex items-center justify-center p-1`}
                >
                  {gameState?.filtersSelected.length > 0 ? (
                    <div>
                      <div className="flex items-center justify-center">
                        {gameState?.filtersSelected[5].filter_image != null ? (
                          <img
                            src={gameState?.filtersSelected[5].filter_image}
                            className="xl:w-12 lg:w-10 md:w-9 w-7 rounded-md"
                          />
                        ) : (
                          <h2 className="text-red-500 font-bold xl:text-3xl lg:text-xl text-lg italic">
                            {gameState?.filtersSelected[5].filter_no_image_text}
                          </h2>
                        )}
                      </div>
                      <p
                        className={`font-semibold xl:pt-2 pt-1 xl:text-base md:text-lg sm:text-sm text-[12px] ${
                          theme === "dark" ? "text-white" : "text-black"
                        }`}
                      >
                        {gameState?.filtersSelected[5].filter_text}
                      </p>
                    </div>
                  ) : (
                    <p>Loading...</p>
                  )}
                </div>
                <div
                  onClick={() => {
                    if (
                      gameState.fighter20.bg ===
                        "from-stone-700 to-stone-800" ||
                      "from-stone-200 to-stone-300"
                    ) {
                      toggleFighterPick();
                      setSelected("fighter20");
                    } else {
                      toast.info("Fighter already selected.");
                    }
                  }}
                  className={`xl:w-44 xl:h-44 md:w-32 md:h-32 sm:w-24 sm:h-24 w-20 h-20 cursor-pointer border ${
                    theme === "dark" ? "border-stone-600" : "border-stone-400"
                  } rounded-lg shadow-md bg-gradient-to-b ${
                    gameState.fighter20.bg
                  } text-center flex items-center justify-center`}
                >
                  <div>
                    <div className="flex justify-center">
                      <img
                        src={gameState.fighter20.url}
                        className="xl:w-12 lg:w-10 md:w-9 w-6"
                      />
                    </div>
                    <p className="font-semibold xl:text-lg lg:text-base md:text-sm text-xs mt-1 leading-[15px]">
                      {gameState.fighter20.text}
                    </p>
                  </div>
                </div>
                <div
                  onClick={() => {
                    if (
                      gameState.fighter21.bg ===
                        "from-stone-700 to-stone-800" ||
                      "from-stone-200 to-stone-300"
                    ) {
                      toggleFighterPick();
                      setSelected("fighter21");
                    } else {
                      toast.info("Fighter already selected.");
                    }
                  }}
                  className={`xl:w-44 xl:h-44 md:w-32 md:h-32 sm:w-24 sm:h-24 w-20 h-20 cursor-pointer border ${
                    theme === "dark" ? "border-stone-600" : "border-stone-400"
                  } rounded-lg shadow-md bg-gradient-to-b ${
                    gameState.fighter21.bg
                  } text-center flex items-center justify-center`}
                >
                  <div>
                    <div className="flex justify-center">
                      <img
                        src={gameState.fighter21.url}
                        className="xl:w-12 lg:w-10 md:w-9 w-6"
                      />
                    </div>
                    <p className="font-semibold xl:text-lg lg:text-base md:text-sm text-xs mt-1 leading-[15px]">
                      {gameState.fighter21.text}
                    </p>
                  </div>
                </div>
                <div
                  onClick={() => {
                    if (
                      gameState.fighter22.bg ===
                        "from-stone-700 to-stone-800" ||
                      "from-stone-200 to-stone-300"
                    ) {
                      toggleFighterPick();
                      setSelected("fighter22");
                    } else {
                      toast.info("Fighter already selected.");
                    }
                  }}
                  className={`xl:w-44 xl:h-44 md:w-32 md:h-32 sm:w-24 sm:h-24 w-20 h-20 cursor-pointer border ${
                    theme === "dark" ? "border-stone-600" : "border-stone-400"
                  } rounded-lg shadow-md bg-gradient-to-b ${
                    gameState.fighter22.bg
                  } text-center flex items-center justify-center`}
                >
                  <div>
                    <div className="flex justify-center">
                      <img
                        src={gameState.fighter22.url}
                        className="xl:w-12 lg:w-10 md:w-9 w-6"
                      />
                    </div>
                    <p className="font-semibold xl:text-lg lg:text-base md:text-sm text-xs mt-1 leading-[15px]">
                      {gameState.fighter22.text}
                    </p>
                  </div>
                </div>
              </div>
              <div
                className={`absolute hidden select-fighter w-full text-white bottom-0 ${
                  theme === "dark"
                    ? "bg-stone-700 border-stone-600"
                    : "bg-stone-200 border-stone-400"
                } rounded-lg border shadow-lg left-0`}
              >
                <div className="p-2 w-full">
                  <input
                    type="text"
                    onChange={(e) => {
                      filterByName(e.target.value);
                    }}
                    placeholder="Search for a fighter..."
                    className="bg-white input-fighter text-black xl:text-base text-sm px-3 w-full py-1 rounded-lg hover:outline-0 focus:outline-1 outline-stone-500 shadow-lg"
                  />
                  {fighters && fighters.length > 0 ? (
                    <div className="w-full h-48 overflow-scroll overflow-x-hidden">
                      {fighters.map((fighter: any, key: any) => (
                        <div
                          onClick={() => {
                            updateBox(fighter);
                          }}
                          key={key}
                          className={`flex items-center border cursor-pointer gap-6 my-3 px-2 pt-2 bg-gradient-to-r ${
                            theme === "dark"
                              ? "from-stone-800 to-stone-900 border-stone-900 text-white"
                              : "from-stone-300 to-stone-400 border-stone-400 text-black"
                          } shadow-lg rounded-lg`}
                        >
                          <img
                            src={
                              fighter.Picture == "Unknown"
                                ? "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png"
                                : fighter.Picture
                            }
                            className="xl:w-13 w-10"
                          />
                          <p className="xl:text-lg md:text-base text-sm font-semibold">
                            {fighter.Fighter}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <div className="flex justify-end py-2">
                    <button
                      onClick={() => {
                        toggleFighterPick();
                      }}
                      className={` ${
                        theme === "dark"
                          ? "bg-stone-800 text-white border-stone-600"
                          : "bg-stone-300 text-black border-stone-400"
                      } px-6 py-1 font-semibold rounded-tr-lg rounded-bl-lg shadow-lg border cursor-pointer`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Room;
