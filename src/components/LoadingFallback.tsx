import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

export default function LoadingFallback() {
  const { theme } = useContext(ThemeContext);

  return (
    <div
      className={`flex items-center justify-center h-screen ${
        theme === "dark"
          ? "bg-gradient-to-br from-stone-900 via-indigo-900 to-stone-800"
          : "bg-gradient-to-br from-stone-200 via-indigo-200 to-stone-300"
      }`}
    >
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className={theme === "dark" ? "text-slate-300" : "text-slate-700"}>
          Loading...
        </p>
      </div>
    </div>
  );
}
