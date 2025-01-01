"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusPage } from "@/components/status-page";

export default function NotFound() {
  return (
    <StatusPage
      code="404"
      message="The page you're looking for doesn't exist or has been moved."
      action={
        <Button variant="outline" size="lg" onClick={() => window.history.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      }
    />
  );
}
