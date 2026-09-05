"use client";

import { ChevronRightIcon, MoonIcon, SunIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { type ReactNode, useEffect, useState } from "react";
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
  CommandShortcut,
} from "@/components/ui/command";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

export interface NavMainSubItem {
  icon?: ReactNode;
  title: string;
  url: string;
}

export interface NavMainItem {
  icon?: ReactNode;
  isActive?: boolean;
  items?: NavMainSubItem[];
  title: string;
  url: string;
}

const getCommandItems = (items: NavMainItem[]) =>
  items.flatMap((item) => {
    const parentItem = {
      icon: item.icon,
      title: item.title,
      url: item.url,
    };

    if (!item.items?.length) {
      return [parentItem];
    }

    return [
      parentItem,
      ...item.items.map((subItem) => ({
        icon: subItem.icon,
        title: subItem.title,
        url: subItem.url,
      })),
    ];
  });

export function NavMain({ items }: { items: NavMainItem[] }) {
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const commandItems = getCommandItems(items);

  const isCurrentPath = (url: string) => pathname === url;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setIsCommandOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <>
      <Dialog onOpenChange={setIsCommandOpen} open={isCommandOpen}>
        <DialogContent className="overflow-hidden p-0">
          <DialogTitle className="sr-only">Search Commands</DialogTitle>
          <Command>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Navigation">
                {commandItems.map((item) => (
                  <CommandItem
                    className="cursor-pointer opacity-70 transition-all duration-200 hover:opacity-100"
                    key={`${item.title}-${item.url}`}
                    onSelect={() => {
                      router.push(item.url);
                      setIsCommandOpen(false);
                    }}
                  >
                    {item.icon && <span className="mr-2">{item.icon}</span>}
                    <span>{item.title}</span>
                    <CommandShortcut>Go</CommandShortcut>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>

      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <div className="relative">
          <SidebarInput
            aria-describedby="command-search-shortcut"
            aria-label="Open command search"
            className="pr-18"
            onClick={() => setIsCommandOpen(true)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setIsCommandOpen(true);
              }
            }}
            placeholder="Search commands..."
            readOnly
            value=""
          />
          <div
            className="pointer-events-none absolute top-1/2 right-1.5 flex -translate-y-1/2 items-center gap-1"
            id="command-search-shortcut"
          >
            <span className="sr-only">Shortcut: Control or Command plus K</span>
            <Kbd aria-hidden="true">Ctrl</Kbd>
            <Kbd aria-hidden="true">K</Kbd>
          </div>
        </div>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel className="text-muted-foreground">
          Navigation
        </SidebarGroupLabel>
        <SidebarMenu>
          {items.map((item) => {
            if (!item.items?.length) {
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="hover:bg-muted data-[active=true]:bg-accent"
                    isActive={isCurrentPath(item.url)}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      {item.icon}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            }

            return (
              <Collapsible
                asChild
                className="group/collapsible"
                defaultOpen={item.isActive}
                key={item.title}
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      className="hover:bg-muted data-[active=true]:bg-accent"
                      isActive={isCurrentPath(item.url)}
                      tooltip={item.title}
                    >
                      {item.icon}
                      <span>{item.title}</span>
                      <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            className="hover:bg-muted"
                            isActive={isCurrentPath(subItem.url)}
                          >
                            <Link href={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          })}
        </SidebarMenu>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel className="text-muted-foreground">
          Quick Actions
        </SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="hover:bg-muted"
              onClick={toggleTheme}
              tooltip="Toggle theme"
            >
              {mounted && theme === "light" ? <MoonIcon /> : <SunIcon />}
              <span>Toggle Theme</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}
