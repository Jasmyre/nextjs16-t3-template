"use client";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  ChevronRight,
  Home,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import type { ReactNode } from "react";
import React, { useEffect, useState } from "react";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu";
import { Separator } from "@/components/ui/separator";
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
  pageItems?: NavItem[];
  title?: string;
}

export function NavigationBar({
  navItems,
  pageItems,
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

  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    const pathSegments = pathname.split("/").filter(Boolean);
    const breadcrumbs: Array<{
      name: string;
      href?: string;
      icon?: ReactNode;
    }> = [{ name: "Home", href: "/", icon: <Home className="h-3 w-3" /> }];

    let currentPath = "";
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;

      // Capitalize and format segment name
      const name =
        segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");

      breadcrumbs.push({
        name,
        href: isLast ? undefined : currentPath,
        icon: undefined,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <>
      {/* Search Command Dialog */}
      <Dialog onOpenChange={setIsSearchOpen} open={isSearchOpen}>
        <DialogContent
          aria-describedby="search-command"
          className="absolute top-60 overflow-hidden p-0 shadow-lg lg:top-80"
        >
          <VisuallyHidden>
            <DialogTitle>Search Commands</DialogTitle>
          </VisuallyHidden>
          <Command className="border-none outline-none ring-0 focus:outline-none focus:ring-0">
            <CommandInput
              className="border-none outline-none ring-0 focus:outline-none focus:ring-0"
              placeholder="Type a command or search..."
            />
            <CommandList className="max-h-100">
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandSeparator />
              <CommandGroup heading="Navigation">
                {navItems.map((item) => (
                  <CommandItem
                    className="cursor-pointer opacity-70 transition-all duration-200 hover:opacity-100"
                    key={item.name}
                    onSelect={() => {
                      if (item.href) {
                        router.push(item.href);
                      }
                      setIsSearchOpen(false);
                    }}
                  >
                    {item.icon && <span className="mr-2">{item.icon}</span>}
                    <span>{item.name}</span>
                    {item.href && <CommandShortcut>Go</CommandShortcut>}
                  </CommandItem>
                ))}
              </CommandGroup>
              {pageItems && (
                <>
                  <CommandSeparator />
                  <CommandGroup heading="Pages">
                    {pageItems.map((item) => (
                      <CommandItem
                        className="cursor-pointer opacity-70 transition-all duration-200 hover:opacity-100"
                        key={item.name}
                        onSelect={() => {
                          if (item.href) {
                            router.push(item.href);
                          }
                          setIsSearchOpen(false);
                        }}
                      >
                        {item.icon && <span className="mr-2">{item.icon}</span>}
                        <span>{item.name}</span>
                        {item.href && <CommandShortcut>Go</CommandShortcut>}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
              <CommandSeparator />
              <CommandGroup heading="Settings">
                <CommandItem
                  className="cursor-pointer opacity-70 transition-all duration-200 hover:opacity-100"
                  onSelect={() => setIsSearchOpen(false)}
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                  <CommandShortcut>⌘P</CommandShortcut>
                </CommandItem>
                <CommandItem
                  className="cursor-pointer opacity-70 transition-all duration-200 hover:opacity-100"
                  onSelect={() => setIsSearchOpen(false)}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                  <CommandShortcut>⌘S</CommandShortcut>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>

      {/* Desktop Navigation */}
      <header
        className={`fixed top-0 right-0 left-0 z-50 mx-auto w-screen border-muted border-b bg-background transition-transform duration-300 ease-in-out dark:border-muted ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        } hidden lg:block`}
      >
        <div className="container mx-auto max-w-7xl">
          <div className="flex h-14 items-center justify-between px-4">
            {/* Left side - Logo and Navigation */}
            <div className="flex items-center space-x-6">
              <Link
                className="cursor-pointer font-bold text-xl opacity-90 transition-all duration-200 hover:opacity-100"
                href="/"
              >
                <span className="flex gap-2">
                  <Image
                    alt="Website logo"
                    className="h-8 w-8 rounded-full"
                    height={100}
                    src={"/logo.svg"}
                    width={100}
                  />
                  {title}
                </span>
              </Link>
              <NavigationMenu className="relative">
                <NavigationMenuList>
                  {navItems.map((item) => (
                    <NavigationMenuItem key={item.name}>
                      {item.children ? (
                        <>
                          <NavigationMenuTrigger className="flex h-10 cursor-pointer items-center gap-2 px-3 py-2 opacity-80 transition-all duration-200 hover:opacity-100">
                            <span className="transition-transform duration-200">
                              {item.icon}
                            </span>
                            {item.name}
                          </NavigationMenuTrigger>
                          <NavigationMenuContent className="min-w-100 p-0">
                            <div className="grid w-100 gap-2 p-4">
                              <div className="row-span-3">
                                <NavigationMenuLink asChild>
                                  <Link
                                    className="flex h-full w-full cursor-pointer select-none flex-col justify-end rounded-md bg-linear-to-b from-muted/50 to-muted p-6 no-underline opacity-90 outline-none transition-all duration-300 hover:opacity-100 focus:shadow-md"
                                    href={item.href ?? "#"}
                                  >
                                    <div className="mt-4 mb-2 font-medium text-lg">
                                      {item.name}
                                    </div>
                                    <p className="text-muted-foreground text-sm leading-tight">
                                      Explore all {item.name.toLowerCase()}{" "}
                                      options
                                    </p>
                                  </Link>
                                </NavigationMenuLink>
                              </div>
                              <div className="mt-4 grid gap-1">
                                {item.children.map((child) => (
                                  <ListItem
                                    href={child.href ?? "#"}
                                    icon={child.icon}
                                    key={child.name}
                                    title={child.name}
                                  >
                                    {child.name} description
                                  </ListItem>
                                ))}
                              </div>
                            </div>
                          </NavigationMenuContent>
                        </>
                      ) : (
                        <NavigationMenuLink asChild>
                          <Link
                            className={`group ${pathname.includes(item.href ? item.href : "") ? (item.href === pathname ? "border-indigo-500" : "") : "border-transparent"} inline-flex h-10 w-max cursor-pointer items-center justify-center rounded-none border-b bg-card px-3 py-2 font-medium text-sm opacity-80 transition-all duration-200 hover:rounded-md hover:bg-muted hover:text-muted-foreground hover:opacity-100 focus:rounded-md focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50`}
                            href={item.href ?? "#"}
                          >
                            <span className="flex items-center gap-2 transition-transform duration-200">
                              {item.icon && (
                                <span className="transition-transform duration-200 group-hover:scale-110">
                                  {item.icon}
                                </span>
                              )}
                              {item.name}
                            </span>
                          </Link>
                        </NavigationMenuLink>
                      )}
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
                <NavigationMenuViewport className="data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 relative mt-1.5 h-(--radix-navigation-menu-viewport-height) w-full origin-top-center overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg data-[state=closed]:animate-out data-[state=open]:animate-in md:w-(--radix-navigation-menu-viewport-width)" />
              </NavigationMenu>
            </div>

            {/* Right side - Quick Actions */}
            <div className="flex items-center space-x-1">
              {/* Search Button */}
              <Button
                aria-label="Search"
                className="relative cursor-pointer opacity-70 transition-all duration-200 hover:opacity-100"
                onClick={() => setIsSearchOpen(true)}
                size="icon"
                variant="ghost"
              >
                <Search className="h-4 w-4 transition-transform duration-200" />
                <span className="sr-only">Search</span>
              </Button>

              {/* Theme Toggle */}
              <Button
                aria-label="Toggle theme"
                className="cursor-pointer opacity-70 transition-all duration-200 hover:opacity-100"
                onClick={toggleTheme}
                size="icon"
                variant="ghost"
              >
                {mounted ? (
                  theme === "dark" ? (
                    <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-300" />
                  ) : (
                    <Moon className="h-4 w-4 rotate-0 scale-100 transition-all duration-300" />
                  )
                ) : (
                  <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-300" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    aria-label="User menu"
                    className="cursor-pointer opacity-70 transition-all duration-200 hover:opacity-100"
                    size="icon"
                    variant="ghost"
                  >
                    <User className="h-4 w-4 transition-transform duration-200" />
                    <span className="sr-only">User menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 dark:bg-card">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer opacity-80 transition-all duration-200 hover:opacity-100">
                    <User className="mr-2 h-4 w-4 transition-transform duration-200" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer opacity-80 transition-all duration-200 hover:opacity-100">
                    <Settings className="mr-2 h-4 w-4 transition-transform duration-200" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer opacity-80 transition-all duration-200 hover:opacity-100">
                    <LogOut className="mr-2 h-4 w-4 transition-transform duration-200" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumbs - Desktop */}
      {pathname !== "/" && (
        <div
          className={`fixed bg-background ${isVisible ? "top-14" : "top-10"} right-0 left-0 z-40 border-muted border-b transition-transform duration-300 ease-in-out dark:border-muted ${
            isVisible ? "translate-y-0" : "-translate-y-full"
          } hidden lg:block`}
        >
          <div className="container mx-auto max-w-7xl">
            <div className="flex h-10 items-center px-4">
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={crumb.name}>
                      <BreadcrumbItem>
                        {crumb.href ? (
                          <BreadcrumbLink asChild>
                            <Link
                              className="flex cursor-pointer items-center gap-1 opacity-70 transition-all delay-400 duration-200 hover:opacity-100"
                              href={crumb.href}
                            >
                              <span className="transition-transform duration-200">
                                {crumb.icon}
                              </span>
                              {crumb.name}
                            </Link>
                          </BreadcrumbLink>
                        ) : (
                          <BreadcrumbPage className="flex items-center gap-1 opacity-100">
                            {crumb.icon}
                            {crumb.name}
                          </BreadcrumbPage>
                        )}
                      </BreadcrumbItem>
                      {index < breadcrumbs.length - 1 && (
                        <BreadcrumbSeparator />
                      )}
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Navigation */}
      <header
        className={`fixed top-0 right-0 left-0 z-50 bg-background transition-transform duration-300 ease-in-out ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        } lg:hidden`}
      >
        <div className="flex h-16 items-center justify-between px-4">
          <Link
            className="cursor-pointer font-bold text-xl opacity-90 transition-all duration-200 hover:opacity-100"
            href="/"
          >
            {title}
          </Link>

          {/* Mobile Quick Actions */}
          <div className="flex items-center space-x-2">
            <Button
              aria-label="Search"
              className="cursor-pointer opacity-70 transition-all duration-200 hover:opacity-100"
              onClick={() => setIsSearchOpen(true)}
              size="icon"
              variant="ghost"
            >
              <Search className="h-4 w-4 transition-transform duration-200" />
              <span className="sr-only">Search</span>
            </Button>

            {/* Mobile Theme Toggle */}
            <Button
              aria-label="Toggle theme"
              className="cursor-pointer opacity-70 transition-all duration-200 hover:opacity-100"
              onClick={toggleTheme}
              size="icon"
              variant="ghost"
            >
              {mounted ? (
                theme === "dark" ? (
                  <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-300" />
                ) : (
                  <Moon className="h-4 w-4 rotate-0 scale-100 transition-all duration-300" />
                )
              ) : (
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-300" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>

            <Sheet onOpenChange={setIsMobileMenuOpen} open={isMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  aria-label="Toggle navigation menu"
                  className="cursor-pointer opacity-70 transition-all duration-200 hover:opacity-100"
                  size="icon"
                  variant="ghost"
                >
                  <Menu className="h-6 w-6 transition-transform duration-200" />
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

        {/* Mobile Breadcrumbs */}
        {pathname !== "/" && (
          <div className="border-muted border-t border-b bg-background px-4 py-2 dark:border-muted">
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.length > 3 ? (
                  <>
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link
                          className="flex cursor-pointer items-center gap-1 opacity-70 transition-all duration-200 hover:opacity-100"
                          href="/"
                        >
                          <Home className="h-3 w-3 transition-transform duration-200" />
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
                      <BreadcrumbPage className="flex items-center gap-1 opacity-100">
                        {breadcrumbs.at(-1)?.name}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                ) : (
                  breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={crumb.name}>
                      <BreadcrumbItem>
                        {crumb.href ? (
                          <BreadcrumbLink asChild>
                            <Link
                              className="flex cursor-pointer items-center gap-1 opacity-70 transition-all duration-200 hover:opacity-100"
                              href={crumb.href}
                            >
                              <span className="transition-transform duration-200">
                                {crumb.icon}
                              </span>
                              {crumb.name}
                            </Link>
                          </BreadcrumbLink>
                        ) : (
                          <BreadcrumbPage className="flex items-center gap-1 opacity-100">
                            {crumb.icon}
                            {crumb.name}
                          </BreadcrumbPage>
                        )}
                      </BreadcrumbItem>
                      {index < breadcrumbs.length - 1 && (
                        <BreadcrumbSeparator />
                      )}
                    </React.Fragment>
                  ))
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        )}
      </header>

      {/* Spacer for fixed header */}
      {enableBlock ? (
        <div className={`${pathname === "/" ? "h-14" : "h-24 lg:h-24"}`} />
      ) : null}
    </>
  );
}

const ListItem = ({
  className,
  title,
  children,
  icon,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<"a"> & { title: string; icon?: ReactNode } & {
  ref?: React.RefObject<React.ElementRef<"a"> | null>;
}) => (
  <NavigationMenuLink asChild>
    <a
      className={cn(
        "block cursor-pointer select-none space-y-1 rounded-md p-2 leading-none no-underline opacity-80 outline-none transition-all duration-200 hover:bg-accent hover:text-accent-foreground hover:opacity-100 focus:bg-accent focus:text-accent-foreground",
        className
      )}
      ref={ref}
      {...props}
    >
      <div className="flex items-center gap-2">
        <span className="transition-transform duration-200">{icon}</span>
        <div className="font-medium text-sm leading-none">{title}</div>
      </div>
      <p className="line-clamp-2 text-muted-foreground text-sm leading-snug">
        {children}
      </p>
    </a>
  </NavigationMenuLink>
);
ListItem.displayName = "ListItem";

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

  return (
    <div className="flex h-full w-full flex-col bg-background">
      {/* Sidebar Header */}
      <div className="flex flex-col gap-3 border-sidebar-border border-b p-3">
        <div className="flex h-10 items-center gap-2">
          <div className="flex items-center justify-center rounded-sm bg-primary p-1 text-primary-foreground transition-all duration-200">
            {/* <User className="h-4 w-4" /> */}
            <Image
              alt="Website logo"
              className="h-4 w-4 rounded-full"
              height={100}
              src={"/logo.svg"}
              width={100}
            />
          </div>
          <div className="relative grid flex-1 text-left text-sm leading-tight">
            <span className="truncate px-2 font-semibold">{title}</span>
            <SheetClose asChild>
              <Button
                className="absolute top-[50%] right-0 translate-y-[-50%] cursor-pointer"
                size={"icon"}
                type="button"
                variant="outline"
              >
                <X />
              </Button>
            </SheetClose>
          </div>
        </div>
      </div>

      {/* Sidebar Content */}
      <div className="flex-1 overflow-auto p-3">
        <div className="space-y-1.5">
          <div className="px-2 py-1 font-semibold text-sidebar-foreground/70 text-xs uppercase tracking-wider">
            Navigation
          </div>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <MobileNavItem
                item={item}
                key={item.name}
                onNavigate={onNavigate}
                pathname={pathname}
              />
            ))}
          </nav>
        </div>

        <Separator className="my-4" />

        {/* Quick Actions in Sidebar */}
        <div className="space-y-1.5">
          <div className="px-2 py-1 font-semibold text-sidebar-foreground/70 text-xs uppercase tracking-wider">
            Quick Actions
          </div>
          <div className="flex flex-col gap-1">
            <Button
              aria-label="Toggle theme"
              className="h-9 cursor-pointer justify-start px-3 opacity-80 transition-all duration-200 hover:opacity-100"
              onClick={toggleTheme}
              variant="ghost"
            >
              {mounted &&
                (theme === "dark" ? (
                  <Sun className="mr-2 h-4 w-4 transition-all duration-300" />
                ) : (
                  <Moon className="mr-2 h-4 w-4 transition-all duration-300" />
                ))}
              Toggle Theme
            </Button>
            <Button
              aria-label="Open settings"
              className="h-9 cursor-pointer justify-start px-3 opacity-80 transition-all duration-200 hover:opacity-100"
              onClick={onNavigate}
              variant="ghost"
            >
              <Settings className="mr-2 h-4 w-4 transition-transform duration-200" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="border-sidebar-border border-t p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label="User account menu"
              className="h-10 w-full cursor-pointer justify-start px-3 opacity-90 transition-all duration-200 hover:opacity-100"
              variant="ghost"
            >
              <div className="flex flex-1 items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs transition-all duration-200">
                  JD
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">John Doe</span>
                  <span className="truncate text-sidebar-foreground/70 text-xs">
                    Account
                  </span>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56" side="top">
            <DropdownMenuLabel className="relative pl-8">
              <div className="absolute top-0 bottom-0 left-2 w-px bg-sidebar-border" />
              My Account
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="relative cursor-pointer pl-8 opacity-80 transition-all duration-200 hover:opacity-100"
              onClick={onNavigate}
            >
              <div className="absolute top-0 bottom-0 left-2 w-px bg-sidebar-border" />
              <User className="mr-2 h-4 w-4 transition-transform duration-200" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="relative cursor-pointer pl-8 opacity-80 transition-all duration-200 hover:opacity-100"
              onClick={onNavigate}
            >
              <div className="absolute top-0 bottom-0 left-2 w-px bg-sidebar-border" />
              <Settings className="mr-2 h-4 w-4 transition-transform duration-200" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="relative cursor-pointer pl-8 opacity-80 transition-all duration-200 hover:opacity-100"
              onClick={onNavigate}
            >
              <div className="absolute top-0 bottom-0 left-2 w-px bg-sidebar-border" />
              <LogOut className="mr-2 h-4 w-4 transition-transform duration-200" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function MobileNavItem({
  item,
  onNavigate,
  pathname,
}: {
  item: NavItem;
  onNavigate: () => void;
  pathname: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (item.children) {
    return (
      <Collapsible onOpenChange={setIsOpen} open={isOpen}>
        <CollapsibleTrigger
          aria-expanded={isOpen}
          aria-label={`${item.name} menu, ${isOpen ? "expanded" : "collapsed"}`}
          className="flex w-full cursor-pointer items-center justify-between rounded-md px-2 py-1.5 font-medium text-sm opacity-80 transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:opacity-100 focus:bg-sidebar-accent focus:text-sidebar-accent-foreground focus:outline-none focus:ring-0"
        >
          <span className="flex items-center gap-2">
            <span className="transition-transform duration-200">
              {item.icon}
            </span>
            {item.name}
          </span>
          <ChevronRight
            aria-hidden="true"
            className={`h-4 w-4 transition-all duration-300 ${isOpen ? "rotate-90" : "rotate-0"}`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-0.5">
          {item.children.map((child) => (
            <Link
              className="relative flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 pl-6 text-sm opacity-70 transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:opacity-100 focus:bg-sidebar-accent focus:text-sidebar-accent-foreground focus:outline-none focus:ring-0"
              href={child.href ?? "#"}
              key={child.name}
              onClick={onNavigate}
              tabIndex={0}
            >
              <div className="absolute top-0 bottom-0 left-4 w-px bg-sidebar-border" />
              <span className="transition-transform duration-200">
                {child.icon}
              </span>
              {child.name}
            </Link>
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <Link
      className={` ${pathname.includes(item.href ? item.href : "") ? (item.href === pathname ? "bg-accent" : "") : "bg-background"} ${pathname.includes(item.href ? item.href : "") ? (item.href === pathname ? "text-accent-foreground" : "") : "text-foreground"} flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 font-medium text-sm opacity-80 transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:opacity-100 focus:bg-sidebar-accent focus:text-sidebar-accent-foreground focus:outline-none focus:ring-0`}
      href={item.href ?? "#"}
      onClick={onNavigate}
      tabIndex={0}
    >
      <span className="transition-transform duration-200">{item.icon}</span>
      {item.name}
    </Link>
  );
}
