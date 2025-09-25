"use client"

import * as React from "react";
import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "@phosphor-icons/react";

import { Switch } from "@/components/ui/switch";

export default function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme()
  const [checked, setChecked] = React.useState<boolean>(systemTheme !== 'dark');

  const handleCheckedChange = () => {
    if (theme === 'light') {
      setTheme('dark') 
    } else {
      setTheme('light');
    }
    setChecked(!checked);
  }

  return (
    <div>

      <div className="relative inline-grid h-8 grid-cols-[1fr_1fr] items-center text-sm font-medium">
        <Switch
          checked={checked}
          onCheckedChange={handleCheckedChange}
          className="peer data-[state=unchecked]:bg-input/50 absolute inset-0 h-[inherit] w-auto [&_span]:z-10 [&_span]:h-full [&_span]:w-1/2 [&_span]:transition-transform [&_span]:duration-300 [&_span]:ease-[cubic-bezier(0.16,1,0.3,1)] [&_span]:data-[state=checked]:translate-x-full [&_span]:data-[state=checked]:rtl:-translate-x-full"
        />
        <span className="pointer-events-none relative ms-0.5 flex min-w-8 items-center justify-center text-center transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] peer-data-[state=checked]:invisible peer-data-[state=unchecked]:translate-x-full peer-data-[state=unchecked]:rtl:-translate-x-full">
          <MoonIcon size={16} aria-hidden="true" />
        </span>
        <span className="peer-data-[state=checked]:text-background pointer-events-none relative me-0.5 flex min-w-8 items-center justify-center text-center transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] peer-data-[state=checked]:-translate-x-full peer-data-[state=unchecked]:invisible peer-data-[state=checked]:rtl:translate-x-full">
          <SunIcon size={16} aria-hidden="true" />
        </span>
      </div>
    </div>
  )
}


{/* <DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline" size="icon">
      <SunIcon className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem onClick={() => setTheme("light")}>
      Light
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => setTheme("dark")}>
      Dark
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => setTheme("system")}>
      System
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu> */}