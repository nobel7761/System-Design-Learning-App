import { ShowcaseShell } from "@/components/showcase/ShowcaseShell";
import { ZodFormShowcase } from "@/components/showcase/ZodFormShowcase";

export default function FormPage() {
  return (
    <ShowcaseShell
      title="Zod form"
      description="A custom form built with RHFZodForm + a Zod schema from @/components/shared/form. Validation runs on blur and submit; the validated payload is shown alongside."
    >
      <ZodFormShowcase />
    </ShowcaseShell>
  );
}
