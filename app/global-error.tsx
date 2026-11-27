"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isDomReconciliationError =
    error.message?.includes("removeChild") ||
    error.message?.includes("insertBefore");

  useEffect(() => {
    if (isDomReconciliationError) {
      const timer = setTimeout(() => {
        reset();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isDomReconciliationError, reset]);

  return (
    <html lang="en" translate="no" className="notranslate">
      <body>
        {!isDomReconciliationError && (
          <div
            style={{
              minHeight: "100vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "1rem",
              padding: "2rem",
              textAlign: "center",
              background: "#050505",
              color: "#ffffff",
            }}
          >
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600 }}>
              Something went wrong
            </h2>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                padding: "0.5rem 1.25rem",
                borderRadius: "9999px",
                border: "1px solid currentColor",
                background: "transparent",
                color: "inherit",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        )}
      </body>
    </html>
  );
}
