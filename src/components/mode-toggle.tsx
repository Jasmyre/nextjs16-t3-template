"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ModeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Ensure theme is mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && theme === "dark";

  return (
    <Button
      aria-label="Toggle theme"
      className="text-muted-foreground hover:text-foreground"
      onClick={toggleTheme}
      size="icon"
      variant="ghost"
    >
      <span className="relative grid size-4 place-items-center">
        <Sun
          className={cn(
            "absolute size-4 transition-[transform,opacity] duration-200 ease-ui",
            isDark
              ? "rotate-90 scale-50 opacity-0"
              : "rotate-0 scale-100 opacity-100"
          )}
        />
        <Moon
          className={cn(
            "absolute size-4 transition-[transform,opacity] duration-200 ease-ui",
            isDark
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-50 opacity-0"
          )}
        />
      </span>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
