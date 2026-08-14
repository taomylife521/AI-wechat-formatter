"use client";

import { useEffect, useRef } from "react";

const ADSTERRA_NATIVE_BANNER_SRC =
  "https://pl30840454.effectivecpmnetwork.com/482b22a34eaa21a66b5a023feb86c780/invoke.js";
const ADSTERRA_NATIVE_BANNER_CONTAINER_ID =
  "container-482b22a34eaa21a66b5a023feb86c780";

/**
 * Adsterra Native Banner（4:1）。
 * 仅生产环境渲染；通过 useEffect 手动注入脚本，
 * 兼容 App Router 软导航与 React StrictMode 重复执行。
 */
export function AdsterraNativeBanner() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || container.querySelector("script")) {
      return;
    }
    const script = document.createElement("script");
    script.src = ADSTERRA_NATIVE_BANNER_SRC;
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    container.appendChild(script);
  }, []);

  if (process.env.NODE_ENV !== "production") {
    return null;
  }

  return (
    <div
      ref={containerRef}
      id={ADSTERRA_NATIVE_BANNER_CONTAINER_ID}
      className="min-h-[120px]"
    />
  );
}
