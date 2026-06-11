"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactNode } from "react";
import { type DefaultValues, FormProvider, useForm } from "react-hook-form";
import type {
  FieldValues,
  Resolver,
  SubmitHandler,
  UseFormReturn,
} from "react-hook-form";
import type { z, ZodTypeAny } from "zod";

type FormValues<TSchema extends ZodTypeAny> = z.infer<TSchema>;

type RHFZodFormProps<TSchema extends ZodTypeAny> = {
  schema: TSchema;
  defaultValues: DefaultValues<FormValues<TSchema> & FieldValues>;
  onSubmit: SubmitHandler<FormValues<TSchema> & FieldValues>;
  children: (
    methods: UseFormReturn<FormValues<TSchema> & FieldValues>,
  ) => ReactNode;
  className?: string;
};

export function RHFZodForm<TSchema extends ZodTypeAny>({
  schema,
  defaultValues,
  onSubmit,
  children,
  className,
}: RHFZodFormProps<TSchema>) {
  type Values = FormValues<TSchema> & FieldValues;

  const methods = useForm<Values>({
    resolver: zodResolver(schema as never) as unknown as Resolver<Values>,
    defaultValues,
    mode: "onBlur",
  });

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className={["form-primary-theme", className ?? ""].join(" ").trim()}
        noValidate
      >
        {children(methods)}
      </form>
    </FormProvider>
  );
}
