"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Laptop } from "lucide-react";

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-9 h-9 rounded-full bg-muted/50 animate-pulse" />;
    }

    return (
        <div className="flex items-center bg-muted/50 border border-border rounded-full p-1 gap-1">
            <button
                onClick={() => setTheme("light")}
                className={`p-1.5 rounded-full transition-all ${
                    theme === "light" 
                        ? "bg-white shadow-sm text-primary" 
                        : "text-muted-foreground hover:text-foreground"
                }`}
                title="Light Mode"
            >
                <Sun size={14} />
            </button>
            <button
                onClick={() => setTheme("system")}
                className={`p-1.5 rounded-full transition-all ${
                    theme === "system" 
                        ? "bg-white dark:bg-zinc-800 shadow-sm text-primary dark:text-primary" 
                        : "text-muted-foreground hover:text-foreground"
                }`}
                title="System Preference"
            >
                <Laptop size={14} />
            </button>
            <button
                onClick={() => setTheme("dark")}
                className={`p-1.5 rounded-full transition-all ${
                    theme === "dark" 
                        ? "bg-zinc-800 shadow-sm text-primary" 
                        : "text-muted-foreground hover:text-foreground"
                }`}
                title="Dark Mode"
            >
                <Moon size={14} />
            </button>
        </div>
    );
}
