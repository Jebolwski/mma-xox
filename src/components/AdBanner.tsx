import { useEffect, useRef } from "react";

interface AdBannerProps {
  adSlot: string;
  style?: React.CSSProperties;
  className?: string;
}

const AdBanner = ({ adSlot, style, className }: AdBannerProps) => {
  const adRef = useRef<HTMLDivElement>(null);
  const adClient = import.meta.env.VITE_AD_CLIENT;

  useEffect(() => {
    if (window) {
      try {
        // Google Ads scripti yüklenmişse reklamı tekrar yükle
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const win = window as any;
        win.adsbygoogle = win.adsbygoogle || [];
        win.adsbygoogle.push({});
      } catch {
        // ignore
      }
    }
  }, []);

  return (
    <div
      ref={adRef}
      className={className}
    >
      <ins
        className="adsbygoogle"
        style={style || { display: "block" }}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
};

export default AdBanner;
