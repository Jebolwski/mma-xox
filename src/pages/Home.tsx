import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

const Home = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <div
      className={`w-screen h-screen flex items-center justify-center bg-gradient-to-br ${
        theme === "dark"
          ? "from-stone-800 to-stone-900"
          : "from-stone-200 to-stone-400"
      } relative`}
    >
      {/* Tema değiştirme butonu */}
      <div className="absolute z-30 text-red-500 top-3 left-3">
        <div
          onClick={toggleTheme}
          className={`p-1 rounded-full border cursor-pointer shadow-xl ${
            theme === "dark"
              ? "bg-stone-700 border-stone-800"
              : "bg-stone-300 border-stone-400"
          }`}
          title="Tema değiştir"
        >
          <img
            src={
              theme === "dark"
                ? "https://clipart-library.com/images/6iypd9jin.png"
                : "https://clipart-library.com/img/1669853.png"
            }
            className="w-8"
            alt={theme === "dark" ? "Açık Tema" : "Koyu Tema"}
          />
        </div>
      </div>
      <div
        className={`rounded-xl shadow-2xl p-10 max-w-lg w-full flex flex-col items-center ${
          theme === "dark" ? "bg-stone-800" : "bg-white"
        }`}
      >
        <img
          src="https://cdn-icons-png.freepik.com/512/921/921676.png"
          alt="MMA XOX Logo"
          className="w-20 h-20 mb-4"
        />
        <h1
          className={`text-4xl font-bold mb-2 ${
            theme === "dark" ? "text-red-400" : "text-red-600"
          }`}
        >
          MMA XOX
        </h1>
        <p
          className={`text-center mb-6 ${
            theme === "dark" ? "text-stone-200" : "text-stone-700"
          }`}
        >
          MMA XOX, klasik XOX (Tic Tac Toe) oyununu dövüşçülerle ve arenayla
          birleştirir!
          <br />
          <br />
          Arkadaşlarınla veya tek ekranda oynayabilir, odalar kurup rakiplerini
          davet edebilirsin.
          <br />
          <br />
          <span className="font-semibold text-red-500">
            Dövüşçünü seç, stratejini belirle ve arenada galip gel!
          </span>
        </p>
        <button
          onClick={() => navigate("/menu")}
          className={`px-8 py-3 rounded-lg text-lg font-semibold shadow-md transition ${
            theme === "dark"
              ? "bg-red-700 hover:bg-red-800 text-white"
              : "bg-red-600 hover:bg-red-700 text-white"
          }`}
        >
          Oyna
        </button>
      </div>
    </div>
  );
};

export default Home;
