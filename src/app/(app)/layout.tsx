"use client";

import { SavedOpportunitiesProvider } from "@/context/SavedOpportunitiesContext";
import { CallProvider } from "@/context/CallContext";
import { ChatProvider } from "@/context/ChatContext";
import { EncryptionProvider } from "@/context/EncryptionContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { AppSidebar } from "@/components/app-sidebar";
import { IncomingCallModal } from "@/components/IncomingCallModal";
import { FEATURES } from "@/lib/brand";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/** Signed-in users without a profile (e.g. first Google sign-in) finish onboarding first. */
function OnboardingGate() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && user && !userProfile) router.replace("/onboarding");
  }, [loading, user, userProfile, router]);
  return null;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SavedOpportunitiesProvider>
      <OnboardingGate />
      <NotificationProvider>
        <EncryptionProvider>
          <ChatProvider>
            <CallProvider>
              <AppSidebar>{children}</AppSidebar>
              {FEATURES.videoCalls && <IncomingCallModal />}
            </CallProvider>
          </ChatProvider>
        </EncryptionProvider>
      </NotificationProvider>
    </SavedOpportunitiesProvider>
  );
}
