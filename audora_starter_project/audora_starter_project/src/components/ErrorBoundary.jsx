import React, { Component } from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from './ui/Button';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-gradient-to-br from-dark-300 to-dark-500 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-dark-200/80 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-red-600/20 flex items-center justify-center mb-6">
                <AlertTriangle size={36} className="text-red-500" />
              </div>
              
              <h1 className="text-2xl font-bold text-white mb-3">Something went wrong</h1>
              
              <p className="text-gray-400 mb-4">
                We've encountered an unexpected error. Please try refreshing the page or going back to the home page.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="w-full mb-6">
                  <div className="bg-dark-400/50 rounded-lg p-4 text-left overflow-auto max-h-40 text-sm text-red-400 font-mono">
                    <p className="mb-2 text-white">{this.state.error.toString()}</p>
                    <pre className="text-xs text-gray-400 whitespace-pre-wrap">
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </div>
                </div>
              )}
              
              <div className="flex gap-4 mt-3">
                <Button 
                  variant="glass" 
                  onClick={this.handleGoHome}
                >
                  Go Home
                </Button>
                
                <Button 
                  variant="primary"
                  onClick={this.handleReload}
                >
                  Refresh Page
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 