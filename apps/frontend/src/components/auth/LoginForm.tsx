"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import {
  RHFZodForm,
  FormInput,
  FormSubmitButton,
} from "@/components/shared/form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shared/shadcn";
import { useAuth } from "@/contexts/AuthContext";
import client from "@/lib/api/client";
import type { LoginResponse } from "@/lib/api/types";

const loginSchema = z.object({
  email: z.string().email("সঠিক email দিন"),
  password: z.string().min(6, "Password কমপক্ষে ৬ অক্ষরের"),
});

export function LoginForm() {
  const router = useRouter();
  const { setToken } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-amber-50 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="text-4xl">🎓</div>
          <CardTitle className="text-2xl">System Design Academy</CardTitle>
          <p className="text-sm text-slate-500">
            আজকের ৩০ মিনিট — login করে শুরু করো!
          </p>
        </CardHeader>
        <CardContent>
          <RHFZodForm
            schema={loginSchema}
            defaultValues={{ email: "", password: "" }}
            onSubmit={async (values) => {
              setServerError(null);
              try {
                const res = await client.post<LoginResponse>(
                  "/auth/login",
                  values,
                );
                setToken(res.data.accessToken);
                router.push("/");
              } catch (err: unknown) {
                const axiosErr = err as {
                  response?: { data?: { message?: string | string[] } };
                };
                const msg = axiosErr.response?.data?.message;
                setServerError(
                  (Array.isArray(msg) ? msg[0] : msg) ??
                    "Login failed — email/password ঠিক আছে কিনা দেখো",
                );
              }
            }}
            className="space-y-4"
          >
            {() => (
              <>
                <FormInput
                  name="email"
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
                <FormInput
                  name="password"
                  label="Password"
                  type="password"
                  showPasswordToggle
                  autoComplete="current-password"
                  required
                />
                {serverError && (
                  <p className="text-sm text-red-600">{serverError}</p>
                )}
                <FormSubmitButton
                  idleLabel="শুরু করি 🚀"
                  loadingLabel="ঢুকছি..."
                  className="w-full"
                />
              </>
            )}
          </RHFZodForm>
        </CardContent>
      </Card>
    </div>
  );
}
