"use client";

import { BrandMark } from "@/components/brand-mark";
import React, { useState } from "react";
import {
  Sidebar,
  SidebarBody,
  SidebarLink,
  MobileSidebarTrigger,
} from "@/components/ui/animated-sidebar";
import {
  Briefcase,
  Building2,
  Heart,
  LayoutDashboard,
  User,
  FileText,
  BarChartHorizontal,
  Rocket,
  Kanban,
  MessageSquare,
  BarChart3,
  Shield,
  ScanSearch,
  Route,
  Linkedin,
  FilePen,
  Mail,
  Mic,
  Target,
  DollarSign,
  MailPlus,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { ConditionalSearchBar } from "@/components/conditional-search-bar";
import { NotificationsDropdown } from "@/components/notifications-dropdown";
import { UserNav } from "@/components/user-nav";
import { ThemeToggle } from "@/components/theme-toggle";

const employeeLinks = [
  {
    label: "Today",
    href: "/dashboard",
    icon: (
      <LayoutDashboard className="text-sidebar-foreground/70 h-5 w-5 flex-shrink-0" />
    ),
  },
  {
    label: "Opportunities",
    href: "/opportunities",
    icon: (
      <Briefcase className="text-sidebar-foreground/70 h-5 w-5 flex-shrink-0" />
    ),
  },
  {
    label: "Employers",
    href: "/employers",
    icon: (
      <Building2 className="text-sidebar-foreground/70 h-5 w-5 flex-shrink-0" />
    ),
  },
  {
    label: "Applications",
    href: "/applications",
    icon: (
      <Kanban className="text-sidebar-foreground/70 h-5 w-5 flex-shrink-0" />
    ),
  },
  {
    label: "LaunchPad",
    href: "/ai-tools",
    icon: (
      <Rocket className="text-sidebar-foreground/70 h-5 w-5 flex-shrink-0" />
    ),
  },
  {
    label: "Saved",
    href: "/saved",
    icon: (
      <Heart className="text-sidebar-foreground/70 h-5 w-5 flex-shrink-0" />
    ),
  },
  {
    label: "Profile",
    href: "/profile",
    icon: (
      <User className="text-sidebar-foreground/70 h-5 w-5 flex-shrink-0" />
    ),
  },
  {
    label: "Inbox",
    href: "/inbox",
    icon: (
      <MessageSquare className="text-sidebar-foreground/70 h-5 w-5 flex-shrink-0" />
    ),
  },
  {
    label: "Insights",
    href: "/insights",
    icon: (
      <BarChart3 className="text-sidebar-foreground/70 h-5 w-5 flex-shrink-0" />
    ),
  },
];

/** LaunchPad tools, listed under LaunchPad in the sidebar while you're in LaunchPad. */
const launchPadTools = [
  { label: "Resume Match", href: "/ai-tools/resume-match", Icon: ScanSearch },
  { label: "Resume Builder", href: "/ai-tools/resume-builder", Icon: FilePen },
  { label: "Cover Letter", href: "/ai-tools/cover-letter", Icon: Mail },
  { label: "Interview Prep", href: "/ai-tools/interview-prep", Icon: Mic },
  { label: "Skill Gap", href: "/ai-tools/skill-gap", Icon: Target },
  { label: "Career Path", href: "/ai-tools/career-path", Icon: Route },
  { label: "Salary", href: "/ai-tools/salary", Icon: DollarSign },
  { label: "LinkedIn", href: "/ai-tools/linkedin", Icon: Linkedin },
  { label: "Email Templates", href: "/ai-tools/email-templates", Icon: MailPlus },
].map(({ Icon, ...tool }) => ({
  ...tool,
  icon: <Icon className="text-sidebar-foreground/60 h-4 w-4 flex-shrink-0" />,
}));

const ACTIVE_LINK =
  "bg-sidebar-accent rounded-lg px-2 [&_svg]:!text-primary [&_span]:!text-sidebar-accent-foreground [&_span]:font-medium";

/** LaunchPad itself while you're inside it: solid espresso, so the lighter tool highlight sits under it. */
const ACTIVE_SECTION =
  "bg-primary rounded-lg px-2 [&_svg]:!text-primary-foreground [&_span]:!text-primary-foreground [&_span]:font-medium";

const employerLinks = [
  {
    label: "Today",
    href: "/employer/dashboard",
    icon: (
      <Building2 className="text-sidebar-foreground/70 h-5 w-5 flex-shrink-0" />
    ),
  },
  {
    label: "Postings",
    href: "/employer/postings",
    icon: (
      <FileText className="text-sidebar-foreground/70 h-5 w-5 flex-shrink-0" />
    ),
  },
  {
    label: "Analytics",
    href: "/employer/analytics",
    icon: (
      <BarChartHorizontal className="text-sidebar-foreground/70 h-5 w-5 flex-shrink-0" />
    ),
  },
  {
    label: "Profile",
    href: "/employer/profile",
    icon: (
      <User className="text-sidebar-foreground/70 h-5 w-5 flex-shrink-0" />
    ),
  },
  {
    label: "Inbox",
    href: "/inbox",
    icon: (
      <MessageSquare className="text-sidebar-foreground/70 h-5 w-5 flex-shrink-0" />
    ),
  },
];

const adminLinks = [
  {
    label: "Admin Dashboard",
    href: "/admin",
    icon: (
      <Shield className="text-sidebar-foreground/70 h-5 w-5 flex-shrink-0" />
    ),
  },
];

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { role, loading } = useAuth();
  const pathname = usePathname();

  // Keep the sidebar expanded inside LaunchPad so its tools stay visible.
  const inLaunchPad = role !== "admin" && role !== "employer" && pathname.startsWith("/ai-tools");
  const sidebarOpen = open || inLaunchPad;

  const links = role === "admin" ? adminLinks : role === "employer" ? employerLinks : employeeLinks;
  const dashboardHref = role === "admin" ? "/admin" : role === "employer" ? "/employer/dashboard" : "/dashboard";

  if (loading) {
    return (
      <div className="flex h-screen w-full">
        <div className="w-[60px] bg-sidebar p-4">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <div className="mt-8 flex flex-col gap-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-5 w-5" />
            ))}
          </div>
        </div>
        <div className="flex-1">{children}</div>
      </div>
    );
  }

  return (
    <Sidebar open={sidebarOpen} setOpen={setOpen}>
      <div className="flex h-screen w-full flex-1 flex-col overflow-hidden border border-sidebar-border bg-sidebar md:flex-row">
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {sidebarOpen ? <Logo href={dashboardHref} /> : <LogoIcon href={dashboardHref} />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link) => {
                const showTools = link.href === "/ai-tools" && inLaunchPad;
                const active = pathname === link.href || pathname.startsWith(link.href + "/");
                return (
                  <React.Fragment key={link.href}>
                    <SidebarLink
                      link={link}
                      className={cn(active && (showTools ? ACTIVE_SECTION : ACTIVE_LINK))}
                    />
                    {showTools ? (
                      <div className="ml-2.5 flex flex-col gap-0.5 border-l border-sidebar-border pl-3">
                        {launchPadTools.map((tool) => (
                          <SidebarLink
                            key={tool.href}
                            link={tool}
                            className={cn(
                              "py-1.5 [&_span]:text-[13px]",
                              pathname === tool.href && ACTIVE_LINK
                            )}
                          />
                        ))}
                      </div>
                    ) : null}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </SidebarBody>
        <div className="flex flex-1 flex-col overflow-hidden bg-background md:rounded-l-3xl">
          {/* One header row on every size: menu and logo (phones only), search, then account actions. */}
          <header className="sticky top-0 z-10 flex shrink-0 items-center gap-2 border-b border-border/60 px-3 py-2 sm:gap-4 sm:px-6 md:border-b-0">
            <div className="flex items-center gap-1 md:flex-1">
              <MobileSidebarTrigger />
              {/* Hidden on the narrowest phones: the drawer behind the menu button carries the logo, and search needs the width. */}
              <span className="hidden sm:inline md:hidden">
                <LogoIcon href={dashboardHref} />
              </span>
            </div>
            <div className="flex min-w-0 flex-1 justify-center md:max-w-xl">
              <ConditionalSearchBar />
            </div>
            <div className="flex items-center justify-end gap-1 sm:gap-4 md:flex-1">
              <NotificationsDropdown />
              <ThemeToggle />
              <UserNav />
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto bg-dots">
            {children}
          </main>
        </div>
      </div>
    </Sidebar>
  );
}

export const Logo = ({ href }: { href: string }) => {
  return (
    <Link
      href={href}
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <BrandMark className="h-6 w-6" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        Career Wise
      </motion.span>
    </Link>
  );
};

export const LogoIcon = ({ href }: { href: string }) => {
  return (
    <Link
      href={href}
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <BrandMark className="h-6 w-6" />
    </Link>
  );
};
