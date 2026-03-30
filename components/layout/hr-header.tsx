"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserNav } from "@/components/auth/user-nav";
import { ModeToggle } from "@/components/theme/mode-toggle";
import { useAuth } from "@/lib/auth-store";

interface HRHeaderProps {
  title?: string;
}

export function HRHeader({ title = "HR Management" }: HRHeaderProps) {
  const { user } = useAuth();

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-6 sticky top-0 z-40 glass transition-all duration-300">
      <SidebarTrigger className="-ml-1 transition-transform hover:scale-105" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <div className="flex items-center gap-2 flex-1">
        <span className="font-medium">{title}</span>
      </div>

      <div className="flex items-center gap-4">
        <ModeToggle className="border-none bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800" />
        {user && <UserNav />}
      </div>
    </header>
  );
}
