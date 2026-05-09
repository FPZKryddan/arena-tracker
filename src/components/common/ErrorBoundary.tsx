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
      <div className="flex flex-col items-center justify-center h-dvh w-full gap-[12px] p-[24px] text-fg">
        <h1 className="text-[16px] font-bold">Something went wrong.</h1>
        <p className="text-[12px] text-fg-muted">
          An unexpected error occurred. Reloading usually helps.
        </p>
        <button
          onClick={this.handleRetry}
          className="rounded-md bg-surface-elevated px-[12px] py-[6px] text-[12px] hover:brightness-110"
        >
          Try again
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;
