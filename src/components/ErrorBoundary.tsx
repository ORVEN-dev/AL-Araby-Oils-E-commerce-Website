import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Last line of defence. Without this, anything thrown during render — a bad
 * localStorage payload, a null product, a lazy chunk that fails to parse —
 * unmounts the whole tree to a blank white page with no way back.
 */
class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    // `esbuild.drop` strips this in production; it is here for local debugging.
    console.error("Unhandled render error:", error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        role="alert"
        className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background px-6 text-center"
      >
        <p className="text-2xl font-bold text-primary">Alaraby Oils</p>
        <h1 className="text-xl font-semibold text-foreground">Something went wrong</h1>
        <p className="max-w-md text-muted-foreground">
          We hit an unexpected error while loading this page. Reloading usually clears it.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-full bg-primary px-8 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Reload the page
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;
