"use client"

import type React from "react"
import { createContext, useContext, useEffect } from "react"
import { useThemeStore } from "../stores/theme-store"

type Theme = "light" | "dark" | "fancy"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  themes: Theme[]
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, themes, setTheme } = useThemeStore()

  useEffect(() => {
    // Apply initial theme on mount
    document.documentElement.setAttribute("data-theme", theme)
  }, [theme])

  return <ThemeContext.Provider value={{ theme, setTheme, themes }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
