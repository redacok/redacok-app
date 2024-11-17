"use client";
import { signOutUser } from "@/app/(auth)/sign-in/actions";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Home, LucideIcon, PanelLeftOpen, X } from "lucide-react";
import Link, { LinkProps } from "next/link";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Button, buttonVariants } from "./button";

interface Links {
  label: string;
  href: string;
  // icon: React.JSX.Element | React.ReactNode | IconNode;
  icon: LucideIcon;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate: animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <>
      <motion.div
        className={cn(
          "h-full px-2 py-4 mx-auto hidden md:flex md:flex-col bg-gray-100 border border-r-gray-200 shadow-md dark:bg-neutral-800 w-[300px] flex-shrink-0",
          className
        )}
        animate={{
          width: animate ? (open ? "300px" : "60px") : "300px",
        }}
        onMouseEnter={() => setOpen(true)}
        // onMouseLeave={() => setOpen(false)}
        {...props}
      >
        {children}
      </motion.div>
    </>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <div
        className={cn(
          "h-10 px-4 py-4 flex flex-row md:hidden items-center justify-between  dark:bg-neutral-800 w-full"
        )}
        {...props}
      >
        <div className="flex z-20 w-full items-center justify-between">
          <Button variant={"ghost"} size={"sm"} onClick={() => setOpen(!open)}>
            <PanelLeftOpen
              className="text-neutral-800 dark:text-slate-200 h-4 w-4"
              aria-label="Ouvrir le menu latéral"
            />
          </Button>
          <Link
            href="/"
            className={cn(
              buttonVariants({
                variant: "ghost",
                size: "sm",
              }),
              "w-fit justify-end text-md items-center hover:text-foreground"
            )}
          >
            <Home className="w-4 h-4" />
            Accueil
          </Link>
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className={cn(
                "fixed h-full border border-r-slate-200 shadow-md w-5/6 inset-0 bg-white dark:bg-neutral-900 px-5 py-8 z-[100] flex flex-col justify-between",
                className
              )}
            >
              <div
                className="absolute right-10 top-10 z-50 text-neutral-800 dark:text-neutral-200"
                onClick={() => setOpen(!open)}
              >
                <X />
              </div>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export const SidebarLink = ({
  link,
  className,
  button,
  ...props
}: {
  link: Links;
  className?: string;
  button?: boolean;
  props?: LinkProps;
}) => {
  const { open, animate, setOpen } = useSidebar();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return !button ? (
    <Link
      href={link.href}
      className={cn(
        "flex items-center justify-start gap-2  group/sidebar py-2",
        className
      )}
      {...props}
      onClick={async () => {
        if (link.label === "Déconnexion") {
          signOutUser();
        } else if (isClient && window.innerWidth < 768 && !button) {
          setOpen(!open);
        }
      }}
    >
      <link.icon className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />

      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="transition-all text-slate-700 dark:text-slate-200 text-sm group-hover/sidebar:translate-x-1 duration-150 whitespace-pre inline-block !p-0 !m-0"
      >
        {link.label}
      </motion.span>
    </Link>
  ) : (
    <Button
      variant={"ghost"}
      className={cn(
        "flex items-center justify-start gap-2 group/sidebar p-2 w-fit",
        className
      )}
      {...props}
    >
      <link.icon className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />

      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="transition-all text-slate-700 dark:text-slate-200 text-sm group-hover/sidebar:translate-x-1 duration-150 whitespace-pre inline-block !p-0 !m-0"
      >
        {link.label}
      </motion.span>
    </Button>
  );
};
