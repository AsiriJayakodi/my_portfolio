"use client";

import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Catches transient WebGL / React 19 DOM reconciliation errors (such as
 * `Cannot read properties of null (reading 'removeChild')` during HMR or
 * browser extension DOM mutations) so they never crash the entire page.
 */
export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    const isTransientDomError =
      error.message?.includes("removeChild") ||
      error.message?.includes("insertBefore");

    if (isTransientDomError) {
      // Auto-recover on the next frame so WebGL/children remount cleanly
      requestAnimationFrame(() => {
        this.setState({ hasError: false });
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}
