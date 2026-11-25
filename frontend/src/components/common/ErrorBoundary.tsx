import React from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'An unexpected rendering error occurred.',
    };
  }

  handleReset = () => {
    this.setState({ hasError: false, message: '' });
  };

  override render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="p-6 rounded-2xl bg-red-950/40 border border-red-800 text-center space-y-3 my-6">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" aria-hidden="true" />
          <h2 className="text-lg font-bold text-white">Module Display Interruption</h2>
          <p className="text-sm text-neutral-300 max-w-md mx-auto">{this.state.message}</p>
          <button
            type="button"
            onClick={this.handleReset}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs inline-flex items-center space-x-2 transition"
          >
            <RotateCw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Reload Module</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
