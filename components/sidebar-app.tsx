"use client";

import { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "./ui/ace-sidebar";

import { signOutUser } from "@/app/(auth)/sign-in/actions";
import { AdminLinks, UserLinks } from "@/constants";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  LucideIcon,
  PanelLeftCloseIcon,
  User2,
} from "lucide-react";
import { User } from "next-auth";
import { usePathname } from "next/navigation";
import { Logo, LogoIcon } from "./logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface LinksProps {
  label: string;
  href: string;
  icon: LucideIcon;
}

export function SidebarApp({
  children,
  session,
}: {
  children: React.ReactNode;
  session: { role: string; phone: string } & User;
}) {
  const [open, setOpen] = useState(window.innerWidth < 768 ? false : true);
  let links = [] as LinksProps[];
  if (session.role === "ADMIN") {
    links = AdminLinks;
  } else {
    links = UserLinks;
  }

  const pathName = usePathname();

  return (
    <div
      className={cn(
        "rounded-md flex flex-col md:flex-row bg-white dark:bg-neutral-800 w-full flex-1 mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden",
        "h-screen"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden transition-all">
            <div className="flex gap-2 items-center">
              {open ? <Logo className="w-full bg-white" /> : <LogoIcon />}
              <PanelLeftCloseIcon
                onClick={() => setOpen(false)}
                className={cn(
                  "h-6 w-6 transition hidden md:block",
                  !open && "md:hidden"
                )}
              />
            </div>
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => {
                const isActive =
                  pathName === link.href ||
                  (link.href !== "/dashboard" &&
                    pathName?.startsWith(`${link.href}/`));
                return (
                  <SidebarLink
                    className={cn(
                      "hover:bg-slate-200 rounded-md py-4 items-center justify-center",
                      isActive &&
                        "bg-slate-200/90 rounded-md py-4 px-1 border-2 border-l-blue-600",
                      open && "px-2 justify-start",
                      open && isActive && "border-l-4"
                    )}
                    key={idx}
                    link={link}
                  />
                );
              })}
            </div>
          </div>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div
                  className={cn(
                    "flex items-center gap-2 cursor-pointer",
                    open && "bg-white p-2 rounded-md"
                  )}
                >
                  <User2 className="h-7 w-7" />
                  <motion.span
                    animate={{
                      display: open ? "inline-block" : "none",
                      opacity: open ? 1 : 0,
                    }}
                    className="flex flex-col gap-1 transition-all text-slate-700 dark:text-slate-200 group-hover/sidebar:translate-x-1 duration-150 whitespace-pre !p-0 !m-0"
                  >
                    <span className="font-semibold w-full">
                      {session?.name}
                    </span>{" "}
                    <br />
                    <span className="text-muted-foreground w-full">
                      {session?.email}
                    </span>
                  </motion.span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width] z-50"
              >
                {/* <DropdownMenuItem>
                  <User2 />
                  <span>Mon compte</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings />
                  <span>Paramètres</span>
                </DropdownMenuItem> */}
                <DropdownMenuItem onClick={async () => signOutUser()}>
                  <ArrowLeftIcon />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SidebarBody>
      </Sidebar>
      <div className="flex px-4 flex-1 overflow-y-auto min-h-screen">
        {children}
      </div>
    </div>
  );
}

// Dummy dashboard component with content
// const Dashboard = () => {
//   return (
//     <div className="flex flex-1">
//       <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
//         <div className="flex gap-2">
//           {[...new Array(4)].map((i) => (
//             <div
//               key={"first-array" + i}
//               className="h-20 w-full rounded-lg  bg-gray-100 dark:bg-neutral-800 animate-pulse"
//             ></div>
//           ))}
//         </div>
//         <div className="flex gap-2 flex-1">
//           {[...new Array(2)].map((i) => (
//             <div
//               key={"second-array" + i}
//               className="h-full w-full rounded-lg  bg-gray-100 dark:bg-neutral-800 animate-pulse"
//             ></div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };
