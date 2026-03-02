"use client";

import { useEffect, useRef } from "react";
import Shepherd from "shepherd.js";
import "shepherd.js/dist/css/shepherd.css";
import "@/styles/shepherd-overrides.css";
import { useOnboarding } from "@/contexts/OnboardingContext";

export default function ShepherdTour() {
  const { journeyMap, markTourCompleted } = useOnboarding();
  const tourRef = useRef<InstanceType<typeof Shepherd.Tour> | null>(null);

  useEffect(() => {
    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        classes: "mongohacks-shepherd-step",
        scrollTo: { behavior: "smooth", block: "center" },
        cancelIcon: { enabled: true },
        modalOverlayOpeningPadding: 8,
        modalOverlayOpeningRadius: 8,
      },
    });

    // Build steps from journey config
    const tourSteps = (journeyMap?.steps || [])
      .filter((s) => s.tourAnchorSelector && s.tourText)
      .map((step, index, arr) => ({
        id: step.id,
        title: step.title,
        text: step.tourText!,
        attachTo: {
          element: step.tourAnchorSelector!,
          on: "bottom" as const,
        },
        buttons: [
          ...(index > 0
            ? [
                {
                  text: "Back",
                  classes: "shepherd-button-secondary",
                  action: () => tour.back(),
                },
              ]
            : []),
          {
            text: index === arr.length - 1 ? "Finish" : "Next",
            classes: "shepherd-button-primary",
            action: () => tour.next(),
          },
        ],
      }));

    tourSteps.forEach((s) => tour.addStep(s));

    tour.on("complete", () => markTourCompleted());
    tour.on("cancel", () => markTourCompleted());

    tourRef.current = tour;

    const handleStart = () => {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        if (tourSteps.length > 0) {
          tour.start();
        }
      }, 100);
    };

    window.addEventListener("start-onboarding-tour", handleStart);

    return () => {
      window.removeEventListener("start-onboarding-tour", handleStart);
      try {
        tour.cancel();
      } catch {
        // Tour may not be active
      }
    };
  }, [journeyMap, markTourCompleted]);

  return null;
}
