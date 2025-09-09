"use client"

import { Moon, Sun, Palette } from "lucide-react"
import { useTheme } from "next-themes"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ThemeToggleProps {
  isCollapsed?: boolean
}

export function ThemeToggle({ isCollapsed }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    console.log('Current theme:', theme)
    
    if (theme === "light") {
      setTheme("dark")
      console.log('Switching to dark')
    } else if (theme === "dark") {
      setTheme("system")
      console.log('Switching to system')
    } else if (theme === "system") {
      setTheme("modern")
      console.log('Switching to modern')
    } else if (theme === "modern") {
      setTheme("light")
      console.log('Switching to light')
    } else {
      setTheme("light")
      console.log('Defaulting to light')
    }
  }

  const getThemeIcon = () => {
    if (!mounted) return <Sun className="h-4 w-4" />
    
    switch (theme) {
      case "light":
        return <Sun className="h-4 w-4" />
      case "dark":
        return <Moon className="h-4 w-4" />
      case "system":
        return <Sun className="h-4 w-4" />
      case "modern":
        return <Palette className="h-4 w-4" />
      default:
        return <Sun className="h-4 w-4" />
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className={cn(
        "w-full justify-start",
        isCollapsed && "lg:justify-center lg:px-2"
      )}
    >
      {getThemeIcon()}
      <span className={cn("sr-only", isCollapsed && "lg:hidden")}>Toggle theme</span>
    </Button>
  )
} 