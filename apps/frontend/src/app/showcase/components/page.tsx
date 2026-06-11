import { ShadcnGallery } from "@/components/showcase/ShadcnGallery";
import { ShowcaseShell } from "@/components/showcase/ShowcaseShell";

export default function ShadcnComponentsPage() {
  return (
    <ShowcaseShell
      title="shadcn/ui components"
      description="All 56 shadcn/ui primitives installed in this project, generated with the new-york style on Tailwind v4. Imported from @/components/shared/shadcn."
    >
      <ShadcnGallery />
    </ShowcaseShell>
  );
}
