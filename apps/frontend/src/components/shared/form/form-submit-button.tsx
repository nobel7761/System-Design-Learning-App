"use client";

import { motion } from "framer-motion";
import { useFormContext } from "react-hook-form";

type FormSubmitButtonProps = {
  idleLabel?: string;
  loadingLabel?: string;
  className?: string;
};

export function FormSubmitButton({
  idleLabel = "Submit",
  loadingLabel = "Submitting...",
  className,
}: FormSubmitButtonProps) {
  const {
    formState: { isSubmitting },
  } = useFormContext();

  return (
    <motion.button
      type="submit"
      whileTap={{ scale: 0.98 }}
      disabled={isSubmitting}
      style={{
        background: "var(--primary-main)",
        color: "var(--primary-contrast)",
      }}
      className={[
        "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold shadow-lg transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-xl",
        "disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0",
        className ?? "",
      ].join(" ")}
    >
      {isSubmitting ? loadingLabel : idleLabel}
    </motion.button>
  );
}
