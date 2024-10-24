import {
  ChevronUp,
  DoorOpen,
  Home,
  Inbox,
  Search,
  Settings,
  User2,
} from "lucide-react";

import { auth } from "@/auth";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Transactions",
    url: "#",
    icon: Inbox,
  },
  {
    title: "Rechercher",
    url: "#",
    icon: Search,
  },
  {
    title: "Paramètres",
    url: "#",
    icon: Settings,
  },
];

export async function AppSidebar() {
  const session = await auth();
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <h1 className="font-bold text-2xl text-slate-900">Redacok.</h1>
          </SidebarGroupLabel>
          <SidebarGroupContent className="py-3">
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="h-auto">
                  <User2 className="" />
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold">{session?.user.name}</span>
                    <span className="text-muted-foreground">
                      {session?.user.email}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem>
                  <User2 />
                  <span>Mon compte</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings />
                  <span>Paramètres</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <DoorOpen />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
