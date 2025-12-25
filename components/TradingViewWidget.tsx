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
    <div className="w-f\">
      {title && <h3 className="text-lg font-medium mb-4">{title}</h3>}
      <div
        className={cn("tradingview-widget-container", className)}
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
