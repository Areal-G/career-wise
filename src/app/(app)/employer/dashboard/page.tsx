"use client";

import { useAuth } from "@/context/AuthContext";
import { LumaSpin } from "@/components/ui/luma-spin";
import { Feed } from "@/components/ui/feed";
import { EmployerToday } from "@/components/today/employer-today";

export default function EmployerDashboardPage() {
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
      <EmployerToday />

      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Company updates</h2>
          <p className="text-muted-foreground">Share what your team is building. Posts show up for candidates.</p>
        </div>
        <Feed />
      </div>
    </div>
  );
}
