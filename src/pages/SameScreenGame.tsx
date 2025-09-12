import { useContext, useEffect, useState } from "react";
import fighters_url from "../assets/data/fighters.json";
import Filters from "../logic/filters";
import { Fighter, FilterDifficulty } from "../interfaces/Fighter";
import { ToastContainer, toast } from "react-toastify";
import return_img from "../assets/return.png";
import { Link } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";

function SameScreenGame() {
  useEffect(() => {
    document.title = "MMA XOX"; // Sayfa başlığını değiştir
  }, []);

  const { theme, toggleTheme } = useContext(ThemeContext);

  const [difficulty, setDifficulty]: any = useState("MEDIUM");

  const [timer, setTimer]: any = useState("30");
  const [timerLength, setTimerLength]: any = useState("30");

  const [gameStart, setGameStart] = useState(false);

  const [gameWinner, setGameWinner]: any = useState(null);

  const [selected, setSelected]: any = useState();

  const [filters, setFilters]: any = useState();

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

  const [turn, setTurn]: any = useState("red");

  const [filtersSelected, setFiltersSelected]: any = useState([]);

  const [fighters, setFigters]: any = useState();

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

  const restartGame = () => {
    setGameStart(false);
    // Tüm kutuları başlangıç durumuna döndür
    setFighter00({
      url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
      text: "",
      bg:
        theme === "dark"
          ? "from-stone-700 to-stone-800"
          : "from-stone-200 to-stone-300",
    });
    setFighter01({
      url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
      text: "",
      bg:
        theme === "dark"
          ? "from-stone-700 to-stone-800"
          : "from-stone-200 to-stone-300",
    });
    setFighter02({
      url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
      text: "",
      bg:
        theme === "dark"
          ? "from-stone-700 to-stone-800"
          : "from-stone-200 to-stone-300",
    });
    setFighter10({
      url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
      text: "",
      bg:
        theme === "dark"
          ? "from-stone-700 to-stone-800"
          : "from-stone-200 to-stone-300",
    });
    setFighter11({
      url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
      text: "",
      bg:
        theme === "dark"
          ? "from-stone-700 to-stone-800"
          : "from-stone-200 to-stone-300",
    });
    setFighter12({
      url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
      text: "",
      bg:
        theme === "dark"
          ? "from-stone-700 to-stone-800"
          : "from-stone-200 to-stone-300",
    });
    setFighter20({
      url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
      text: "",
      bg:
        theme === "dark"
          ? "from-stone-700 to-stone-800"
          : "from-stone-200 to-stone-300",
    });
    setFighter21({
      url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
      text: "",
      bg:
        theme === "dark"
          ? "from-stone-700 to-stone-800"
          : "from-stone-200 to-stone-300",
    });
    setFighter22({
      url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
      text: "",
      bg:
        theme === "dark"
          ? "from-stone-700 to-stone-800"
          : "from-stone-200 to-stone-300",
    });

    // Oyunun ilk sırası kırmızı olsun
    setTurn("red");

    // Oyuncuların seçtiği dövüşçüleri sıfırla
    setFigters([]);

    // Yeni rastgele dövüşçüleri belirle
    getFilters();

    setGameWinner(null);
  };

  const filterByName = (name: string) => {
    if (name.length > 3) {
      let fighters = fighters_url.filter((fighter) => {
        return fighter.Fighter.toLowerCase().includes(name);
      });
      setFigters(fighters);
    }
  };

  const resetInput = () => {
    let input: any = document.querySelector(".input-fighter");
    input.value = "";
  };

  const updateBox = (fighter: Fighter) => {
    let picture =
      fighter.Picture === "Unknown"
        ? "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png"
        : fighter.Picture;
    let name = fighter.Fighter;

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

      const winner = checkWinner();
      if (winner) {
        alert(winner); // Kazananı bildir
        return;
      }
    }

    setTurn(turn === "red" ? "blue" : "red");
    setTimer(timerLength);
    toggleFighterPick();
    resetInput();
    setFigters([]);
  };

  const startGame = () => {
    let f: FilterDifficulty = Filters();

    setTimer(timerLength);
    if (difficulty == "EASY") {
      setFilters(f.easy);
    } else if (difficulty == "MEDIUM") {
      setFilters(f.medium);
    } else {
      setFilters(f.hard);
    }

    setGameStart(true);
  };

  const getFilters = () => {
    let filters_arr: any = [];

    while (filters_arr.length < 6) {
      let random_index = Math.floor(Math.random() * filters.length);
      if (!filters_arr.includes(filters[random_index])) {
        filters_arr.push(filters[random_index]);
      }
    }

    if (filters_arr.length < 6) {
      console.error("HATA: filters_arr 6'dan az eleman içeriyor!");
      return;
    }

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
          console.warn("Eşleşme sağlanamadı, döngü yeniden başlatılıyor.");
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
        setPositionsFighters(newPositions); // Tek seferde state güncelle
        setFiltersSelected(filters_arr);
        break;
      }
    }
  };

  const checkWinner = () => {
    const board = [
      [fighter00.bg, fighter01.bg, fighter02.bg],
      [fighter10.bg, fighter11.bg, fighter12.bg],
      [fighter20.bg, fighter21.bg, fighter22.bg],
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
        return cellA.includes("red") ? "Red Wins!" : "Blue Wins!";
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

  const toggleFighterPick = () => {
    if (selected) {
    }
    let div = document.querySelector(".select-fighter");
    div?.classList.toggle("hidden");
  };

  useEffect(() => {
    if (gameStart == true) {
      const winner = checkWinner();
      if (winner) {
        if (winner == "Red Wins!") {
          setGameWinner("Red");
        } else if (winner == "Blue Wins!") {
          setGameWinner("Blue");
        } else if (winner == "Draw!") {
          setGameWinner("Draw");
        } else {
          setGameWinner(null);
        }
        return;
      }
    }
  }, [turn]);

  useEffect(() => {
    console.log(fighter00.bg);
    console.log(fighter01.bg);
    console.log(fighter02.bg);

    if (
      fighter00.bg != "from-red-800 to-red-900" &&
      fighter00.bg != "from-blue-800 to-blue-900"
    ) {
      setFighter00({
        ...fighter00,
        bg:
          theme === "dark"
            ? "from-stone-700 to-stone-800"
            : "from-stone-200 to-stone-300",
      });
    }
    if (
      fighter01.bg != "from-red-800 to-red-900" &&
      fighter01.bg != "from-blue-800 to-blue-900"
    ) {
      setFighter01({
        ...fighter01,
        bg:
          theme === "dark"
            ? "from-stone-700 to-stone-800"
            : "from-stone-200 to-stone-300",
      });
    }
    if (
      fighter02.bg != "from-red-800 to-red-900" &&
      fighter02.bg != "from-blue-800 to-blue-900"
    ) {
      setFighter02({
        ...fighter02,
        bg:
          theme === "dark"
            ? "from-stone-700 to-stone-800"
            : "from-stone-200 to-stone-300",
      });
    }
    if (
      fighter10.bg != "from-red-800 to-red-900" &&
      fighter10.bg != "from-blue-800 to-blue-900"
    ) {
      setFighter10({
        ...fighter10,
        bg:
          theme === "dark"
            ? "from-stone-700 to-stone-800"
            : "from-stone-200 to-stone-300",
      });
    }
    if (
      fighter11.bg != "from-red-800 to-red-900" &&
      fighter11.bg != "from-blue-800 to-blue-900"
    ) {
      setFighter11({
        ...fighter11,
        bg:
          theme === "dark"
            ? "from-stone-700 to-stone-800"
            : "from-stone-200 to-stone-300",
      });
    }
    if (
      fighter12.bg != "from-red-800 to-red-900" &&
      fighter12.bg != "from-blue-800 to-blue-900"
    ) {
      setFighter12({
        ...fighter12,
        bg:
          theme === "dark"
            ? "from-stone-700 to-stone-800"
            : "from-stone-200 to-stone-300",
      });
    }
    if (
      fighter20.bg != "from-red-800 to-red-900" &&
      fighter20.bg != "from-blue-800 to-blue-900"
    ) {
      setFighter20({
        ...fighter20,
        bg:
          theme === "dark"
            ? "from-stone-700 to-stone-800"
            : "from-stone-200 to-stone-300",
      });
    }
    if (
      fighter21.bg != "from-red-800 to-red-900" &&
      fighter21.bg != "from-blue-800 to-blue-900"
    ) {
      setFighter21({
        ...fighter21,
        bg:
          theme === "dark"
            ? "from-stone-700 to-stone-800"
            : "from-stone-200 to-stone-300",
      });
    }
    if (
      fighter22.bg != "from-red-800 to-red-900" &&
      fighter22.bg != "from-blue-800 to-blue-900"
    ) {
      setFighter22({
        ...fighter22,
        bg:
          theme === "dark"
            ? "from-stone-700 to-stone-800"
            : "from-stone-200 to-stone-300",
      });
    }
  }, [theme]);

  useEffect(() => {
    if (gameStart == true) {
      getFilters();
    }
  }, [gameStart]);

  useEffect(() => {
    if (timer <= 0) {
      setTurn((prevTurn: any) => (prevTurn === "red" ? "blue" : "red"));
      setTimer(timerLength);
      return; // Yeni interval başlatmadan çık
    }

    const interval = setInterval(() => {
      setTimer((prev: any) => prev - 1);
    }, 1000);

    return () => clearInterval(interval); // Eski intervali temizle
  }, [timer]);

  const notify = () => toast.error("Fighter doesnt meet the requirements.");

  return (
    <>
      <div
        className={`w-[100vw] h-[100vh] min-h-screen relative overflow-hidden transition-all duration-1000 ${
          theme === "dark"
            ? "bg-gradient-to-br from-stone-900 via-indigo-900 to-stone-800"
            : "bg-gradient-to-br from-stone-200 via-indigo-200 to-stone-300"
        }`}
      >
        <ToastContainer
          position="bottom-right"
          theme="dark"
        />
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Mountains */}
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
          {/* Floating particles */}
          {[
            { left: "10%", top: "20%", delay: "0s", duration: "3s" },
            { left: "85%", top: "15%", delay: "0.5s", duration: "4s" },
            { left: "25%", top: "40%", delay: "1s", duration: "3.5s" },
            { left: "70%", top: "35%", delay: "1.5s", duration: "4.5s" },
            { left: "45%", top: "10%", delay: "2s", duration: "3s" },
            { left: "15%", top: "60%", delay: "2.5s", duration: "4s" },
            { left: "90%", top: "55%", delay: "0.2s", duration: "3.8s" },
            { left: "35%", top: "75%", delay: "0.8s", duration: "4.2s" },
            { left: "60%", top: "25%", delay: "1.2s", duration: "3.3s" },
            { left: "5%", top: "45%", delay: "1.8s", duration: "4.7s" },
            { left: "80%", top: "70%", delay: "0.3s", duration: "3.6s" },
            { left: "50%", top: "5%", delay: "0.9s", duration: "4.1s" },
            { left: "20%", top: "85%", delay: "1.4s", duration: "3.9s" },
            { left: "75%", top: "80%", delay: "1.9s", duration: "4.4s" },
            { left: "40%", top: "50%", delay: "0.6s", duration: "3.7s" },
            { left: "95%", top: "30%", delay: "1.1s", duration: "4.3s" },
            { left: "30%", top: "90%", delay: "1.6s", duration: "3.4s" },
            { left: "65%", top: "60%", delay: "2.1s", duration: "4.6s" },
            { left: "8%", top: "75%", delay: "0.4s", duration: "3.2s" },
            { left: "55%", top: "40%", delay: "1.3s", duration: "4.8s" },
          ].map((particle, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 rounded-full ${
                theme === "dark" ? "bg-purple-400/20" : "bg-blue-400/30"
              } animate-pulse`}
              style={{
                left: particle.left,
                top: particle.top,
                animationDelay: particle.delay,
                animationDuration: particle.duration,
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
            to="/menu"
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
            <span className="font-semibold">Back to Menu</span>
          </Link>
        </div>
        <div className="flex w-full h-full justify-center">
          <div>
            <div className="mt-32">
              {gameStart == true && parseInt(timerLength) >= 0 ? (
                <p
                  className={`xl:text-xl md:hidden block lg:text-lg text-base font-semibold ${
                    turn == "red" ? "text-red-500" : "text-blue-500"
                  }`}
                >
                  {timer} seconds
                </p>
              ) : null}
            </div>
            <div className="flex justify-between items-center gap-3 flex-wrap text-right pt-2 relative">
              <div
                onClick={() => {
                  restartGame();
                }}
                className={`cursor-pointer flex gap-4 items-center xl:text-base text-xs font-semibold w-fit px-6 py-2 rounded-lg shadow-xl backdrop-blur-sm border-2 transition-all duration-300 ${
                  theme === "dark"
                    ? "bg-gradient-to-r from-slate-700/80 to-slate-600/80 border-slate-500/30 hover:from-slate-600/80 hover:to-slate-500/80 text-white"
                    : "bg-gradient-to-r from-white/80 to-gray-100/80 border-gray-200/30 hover:from-gray-50/80 hover:to-white/80"
                }`}
              >
                Restart Game
              </div>
              <div>
                {gameStart == true && parseInt(timerLength) >= 0 ? (
                  <p
                    className={`xl:text-xl md:block hidden lg:text-lg text-base text-center font-semibold ${
                      turn == "red" ? "text-red-500" : "text-blue-500"
                    }`}
                  >
                    {timer} seconds
                  </p>
                ) : null}
              </div>
              {turn == "red" ? (
                <div
                  className={`cursor-pointer flex gap-4 items-center xl:text-base text-xs font-semibold w-fit px-6 py-2 rounded-lg shadow-xl backdrop-blur-sm border-2 duration-200 transition-all duration-300 ${
                    theme === "dark"
                      ? "bg-gradient-to-r from-slate-700/80 to-slate-600/80 border-slate-500/30 hover:from-slate-600/80 hover:to-slate-500/80 text-red-400"
                      : "bg-gradient-to-r from-white/80 to-gray-100/80 border-gray-200/30 hover:from-gray-50/80 hover:to-white/80 text-red-600"
                  }`}
                >
                  <p>Turn : Red</p>
                  <div
                    onClick={() => {
                      setTurn("blue");
                      setTimer(timerLength);
                    }}
                    className={`${
                      theme === "dark"
                        ? "bg-slate-500 border-slate-700 text-slate-200"
                        : "bg-gradient-to-b from-slate-200 to-slate-300 border-slate-400 text-slate-900"
                    } cursor-pointer xl:text-base text-xs px-2 rounded-lg shadow-lg border`}
                  >
                    Skip
                  </div>
                </div>
              ) : (
                <div
                  className={`cursor-pointer flex gap-4 items-center xl:text-base text-xs font-semibold w-fit px-6 py-2 rounded-lg shadow-xl backdrop-blur-sm border-2 duration-200 transition-all duration-300 ${
                    theme === "dark"
                      ? "bg-gradient-to-r from-slate-700/80 to-slate-600/80 border-slate-500/30 hover:from-slate-600/80 hover:to-slate-500/80 text-blue-400"
                      : "bg-gradient-to-r from-white/80 to-gray-100/80 border-gray-200/30 hover:from-gray-50/80 hover:to-white/80 text-blue-600"
                  }`}
                >
                  <p>Turn : Blue</p>
                  <div
                    onClick={() => {
                      setTurn("red");
                      setTimer(timerLength);
                    }}
                    className={`${
                      theme === "dark"
                        ? "bg-slate-500 border-slate-700 text-slate-200"
                        : "bg-gradient-to-b from-slate-200 to-slate-300 border-slate-400 text-slate-900"
                    } cursor-pointer xl:text-base text-xs px-2 rounded-lg shadow-lg border`}
                  >
                    Skip
                  </div>
                </div>
              )}
            </div>
            <div
              className={`${
                theme === "dark"
                  ? "bg-indigo-900/50 text-stone-200 shadow-indigo-800/20 border-indigo-900"
                  : "bg-indigo-200/50 text-stone-700 shadow-indigo-100/20 border-indigo-200"
              } rounded-lg border-2 shadow-md relative h-fit mt-3 shadow-xl`}
            >
              <div
                className={`${gameWinner == null ? "hidden" : "absolute"} ${
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
                    {gameWinner == "Red" ? (
                      <>
                        <p className="text-red-500 font-semibold text-xl mt-4 text-center">
                          Red Wins!
                        </p>
                      </>
                    ) : gameWinner == "Blue" ? (
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
                  {filtersSelected.length > 0 ? (
                    <div>
                      <div className="flex items-center justify-center">
                        {filtersSelected[0].filter_image != null ? (
                          <img
                            src={filtersSelected[0].filter_image}
                            className="xl:w-12 lg:w-10 md:w-9 w-7 rounded-md"
                          />
                        ) : (
                          <h2 className="text-red-500 font-bold xl:text-3xl lg:text-xl text-lg italic">
                            {filtersSelected[0].filter_no_image_text}
                          </h2>
                        )}
                      </div>
                      <p
                        className={`font-semibold xl:pt-2 pt-1 xl:text-base md:text-lg sm:text-sm text-[12px] ${
                          theme === "dark" ? "text-white" : "text-black"
                        }`}
                      >
                        {filtersSelected[0].filter_text}
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
                  {filtersSelected.length > 0 ? (
                    <div>
                      <div className="flex items-center justify-center">
                        {filtersSelected[1].filter_image != null ? (
                          <img
                            src={filtersSelected[1].filter_image}
                            className="xl:w-12 lg:w-10 md:w-9 w-7 rounded-md"
                          />
                        ) : (
                          <h2 className="text-red-500 font-bold xl:text-3xl lg:text-xl text-lg italic">
                            {filtersSelected[1].filter_no_image_text}
                          </h2>
                        )}
                      </div>
                      <p
                        className={`font-semibold xl:pt-2 pt-1 xl:text-base md:text-lg sm:text-sm text-[12px] ${
                          theme === "dark" ? "text-white" : "text-black"
                        }`}
                      >
                        {filtersSelected[1].filter_text}
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
                  {filtersSelected.length > 0 ? (
                    <div>
                      <div className="flex items-center justify-center">
                        {filtersSelected[2].filter_image != null ? (
                          <img
                            src={filtersSelected[2].filter_image}
                            className="xl:w-12 lg:w-10 md:w-9 w-7 rounded-md"
                          />
                        ) : (
                          <h2 className="text-red-500 font-bold xl:text-3xl lg:text-xl text-lg italic">
                            {filtersSelected[2].filter_no_image_text}
                          </h2>
                        )}
                      </div>
                      <p
                        className={`font-semibold xl:pt-2 pt-1 xl:text-base md:text-lg sm:text-sm text-[12px] ${
                          theme === "dark" ? "text-white" : "text-black"
                        }`}
                      >
                        {filtersSelected[2].filter_text}
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
                  {filtersSelected.length > 0 ? (
                    <div>
                      <div className="flex items-center justify-center">
                        {filtersSelected[3].filter_image != null ? (
                          <img
                            src={filtersSelected[3].filter_image}
                            className="xl:w-12 lg:w-10 md:w-9 w-7 rounded-md"
                          />
                        ) : (
                          <h2 className="text-red-500 font-bold xl:text-3xl lg:text-xl text-lg italic">
                            {filtersSelected[3].filter_no_image_text}
                          </h2>
                        )}
                      </div>
                      <p
                        className={`font-semibold xl:pt-2 pt-1 xl:text-base md:text-lg sm:text-sm text-[12px] ${
                          theme === "dark" ? "text-white" : "text-black"
                        }`}
                      >
                        {filtersSelected[3].filter_text}
                      </p>
                    </div>
                  ) : (
                    <p>Loading...</p>
                  )}
                </div>
                <div
                  onClick={() => {
                    if (
                      fighter00.bg === "from-stone-700 to-stone-800" ||
                      fighter00.bg === "from-stone-200 to-stone-300"
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
                    fighter00.bg
                  } text-center flex items-center justify-center`}
                >
                  <div>
                    <div className="flex justify-center">
                      <img
                        src={fighter00.url}
                        className="xl:w-12 lg:w-10 md:w-9 w-6"
                      />
                    </div>
                    <p className="font-semibold xl:text-lg lg:text-base md:text-sm text-xs mt-1 leading-[15px]">
                      {fighter00.text}
                    </p>
                  </div>
                </div>
                <div
                  onClick={() => {
                    if (
                      fighter01.bg === "from-stone-700 to-stone-800" ||
                      fighter01.bg === "from-stone-200 to-stone-300"
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
                    fighter01.bg
                  } text-center flex items-center justify-center`}
                >
                  <div>
                    <div className="flex justify-center">
                      <img
                        src={fighter01.url}
                        className="xl:w-12 lg:w-10 md:w-9 w-6"
                      />
                    </div>
                    <p className="font-semibold xl:text-lg lg:text-base md:text-sm text-xs mt-1 leading-[15px]">
                      {fighter01.text}
                    </p>
                  </div>
                </div>
                <div
                  onClick={() => {
                    if (
                      fighter02.bg === "from-stone-700 to-stone-800" ||
                      fighter02.bg === "from-stone-200 to-stone-300"
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
                    fighter02.bg
                  } text-center flex items-center justify-center`}
                >
                  <div>
                    <div className="flex justify-center">
                      <img
                        src={fighter02.url}
                        className="xl:w-12 lg:w-10 md:w-9 w-6"
                      />
                    </div>
                    <p className="font-semibold xl:text-lg lg:text-base md:text-sm text-xs mt-1 leading-[15px]">
                      {fighter02.text}
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
                  {filtersSelected.length > 0 ? (
                    <div>
                      <div className="flex items-center justify-center">
                        {filtersSelected[4].filter_image != null ? (
                          <img
                            src={filtersSelected[4].filter_image}
                            className="xl:w-12 lg:w-10 md:w-9 w-7 rounded-md"
                          />
                        ) : (
                          <h2 className="text-red-500 font-bold xl:text-3xl lg:text-xl text-lg italic">
                            {filtersSelected[4].filter_no_image_text}
                          </h2>
                        )}
                      </div>
                      <p
                        className={`font-semibold xl:pt-2 pt-1 xl:text-base md:text-lg sm:text-sm text-[12px] ${
                          theme === "dark" ? "text-white" : "text-black"
                        }`}
                      >
                        {filtersSelected[4].filter_text}
                      </p>
                    </div>
                  ) : (
                    <p>Loading...</p>
                  )}
                </div>
                <div
                  onClick={() => {
                    if (
                      fighter10.bg === "from-stone-700 to-stone-800" ||
                      fighter10.bg === "from-stone-200 to-stone-300"
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
                    fighter10.bg
                  } text-center flex items-center justify-center`}
                >
                  <div>
                    <div className="flex justify-center">
                      <img
                        src={fighter10.url}
                        className="xl:w-12 lg:w-10 md:w-9 w-6"
                      />
                    </div>
                    <p className="font-semibold xl:text-lg lg:text-base md:text-sm text-xs mt-1 leading-[15px]">
                      {fighter10.text}
                    </p>
                  </div>
                </div>
                <div
                  onClick={() => {
                    if (
                      fighter11.bg === "from-stone-700 to-stone-800" ||
                      fighter11.bg === "from-stone-200 to-stone-300"
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
                    fighter11.bg
                  } text-center flex items-center justify-center`}
                >
                  <div>
                    <div className="flex justify-center">
                      <img
                        src={fighter11.url}
                        className="xl:w-12 lg:w-10 md:w-9 w-6"
                      />
                    </div>
                    <p className="font-semibold xl:text-lg lg:text-base md:text-sm text-xs mt-1 leading-[15px]">
                      {fighter11.text}
                    </p>
                  </div>
                </div>
                <div
                  onClick={() => {
                    if (
                      fighter12.bg === "from-stone-700 to-stone-800" ||
                      fighter12.bg === "from-stone-200 to-stone-300"
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
                    fighter12.bg
                  } text-center flex items-center justify-center`}
                >
                  <div>
                    <div className="flex justify-center">
                      <img
                        src={fighter12.url}
                        className="xl:w-12 lg:w-10 md:w-9 w-6"
                      />
                    </div>
                    <p className="font-semibold xl:text-lg lg:text-base md:text-sm text-xs mt-1 leading-[15px]">
                      {fighter12.text}
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
                  {filtersSelected.length > 0 ? (
                    <div>
                      <div className="flex items-center justify-center">
                        {filtersSelected[5].filter_image != null ? (
                          <img
                            src={filtersSelected[5].filter_image}
                            className="xl:w-12 lg:w-10 md:w-9 w-7 rounded-md"
                          />
                        ) : (
                          <h2 className="text-red-500 font-bold xl:text-3xl lg:text-xl text-lg italic">
                            {filtersSelected[5].filter_no_image_text}
                          </h2>
                        )}
                      </div>
                      <p
                        className={`font-semibold xl:pt-2 pt-1 xl:text-base md:text-lg sm:text-sm text-[12px] ${
                          theme === "dark" ? "text-white" : "text-black"
                        }`}
                      >
                        {filtersSelected[5].filter_text}
                      </p>
                    </div>
                  ) : (
                    <p>Loading...</p>
                  )}
                </div>
                <div
                  onClick={() => {
                    if (
                      fighter20.bg === "from-stone-700 to-stone-800" ||
                      fighter20.bg === "from-stone-200 to-stone-300"
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
                    fighter20.bg
                  } text-center flex items-center justify-center`}
                >
                  <div>
                    <div className="flex justify-center">
                      <img
                        src={fighter20.url}
                        className="xl:w-12 lg:w-10 md:w-9 w-6"
                      />
                    </div>
                    <p className="font-semibold xl:text-lg lg:text-base md:text-sm text-xs mt-1 leading-[15px]">
                      {fighter20.text}
                    </p>
                  </div>
                </div>
                <div
                  onClick={() => {
                    if (
                      fighter21.bg === "from-stone-700 to-stone-800" ||
                      fighter21.bg === "from-stone-200 to-stone-300"
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
                    fighter21.bg
                  } text-center flex items-center justify-center`}
                >
                  <div>
                    <div className="flex justify-center">
                      <img
                        src={fighter21.url}
                        className="xl:w-12 lg:w-10 md:w-9 w-6"
                      />
                    </div>
                    <p className="font-semibold xl:text-lg lg:text-base md:text-sm text-xs mt-1 leading-[15px]">
                      {fighter21.text}
                    </p>
                  </div>
                </div>
                <div
                  onClick={() => {
                    if (
                      fighter22.bg === "from-stone-700 to-stone-800" ||
                      fighter22.bg === "from-stone-200 to-stone-300"
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
                    fighter22.bg
                  } text-center flex items-center justify-center`}
                >
                  <div>
                    <div className="flex justify-center">
                      <img
                        src={fighter22.url}
                        className="xl:w-12 lg:w-10 md:w-9 w-6"
                      />
                    </div>
                    <p className="font-semibold xl:text-lg lg:text-base md:text-sm text-xs mt-1 leading-[15px]">
                      {fighter22.text}
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
          </div>
        </div>
        <div
          className={`${
            gameStart ? "hidden" : "absolute"
          } w-full h-full top-0 left-0`}
        >
          <div className="flex w-full h-full justify-center items-center bg-[#00000092]">
            <div
              className={`z-40 absolute backdrop-blur-md bg-gradient-to-b ${
                theme === "dark"
                  ? "from-indigo-900/90 to-indigo-900/90 border-indigo-700/50 text-indigo-100"
                  : "from-indigo-100/90 to-sky-200/90 border-indigo-300/50 text-indigo-900"
              } shadow-2xl py-6 px-12 border-2 rounded-xl transition-all duration-300 hover:shadow-indigo-500/20`}
            >
              <div className="flex gap-3 items-center">
                <img
                  src="https://cdn-icons-png.freepik.com/512/921/921676.png"
                  alt="logo"
                  className="w-10 drop-shadow-lg"
                />
                <h1 className="font-bold text-2xl bg-gradient-to-r from-indigo-400 to-indigo-400 bg-clip-text text-transparent">
                  MMA XOX
                </h1>
              </div>
              <div className="flex text-center justify-center">
                <div className="mt-6">
                  <h2 className="font-semibold text-lg mb-2">
                    CHOOSE DIFFICULTY
                  </h2>
                  <select
                    defaultValue={"MEDIUM"}
                    onChange={(e) => {
                      setDifficulty(e.target.value);
                    }}
                    className={`${
                      theme === "dark"
                        ? "text-indigo-100 bg-gradient-to-r from-indigo-800 to-indigo-800 border-indigo-600"
                        : "text-indigo-900 bg-gradient-to-r from-indigo-200 to-sky-300 border-indigo-400"
                    } shadow-lg focus:outline-0 cursor-pointer border-2 font-semibold rounded-lg px-3 py-1 transition-all duration-200 hover:shadow-xl focus:ring-2 focus:ring-indigo-400`}
                  >
                    <option
                      value="EASY"
                      className={`${
                        theme === "dark" ? "bg-indigo-800" : "bg-sky-100"
                      }`}
                    >
                      EASY
                    </option>
                    <option
                      value="MEDIUM"
                      className={`${
                        theme === "dark" ? "bg-indigo-800" : "bg-sky-100"
                      }`}
                    >
                      MEDIUM
                    </option>
                    <option
                      value="HARD"
                      className={`${
                        theme === "dark" ? "bg-indigo-800" : "bg-sky-100"
                      }`}
                    >
                      HARD
                    </option>
                  </select>
                </div>
              </div>
              <div className="flex text-center justify-center">
                <div className="mt-6">
                  <h2 className="font-semibold text-lg mb-2">TIMER</h2>
                  <select
                    onChange={(e) => {
                      setTimerLength(e.target.value);
                    }}
                    defaultValue={"30"}
                    className={`${
                      theme === "dark"
                        ? "text-indigo-100 bg-gradient-to-r from-indigo-800 to-indigo-800 border-indigo-600"
                        : "text-indigo-900 bg-gradient-to-r from-indigo-200 to-sky-300 border-indigo-400"
                    } shadow-lg focus:outline-0 cursor-pointer border-2 font-semibold rounded-lg px-3 py-1 transition-all duration-200 hover:shadow-xl focus:ring-2 focus:ring-indigo-400`}
                  >
                    <option
                      value="-2"
                      className={`${
                        theme === "dark" ? "bg-indigo-800" : "bg-sky-100"
                      }`}
                    >
                      No time limit
                    </option>
                    <option
                      value="20"
                      className={`${
                        theme === "dark" ? "bg-indigo-800" : "bg-sky-100"
                      }`}
                    >
                      20 seconds
                    </option>
                    <option
                      value="30"
                      className={`${
                        theme === "dark" ? "bg-indigo-800" : "bg-sky-100"
                      }`}
                    >
                      30 seconds
                    </option>
                    <option
                      value="40"
                      className={`${
                        theme === "dark" ? "bg-indigo-800" : "bg-sky-100"
                      }`}
                    >
                      40 seconds
                    </option>
                  </select>
                </div>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={startGame}
                  className={`${
                    theme === "dark"
                      ? "border-indigo-600 bg-gradient-to-r from-indigo-700 to-indigo-700 text-indigo-100 hover:from-indigo-600 hover:to-indigo-600"
                      : "border-indigo-400 bg-gradient-to-r from-indigo-300 to-sky-400 text-indigo-900 hover:from-indigo-400 hover:to-sky-500"
                  } border-2 mt-6 text-xl hover:shadow-2xl px-6 py-2 shadow-lg duration-300 cursor-pointer rounded-xl font-bold transform hover:scale-105 transition-all focus:ring-2 focus:ring-blue-400`}
                >
                  PLAY!
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SameScreenGame;
