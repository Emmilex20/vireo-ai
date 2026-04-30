"use client";

import { Joyride, STATUS, type EventData, type Step } from "react-joyride";
import { useState } from "react";

export function OnboardingTour() {
  const [run, setRun] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return !window.localStorage.getItem("vireon_onboarding_seen");
  });

  function handleFinish() {
    window.localStorage.setItem("vireon_onboarding_seen", "true");
    setRun(false);
  }

  const steps: Step[] = [
    {
      target: "body",
      content:
        "Welcome to Vireon AI. Let's quickly show you how to create visuals, manage credits, and explore the platform.",
      placement: "center"
    },
    {
      target: "[data-tour='studio']",
      content:
        "Start here to generate AI images and videos from your prompts."
    },
    {
      target: "[data-tour='credits']",
      content:
        "Credits power generation. You can buy more or subscribe whenever you need them."
    },
    {
      target: "[data-tour='gallery']",
      content:
        "Explore public creations from other users for inspiration and discovery."
    },
    {
      target: "[data-tour='projects']",
      content:
        "Build multi-scene video projects here and export full cinematic clips."
    }
  ];

  function handleEvent(data: EventData) {
    if (
      data.status === STATUS.FINISHED ||
      data.status === STATUS.SKIPPED
    ) {
      handleFinish();
    }
  }

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      onEvent={handleEvent}
      options={{
        buttons: ["back", "close", "primary", "skip"],
        primaryColor: "#6366f1",
        zIndex: 10000,
        showProgress: true
      }}
    />
  );
}
