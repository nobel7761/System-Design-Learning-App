"use client";

import React from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "icon";
type IconColor = "slate" | "blue" | "red";

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  iconColor?: IconColor;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "inline-flex items-center justify-center px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition disabled:opacity-50 disabled:cursor-not-allowed",
  secondary:
    "inline-flex items-center justify-center px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed",
  danger:
    "inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition disabled:opacity-60 disabled:cursor-not-allowed",
  ghost:
    "inline-flex items-center justify-center transition disabled:opacity-50",
  icon: "inline-flex items-center justify-center p-1.5 rounded transition",
};

const ICON_COLOR_CLASSES: Record<IconColor, string> = {
  slate: "text-slate-600 hover:bg-slate-100",
  blue: "text-blue-600 hover:bg-blue-50",
  red: "text-red-600 hover:bg-red-50",
};

export default function CustomButton({
  variant,
  iconColor = "slate",
  className,
  type = "button",
  children,
  ...rest
}: CustomButtonProps) {
  let base = "";
  if (variant) {
    base =
      variant === "icon"
        ? `${VARIANT_CLASSES.icon} ${ICON_COLOR_CLASSES[iconColor]}`
        : VARIANT_CLASSES[variant];
  }

  const computedClass =
    [base, className].filter(Boolean).join(" ") || undefined;

  return (
    <button type={type} className={computedClass} {...rest}>
      {children}
    </button>
  );
}
