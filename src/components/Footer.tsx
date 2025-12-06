import { useContext } from "react";
import { useLocation } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";

export default function Footer() {
  const { theme } = useContext(ThemeContext);
  const location = useLocation();
  const isHome = location.pathname === "/";
  const currentYear = new Date().getFullYear();
  const email = "mertgkmeen@gmail.com";
  const buyMeACoffeeUrl = "https://buymeacoffee.com/jebolwski";

  return (
    <footer
      className={`lg:py-4 py-3 z-10 w-full border-t ${
        isHome
          ? theme === "dark"
            ? "bg-gradient-to-r from-green-800 to-emerald-600 border-emerald-700/50 text-slate-200"
            : "bg-gradient-to-r from-green-200 to-emerald-200 border-emerald-200/50 text-slate-600"
          : theme === "dark"
          ? "bg-gradient-to-r from-purple-800 to-indigo-600 border-indigo-700/50 text-slate-200"
          : "bg-gradient-to-r from-purple-200 to-indigo-200 border-indigo-200/50 text-slate-600"
      }`}
    >
      <div className="max-w-7xl mx-auto lg:px-4 px-3">
        <div className="flex flex-wrap flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          {/* Links */}
          <div className="flex items-center gap-4">
            {/* Email */}
            <a
              href={`mailto:${email}`}
              className={`hover:underline transition-colors ${
                theme === "dark"
                  ? "hover:text-slate-300"
                  : "hover:text-slate-700"
              }`}
              title="Send email"
            >
              📧 Contact Me
            </a>

            {/* Buy Me A Coffee */}
            <a
              href={buyMeACoffeeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`px-3 py-1 rounded-lg transition-all ${
                theme === "dark"
                  ? "bg-yellow-900/30 hover:bg-yellow-800/40 text-yellow-400"
                  : "bg-yellow-100/50 hover:bg-yellow-200/50 text-yellow-700"
              }`}
              title="Support me"
            >
              ☕ Buy Me A Coffee
            </a>
          </div>

          {/* Bottom Text */}
          <div
            className={`text-center text-xs ${
              theme === "dark" ? "text-slate-200" : "text-slate-600"
            }`}
          >
            <p>Made with ❤️ for MMA fans</p>
          </div>

          {/* Copyright */}
          <div className="text-center sm:text-left">
            <p>© {currentYear} MMA XOX. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
