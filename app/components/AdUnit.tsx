"use client";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface AdUnitProps {
  slot: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  style?: React.CSSProperties;
  className?: string;
  type?: "sidebar" | "native" | "infeed";
}

export default function AdUnit({ slot, format = "auto", style, className, type = "sidebar" }: AdUnitProps) {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      // Load ad after component mount
      const timer = setTimeout(() => {
        if (window.adsbygoogle) {
          window.adsbygoogle.push({});
        }
      }, 100);
      return () => clearTimeout(timer);
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, []);

  // Different styles based on ad type
  const getAdStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      display: "block",
      width: "100%",
      ...style,
    };

    if (type === "sidebar") {
      return {
        ...baseStyle,
        minHeight: "250px",
        maxHeight: "600px",
        borderRadius: "12px",
        overflow: "hidden",
      };
    }

    if (type === "native") {
      return {
        ...baseStyle,
        minHeight: "120px",
        borderRadius: "12px",
        margin: "8px 0",
      };
    }

    if (type === "infeed") {
      return {
        ...baseStyle,
        minHeight: "100px",
        borderRadius: "12px",
        margin: "12px 0",
      };
    }

    return baseStyle;
  };

  return (
    <div 
      ref={adRef}
      className={`ad-unit ad-${type} ${className || ""}`} 
      style={{ 
        background: "rgba(255,255,255,0.02)",
        borderRadius: "12px",
        border: "1px solid rgba(255,255,255,0.04)",
        padding: "4px",
        transition: "all 0.3s ease",
        cursor: "pointer",
        minHeight: type === "sidebar" ? "250px" : "100px",
        ...style
      }}
    >
      <ins
        className="adsbygoogle"
        style={getAdStyle()}
        data-ad-client="ca-pub-9427071028467343"
        data-ad-slot={slot}
        data-ad-format={format === "vertical" ? "auto" : format}
        data-full-width-responsive="true"
        data-ad-layout-key={type === "native" ? "-gw-3+1f-3d+7s" : undefined}
      />
    </div>
  );
}