import { useState } from "react";
import fighters_url from "./assets/data/fighters_url.json";
import Filters from "./logic/filters";
import { Fighter } from "./interfaces/Fighter";

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

  const updateBox = (picture: string, name: string) => {
    if (picture == "Unknown") {
      picture =
        "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png";
    }

    if (turn == "red") {
      if (selected == "fighter00") {
        setFighter00({
          url: picture,
          text: name,
          bg: "from-red-800 to-red-900",
        });
      } else if (selected == "fighter01") {
        setFighter01({
          url: picture,
          text: name,
          bg: "from-red-800 to-red-900",
        });
      } else if (selected == "fighter02") {
        setFighter02({
          url: picture,
          text: name,
          bg: "from-red-800 to-red-900",
        });
      } else if (selected == "fighter10") {
        setFighter10({
          url: picture,
          text: name,
          bg: "from-red-800 to-red-900",
        });
      } else if (selected == "fighter11") {
        setFighter11({
          url: picture,
          text: name,
          bg: "from-red-800 to-red-900",
        });
      } else if (selected == "fighter12") {
        setFighter12({
          url: picture,
          text: name,
          bg: "from-red-800 to-red-900",
        });
      } else if (selected == "fighter20") {
        setFighter20({
          url: picture,
          text: name,
          bg: "from-red-800 to-red-900",
        });
      } else if (selected == "fighter21") {
        setFighter21({
          url: picture,
          text: name,
          bg: "from-red-800 to-red-900",
        });
      } else if (selected == "fighter22") {
        setFighter22({
          url: picture,
          text: name,
          bg: "from-red-800 to-red-900",
        });
      }
    } else {
      if (selected == "fighter00") {
        setFighter00({
          url: picture,
          text: name,
          bg: "from-blue-700 to-blue-900",
        });
      } else if (selected == "fighter01") {
        setFighter01({
          url: picture,
          text: name,
          bg: "from-blue-700 to-blue-900",
        });
      } else if (selected == "fighter02") {
        setFighter02({
          url: picture,
          text: name,
          bg: "from-blue-700 to-blue-900",
        });
      } else if (selected == "fighter10") {
        setFighter10({
          url: picture,
          text: name,
          bg: "from-blue-700 to-blue-900",
        });
      } else if (selected == "fighter11") {
        setFighter11({
          url: picture,
          text: name,
          bg: "from-blue-700 to-blue-900",
        });
      } else if (selected == "fighter12") {
        setFighter12({
          url: picture,
          text: name,
          bg: "from-blue-700 to-blue-900",
        });
      } else if (selected == "fighter20") {
        setFighter20({
          url: picture,
          text: name,
          bg: "from-blue-700 to-blue-900",
        });
      } else if (selected == "fighter21") {
        setFighter21({
          url: picture,
          text: name,
          bg: "from-blue-700 to-blue-900",
        });
      } else if (selected == "fighter22") {
        setFighter22({
          url: picture,
          text: name,
          bg: "from-blue-700 to-blue-900",
        });
      }
    }

    toggleFighterPick();
    resetInput();
    if (turn == "blue") {
      setTurn("red");
    } else {
      setTurn("blue");
    }
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
        console.log("BİTTİ", newPositions);
        break;
      }
    }
  };

  const toggleFighterPick = () => {
    let div = document.querySelector(".select-fighter");
    div?.classList.toggle("hidden");
  };

  return (
    <>
      <div className="w-[100vw] h-[100vh] bg-stone-800">
        <div className="flex w-full h-full justify-center">
          <div className="bg-stone-600 rounded-lg relative h-fit mt-6 shadow-xl">
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
                <div>
                  <div className="flex items-center justify-center">
                    <img
                      src="https://vectorflags.s3.amazonaws.com/flags/us-square-01.png"
                      className="xl:w-12 lg:w-10 md:w-9 w-7 rounded-md"
                    />
                  </div>
                  <p
                    onClick={getFilters}
                    className="font-semibold pt-2 xl:text-base md:text-lg sm:text-sm text-xs"
                  >
                    USA
                  </p>
                </div>
              </div>
              <div className="xl:w-44 xl:h-44 md:w-32 md:h-32 sm:w-24 sm:h-24 w-20 h-20 border border-stone-600 rounded-lg bg-stone-800 text-center flex items-center justify-center">
                <div>
                  <div className="flex items-center justify-center">
                    <img
                      src="https://clipart-library.com/images/6cyoELkei.png"
                      className="xl:w-12 lg:w-10 md:w-9 w-7 rounded-md"
                    />
                  </div>
                  <p className="font-semibold pt-2 xl:text-base md:text-lg sm:text-sm text-xs">
                    UNDEFEATED
                  </p>
                </div>
              </div>
              <div className="xl:w-44 xl:h-44 md:w-32 md:h-32 sm:w-24 sm:h-24 w-20 h-20 border border-stone-600 rounded-lg bg-stone-800 text-center flex items-center justify-center">
                <div>
                  <div className="flex items-center justify-center">
                    <h2 className="text-red-500 font-bold xl:text-3xl lg:text-xl text-lg italic">
                      30&lt;
                    </h2>
                  </div>
                  <p className="font-semibold pt-2 xl:text-base md:text-lg sm:text-sm text-xs">
                    AGE
                  </p>
                </div>
              </div>
            </div>
            <div className="flex text-white">
              <div className="xl:w-44 xl:h-44 md:w-32 md:h-32 sm:w-24 sm:h-24 w-20 h-20 border border-stone-600 rounded-lg bg-stone-800 text-center flex items-center justify-center">
                <div>
                  <div className="flex items-center justify-center">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Brazilian_flag_icon_square.svg/640px-Brazilian_flag_icon_square.svg.png"
                      className="xl:w-12 lg:w-10 md:w-9 w-7 rounded-md"
                    />
                  </div>
                  <p className="font-semibold pt-2 xl:text-base md:text-lg sm:text-sm text-xs">
                    BRAZILIAN
                  </p>
                </div>
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
                      className="xl:w-12 lg:w-10 md:w-9 w-7"
                    />
                  </div>
                  <p className="font-semibold text-lg mt-1">{fighter00.text}</p>
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
                      className="xl:w-12 lg:w-10 md:w-9 w-7"
                    />
                  </div>
                  <p className="font-semibold text-lg mt-1">{fighter01.text}</p>
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
                      className="xl:w-12 lg:w-10 md:w-9 w-7"
                    />
                  </div>
                  <p className="font-semibold text-lg mt-1">{fighter02.text}</p>
                </div>
              </div>
            </div>
            <div className="flex text-white">
              <div className="xl:w-44 xl:h-44 md:w-32 md:h-32 sm:w-24 sm:h-24 w-20 h-20 border border-stone-600 rounded-lg bg-stone-800 text-center flex items-center justify-center">
                <div>
                  <div className="flex items-center justify-center">
                    <img
                      src="https://pngimg.com/d/ufc_PNG66.png"
                      className="xl:w-12 lg:w-10 md:w-9 w-7 rounded-md"
                    />
                  </div>
                  <p className="font-semibold pt-2 xl:text-base md:text-lg sm:text-sm text-xs">
                    CHAMPION
                  </p>
                </div>
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
                      className="xl:w-12 lg:w-10 md:w-9 w-7"
                    />
                  </div>
                  <p className="font-semibold text-lg mt-1">{fighter10.text}</p>
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
                      className="xl:w-12 lg:w-10 md:w-9 w-7"
                    />
                  </div>
                  <p className="font-semibold text-lg mt-1">{fighter11.text}</p>
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
                      className="xl:w-12 lg:w-10 md:w-9 w-7"
                    />
                  </div>
                  <p className="font-semibold text-lg mt-1">{fighter12.text}</p>
                </div>
              </div>
            </div>
            <div className="flex text-white">
              <div className="xl:w-44 xl:h-44 md:w-32 md:h-32 sm:w-24 sm:h-24 w-20 h-20 border border-stone-600 rounded-lg bg-stone-800 text-center flex items-center justify-center">
                <div>
                  <div className="flex items-center justify-center">
                    <img
                      src="https://clipart-library.com/2024/gambar-karate/gambar-karate-12.png"
                      className="xl:w-12 lg:w-10 md:w-9 w-7 rounded-md"
                    />
                  </div>
                  <p className="font-semibold pt-2 xl:text-base md:text-lg sm:text-sm text-xs">
                    SOUTHPAW
                  </p>
                </div>
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
                      className="xl:w-12 lg:w-10 md:w-9 w-7"
                    />
                  </div>
                  <p className="font-semibold text-lg mt-1">{fighter20.text}</p>
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
                      className="xl:w-12 lg:w-10 md:w-9 w-7"
                    />
                  </div>
                  <p className="font-semibold text-lg mt-1">{fighter21.text}</p>
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
                      className="xl:w-12 lg:w-10 md:w-9 w-7"
                    />
                  </div>
                  <p className="font-semibold text-lg mt-1">{fighter22.text}</p>
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
                          updateBox(fighter.Picture, fighter.Fighter);
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
    </>
  );
}

export default App;
