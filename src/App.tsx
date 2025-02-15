import { useEffect, useState } from "react";
import fighters_url from "./assets/data/fighters_url.json";
import Filters from "./logic/filters";
import { Fighter } from "./interfaces/Fighter";
import { ToastContainer, toast } from "react-toastify";

function App() {
  let filters = Filters();

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

  useEffect(() => {
    const winner = checkWinner();
    if (winner) {
      alert(winner); // Kazananı bildir
      return;
    }
  }, [turn]);

  const [filtersSelected, setFiltersSelected]: any = useState([]);

  const [fighters, setFigters]: any = useState();

  const [fighter00, setFighter00]: any = useState({
    url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
    text: "",
    bg: "from-stone-700 to-stone-800",
  });
  const [fighter01, setFighter01]: any = useState({
    url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
    text: "",
    bg: "from-stone-700 to-stone-800",
  });
  const [fighter02, setFighter02]: any = useState({
    url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
    text: "",
    bg: "from-stone-700 to-stone-800",
  });
  const [fighter10, setFighter10]: any = useState({
    url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
    text: "",
    bg: "from-stone-700 to-stone-800",
  });
  const [fighter11, setFighter11]: any = useState({
    url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
    text: "",
    bg: "from-stone-700 to-stone-800",
  });
  const [fighter12, setFighter12]: any = useState({
    url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
    text: "",
    bg: "from-stone-700 to-stone-800",
  });
  const [fighter20, setFighter20]: any = useState({
    url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
    text: "",
    bg: "from-stone-700 to-stone-800",
  });
  const [fighter21, setFighter21]: any = useState({
    url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
    text: "",
    bg: "from-stone-700 to-stone-800",
  });
  const [fighter22, setFighter22]: any = useState({
    url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
    text: "",
    bg: "from-stone-700 to-stone-800",
  });

  useEffect(() => {
    getFilters();
  }, []);

  const [selected, setSelected]: any = useState();

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
    toggleFighterPick();
    resetInput();
    setFigters([]);
  };

  const getFilters = () => {
    let filters_arr: any = [];

    while (filters_arr.length < 6) {
      let random_index = Math.floor(Math.random() * filters.length);
      if (!filters_arr.includes(filters[random_index])) {
        filters_arr.push(filters[random_index]);
      }
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

      let newPositions = { ...positionsFighters }; // Yeni state nesnesi oluştur

      for (let i = 0; i < 3; i++) {
        let intersection3 = filters_arr[i].filter_fighters.filter(
          (fighter1: Fighter) =>
            filters_arr[3].filter_fighters.some(
              (fighter2: Fighter) => fighter1.Id === fighter2.Id
            )
        );

        let intersection4 = filters_arr[i].filter_fighters.filter(
          (fighter1: Fighter) =>
            filters_arr[4].filter_fighters.some(
              (fighter2: Fighter) => fighter1.Id === fighter2.Id
            )
        );

        let intersection5 = filters_arr[i].filter_fighters.filter(
          (fighter1: Fighter) =>
            filters_arr[5].filter_fighters.some(
              (fighter2: Fighter) => fighter1.Id === fighter2.Id
            )
        );

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
        setPositionsFighters(newPositions); // Tek seferde state güncelle
        setFiltersSelected(filters_arr);
        break;
      }
    }
    console.log(filtersSelected);
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

    for (let pattern of winPatterns) {
      const [a, b, c] = pattern;
      const cellA = board[a[0]][a[1]];
      const cellB = board[b[0]][b[1]];
      const cellC = board[c[0]][c[1]];

      if (
        cellA !== "from-stone-700 to-stone-800" && // Boş değilse
        cellA === cellB &&
        cellB === cellC
      ) {
        return cellA.includes("red") ? "Red Wins!" : "Blue Wins!";
      }
    }

    return null;
  };

  const toggleFighterPick = () => {
    let div = document.querySelector(".select-fighter");
    div?.classList.toggle("hidden");
  };

  const notify = () => toast.error("Fighter doesnt meet the requirements.");

  return (
    <>
      <div className="w-[100vw] h-[100vh] bg-stone-800">
        <ToastContainer
          position="bottom-right"
          theme="dark"
        />
        <div className="flex w-full h-full justify-center">
          <div>
            <div className="flex justify-end text-right pt-12">
              {turn == "red" ? (
                <div className="bg-stone-300 flex gap-4 text-red-600 border border-stone-400 font-semibold w-fit px-5 py-1 rounded-lg shadow-xl">
                  <p>Turn : Red</p>
                  <div
                    onClick={() => {
                      setTurn("blue");
                    }}
                    className="bg-stone-600 text-white cursor-pointer px-2 rounded-lg"
                  >
                    Skip
                  </div>
                </div>
              ) : (
                <div className="bg-stone-300 flex gap-4 text-blue-600 border border-stone-400 font-semibold w-fit px-5 py-1 rounded-lg shadow-xl">
                  <p>Turn : Blue</p>
                  <div
                    onClick={() => {
                      setTurn("red");
                    }}
                    className="bg-stone-600 text-white cursor-pointer px-2 rounded-lg"
                  >
                    Skip
                  </div>
                </div>
              )}
            </div>
            <div className="bg-stone-600 rounded-lg relative h-fit mt-3 shadow-xl">
              <div className="flex text-white">
                <div className="xl:w-44 xl:h-44 md:w-32 md:h-32 sm:w-24 sm:h-24 w-20 h-20 border border-stone-600 rounded-lg bg-neutral-900 text-center flex items-center justify-center">
                  <div>
                    <div className="flex items-center justify-center">
                      <img
                        src="https://cdn-icons-png.freepik.com/512/921/921676.png"
                        className="xl:w-12 lg:w-10 md:w-9 w-7 rounded-md"
                      />
                    </div>
                    <p className="font-semibold pt-2 xl:text-base md:text-lg sm:text-sm text-xs">
                      MMA XOX
                    </p>
                  </div>
                </div>
                <div className="xl:w-44 xl:h-44 md:w-32 md:h-32 sm:w-24 sm:h-24 w-20 h-20 border border-stone-600 rounded-lg bg-stone-800 text-center flex items-center justify-center">
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
                        onClick={getFilters}
                        className="font-semibold pt-2 xl:text-base md:text-lg sm:text-sm text-xs"
                      >
                        {filtersSelected[0].filter_text}
                      </p>
                    </div>
                  ) : (
                    <p>Loading...</p>
                  )}
                </div>
                <div className="xl:w-44 xl:h-44 md:w-32 md:h-32 sm:w-24 sm:h-24 w-20 h-20 border border-stone-600 rounded-lg bg-stone-800 text-center flex items-center justify-center">
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
                        onClick={getFilters}
                        className="font-semibold pt-2 xl:text-base md:text-lg sm:text-sm text-xs"
                      >
                        {filtersSelected[1].filter_text}
                      </p>
                    </div>
                  ) : (
                    <p>Loading...</p>
                  )}
                </div>
                <div className="xl:w-44 xl:h-44 md:w-32 md:h-32 sm:w-24 sm:h-24 w-20 h-20 border border-stone-600 rounded-lg bg-stone-800 text-center flex items-center justify-center">
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
                        onClick={getFilters}
                        className="font-semibold pt-2 xl:text-base md:text-lg sm:text-sm text-xs"
                      >
                        {filtersSelected[2].filter_text}
                      </p>
                    </div>
                  ) : (
                    <p>Loading...</p>
                  )}
                </div>
              </div>
              <div className="flex text-white">
                <div className="xl:w-44 xl:h-44 md:w-32 md:h-32 sm:w-24 sm:h-24 w-20 h-20 border border-stone-600 rounded-lg bg-stone-800 text-center flex items-center justify-center">
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
                        onClick={getFilters}
                        className="font-semibold pt-2 xl:text-base md:text-lg sm:text-sm text-xs"
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
                    toggleFighterPick();
                    setSelected("fighter00");
                  }}
                  className={`xl:w-44 xl:h-44 md:w-32 md:h-32 sm:w-24 sm:h-24 w-20 h-20 cursor-pointer  border border-stone-600 rounded-lg shadow-md bg-gradient-to-b ${fighter00.bg} text-center flex items-center justify-center`}
                >
                  <div>
                    <div className="flex justify-center">
                      <img
                        src={fighter00.url}
                        className="xl:w-12 lg:w-10 md:w-9 w-6"
                      />
                    </div>
                    <p className="font-semibold xl:text-lg lg:text-base md:text-sm text-xs mt-1">
                      {fighter00.text}
                    </p>
                  </div>
                </div>
                <div
                  onClick={() => {
                    toggleFighterPick();
                    setSelected("fighter01");
                  }}
                  className={`xl:w-44 xl:h-44 md:w-32 md:h-32 sm:w-24 sm:h-24 w-20 h-20 cursor-pointer  border border-stone-600 rounded-lg shadow-md bg-gradient-to-b ${fighter01.bg} text-center flex items-center justify-center`}
                >
                  <div>
                    <div className="flex justify-center">
                      <img
                        src={fighter01.url}
                        className="xl:w-12 lg:w-10 md:w-9 w-6"
                      />
                    </div>
                    <p className="font-semibold xl:text-lg lg:text-base md:text-sm text-xs mt-1">
                      {fighter01.text}
                    </p>
                  </div>
                </div>
                <div
                  onClick={() => {
                    toggleFighterPick();
                    setSelected("fighter02");
                  }}
                  className={`xl:w-44 xl:h-44 md:w-32 md:h-32 sm:w-24 sm:h-24 w-20 h-20 cursor-pointer  border border-stone-600 rounded-lg shadow-md bg-gradient-to-b ${fighter02.bg} text-center flex items-center justify-center`}
                >
                  <div>
                    <div className="flex justify-center">
                      <img
                        src={fighter02.url}
                        className="xl:w-12 lg:w-10 md:w-9 w-6"
                      />
                    </div>
                    <p className="font-semibold xl:text-lg lg:text-base md:text-sm text-xs mt-1">
                      {fighter02.text}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex text-white">
                <div className="xl:w-44 xl:h-44 md:w-32 md:h-32 sm:w-24 sm:h-24 w-20 h-20 border border-stone-600 rounded-lg bg-stone-800 text-center flex items-center justify-center">
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
                        onClick={getFilters}
                        className="font-semibold pt-2 xl:text-base md:text-lg sm:text-sm text-xs"
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
                    toggleFighterPick();
                    setSelected("fighter10");
                  }}
                  className={`xl:w-44 xl:h-44 md:w-32 md:h-32 sm:w-24 sm:h-24 w-20 h-20 cursor-pointer  border border-stone-600 rounded-lg shadow-md bg-gradient-to-b ${fighter10.bg} text-center flex items-center justify-center`}
                >
                  <div>
                    <div className="flex justify-center">
                      <img
                        src={fighter10.url}
                        className="xl:w-12 lg:w-10 md:w-9 w-6"
                      />
                    </div>
                    <p className="font-semibold xl:text-lg lg:text-base md:text-sm text-xs mt-1">
                      {fighter10.text}
                    </p>
                  </div>
                </div>
                <div
                  onClick={() => {
                    toggleFighterPick();
                    setSelected("fighter11");
                  }}
                  className={`xl:w-44 xl:h-44 md:w-32 md:h-32 sm:w-24 sm:h-24 w-20 h-20 cursor-pointer  border border-stone-600 rounded-lg shadow-md bg-gradient-to-b ${fighter11.bg} text-center flex items-center justify-center`}
                >
                  <div>
                    <div className="flex justify-center">
                      <img
                        src={fighter11.url}
                        className="xl:w-12 lg:w-10 md:w-9 w-6"
                      />
                    </div>
                    <p className="font-semibold xl:text-lg lg:text-base md:text-sm text-xs mt-1">
                      {fighter11.text}
                    </p>
                  </div>
                </div>
                <div
                  onClick={() => {
                    toggleFighterPick();
                    setSelected("fighter12");
                  }}
                  className={`xl:w-44 xl:h-44 md:w-32 md:h-32 sm:w-24 sm:h-24 w-20 h-20 cursor-pointer  border border-stone-600 rounded-lg shadow-md bg-gradient-to-b ${fighter12.bg} text-center flex items-center justify-center`}
                >
                  <div>
                    <div className="flex justify-center">
                      <img
                        src={fighter12.url}
                        className="xl:w-12 lg:w-10 md:w-9 w-6"
                      />
                    </div>
                    <p className="font-semibold xl:text-lg lg:text-base md:text-sm text-xs mt-1">
                      {fighter12.text}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex text-white">
                <div className="xl:w-44 xl:h-44 md:w-32 md:h-32 sm:w-24 sm:h-24 w-20 h-20 border border-stone-600 rounded-lg bg-stone-800 text-center flex items-center justify-center">
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
                        onClick={getFilters}
                        className="font-semibold pt-2 xl:text-base md:text-lg sm:text-sm text-xs"
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
                    toggleFighterPick();
                    setSelected("fighter20");
                  }}
                  className={`xl:w-44 xl:h-44 md:w-32 md:h-32 sm:w-24 sm:h-24 w-20 h-20 cursor-pointer  border border-stone-600 rounded-lg shadow-md bg-gradient-to-b ${fighter20.bg} text-center flex items-center justify-center`}
                >
                  <div>
                    <div className="flex justify-center">
                      <img
                        src={fighter20.url}
                        className="xl:w-12 lg:w-10 md:w-9 w-6"
                      />
                    </div>
                    <p className="font-semibold xl:text-lg lg:text-base md:text-sm text-xs mt-1">
                      {fighter20.text}
                    </p>
                  </div>
                </div>
                <div
                  onClick={() => {
                    toggleFighterPick();
                    setSelected("fighter21");
                  }}
                  className={`xl:w-44 xl:h-44 md:w-32 md:h-32 sm:w-24 sm:h-24 w-20 h-20 cursor-pointer  border border-stone-600 rounded-lg shadow-md bg-gradient-to-b ${fighter21.bg} text-center flex items-center justify-center`}
                >
                  <div>
                    <div className="flex justify-center">
                      <img
                        src={fighter21.url}
                        className="xl:w-12 lg:w-10 md:w-9 w-6"
                      />
                    </div>
                    <p className="font-semibold xl:text-lg lg:text-base md:text-sm text-xs mt-1">
                      {fighter21.text}
                    </p>
                  </div>
                </div>
                <div
                  onClick={() => {
                    toggleFighterPick();
                    setSelected("fighter22");
                  }}
                  className={`xl:w-44 xl:h-44 md:w-32 md:h-32 sm:w-24 sm:h-24 w-20 h-20 cursor-pointer  border border-stone-600 rounded-lg shadow-md bg-gradient-to-b ${fighter22.bg} text-center flex items-center justify-center`}
                >
                  <div>
                    <div className="flex justify-center">
                      <img
                        src={fighter22.url}
                        className="xl:w-12 lg:w-10 md:w-9 w-6"
                      />
                    </div>
                    <p className="font-semibold xl:text-lg lg:text-base md:text-sm text-xs mt-1">
                      {fighter22.text}
                    </p>
                  </div>
                </div>
              </div>
              <div className="absolute hidden select-fighter w-full text-white bottom-0 bg-stone-700 rounded-lg border border-stone-600 shadow-lg left-0">
                <div className="p-2 w-full">
                  <input
                    type="text"
                    onChange={(e) => {
                      filterByName(e.target.value);
                    }}
                    placeholder="Search for a fighter..."
                    className="bg-white input-fighter text-black px-3 w-full py-1 rounded-lg hover:outline-0 focus:outline-1 outline-stone-500 shadow-lg"
                  />
                  {fighters && fighters.length > 0 ? (
                    <div className="w-full h-48 overflow-scroll overflow-x-hidden">
                      {fighters.map((fighter: any, key: any) => (
                        <div
                          onClick={() => {
                            updateBox(fighter);
                          }}
                          key={key}
                          className="flex items-center cursor-pointer gap-6 my-3 px-2 pt-2 bg-gradient-to-r from-stone-800 to-stone-900 shadow-lg rounded-lg text-white"
                        >
                          <img
                            src={
                              fighter.Picture == "Unknown"
                                ? "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png"
                                : fighter.Picture
                            }
                            className="w-13"
                          />
                          <p className="text-lg font-semibold">
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
                      className="bg-stone-800 px-6 py-1 font-semibold rounded-tr-lg rounded-bl-lg shadow-lg border cursor-pointer border-stone-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
