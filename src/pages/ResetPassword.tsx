import { useState, useContext, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "../firebase";
import { toast, ToastContainer } from "react-toastify";
import { useTranslation } from "react-i18next";

const ResetPassword = () => {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [email, setEmail] = useState("");

  const oobCode = searchParams.get("oobCode");

  useEffect(() => {
    const verifyCode = async () => {
      if (!oobCode) {
        toast.error(t("password.resetInvalidLink"));
        navigate("/login");
        return;
      }

      try {
        const userEmail = await verifyPasswordResetCode(auth, oobCode);
        setEmail(userEmail);
        setVerifying(false);
      } catch (error: any) {
        toast.error(t("password.resetExpired"));
        navigate("/login");
      }
    };

    verifyCode();
  }, [oobCode, navigate]);

  const handleResetPassword = async (e: any) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast.error(t("password.fillAllFields"));
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(t("password.passwordsNoMatch"));
      return;
    }

    if (newPassword.length < 6) {
      toast.error(t("password.passwordMinLength"));
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode!, newPassword);
      toast.success(t("password.resetSuccess"));
      navigate("/login");
    } catch (error: any) {
      if (error.code === "auth/weak-password") {
        toast.error(t("password.passwordTooWeak"));
      } else if (error.code === "auth/expired-action-code") {
        toast.error(t("password.resetExpiredGeneric"));
      } else {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          theme === "dark"
            ? "bg-gradient-to-br from-stone-900 via-indigo-900 to-stone-800"
            : "bg-gradient-to-br from-stone-200 via-indigo-200 to-stone-300"
        }`}
      >
        <ToastContainer
          position="bottom-right"
          theme={theme === "dark" ? "dark" : "light"}
        />
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className={theme === "dark" ? "text-slate-300" : "text-slate-700"}>
            {t("password.verifyingLink")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen relative overflow-hidden transition-all duration-1000 ${
        theme === "dark"
          ? "bg-gradient-to-br from-stone-900 via-indigo-900 to-stone-800"
          : "bg-gradient-to-br from-stone-200 via-indigo-200 to-stone-300"
      }`}
    >
      <ToastContainer
        position="bottom-right"
        theme={theme === "dark" ? "dark" : "light"}
      />

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen p-6">
        <div
          className={`p-8 rounded-2xl shadow-2xl border backdrop-blur-md w-full max-w-md transition-all duration-300 ${
            theme === "dark"
              ? "bg-slate-800/90 border-slate-600/50 text-slate-100"
              : "bg-white/90 border-slate-200/50 text-slate-800"
          }`}
        >
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-3">
              <img
                src="https://cdn-icons-png.freepik.com/512/921/921676.png"
                alt="MMA XOX"
                className="w-12 h-12 drop-shadow-lg"
              />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  MMA XOX
                </h1>
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  {t("password.resetSubtitle")}
                </p>
              </div>
            </div>
          </div>

          <p
            className={`mb-6 text-center text-sm ${
              theme === "dark" ? "text-slate-400" : "text-slate-600"
            }`}
          >
            {t("password.resettingFor")} <strong>{email}</strong>
          </p>

          <form
            onSubmit={handleResetPassword}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium mb-2">
                {t("password.newPassword")}
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 ${
                  theme === "dark"
                    ? "bg-slate-700/80 border-slate-600/50 text-white placeholder-slate-400 focus:ring-purple-500/50"
                    : "bg-white/80 border-slate-300/50 text-slate-800 placeholder-slate-500 focus:ring-indigo-500/50"
                }`}
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {t("password.confirmPassword")}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 ${
                  theme === "dark"
                    ? "bg-slate-700/80 border-slate-600/50 text-white placeholder-slate-400 focus:ring-purple-500/50"
                    : "bg-white/80 border-slate-300/50 text-slate-800 placeholder-slate-500 focus:ring-indigo-500/50"
                }`}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                loading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:scale-105 cursor-pointer hover:shadow-xl"
              } bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg`}
            >
              {loading ? t("password.resetting") : t("password.resetButton")}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/login")}
              className={`text-sm hover:underline transition-colors cursor-pointer duration-200 ${
                theme === "dark"
                  ? "text-purple-400 hover:text-purple-300"
                  : "text-indigo-600 hover:text-indigo-500"
              }`}
            >
              {t("password.backToLogin")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
