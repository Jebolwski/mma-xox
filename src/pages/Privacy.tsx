import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";
import { usePageTitle } from "../hooks/usePageTitle";
import { Helmet } from "react-helmet-async";

const Privacy = () => {
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();
  usePageTitle(`${t("privacy.title")} - MMA XOX`);

  return (
    <>
      <Helmet>
        <title>{t("privacy.title")} - MMA XOX</title>
        <meta
          name="description"
          content="Privacy Policy for MMA XOX - Learn how we collect, use, and protect your personal data."
        />
        <meta
          name="robots"
          content="index, follow"
        />
      </Helmet>
      <div
        className={`min-h-screen py-12 pt-28 px-6 transition-all duration-1000 ${
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
            <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {t("privacy.title")}
            </h1>

            <div className="space-y-8">
              {/* Section 1 */}
              <section>
                <h2 className="text-2xl font-bold mb-4 text-blue-500">
                  {t("privacy.section1Title")}
                </h2>
                <p
                  className={`text-lg leading-8 ${
                    theme === "dark" ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  {t("privacy.section1Text")}
                </p>
              </section>

              {/* Section 2 */}
              <section>
                <h2 className="text-2xl font-bold mb-4 text-purple-500">
                  {t("privacy.section2Title")}
                </h2>
                <p
                  className={`text-lg leading-8 ${
                    theme === "dark" ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  {t("privacy.section2Text")}
                </p>
              </section>

              {/* Section 3 */}
              <section>
                <h2 className="text-2xl font-bold mb-4 text-orange-600">
                  {t("privacy.section3Title")}
                </h2>
                <p
                  className={`text-lg leading-8 ${
                    theme === "dark" ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  {t("privacy.section3Text")}
                </p>
              </section>

              {/* Section 4 */}
              <section>
                <h2 className="text-2xl font-bold mb-4 text-cyan-500">
                  {t("privacy.section4Title")}
                </h2>
                <p
                  className={`text-lg leading-8 ${
                    theme === "dark" ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  {t("privacy.section4Text")}
                </p>
              </section>

              {/* Section 5 */}
              <section>
                <h2
                  className={`text-2xl font-bold mb-4 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  {t("privacy.section5Title")}
                </h2>
                <p
                  className={`text-lg leading-8 ${
                    theme === "dark" ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  {t("privacy.section5Text")}
                </p>
              </section>

              {/* Section 6 */}
              <section>
                <h2 className="text-2xl font-bold mb-4 text-blue-500">
                  {t("privacy.section6Title")}
                </h2>
                <p
                  className={`text-lg leading-8 ${
                    theme === "dark" ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  {t("privacy.section6Text")}
                </p>
              </section>

              {/* Section 7 */}
              <section>
                <h2 className="text-2xl font-bold mb-4 text-purple-500">
                  {t("privacy.section7Title")}
                </h2>
                <p
                  className={`text-lg leading-8 ${
                    theme === "dark" ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  {t("privacy.section7TextPrefix")}
                  <a
                    href="mailto:mertgkmeen@gmail.com"
                    className="text-purple-500 hover:text-purple-600 hover:underline font-semibold transition-colors"
                  >
                    {t("privacy.section7Email")}
                  </a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Privacy;
