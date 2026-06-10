"use client";

import { IntakeForm } from "@/components/studio/IntakeForm";
import { StudioView } from "@/components/studio/StudioView";
import { LandingHero } from "@/components/studio/LandingHero";
import { StoreHydration } from "@/components/studio/StoreHydration";
import { useStudioStore } from "@/lib/store";

export default function HomePage() {
  const step = useStudioStore((s) => s.step);

  return (
    <StoreHydration>
      {step === "studio" ? (
        <StudioView />
      ) : (
        <div className="bg-grid min-h-[calc(100vh-56px)]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
            <LandingHero />
            <IntakeForm />
          </div>
        </div>
      )}
    </StoreHydration>
  );
}
