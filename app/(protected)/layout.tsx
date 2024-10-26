import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full flex py-3">
        <SidebarTrigger />
        <div className="px-2 sm:px-3 w-full">{children}</div>
      </main>
    </SidebarProvider>
  );
}
