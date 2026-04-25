"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

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

  return (
    <Button
      aria-label="Toggle theme"
      className="cursor-pointer opacity-70 transition-all duration-200 hover:opacity-100"
      onClick={toggleTheme}
      size="icon"
      variant="ghost"
    >
      {mounted ? (
        <div>
          {theme === "dark" ? (
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-300" />
          ) : (
            <Moon className="h-4 w-4 rotate-0 scale-100 transition-all duration-300" />
          )}
        </div>
      ) : (
        <div>
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-300" />
        </div>
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
