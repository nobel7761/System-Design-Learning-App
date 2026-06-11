"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "./utils";

type FormFieldProps = {
  label: string;
  required?: boolean;
  htmlFor?: string;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
};

export function FormField({
  label,
  required,
  htmlFor,
  hint,
  error,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium tracking-wide text-slate-700"
      >
        {label}
        {required ? (
          <span className="ml-1 text-(--form-error-main)">*</span>
        ) : null}
      </label>
      <div>{children}</div>
      <AnimatePresence initial={false} mode="wait">
        {error ? (
          <motion.p
            key="field-error"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="text-sm text-(--form-error-main)"
          >
            {error}
          </motion.p>
        ) : hint ? (
          <motion.p
            key="field-hint"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="text-sm text-slate-500"
          >
            {hint}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
