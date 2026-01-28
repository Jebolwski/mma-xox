import { useContext, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ThemeContext } from "../context/ThemeContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { toast } from "react-toastify";
import emailjs from "@emailjs/browser";

const Contact = () => {
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  usePageTitle(t("contact.pageTitle"));

  // Initialize EmailJS
  useEffect(() => {
    emailjs.init("MQpnUGCKRZqRAkUDC"); // Replace with your EmailJS public key
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error(t("contact.form.requiredFields"));
      return;
    }

    setLoading(true);

    try {
      // Send email using EmailJS
      await emailjs.send(
        "service_ccajokk", // Replace with your EmailJS service ID
        "template_u0zkxob", // Replace with your EmailJS template ID
        {
          name: formData.name,
          email: formData.email,
          subject: formData.subject || "Contact Form Submission",
          message: formData.message,
          to_email: "mertgkmeen@gmail.com",
        },
      );

      // Success message
      toast.success(t("contact.form.successMessage"));

      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("EmailJS Error:", error);
      toast.error(t("contact.form.errorMessage"));
    } finally {
      setLoading(false);
    }
  };

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
            {t("contact.heading")}
          </h1>
          <p
            className={`text-base md:text-lg ${
              theme === "dark" ? "text-slate-300" : "text-slate-700"
            }`}
          >
            {t("contact.description")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div
            className={`rounded-lg backdrop-blur-sm border-2 p-6 ${
              theme === "dark"
                ? "bg-slate-800/60 border-slate-600"
                : "bg-white/60 border-slate-300"
            }`}
          >
            <h2
              className={`text-2xl font-bold mb-6 ${
                theme === "dark" ? "text-purple-400" : "text-purple-600"
              }`}
            >
              {t("contact.formTitle")}
            </h2>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* Name */}
              <div>
                <label
                  className={`block text-sm font-bold mb-2 ${
                    theme === "dark" ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  {t("contact.form.nameLabel")}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t("contact.form.namePlaceholder")}
                  className={`w-full px-4 py-2 rounded-lg border-2 transition-all ${
                    theme === "dark"
                      ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500"
                      : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-purple-500"
                  } focus:outline-none`}
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label
                  className={`block text-sm font-bold mb-2 ${
                    theme === "dark" ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  {t("contact.form.emailLabel")}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t("contact.form.emailPlaceholder")}
                  className={`w-full px-4 py-2 rounded-lg border-2 transition-all ${
                    theme === "dark"
                      ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500"
                      : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-purple-500"
                  } focus:outline-none`}
                  required
                />
              </div>

              {/* Subject */}
              <div>
                <label
                  className={`block text-sm font-bold mb-2 ${
                    theme === "dark" ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  {t("contact.form.subjectLabel")}
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder={t("contact.form.subjectPlaceholder")}
                  className={`w-full px-4 py-2 rounded-lg border-2 transition-all ${
                    theme === "dark"
                      ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500"
                      : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-purple-500"
                  } focus:outline-none`}
                />
              </div>

              {/* Message */}
              <div>
                <label
                  className={`block text-sm font-bold mb-2 ${
                    theme === "dark" ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  {t("contact.form.messageLabel")}
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder={t("contact.form.messagePlaceholder")}
                  rows={6}
                  className={`w-full px-4 py-2 rounded-lg border-2 transition-all resize-none ${
                    theme === "dark"
                      ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500"
                      : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-purple-500"
                  } focus:outline-none`}
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full px-6 py-3 rounded-lg font-bold text-lg transition-all duration-200 ${
                  theme === "dark"
                    ? "bg-purple-600 hover:bg-purple-700 text-white border-2 border-purple-400 shadow-lg shadow-purple-600/30"
                    : "bg-blue-500 hover:bg-blue-600 text-white border-2 border-blue-300 shadow-lg shadow-blue-500/30"
                } disabled:opacity-50`}
              >
                {loading
                  ? t("contact.form.sendingButton")
                  : t("contact.form.submitButton")}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Info Box 1 */}
            <div
              className={`rounded-lg backdrop-blur-sm border-2 p-6 ${
                theme === "dark"
                  ? "bg-slate-800/60 border-slate-600"
                  : "bg-white/60 border-slate-300"
              }`}
            >
              <h3
                className={`text-xl font-bold mb-4 ${
                  theme === "dark" ? "text-blue-400" : "text-blue-600"
                }`}
              >
                {t("contact.infoBoxes.email.title")}
              </h3>
              <p
                className={`text-base ${
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                }`}
              >
                <a
                  href="mailto:mertgkmeen@gmail.com"
                  className="text-blue-500 hover:underline"
                >
                  {t("contact.infoBoxes.email.content")}
                </a>
              </p>
            </div>
            {/* Info Box 2 */}
            <div
              className={`rounded-lg backdrop-blur-sm border-2 p-6 ${
                theme === "dark"
                  ? "bg-slate-800/60 border-slate-600"
                  : "bg-white/60 border-slate-300"
              }`}
            >
              <h3
                className={`text-xl font-bold mb-4 ${
                  theme === "dark" ? "text-blue-400" : "text-blue-600"
                }`}
              >
                {t("contact.infoBoxes.followUs.title")}
              </h3>
              <p
                className={`text-base ${
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                }`}
              >
                {t("contact.infoBoxes.followUs.content")}
              </p>
            </div>
            {/* Info Box 3 */}
            <div
              className={`rounded-lg backdrop-blur-sm border-2 p-6 ${
                theme === "dark"
                  ? "bg-slate-800/60 border-slate-600"
                  : "bg-white/60 border-slate-300"
              }`}
            >
              <h3
                className={`text-xl font-bold mb-4 ${
                  theme === "dark" ? "text-blue-400" : "text-blue-600"
                }`}
              >
                {t("contact.infoBoxes.responseTime.title")}
              </h3>
              <p
                className={`text-base ${
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                }`}
              >
                {t("contact.infoBoxes.responseTime.content")}
              </p>
            </div>
            {/* Info Box 4
            <div
              className={`rounded-lg backdrop-blur-sm border-2 p-6 ${
                theme === "dark"
                  ? "bg-slate-800/60 border-slate-600"
                  : "bg-white/60 border-slate-300"
              }`}
            >
              <h3
                className={`text-xl font-bold mb-4 ${
                  theme === "dark" ? "text-blue-400" : "text-blue-600"
                }`}
              >
                ❓ FAQ
              </h3>
              <p
                className={`text-base ${
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Check our{" "}
                <a
                  href="/"
                  className="text-blue-500 hover:underline font-bold"
                >
                  help center
                </a>{" "}
                for common questions.
              </p>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
