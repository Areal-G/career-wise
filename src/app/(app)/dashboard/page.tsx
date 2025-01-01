"use client";
import { useAuth } from "@/context/AuthContext";
import { LumaSpin } from "@/components/ui/luma-spin";
import { Feed } from "@/components/ui/feed";
import { SeekerToday } from "@/components/today/seeker-today";

export default function DashboardPage() {
  const { loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center min-h-[60vh]">
        <LumaSpin />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-10">
      <SeekerToday />

      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Company updates</h2>
          <p className="text-muted-foreground">News from companies you follow and people in your field.</p>
        </div>
        <Feed />
      </div>
    </div>
  );
}
