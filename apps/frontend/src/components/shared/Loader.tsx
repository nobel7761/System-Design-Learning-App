"use client";

type LoaderProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZE = {
  sm: "w-5 h-5 border-2",
  md: "w-8 h-8 border-[3px]",
  lg: "w-12 h-12 border-4",
};

export default function Loader({ size = "md", className = "" }: LoaderProps) {
  return (
    <div
      className={`${SIZE[size]} rounded-full border-slate-200 border-t-indigo-600 animate-spin ${className}`}
    />
  );
}
