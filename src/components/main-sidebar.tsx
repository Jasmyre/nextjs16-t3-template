import { NavLogoHeader } from "@/components/nav-logo-header";
import type { NavMainItem } from "@/components/nav-main";
import { NavMain } from "@/components/nav-main";
import { type NavUserData, SidebarFooterContent } from "@/components/nav-user";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

interface MainSidebarProps extends React.ComponentProps<typeof Sidebar> {
  navItems: NavMainItem[];
  user?: NavUserData | null;
}

export function MainSidebar({ navItems, user, ...props }: MainSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="bg-background">
        <NavLogoHeader />
      </SidebarHeader>
      <Separator />
      <SidebarContent className="bg-background">
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter className="bg-background">
        <SidebarFooterContent user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
