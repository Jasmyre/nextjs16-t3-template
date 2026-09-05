"use client";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Home, Menu, Moon, Search, Sun, User, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Fragment, type ReactNode, useEffect, useState } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { SignOutButton } from "@/components/sign-out-button";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useScrollDirection } from "@/hooks/use-scroll-direction";
import { cn } from "@/lib/utils";

export interface NavItem {
  children?: NavItem[];
  href?: string;
  icon?: ReactNode;
  name: string;
}

interface AdaptiveNavProps {
  enableBlock?: boolean;
  navItems: NavItem[];
  title?: string;
}

function isPathActive(href: string | undefined, pathname: string): boolean {
  if (!href) {
    return false;
  }
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function generateBreadcrumbs(pathname: string): Array<{
  href?: string;
  icon?: ReactNode;
  name: string;
}> {
  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbs: Array<{ href?: string; icon?: ReactNode; name: string }> =
    [{ href: "/", icon: <Home className="size-3" />, name: "Home" }];

  let currentPath = "";
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === pathSegments.length - 1;
    const name =
      segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
    breadcrumbs.push({ href: isLast ? undefined : currentPath, name });
  });

  return breadcrumbs;
}

export function NavigationBar({
  navItems,
  title = "Logo",
  enableBlock = true,
}: AdaptiveNavProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const isVisible = useScrollDirection();
  const pathname = usePathname();
  const router = useRouter();

  // Ensure theme is mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard shortcut for search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const isDark = mounted && theme === "dark";

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleSelect = (item: NavItem) => {
    if (item.href) {
      router.push(item.href);
    }
    setIsSearchOpen(false);
  };

  const breadcrumbs = generateBreadcrumbs(pathname);

  const chromeClass = cn(
    "fixed inset-x-0 top-0 z-50 transition-transform duration-300 ease-ui motion-reduce:transition-none",
    isVisible ? "translate-y-0" : "-translate-y-full"
  );

  const navLinkClass = (active: boolean) =>
    cn(
      "flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium text-sm transition-colors duration-150 ease-ui",
      active
        ? "bg-muted text-foreground"
        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
    );

  const crumbLinkClass =
    "inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors duration-150 ease-ui hover:text-foreground";

  return (
    <>
      {/* Search Command Dialog */}
      <CommandDialog
        className="sm:max-w-lg"
        onOpenChange={setIsSearchOpen}
        open={isSearchOpen}
      >
        <Command className="rounded-xl!">
          <CommandInput placeholder="Type a command or search..." />
          <CommandList className="max-h-80">
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Navigation">
              {navItems.map((item) => (
                <CommandItem
                  className="cursor-pointer"
                  key={item.name}
                  onSelect={() => handleSelect(item)}
                >
                  {item.icon ? (
                    <span className="text-muted-foreground">{item.icon}</span>
                  ) : null}
                  <span>{item.name}</span>
                  {item.href ? <CommandShortcut>Go</CommandShortcut> : null}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Appearance">
              <CommandItem className="cursor-pointer" onSelect={toggleTheme}>
                {isDark ? (
                  <Sun className="size-4" />
                ) : (
                  <Moon className="size-4" />
                )}
                <span>
                  {isDark ? "Switch to light mode" : "Switch to dark mode"}
                </span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>

      {/* Desktop chrome */}
      <div className={cn(chromeClass, "hidden lg:block")}>
        <header className="border-border/70 border-b bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
          <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4">
            <div className="flex items-center gap-8">
              <Link
                className="flex shrink-0 items-center gap-2.5 font-heading font-semibold text-sm tracking-tight transition-opacity duration-150 ease-ui hover:opacity-80"
                href="/"
              >
                <Image
                  alt="Website logo"
                  className="size-7 rounded-full"
                  height={100}
                  src="/logo.svg"
                  width={100}
                />
                {title}
              </Link>
              <nav aria-label="Primary" className="flex items-center gap-1">
                {navItems.map((item) => (
                  <Link
                    className={navLinkClass(isPathActive(item.href, pathname))}
                    href={item.href ?? "#"}
                    key={item.name}
                  >
                    {item.icon ? (
                      <span className="text-current">{item.icon}</span>
                    ) : null}
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-1">
              <Button
                aria-label="Search"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setIsSearchOpen(true)}
                size="icon"
                variant="ghost"
              >
                <Search className="size-4" />
                <span className="sr-only">Search</span>
              </Button>
              <ModeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    aria-label="User menu"
                    className="text-muted-foreground hover:text-foreground"
                    size="icon"
                    variant="ghost"
                  >
                    <User className="size-4" />
                    <span className="sr-only">User menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <SignOutButton />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {pathname === "/" ? null : (
          <div className="border-border/70 border-b bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
            <div className="mx-auto flex h-9 w-full max-w-7xl items-center px-4">
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((crumb, index) => (
                    <Fragment key={crumb.href ?? crumb.name}>
                      <BreadcrumbItem>
                        {crumb.href ? (
                          <BreadcrumbLink asChild>
                            <Link className={crumbLinkClass} href={crumb.href}>
                              {crumb.icon}
                              {crumb.name}
                            </Link>
                          </BreadcrumbLink>
                        ) : (
                          <BreadcrumbPage className="inline-flex items-center gap-1 font-medium text-foreground">
                            {crumb.icon}
                            {crumb.name}
                          </BreadcrumbPage>
                        )}
                      </BreadcrumbItem>
                      {index < breadcrumbs.length - 1 ? (
                        <BreadcrumbSeparator />
                      ) : null}
                    </Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>
        )}
      </div>

      {/* Mobile chrome */}
      <div className={cn(chromeClass, "lg:hidden")}>
        <header className="border-border/70 border-b bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
          <div className="flex h-14 items-center justify-between px-4">
            <Link
              className="flex items-center gap-2.5 font-heading font-semibold text-sm tracking-tight transition-opacity duration-150 ease-ui hover:opacity-80"
              href="/"
            >
              <Image
                alt="Website logo"
                className="size-5 rounded-full"
                height={100}
                src="/logo.svg"
                width={100}
              />
              {title}
            </Link>

            <div className="flex items-center gap-1">
              <Button
                aria-label="Search"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setIsSearchOpen(true)}
                size="icon"
                variant="ghost"
              >
                <Search className="size-4" />
                <span className="sr-only">Search</span>
              </Button>
              <ModeToggle />
              <Sheet onOpenChange={setIsMobileMenuOpen} open={isMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    aria-label="Toggle navigation menu"
                    className="text-muted-foreground hover:text-foreground"
                    size="icon"
                    variant="ghost"
                  >
                    <Menu className="size-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                  </Button>
                </SheetTrigger>
                <SheetDescription className="sr-only">
                  Mobile navigation bar
                </SheetDescription>
                <SheetContent
                  className="w-80 max-w-[75vw] p-0 max-xs:w-full max-xs:max-w-full [&>button:first-of-type]:hidden"
                  side="right"
                >
                  <VisuallyHidden>
                    <SheetTitle>Navigation Menu</SheetTitle>
                  </VisuallyHidden>
                  <MobileSidebar
                    navItems={navItems}
                    onNavigate={() => setIsMobileMenuOpen(false)}
                    pathname={pathname}
                    title={title}
                  />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>

        {pathname === "/" ? null : (
          <div className="border-border/70 border-b bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.length > 3 ? (
                  <>
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link className={crumbLinkClass} href="/">
                          <Home className="size-3" />
                          Home
                        </Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbEllipsis />
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage className="font-medium text-foreground">
                        {breadcrumbs.at(-1)?.name}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                ) : (
                  breadcrumbs.map((crumb, index) => (
                    <Fragment key={crumb.href ?? crumb.name}>
                      <BreadcrumbItem>
                        {crumb.href ? (
                          <BreadcrumbLink asChild>
                            <Link className={crumbLinkClass} href={crumb.href}>
                              {crumb.icon}
                              {crumb.name}
                            </Link>
                          </BreadcrumbLink>
                        ) : (
                          <BreadcrumbPage className="inline-flex items-center gap-1 font-medium text-foreground">
                            {crumb.icon}
                            {crumb.name}
                          </BreadcrumbPage>
                        )}
                      </BreadcrumbItem>
                      {index < breadcrumbs.length - 1 ? (
                        <BreadcrumbSeparator />
                      ) : null}
                    </Fragment>
                  ))
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        )}
      </div>

      {/* Spacer for fixed chrome */}
      {enableBlock ? (
        <div className={pathname === "/" ? "h-14" : "h-[5.75rem]"} />
      ) : null}
    </>
  );
}

function MobileSidebar({
  navItems,
  onNavigate,
  title,
  pathname,
}: {
  navItems: NavItem[];
  onNavigate: () => void;
  title: string;
  pathname: string;
}) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  const isDark = mounted && theme === "dark";

  return (
    <div className="flex h-full w-full flex-col bg-background">
      <div className="flex h-14 shrink-0 items-center justify-between border-border border-b px-4">
        <span className="flex items-center gap-2.5 font-heading font-semibold text-sm tracking-tight">
          <Image
            alt="Website logo"
            className="size-5 rounded-full"
            height={100}
            src="/logo.svg"
            width={100}
          />
          {title}
        </span>
        <SheetClose asChild>
          <Button
            aria-label="Close menu"
            className="text-muted-foreground hover:text-foreground"
            size="icon"
            variant="ghost"
          >
            <X className="size-4" />
            <span className="sr-only">Close menu</span>
          </Button>
        </SheetClose>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <p className="px-3 pt-3 pb-1.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">
          Navigation
        </p>
        <nav aria-label="Primary" className="flex flex-col gap-0.5">
          {navItems.map((item) => (
            <Link
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 font-medium text-sm transition-colors duration-150 ease-ui",
                isPathActive(item.href, pathname)
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
              href={item.href ?? "#"}
              key={item.name}
              onClick={onNavigate}
            >
              {item.icon ? (
                <span className="text-current">{item.icon}</span>
              ) : null}
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      <div className="shrink-0 space-y-1 border-border border-t p-2">
        <Button
          className="h-9 w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={toggleTheme}
          variant="ghost"
        >
          {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          {isDark ? "Switch to light mode" : "Switch to dark mode"}
        </Button>
        <SignOutButton />
      </div>
    </div>
  );
}
