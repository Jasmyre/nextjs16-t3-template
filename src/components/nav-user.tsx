"use client";

import { ChevronsUpDownIcon, LogOutIcon } from "lucide-react";
import { signout } from "@/actions/sign-out";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

export interface NavUserData {
  email: string;
  image?: string | null;
  userName: string;
}

export function SidebarFooterContent({ user }: { user?: NavUserData | null }) {
  if (!user) {
    return <SidebarFooterSkeleton />;
  }

  return <NavUser user={user} />;
}

function SidebarFooterSkeleton() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          className="bg-card data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          size="lg"
        >
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarFallback className="rounded-lg" />
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <Skeleton className="h-4 w-25" />
            <Skeleton className="h-3 w-32" />
          </div>
          <ChevronsUpDownIcon className="ml-auto size-4 text-muted-foreground" />
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function UserAvatar({
  userName,
  image,
  initials,
}: {
  userName: string;
  image?: string | null;
  initials: string;
}) {
  return (
    <Avatar className="h-8 w-8 rounded-lg">
      {image ? (
        <AvatarImage alt={userName} src={image} />
      ) : (
        <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
      )}
    </Avatar>
  );
}

export function NavUser({ user }: { user: NavUserData }) {
  const { isMobile } = useSidebar();

  const handleSignout = async () => {
    await signout();
  };

  const initials = user.userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              aria-label="User menu"
              className="bg-card data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              size="lg"
            >
              <UserAvatar
                image={user.image}
                initials={initials}
                userName={user.userName}
              />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.userName}</span>
                <span className="truncate text-muted-foreground text-xs">
                  {user.email}
                </span>
              </div>
              <ChevronsUpDownIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <UserAvatar
                  image={user.image}
                  initials={initials}
                  userName={user.userName}
                />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.userName}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={handleSignout}
            >
              <LogOutIcon />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
