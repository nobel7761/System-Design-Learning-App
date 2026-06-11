"use client";

import { useController, useFormContext } from "react-hook-form";
import { PhoneCountryField } from "@/components/PhoneCountryField";

type FormPhoneCountryFieldProps = {
  name: string;
  label: React.ReactNode;
  required?: boolean;
  className?: string;
};

export function FormPhoneCountryField({
  name,
  label,
  required,
  className,
}: FormPhoneCountryFieldProps) {
  const { control } = useFormContext();
  const { field, fieldState } = useController({ name, control });

  return (
    <div className={className}>
      <PhoneCountryField
        id={name}
        label={label}
        required={required}
        value={field.value ?? ""}
        onChange={field.onChange}
        hasError={!!fieldState.error}
        errorMessage={fieldState.error?.message}
      />
    </div>
  );
}
