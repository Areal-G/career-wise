"use client";

import { useEffect } from "react";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusPage } from "@/components/status-page";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusPage
      code="500"
      message="Something went wrong. Please try again or contact support if the problem persists."
      action={
        <Button variant="outline" size="lg" onClick={reset}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      }
    />
  );
}
