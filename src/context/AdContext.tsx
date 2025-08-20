import React, { createContext, useContext, useState, useEffect } from "react";

interface AdContextType {
  showAds: boolean;
  adFrequency: number;
  lastAdTime: number;
  shouldShowAd: () => boolean;
  setShowAds: (show: boolean) => void;
  setAdFrequency: (frequency: number) => void;
  recordAdView: () => void;
}

const AdContext = createContext<AdContextType | undefined>(undefined);

export const useAdContext = () => {
  const context = useContext(AdContext);
  if (!context) {
    throw new Error("useAdContext must be used within an AdProvider");
  }
  return context;
};

interface AdProviderProps {
  children: React.ReactNode;
}

export const AdProvider: React.FC<AdProviderProps> = ({ children }) => {
  const [showAds, setShowAds] = useState(true);
  const [adFrequency, setAdFrequency] = useState(3); // Her 3 oyunda bir reklam
  const [lastAdTime, setLastAdTime] = useState(0);

  // Local storage'dan ayarları yükle
  useEffect(() => {
    const savedShowAds = localStorage.getItem("showAds");
    const savedAdFrequency = localStorage.getItem("adFrequency");

    if (savedShowAds !== null) {
      setShowAds(JSON.parse(savedShowAds));
    }
    if (savedAdFrequency !== null) {
      setAdFrequency(JSON.parse(savedAdFrequency));
    }
  }, []);

  // Ayarları local storage'a kaydet
  const updateShowAds = (show: boolean) => {
    setShowAds(show);
    localStorage.setItem("showAds", JSON.stringify(show));
  };

  const updateAdFrequency = (frequency: number) => {
    setAdFrequency(frequency);
    localStorage.setItem("adFrequency", JSON.stringify(frequency));
  };

  const shouldShowAd = (): boolean => {
    if (!showAds) return false;

    const now = Date.now();
    const timeSinceLastAd = now - lastAdTime;
    const minInterval = 60000; // En az 1 dakika

    return timeSinceLastAd >= minInterval;
  };

  const recordAdView = () => {
    setLastAdTime(Date.now());
  };

  const value: AdContextType = {
    showAds,
    adFrequency,
    lastAdTime,
    shouldShowAd,
    setShowAds: updateShowAds,
    setAdFrequency: updateAdFrequency,
    recordAdView,
  };

  return <AdContext.Provider value={value}>{children}</AdContext.Provider>;
};

