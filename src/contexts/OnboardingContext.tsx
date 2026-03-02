"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useSession } from "next-auth/react";
import {
  getJourneyMap,
  type JourneyStep,
  type JourneyMap,
} from "@/lib/onboarding/journey-steps";
import JourneyDrawer from "@/components/onboarding/JourneyDrawer";
import JourneyFab from "@/components/onboarding/JourneyFab";
import ShepherdTour from "@/components/onboarding/ShepherdTour";

interface OnboardingContextType {
  journeyMap: JourneyMap | null;
  completedSteps: Set<string>;
  isDrawerOpen: boolean;
  isLoading: boolean;
  progress: number;
  isPreviewMode: boolean; // true when admin is impersonating another user
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  completeStep: (stepId: string) => void;
  dismissJourney: () => void;
  resetDismiss: () => void;
  startTour: () => void;
  markTourCompleted: () => void;
  markFirstLoginSeen: () => void;
  currentStep: JourneyStep | null;
  isFirstLogin: boolean;
  tourCompleted: boolean;
  isDismissed: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

export function OnboardingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [tourCompleted, setTourCompleted] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const fetchedRef = useRef(false);

  const user = session?.user as
    | { id?: string; role?: string; isImpersonating?: boolean; realAdminRole?: string }
    | undefined;
  const role = user?.role || "participant";
  const userId = user?.id;
  const isPreviewMode = !!user?.isImpersonating;

  const journeyMap = getJourneyMap(role);
  const effectiveSteps = journeyMap?.steps || [];

  // Re-fetch when user identity changes (e.g. impersonation start/stop)
  const prevUserIdRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (userId !== prevUserIdRef.current) {
      prevUserIdRef.current = userId;
      fetchedRef.current = false;
      // Reset state for the new user
      setCompletedSteps(new Set());
      setIsFirstLogin(false);
      setTourCompleted(false);
      setIsDismissed(false);
      setIsDrawerOpen(false);
      setIsLoading(true);
    }
  }, [userId]);

  // Fetch onboarding progress on mount and when user identity changes
  useEffect(() => {
    if (status !== "authenticated" || fetchedRef.current || !userId) return;
    fetchedRef.current = true;

    (async () => {
      try {
        const res = await fetch("/api/user/onboarding");
        const data = await res.json();
        if (data.success) {
          const dismissed = !!data.progress.dismissedAt;

          const merged = new Set<string>([
            ...(data.progress.completedSteps || []),
            ...(data.autoDetected || []),
          ]);
          setCompletedSteps(merged);
          setTourCompleted(data.progress.tourCompleted || false);

          if (dismissed) {
            setIsDismissed(true);
            setIsDrawerOpen(false);
          }

          // Don't auto-open or trigger first-login when impersonating or when dismissed
          if (!isPreviewMode && !dismissed) {
            if (!data.progress.firstLoginSeen) {
              setIsFirstLogin(true);
              setIsDrawerOpen(true);
            }
          }
        }
      } catch (e) {
        console.error("Failed to fetch onboarding progress", e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [status, userId, isPreviewMode]);

  // Calculate progress
  const completedCount = effectiveSteps.filter((s) =>
    completedSteps.has(s.id)
  ).length;
  const progress =
    effectiveSteps.length > 0
      ? Math.round((completedCount / effectiveSteps.length) * 100)
      : 100;

  const currentStep =
    effectiveSteps.find((s) => !completedSteps.has(s.id)) || null;

  // Helper: only persist changes when NOT impersonating
  const patchOnboarding = useCallback(
    (body: Record<string, unknown>) => {
      if (isPreviewMode) return; // Don't modify impersonated user's data
      fetch("/api/user/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).catch(() => {});
    },
    [isPreviewMode]
  );

  const completeStep = useCallback(
    async (stepId: string) => {
      setCompletedSteps((prev) => new Set([...prev, stepId]));
      patchOnboarding({ completeStep: stepId });
    },
    [patchOnboarding]
  );

  const dismissJourney = useCallback(async () => {
    setIsDismissed(true);
    setIsDrawerOpen(false);
    patchOnboarding({ dismiss: true });
  }, [patchOnboarding]);

  // Auto-dismiss journey permanently once all steps are complete
  useEffect(() => {
    if (isPreviewMode) return;
    if (!journeyMap) return;
    if (effectiveSteps.length === 0) return;
    if (isDismissed) return;

    const completedCount = effectiveSteps.filter((s) =>
      completedSteps.has(s.id)
    ).length;
    const allComplete = completedCount === effectiveSteps.length;

    if (allComplete) {
      setIsDismissed(true);
      setIsDrawerOpen(false);
      patchOnboarding({ dismiss: true });
    }
  }, [
    completedSteps,
    effectiveSteps,
    isDismissed,
    isPreviewMode,
    journeyMap,
    patchOnboarding,
  ]);

  const resetDismiss = useCallback(async () => {
    setIsDismissed(false);
    patchOnboarding({ resetDismiss: true });
  }, [patchOnboarding]);

  const markFirstLoginSeen = useCallback(async () => {
    setIsFirstLogin(false);
    patchOnboarding({ firstLoginSeen: true });
  }, [patchOnboarding]);

  const markTourCompleted = useCallback(async () => {
    setTourCompleted(true);
    patchOnboarding({ tourCompleted: true });
  }, [patchOnboarding]);

  const startTour = useCallback(() => {
    setIsDrawerOpen(false);
    // Small delay to let drawer close before tour starts
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("start-onboarding-tour"));
    }, 300);
  }, []);

  const value: OnboardingContextType = {
    journeyMap,
    completedSteps,
    isDrawerOpen,
    isLoading,
    progress,
    isPreviewMode,
    openDrawer: () => setIsDrawerOpen(true),
    closeDrawer: () => setIsDrawerOpen(false),
    toggleDrawer: () => setIsDrawerOpen((prev) => !prev),
    completeStep,
    dismissJourney,
    resetDismiss,
    startTour,
    markTourCompleted,
    markFirstLoginSeen,
    currentStep,
    isFirstLogin,
    tourCompleted,
    isDismissed,
  };

  // Only render onboarding UI for authenticated users with journey steps
  if (status !== "authenticated" || !journeyMap) {
    return <>{children}</>;
  }

  return (
    <OnboardingContext.Provider value={value}>
      {children}
      <JourneyDrawer />
      <JourneyFab />
      <ShepherdTour />
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}

/** Safe variant — returns null when outside provider (e.g. unauthenticated users). */
export function useOnboardingSafe() {
  return useContext(OnboardingContext) ?? null;
}
