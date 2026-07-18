"use client";

import { createContext, useCallback, useContext, useMemo, useState, useEffect, type ReactNode } from "react";

type CanvasContextValue = {
  canvasEnabled: boolean;
  toggleCanvas: () => void;
  enableCanvas: () => void;
  disableCanvas: () => void;
};

const CanvasContext = createContext<CanvasContextValue>({
  canvasEnabled: false,
  toggleCanvas: () => {},
  enableCanvas: () => {},
  disableCanvas: () => {},
});

export function CanvasProvider({ children }: { children: ReactNode }) {
  const [canvasEnabled, setCanvasEnabled] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("qyvera-canvas-enabled");
      if (stored === "true") {
        setCanvasEnabled(true);
      }
    } catch (e) {}
  }, []);

  const toggleCanvas = useCallback(() => setCanvasEnabled((v) => {
    const next = !v;
    try {
      localStorage.setItem("qyvera-canvas-enabled", String(next));
    } catch (e) {}
    return next;
  }), []);
  
  const enableCanvas = useCallback(() => {
    setCanvasEnabled(true);
    try {
      localStorage.setItem("qyvera-canvas-enabled", "true");
    } catch (e) {}
  }, []);
  
  const disableCanvas = useCallback(() => {
    setCanvasEnabled(false);
    try {
      localStorage.setItem("qyvera-canvas-enabled", "false");
    } catch (e) {}
  }, []);

  const value = useMemo(
    () => ({ canvasEnabled, toggleCanvas, enableCanvas, disableCanvas }),
    [canvasEnabled, toggleCanvas, enableCanvas, disableCanvas]
  );

  return (
    <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>
  );
}

export function useCanvas() {
  return useContext(CanvasContext);
}
