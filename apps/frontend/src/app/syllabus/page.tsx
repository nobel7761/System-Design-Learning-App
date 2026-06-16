import { Suspense } from "react";
import { SyllabusScreen } from "@/components/syllabus/SyllabusScreen";

export default function SyllabusPage() {
  return (
    <Suspense>
      <SyllabusScreen />
    </Suspense>
  );
}
