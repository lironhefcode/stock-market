"use client";
import { useTradingViewWidget } from "@/hooks/useTradingViewWidget";
import { cn } from "@/lib/utils";
import React, { memo } from "react";
interface TradingViewWidgetProps {
  title?: string;
  scriptUrl: string;
  config: Record<string, unknown>;
  height?: number;
  className?: string;
}
function TradingViewWidget({
  title,
  scriptUrl,
  config,
  height,
  className,
}: TradingViewWidgetProps) {
  const containerRef = useTradingViewWidget(scriptUrl, config, height);

  return (
    <div className="w-full h-full">
      {title && (
        <div className="mb-4 flex items-center gap-3">
          <h3 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-[0.15em]">
            {title}
          </h3>
          <div className="flex-1 h-px bg-gray-700" />
        </div>
      )}
      <div
        className={cn("tradingview-widget-container rounded overflow-hidden", className)}
        ref={containerRef}
        style={{ height: "100%", width: "100%" }}
      >
        <div
          className="tradingview-widget-container__widget"
          style={{ height, width: "100%" }}
        ></div>
      </div>
    </div>
  );
}

export default memo(TradingViewWidget);
