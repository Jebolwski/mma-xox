import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const navigate = useNavigate();
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div
      className={`min-h-screen relative overflow-hidden transition-all duration-1000 ${
        theme === "dark"
          ? "bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900"
          : "bg-gradient-to-b from-blue-400 via-blue-300 to-green-400"
      }`}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Mountains */}
        <div
          className={`absolute bottom-0 left-0 w-full h-64 ${
            theme === "dark" ? "bg-slate-700" : "bg-green-600"
          } clip-path-mountain opacity-80`}
          style={{
            clipPath:
              "polygon(0% 100%, 15% 60%, 25% 80%, 35% 40%, 50% 70%, 65% 30%, 80% 60%, 100% 50%, 100% 100%)",
          }}
        />

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 ${
              theme === "dark" ? "bg-yellow-300" : "bg-white"
            } rounded-full animate-pulse`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 60}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Theme Toggle */}
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

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Game Logo */}
        <div className="mb-8 text-center animate-bounce-slow">
          <div
            className={`relative inline-block p-6 rounded-2xl shadow-2xl backdrop-blur-md border-4 ${
              theme === "dark"
                ? "bg-slate-800/90 border-red-500 shadow-red-500/20"
                : "bg-white/90 border-red-600 shadow-red-600/20"
            }`}
          >
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full animate-pulse" />
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-orange-400 rounded-full animate-pulse delay-500" />
            <div className="flex justify-center">
              <img
                src="https://cdn-icons-png.freepik.com/512/921/921676.png"
                alt="logo"
                className="lg:w-20 lg:h-20 w-16 h-16 mb-1"
              />
            </div>
            <h1
              className={`text-6xl md:text-8xl font-black tracking-wider ${
                theme === "dark" ? "text-red-400" : "text-red-600"
              } drop-shadow-lg`}
              style={{
                textShadow:
                  theme === "dark"
                    ? "4px 4px 0px #7f1d1d, 8px 8px 0px #450a0a"
                    : "4px 4px 0px #dc2626, 8px 8px 0px #991b1b",
              }}
            >
              MMA
            </h1>
            <h2
              className={`text-4xl md:text-6xl font-black tracking-widest ${
                theme === "dark" ? "text-yellow-400" : "text-yellow-600"
              } drop-shadow-lg`}
              style={{
                textShadow:
                  theme === "dark"
                    ? "3px 3px 0px #a16207, 6px 6px 0px #713f12"
                    : "3px 3px 0px #d97706, 6px 6px 0px #92400e",
              }}
            >
              XOX
            </h2>
          </div>
        </div>

        <div
          className={`max-w-2xl mx-auto mb-10 p-6 rounded-xl backdrop-blur-md border-2 ${
            theme === "dark"
              ? "bg-slate-800/80 border-slate-600 text-slate-200"
              : "bg-white/80 border-slate-300 text-slate-700"
          } shadow-xl`}
        >
          <p className="text-lg md:text-xl text-center leading-relaxed">
            <span className="font-bold text-red-500">MMA XOX</span> combines the
            classic Tic Tac Toe game with fighters and an arena!
          </p>
          <p className="text-base md:text-lg text-center mt-4 opacity-90">
            Play with your friends or on a single screen, create rooms and
            invite your rivals.
          </p>
          <p
            className={`text-lg md:text-xl text-center mt-4 font-bold ${
              theme === "dark" ? "text-yellow-400" : "text-red-600"
            }`}
          >
            Choose your fighter, plan your strategy, and win in the arena! 🥊
          </p>
        </div>

        {/* Menu Buttons */}
        <div className="flex flex-col justify-center gap-4 max-w-md">
          <div
            onClick={() => {
              navigate("/menu");
            }}
            className={`w-fit px-10 py-3 text-2xl font-bold cursor-pointer rounded-xl border-4 transition-all duration-300 hover:scale-105 active:scale-95 ${
              theme === "dark"
                ? "bg-red-600 hover:bg-red-700 border-red-400 text-white shadow-lg shadow-red-600/30"
                : "bg-red-500 hover:bg-red-600 border-red-300 text-white shadow-lg shadow-red-500/30"
            }`}
            style={{
              textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
            }}
          >
            🎮 PLAY
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
