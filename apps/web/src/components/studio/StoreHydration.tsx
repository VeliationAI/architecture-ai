"use client";

import { useEffect, useState } from "react";
import { useStudioStore } from "@/lib/store";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function StoreHydration({ children }: { children: React.ReactNode }) {
  const hasHydrated = useStudioStore((s) => s._hasHydrated);
  const reset = useStudioStore((s) => s.reset);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const finish = () => useStudioStore.setState({ _hasHydrated: true });

    const unsub = useStudioStore.persist.onFinishHydration(finish);
    void useStudioStore.persist.rehydrate();

    const timer = window.setTimeout(() => {
      if (!useStudioStore.getState()._hasHydrated) {
        setTimedOut(true);
        finish();
      }
    }, 3000);

    return () => {
      unsub();
      window.clearTimeout(timer);
    };
  }, []);

  if (!hasHydrated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" />
        <p className="text-sm text-[var(--muted)]">Loading your studio...</p>
        {timedOut && (
          <Button size="sm" variant="outline" onClick={reset}>
            Reset session
          </Button>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
