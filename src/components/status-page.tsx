"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const CAT_ANIMATION = "https://lottie.host/8cf4ba71-e5fb-44f3-8134-178c4d389417/0CCsdcgNIP.json";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.7, ease: "easeOut" as const },
});

interface StatusPageProps {
  code: string;
  message: string;
  /** Secondary action shown next to the Home button. */
  action: ReactNode;
}

/** Full-screen status screen shared by the 404 and error boundaries. */
export function StatusPage({ code, message, action }: StatusPageProps) {
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background px-4 text-center">
      <div
        className="pointer-events-none absolute inset-0 bg-dots [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 flex flex-col items-center">
        <motion.div {...fadeUp(0)} className="h-28 w-28 md:h-36 md:w-36">
          <DotLottieReact src={CAT_ANIMATION} loop autoplay />
        </motion.div>

        <motion.h1
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          className="select-none text-[6rem] font-black leading-none tracking-tight text-primary md:text-[8rem]"
        >
          {code}
        </motion.h1>

        <motion.p {...fadeUp(0.4)} className="mb-8 mt-3 max-w-lg text-lg text-muted-foreground md:text-xl">
          {message}
        </motion.p>

        <motion.div {...fadeUp(0.6)} className="flex flex-wrap justify-center gap-3">
          {action}
          <Button asChild size="lg">
            <Link href="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Link>
          </Button>
        </motion.div>
      </div>
    </main>
  );
}
