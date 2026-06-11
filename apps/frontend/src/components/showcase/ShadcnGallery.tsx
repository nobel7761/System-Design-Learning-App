"use client";

import { Toaster, TooltipProvider } from "@/components/shared/shadcn";
import { ButtonsSection } from "./gallery/buttons-section";
import { InputsSection } from "./gallery/inputs-section";
import { OverlaysSection } from "./gallery/overlays-section";
import { MenusSection } from "./gallery/menus-section";
import { DisplaySection } from "./gallery/display-section";
import { FeedbackSection } from "./gallery/feedback-section";
import { NavigationSection } from "./gallery/navigation-section";

export function ShadcnGallery() {
  return (
    <TooltipProvider>
      <div className="space-y-12">
        <ButtonsSection />
        <InputsSection />
        <OverlaysSection />
        <MenusSection />
        <DisplaySection />
        <FeedbackSection />
        <NavigationSection />
      </div>
      <Toaster richColors position="bottom-right" />
    </TooltipProvider>
  );
}
