import { useNavigate, type NavigateFunction } from "react-router-dom";
import { useRoutes } from "react-router-dom";
import { useEffect, Suspense, Component, type ReactNode } from "react";
import routes from "./config";

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white p-8">
          <div className="text-center">
            <p className="text-red-600 font-medium mb-2">エラーが発生しました</p>
            <p className="text-sm text-gray-500 mb-4">{(this.state.error as Error).message}</p>
            <button onClick={() => { this.setState({ error: null }); window.location.reload(); }}
              className="px-4 py-2 bg-gray-900 text-white text-sm rounded hover:bg-gray-800">
              再読み込み
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

let navigateResolver: (navigate: ReturnType<typeof useNavigate>) => void;

declare global {
  interface Window {
    REACT_APP_NAVIGATE: ReturnType<typeof useNavigate>;
  }
}

export const navigatePromise = new Promise<NavigateFunction>((resolve) => {
  navigateResolver = resolve;
});

export function AppRoutes() {
  const element = useRoutes(routes);
  const navigate = useNavigate();
  useEffect(() => {
    window.REACT_APP_NAVIGATE = navigate;
    navigateResolver(window.REACT_APP_NAVIGATE);
  });
  return (
    <ErrorBoundary>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        {element}
      </Suspense>
    </ErrorBoundary>
  );
}
