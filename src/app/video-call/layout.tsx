"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FEATURES } from "@/lib/brand";

import { CallProvider } from "@/context/CallContext";
import { EncryptionProvider } from "@/context/EncryptionContext";

// Minimal layout for video call - no sidebar, fullscreen
export default function VideoCallLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    if (!FEATURES.videoCalls) router.replace("/inbox");
  }, [router]);
  if (!FEATURES.videoCalls) return null;
  return (
    <EncryptionProvider>
      <CallProvider>
        <div className="fixed inset-0 bg-black">
          {children}
        </div>
      </CallProvider>
    </EncryptionProvider>
  );
}
