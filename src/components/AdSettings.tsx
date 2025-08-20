import React from "react";
import { useAdContext } from "../context/AdContext";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

const AdSettings: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const { showAds, setShowAds, adFrequency, setAdFrequency } = useAdContext();

  return (
    <div
      className={`p-4 rounded-lg border ${
        theme === "dark"
          ? "bg-stone-700 border-stone-600 text-stone-200"
          : "bg-stone-300 border-stone-400 text-stone-800"
      }`}
    >
      <h3 className="text-lg font-semibold mb-4">Reklam Ayarları</h3>

      <div className="space-y-4">
        {/* Reklamları Göster/Gizle */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Reklamları Göster</label>
          <button
            onClick={() => setShowAds(!showAds)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              showAds ? "bg-green-500" : "bg-stone-400"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                showAds ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Reklam Sıklığı */}
        <div>
          <label className="text-sm font-medium block mb-2">
            Reklam Sıklığı: Her {adFrequency} oyunda bir
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={adFrequency}
            onChange={(e) => setAdFrequency(parseInt(e.target.value))}
            className="w-full h-2 bg-stone-400 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-stone-500 mt-1">
            <span>Az</span>
            <span>Çok</span>
          </div>
        </div>

        {/* Bilgi */}
        <div
          className={`text-xs p-3 rounded ${
            theme === "dark"
              ? "bg-stone-600 text-stone-300"
              : "bg-stone-200 text-stone-600"
          }`}
        >
          <p>💡 Reklamlar oyun deneyimini desteklemek için gösterilir.</p>
          <p>🎮 Reklamları kapatarak premium deneyim yaşayabilirsiniz.</p>
        </div>
      </div>
    </div>
  );
};

export default AdSettings;

