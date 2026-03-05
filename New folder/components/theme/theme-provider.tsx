"use client";

import { ThemeProvider } from "next-themes";

export function ThemeProviderClient({
  children,
  ...props
}: React.ComponentProps<typeof ThemeProvider>) {
  return <ThemeProvider {...props}>{children}</ThemeProvider>;
}
