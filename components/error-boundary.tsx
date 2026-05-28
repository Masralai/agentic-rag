"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex items-center justify-center min-h-[200px] text-text-muted">
            <div className="text-center">
              <p className="text-sm font-medium">Something went wrong</p>
              <p className="text-xs mt-1 text-text-muted">
                {this.state.error?.message || "An unexpected error occurred"}
              </p>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
