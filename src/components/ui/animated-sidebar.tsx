"use client";
import { cn } from "@/lib/utils";
import Link, { LinkProps } from "next/link";
import React, { useState, createContext, useContext, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
  /** The phone drawer has its own state, so a desktop "keep expanded" rule never opens it. */
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
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
  const [mobileOpen, setMobileOpen] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate: animate, mobileOpen, setMobileOpen }}>
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
    <motion.div
      className={cn(
        "h-full px-4 py-4 hidden md:flex md:flex-col bg-sidebar flex-shrink-0",
        className
      )}
      animate={{
        width: animate ? (open ? "250px" : "70px") : "250px",
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/** Hamburger for phones; place it in the page header. */
export const MobileSidebarTrigger = ({ className }: { className?: string }) => {
  const { setMobileOpen } = useSidebar();
  return (
    <button
      type="button"
      aria-label="Open menu"
      className={cn("rounded-full p-2 text-sidebar-foreground hover:bg-muted md:hidden", className)}
      onClick={() => setMobileOpen(true)}
    >
      <Menu className="h-5 w-5" />
    </button>
  );
};

/** Full-screen navigation drawer for phones. Opened by MobileSidebarTrigger. */
export const MobileSidebar = ({
  className,
  children,
}: React.ComponentProps<"div">) => {
  const ctx = useSidebar();
  const { mobileOpen, setMobileOpen } = ctx;
  const close = () => setMobileOpen(false);
  const pathname = usePathname();
  // Close after navigating to another page.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, setMobileOpen]);
  return (
    <AnimatePresence>
      {mobileOpen && (
        <motion.div
          initial={{ x: "-100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "-100%", opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={cn(
            "fixed inset-0 z-[100] flex h-full w-full flex-col justify-between bg-background p-10 md:hidden",
            className
          )}
        >
          <button
            type="button"
            aria-label="Close menu"
            className="absolute right-8 top-8 z-50 rounded-full p-2 text-sidebar-foreground hover:bg-muted"
            onClick={close}
          >
            <X />
          </button>
          {/* Labels are always shown inside the drawer. */}
          <SidebarContext.Provider value={{ ...ctx, open: true, animate: false }}>
            {children}
          </SidebarContext.Provider>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const SidebarLink = ({
  link,
  className,
  ...props
}: {
  link: Links;
  className?: string;
  props?: LinkProps;
}) => {
  const { open, animate } = useSidebar();
  return (
    <Link
      href={link.href}
      className={cn(
        "flex items-center justify-start gap-2 group/sidebar py-2",
        className
      )}
      {...props}
    >
      {link.icon}
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="text-sidebar-foreground/80 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
      >
        {link.label}
      </motion.span>
    </Link>
  );
};
