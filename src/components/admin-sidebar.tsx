"use client";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Menu, Moon, Sun, Users } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { SignOutButton } from "@/components/sign-out-button";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const sidebarNav = [{ name: "Users", href: "/admin", icon: Users }] as const;

function Brand() {
  return (
    <div className="flex items-center gap-2">
      <Link
        className="font-semibold text-lg transition-opacity hover:opacity-80"
        href="/"
      >
        Template
      </Link>
      <Separator className="h-5" orientation="vertical" />
      <span className="font-medium text-muted-foreground text-sm">Admin</span>
    </div>
  );
}

function BackToDashboard() {
  return (
    <Link
      className="font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
      href="/"
    >
      Back to Dashboard
    </Link>
  );
}

function SidebarNav({
  onNavigate,
  pathname,
}: {
  onNavigate?: () => void;
  pathname: string;
}) {
  return (
    <nav className="flex flex-col gap-1">
      {sidebarNav.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 font-medium text-sm transition-colors",
              isActive
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            href={item.href}
            key={item.name}
            onClick={onNavigate}
          >
            <item.icon className="h-4 w-4" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex flex-col gap-1">
      <Button
        className="cursor-pointer justify-start gap-3 px-3"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        variant="ghost"
      >
        {mounted ? (
          theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )
        ) : (
          <Sun className="h-4 w-4" />
        )}
        <span className="font-medium text-sm">Theme</span>
      </Button>
      <SignOutButton leading={null} />
    </div>
  );
}

export function AdminSidebar({ pathname }: { pathname: string }) {
  return (
    <>
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col lg:border-r lg:bg-background">
        <div className="flex grow flex-col gap-y-6 overflow-y-auto px-6 pt-6 pb-4">
          <Brand />

          <BackToDashboard />

          <SidebarNav pathname={pathname} />

          <div className="mt-auto">
            <Separator className="mb-4" />
            <SidebarFooter />
          </div>
        </div>
      </aside>

      <div className="sticky top-0 z-40 flex items-center gap-4 border-b bg-background px-4 py-3 lg:hidden">
        <MobileSidebar pathname={pathname} />
        <Brand />
      </div>
    </>
  );
}

function MobileSidebar({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger asChild>
        <Button
          aria-label="Toggle navigation menu"
          className="cursor-pointer"
          size="icon"
          variant="ghost"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetDescription className="sr-only">Admin navigation</SheetDescription>
      <SheetContent
        className="w-72 p-0 max-xs:w-full max-xs:max-w-full [&>button:first-of-type]:hidden"
        side="left"
      >
        <VisuallyHidden>
          <SheetTitle>Admin Navigation</SheetTitle>
        </VisuallyHidden>
        <div className="flex h-full flex-col bg-background">
          <div className="flex items-center gap-2 border-b px-6 py-4">
            <Brand />
            <SheetClose asChild>
              <Button
                className="ml-auto cursor-pointer"
                size="icon-sm"
                variant="ghost"
              >
                <span className="sr-only">Close</span>×
              </Button>
            </SheetClose>
          </div>

          <div className="flex-1 overflow-auto px-4 py-4">
            <div className="mb-4">
              <BackToDashboard />
            </div>
            <SidebarNav onNavigate={() => setOpen(false)} pathname={pathname} />
          </div>

          <div className="border-t px-4 py-4">
            <SidebarFooter />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
