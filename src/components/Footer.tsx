import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";

export default function Footer() {
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();
  const location = useLocation();
  const isHome =
    location.pathname === "/" ||
    location.pathname === "/available-rooms" ||
    location.pathname === "/login" ||
    location.pathname === "/contact" ||
    location.pathname === "/about";
  const currentYear = new Date().getFullYear();
  const email = "mertgkmeen@gmail.com";
  const buyMeACoffeeUrl = "https://buymeacoffee.com/jebolwski";

  return (
    <footer
      className={`lg:py-4 py-3 z-10 w-full border-t ${
        isHome
          ? theme === "dark"
            ? "bg-gradient-to-r from-slate-800 to-slate-700 border-slate-700/50 text-slate-200"
            : "bg-gradient-to-r from-green-200 to-emerald-200 border-emerald-200/50 text-slate-600"
          : theme === "dark"
            ? "bg-gradient-to-r from-purple-800 to-indigo-600 border-indigo-700/50 text-slate-200"
            : "bg-gradient-to-r from-purple-200 to-indigo-200 border-indigo-200/50 text-slate-600"
      }`}
    >
      <div className="max-w-7xl mx-auto lg:px-4 px-3">
        <div className="flex flex-wrap flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-4">
            {/* Email */}
            <a
              href={`mailto:${email}`}
              className={`hover:underline transition-colors ${
                theme === "dark"
                  ? "hover:text-slate-300"
                  : "hover:text-slate-700"
              }`}
              title={t("footer.sendEmail")}
            >
              📧 {t("footer.contactMe")}
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
              title={t("footer.supportMe")}
            >
              ☕ {t("footer.buyMeACoffee")}
            </a>
          </div>

          <div
            className={`text-sm ${
              theme === "dark" ? "text-slate-200" : "text-slate-600"
            }`}
          >
            <Link
              to="/about"
              className="mx-2"
            >
              ℹ️ About
            </Link>
          </div>

          <div
            className={`text-sm ${
              theme === "dark" ? "text-slate-200" : "text-slate-600"
            }`}
          >
            <Link
              to="/contact"
              className="mx-2"
            >
              📧 Contact
            </Link>
          </div>

          <div
            className={`text-sm ${
              theme === "dark" ? "text-slate-200" : "text-slate-600"
            }`}
          >
            <Link
              to="/terms-of-service"
              className="mx-2"
            >
              📜 {t("terms.title")}
            </Link>
          </div>
          <div
            className={`text-center text-xs ${
              theme === "dark" ? "text-slate-200" : "text-slate-600"
            }`}
          >
            <p>{t("footer.madeWith")}</p>
          </div>
          <div
            className={`text-sm ${
              theme === "dark" ? "text-slate-200" : "text-slate-600"
            }`}
          >
            <Link
              to="/privacy-policy"
              className="mx-2"
            >
              🔒 {t("privacy.title")}
            </Link>
          </div>
          <div className="text-center sm:text-left">
            <p>{t("footer.copyright", { year: currentYear })}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
