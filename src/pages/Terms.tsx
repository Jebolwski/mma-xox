import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";
import { usePageTitle } from "../hooks/usePageTitle";

const Terms = () => {
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();
  usePageTitle(`${t("terms.title")} - MMA XOX`);

  return (
    <div
      className={`pt-28 min-h-[calc(100vh-61px)] px-6 transition-all duration-1000 ${
        theme === "dark"
          ? "bg-gradient-to-br from-stone-900 via-indigo-900 to-stone-800"
          : "bg-gradient-to-br from-stone-200 via-indigo-200 to-stone-300"
      }`}
    >
      <div className="max-w-4xl mx-auto">
        <div
          className={`p-8 rounded-2xl shadow-2xl border backdrop-blur-md transition-all duration-300 ${
            theme === "dark"
              ? "bg-slate-800/90 border-slate-600/50 text-slate-100"
              : "bg-white/90 border-slate-200/50 text-slate-800"
          }`}
        >
          <h1
            className={`text-4xl font-bold mb-6 ${
              theme === "dark" ? "text-purple-400" : "text-purple-700"
            }`}
          >
            {t("terms.title")}
          </h1>

          <p
            className={`text-lg leading-8 ${
              theme === "dark" ? "text-slate-300" : "text-slate-700"
            }`}
          >
            {t("terms.intro")}
          </p>

          <section className="mt-6">
            <h2
              className={`text-2xl font-bold mb-2 ${
                theme === "dark" ? "text-cyan-400" : "text-cyan-600"
              }`}
            >
              {t("terms.section1Title")}
            </h2>
            <p
              className={`text-lg leading-8 ${
                theme === "dark" ? "text-slate-300" : "text-slate-700"
              }`}
            >
              {t("terms.section1Text")}
            </p>
          </section>

          <section className="mt-6">
            <h2
              className={`text-2xl font-bold mb-2 ${
                theme === "dark" ? "text-orange-400" : "text-orange-600"
              }`}
            >
              {t("terms.section2Title")}
            </h2>
            <p
              className={`text-lg leading-8 ${
                theme === "dark" ? "text-slate-300" : "text-slate-700"
              }`}
            >
              {t("terms.section2Text")}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
