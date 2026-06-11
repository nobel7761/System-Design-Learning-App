"use client";

import { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log error to error reporting service in production
    if (process.env.NODE_ENV === "production") {
      // Example: log to error reporting service
      // logErrorToService(error);
    } else {
      console.error("Global application error:", error);
    }
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
            <div className="text-center">
              <div className="mb-4 text-6xl">🚨</div>
              <h1 className="mb-2 text-2xl font-bold text-gray-900">
                Critical Error
              </h1>
              <p className="mb-6 text-gray-600">
                {error.message ||
                  "A critical error occurred that prevented the application from loading"}
              </p>

              {process.env.NODE_ENV === "development" && error.stack && (
                <details className="mb-6 text-left">
                  <summary className="cursor-pointer text-sm font-semibold text-gray-700">
                    Error Details (Development Only)
                  </summary>
                  <pre className="mt-2 max-h-60 overflow-auto rounded bg-gray-100 p-4 text-xs text-gray-800">
                    {error.stack}
                  </pre>
                </details>
              )}

              <div className="flex gap-4">
                <button
                  onClick={reset}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  Try again
                </button>
                <button
                  onClick={() => (window.location.href = "/")}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Go home
                </button>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
