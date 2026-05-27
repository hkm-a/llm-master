import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-secondary-50">
          <div className="max-w-md w-full mx-4">
            <div className="bg-white rounded-2xl shadow-sm border border-secondary-200 p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>

              <h2 className="text-xl font-bold text-secondary-900 mb-2">
                出错了
              </h2>

              <p className="text-secondary-600 mb-6">
                应用程序遇到了意外错误。请尝试刷新页面。
              </p>

              {this.state.error && (
                <details className="mb-6 text-left">
                  <summary className="text-sm text-secondary-500 cursor-pointer hover:text-secondary-700">
                    错误详情
                  </summary>
                  <pre className="mt-2 p-3 bg-secondary-50 rounded-lg text-xs text-secondary-700 overflow-auto max-h-32">
                    {this.state.error.message}
                  </pre>
                </details>
              )}

              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                重试
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
