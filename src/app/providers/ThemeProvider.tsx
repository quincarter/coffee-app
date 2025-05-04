"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useEffect, type ReactNode } from "react";

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    document
      ?.getElementById("root-html")
      ?.setAttribute("data-theme", "coffee");
  }, []);

  return (
    <NextThemesProvider attribute="data-theme" defaultTheme="coffee" enableSystem={false}>
      {children}
    </NextThemesProvider>
  );
};
