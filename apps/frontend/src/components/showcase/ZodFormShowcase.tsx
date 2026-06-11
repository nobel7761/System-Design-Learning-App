"use client";

import { useState } from "react";
import { z } from "zod";
import {
  RHFZodForm,
  FormInput,
  FormTextarea,
  FormSelect,
  FormMultiSelect,
  FormRadioGroup,
  FormCheckbox,
  FormSwitch,
  FormSlider,
  FormDateInput,
  FormSubmitButton,
} from "@/components/shared/form";

// ---------------------------------------------------------------------------
// Zod schema — this is the single source of truth for validation + types
// ---------------------------------------------------------------------------

const schema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(6, "Enter a valid phone number"),
  age: z.coerce
    .number({ message: "Age is required" })
    .int("Must be a whole number")
    .min(18, "Must be 18 or older")
    .max(120, "Really?"),
  role: z.string().min(1, "Pick a role"),
  interests: z.array(z.string()).min(1, "Choose at least one interest"),
  plan: z.string().min(1, "Choose a plan"),
  birthDate: z.string().min(1, "Birth date is required"),
  satisfaction: z.coerce.number().min(0).max(100),
  bio: z.string().max(280, "Keep it under 280 characters").optional(),
  newsletter: z.boolean(),
  terms: z.boolean().refine((v) => v === true, {
    message: "You must accept the terms",
  }),
});

type FormValues = z.infer<typeof schema>;

const defaultValues: FormValues = {
  fullName: "",
  email: "",
  phone: "",
  age: 18,
  role: "",
  interests: [],
  plan: "free",
  birthDate: "",
  satisfaction: 50,
  bio: "",
  newsletter: true,
  terms: false,
};

const roleOptions = [
  { label: "Admin", value: "admin" },
  { label: "Manager", value: "manager" },
  { label: "Member", value: "member" },
  { label: "Viewer", value: "viewer" },
];

const interestOptions = [
  { label: "Engineering", value: "engineering" },
  { label: "Design", value: "design" },
  { label: "Marketing", value: "marketing" },
  { label: "Sales", value: "sales" },
  { label: "Operations", value: "operations" },
];

const planOptions = [
  { label: "Free — $0/mo", value: "free" },
  { label: "Pro — $29/mo", value: "pro" },
  { label: "Enterprise — let's talk", value: "enterprise" },
];

export function ZodFormShowcase() {
  const [submitted, setSubmitted] = useState<FormValues | null>(null);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Registration form
        </h2>
        <p className="mb-6 text-sm text-slate-500">
          Built with <code>RHFZodForm</code> + a Zod schema. Validation runs on
          blur and on submit. Try submitting empty to see field-level errors.
        </p>

        <RHFZodForm
          schema={schema}
          defaultValues={defaultValues}
          onSubmit={async (values) => {
            // simulate a request
            await new Promise((r) => setTimeout(r, 600));
            setSubmitted(values);
          }}
          className="space-y-5"
        >
          {() => (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                <FormInput name="fullName" label="Full name" required />
                <FormInput name="email" label="Email" type="email" required />
                <FormInput
                  name="phone"
                  label="Phone"
                  placeholder="+880 1XXX-XXXXXX"
                  required
                />
                <FormInput name="age" label="Age" type="number" required />
                <FormSelect
                  name="role"
                  label="Role"
                  options={roleOptions}
                  required
                />
                <FormDateInput name="birthDate" label="Birth date" required />
              </div>

              <FormMultiSelect
                name="interests"
                label="Interests"
                options={interestOptions}
                required
              />

              <FormRadioGroup
                name="plan"
                label="Plan"
                options={planOptions}
                required
              />

              <FormSlider
                name="satisfaction"
                label="Satisfaction"
                min={0}
                max={100}
                step={5}
              />

              <FormTextarea
                name="bio"
                label="Short bio"
                rows={3}
                hint="Optional — max 280 characters"
              />

              <div className="space-y-3">
                <FormSwitch
                  name="newsletter"
                  label="Send me product updates"
                  description="You can unsubscribe anytime."
                />
                <FormCheckbox
                  name="terms"
                  label="I accept the terms and conditions"
                  description="Required to create an account."
                />
              </div>

              <FormSubmitButton idleLabel="Create account" />
            </>
          )}
        </RHFZodForm>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-950 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-200">
          Submitted values
        </h3>
        <p className="mb-4 text-xs text-slate-400">
          The validated, type-safe payload appears here after a successful
          submit.
        </p>
        {submitted ? (
          <pre className="overflow-auto rounded-lg bg-slate-900 p-4 text-xs leading-relaxed text-emerald-300">
            {JSON.stringify(submitted, null, 2)}
          </pre>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-700 p-8 text-center text-sm text-slate-500">
            Nothing submitted yet.
          </div>
        )}
      </div>
    </div>
  );
}
