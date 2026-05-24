import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("ErrorBoundary caught:", error, info);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false });
  };

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;
    return (
      <div className="flex flex-col items-center justify-center h-dvh w-full gap-3 p-6 text-fg">
        <h1 className="t-h2">Something went wrong.</h1>
        <p className="t-body-sm text-fg-muted">
          An unexpected error occurred. Reloading usually helps.
        </p>
        <button
          onClick={this.handleRetry}
          className="t-label rounded-md bg-surface-elevated px-3 py-1.5 hover:brightness-110"
        >
          Try again
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;
