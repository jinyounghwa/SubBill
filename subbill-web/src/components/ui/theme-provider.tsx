"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes"

type ThemeProviderProps = {
  children: React.ReactNode
  [key: string]: any
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

export const useTheme = useNextTheme
