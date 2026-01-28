import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { ThemeContext } from "../context/ThemeContext";
import { usePageTitle } from "../hooks/usePageTitle";

const About = () => {
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();

  usePageTitle("About Us - MMA XOX");

  return (
    <div
      className={`min-h-[calc(100vh-61px)] transition-all duration-1000 ${
        theme === "dark"
          ? "bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900"
          : "bg-gradient-to-b from-blue-400 via-blue-300 to-green-400"
      }`}
    >
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12 pt-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1
            className={`text-4xl md:text-5xl font-black mb-4 ${
              theme === "dark" ? "text-red-400" : "text-red-600"
            }`}
            style={{
              textShadow:
                theme === "dark"
                  ? "2px 2px 0px #7f1d1d, 4px 4px 0px #450a0a"
                  : "2px 2px 0px #dc2626, 4px 4px 0px #991b1b",
            }}
          >
            About MMA XOX
          </h1>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Section 1 */}
          <div
            className={`rounded-lg backdrop-blur-sm border-2 p-6 ${
              theme === "dark"
                ? "bg-slate-800/60 border-slate-600"
                : "bg-white/60 border-slate-300"
            }`}
          >
            <h2
              className={`text-2xl font-bold mb-4 ${
                theme === "dark" ? "text-purple-400" : "text-purple-600"
              }`}
            >
              🎮 Our Mission
            </h2>
            <p
              className={`text-base leading-relaxed ${
                theme === "dark" ? "text-slate-300" : "text-slate-700"
              }`}
            >
              MMA XOX is an innovative online gaming platform that brings
              together two passions: the strategic depth of classic tic-tac-toe
              and the excitement of Mixed Martial Arts. Our mission is to create
              an engaging, free-to-play arena where players worldwide can
              compete, strategize, and have fun.
            </p>
          </div>

          {/* Section 2 */}
          <div
            className={`rounded-lg backdrop-blur-sm border-2 p-6 ${
              theme === "dark"
                ? "bg-slate-800/60 border-slate-600"
                : "bg-white/60 border-slate-300"
            }`}
          >
            <h2
              className={`text-2xl font-bold mb-4 ${
                theme === "dark" ? "text-purple-400" : "text-purple-600"
              }`}
            >
              🥊 What We Offer
            </h2>
            <ul
              className={`text-base leading-relaxed space-y-3 ${
                theme === "dark" ? "text-slate-300" : "text-slate-700"
              }`}
            >
              <li>
                <strong>Free Online Gaming:</strong> Play anytime, anywhere
                without downloading or paying.
              </li>
              <li>
                <strong>Multiplayer Experience:</strong> Challenge friends or
                compete with global players in real-time matches.
              </li>
              <li>
                <strong>Ranked Competitions:</strong> Climb the leaderboard and
                showcase your skills with our rating system.
              </li>
              <li>
                <strong>Diverse Fighters:</strong> Choose from an extensive
                roster of real MMA fighters to represent in the arena.
              </li>
              <li>
                <strong>Cross-Platform Play:</strong> Play on desktop, tablet,
                or mobile devices seamlessly.
              </li>
              <li>
                <strong>Multi-Language Support:</strong> Available in 14
                languages to reach players worldwide.
              </li>
            </ul>
          </div>

          {/* Section 3 */}
          <div
            className={`rounded-lg backdrop-blur-sm border-2 p-6 ${
              theme === "dark"
                ? "bg-slate-800/60 border-slate-600"
                : "bg-white/60 border-slate-300"
            }`}
          >
            <h2
              className={`text-2xl font-bold mb-4 ${
                theme === "dark" ? "text-purple-400" : "text-purple-600"
              }`}
            >
              💪 Our Values
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3
                  className={`font-bold mb-2 ${
                    theme === "dark" ? "text-blue-400" : "text-blue-600"
                  }`}
                >
                  Fair Play
                </h3>
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  We maintain a level playing field where skill and strategy
                  determine success.
                </p>
              </div>
              <div>
                <h3
                  className={`font-bold mb-2 ${
                    theme === "dark" ? "text-blue-400" : "text-blue-600"
                  }`}
                >
                  Community
                </h3>
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  We foster a positive community where players from all
                  backgrounds can connect.
                </p>
              </div>
              <div>
                <h3
                  className={`font-bold mb-2 ${
                    theme === "dark" ? "text-blue-400" : "text-blue-600"
                  }`}
                >
                  Innovation
                </h3>
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  We continuously improve and evolve our game with new features
                  and enhancements.
                </p>
              </div>
              <div>
                <h3
                  className={`font-bold mb-2 ${
                    theme === "dark" ? "text-blue-400" : "text-blue-600"
                  }`}
                >
                  Accessibility
                </h3>
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  Gaming should be free and accessible to everyone, everywhere.
                </p>
              </div>
            </div>
          </div>

          {/* Section 4 */}
          <div
            className={`rounded-lg backdrop-blur-sm border-2 p-6 ${
              theme === "dark"
                ? "bg-slate-800/60 border-slate-600"
                : "bg-white/60 border-slate-300"
            }`}
          >
            <h2
              className={`text-2xl font-bold mb-4 ${
                theme === "dark" ? "text-purple-400" : "text-purple-600"
              }`}
            >
              🌟 Get Started Today
            </h2>
            <p
              className={`text-base leading-relaxed mb-4 ${
                theme === "dark" ? "text-slate-300" : "text-slate-700"
              }`}
            >
              Whether you're a casual player looking for fun or a competitive
              gamer aiming for the top of the leaderboard, MMA XOX has something
              for you. Join thousands of players and experience the ultimate
              tic-tac-toe arena with MMA fighters!
            </p>
            <p
              className={`text-sm ${
                theme === "dark" ? "text-slate-400" : "text-slate-600"
              }`}
            >
              For more information or inquiries, please{" "}
              <a
                href="/contact"
                className="text-blue-500 hover:underline font-bold"
              >
                contact us
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
