"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useController, useFormContext } from "react-hook-form";
import { FormField } from "./form-field";
import { cn } from "./utils";

type FormFileUploadProps = {
  name: string;
  label: string;
  accept?: string;
  required?: boolean;
  hint?: string;
  className?: string;
};

export function FormFileUpload({
  name,
  label,
  accept = "image/*",
  required,
  hint,
  className,
}: FormFileUploadProps) {
  const { control } = useFormContext();
  const { field, fieldState } = useController({ name, control });
  const file = field.value as File | null;
  const objectUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    setPreviewUrl(objectUrl);
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  return (
    <FormField
      label={label}
      required={required}
      hint={hint}
      error={fieldState.error?.message}
      className={className}
    >
      <div
        className={cn(
          "rounded-xl border border-dashed bg-white/70 p-4",
          fieldState.error ? "border-(--form-error-main)" : "border-slate-300",
        )}
      >
        <input
          type="file"
          accept={accept}
          onBlur={field.onBlur}
          onChange={(event) => {
            const selectedFile = event.target.files?.[0] ?? null;
            field.onChange(selectedFile);
          }}
          className="w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-(--primary-soft) file:px-3 file:py-2 file:text-sm file:font-semibold file:text-(--primary-main) hover:file:bg-(--primary-soft)"
        />
        {file ? (
          <p className="mt-2 text-sm text-slate-600">
            Selected:{" "}
            <span className="font-medium text-slate-800">{file.name}</span>
          </p>
        ) : null}
        {previewUrl ? (
          <div className="relative mt-3 h-28 w-28 overflow-hidden rounded-xl ring-2 ring-(--primary-main-200)">
            <Image
              src={previewUrl}
              alt="Uploaded preview"
              fill
              className="object-cover"
            />
          </div>
        ) : null}
      </div>
    </FormField>
  );
}
