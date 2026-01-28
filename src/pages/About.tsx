import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { ThemeContext } from "../context/ThemeContext";
import { usePageTitle } from "../hooks/usePageTitle";

const About = () => {
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();

  usePageTitle(t("about.pageTitle"));

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
            {t("about.heading")}
          </h1>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Mission Section */}
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
              {t("about.mission.title")}
            </h2>
            <p
              className={`text-base leading-relaxed ${
                theme === "dark" ? "text-slate-300" : "text-slate-700"
              }`}
            >
              {t("about.mission.text")}
            </p>
          </div>

          {/* Offer Section */}
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
              {t("about.offer.title")}
            </h2>
            <ul
              className={`text-base leading-relaxed space-y-3 ${
                theme === "dark" ? "text-slate-300" : "text-slate-700"
              }`}
            >
              {(t("about.offer.items", { returnObjects: true }) as any[]).map(
                (item: any, index: number) => (
                  <li key={index}>
                    <strong>{item.label}</strong> {item.text}
                  </li>
                ),
              )}
            </ul>
          </div>

          {/* Values Section */}
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
              {t("about.values.title")}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(
                t("about.values.items", { returnObjects: true }),
              ).map(([key, value]: any) => (
                <div key={key}>
                  <h3
                    className={`font-bold mb-2 ${
                      theme === "dark" ? "text-blue-400" : "text-blue-600"
                    }`}
                  >
                    {value.title}
                  </h3>
                  <p
                    className={`text-sm ${
                      theme === "dark" ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    {value.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Get Started Section */}
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
              {t("about.getStarted.title")}
            </h2>
            <p
              className={`text-base leading-relaxed mb-4 ${
                theme === "dark" ? "text-slate-300" : "text-slate-700"
              }`}
            >
              {t("about.getStarted.text")}
            </p>
            <p
              className={`text-sm ${
                theme === "dark" ? "text-slate-400" : "text-slate-600"
              }`}
            >
              {t("about.getStarted.contactText")}{" "}
              <a
                href="/contact"
                className="text-blue-500 hover:underline font-bold"
              >
                {t("about.getStarted.contactLink")}
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
