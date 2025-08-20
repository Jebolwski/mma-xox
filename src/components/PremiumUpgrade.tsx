import React from "react";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { useAdContext } from "../context/AdContext";

const PremiumUpgrade: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const { setShowAds } = useAdContext();

  const handleUpgrade = () => {
    // Premium özellikleri aktifleştir
    setShowAds(false);
    localStorage.setItem("premium", "true");
    localStorage.setItem("showAds", "false");

    // Burada gerçek ödeme sistemi entegrasyonu yapılabilir
    alert("Premium üyelik aktifleştirildi! Reklamlar kapatıldı.");
  };

  return (
    <div
      className={`p-6 rounded-lg border-2 ${
        theme === "dark"
          ? "bg-gradient-to-br from-yellow-600 to-yellow-800 border-yellow-500 text-white"
          : "bg-gradient-to-br from-yellow-300 to-yellow-500 border-yellow-400 text-black"
      }`}
    >
      <div className="text-center">
        <div className="text-3xl mb-2">👑</div>
        <h3 className="text-xl font-bold mb-2">Premium Üyelik</h3>
        <p className="text-sm mb-4 opacity-90">
          Reklamsız oyun deneyimi için premium üye olun!
        </p>

        <div className="space-y-2 mb-6 text-sm">
          <div className="flex items-center justify-center gap-2">
            <span>✅</span>
            <span>Reklamsız oyun deneyimi</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span>✅</span>
            <span>Özel tema seçenekleri</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span>✅</span>
            <span>Gelişmiş oyun istatistikleri</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span>✅</span>
            <span>Öncelikli destek</span>
          </div>
        </div>

        <div className="text-2xl font-bold mb-4">Sadece $4.99/ay</div>

        <button
          onClick={handleUpgrade}
          className={`w-full py-3 px-6 rounded-lg font-bold text-lg transition-all duration-200 ${
            theme === "dark"
              ? "bg-white text-yellow-800 hover:bg-yellow-100"
              : "bg-yellow-800 text-white hover:bg-yellow-900"
          } shadow-lg hover:shadow-xl transform hover:scale-105`}
        >
          Premium'a Yükselt
        </button>

        <p className="text-xs mt-3 opacity-75">
          * İstediğiniz zaman iptal edebilirsiniz
        </p>
      </div>
    </div>
  );
};

export default PremiumUpgrade;

