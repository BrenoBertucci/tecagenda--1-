import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';


class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  state: { hasError: boolean, error: Error | null } = { hasError: false, error: null };
  props: { children: React.ReactNode };

  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.props = props;
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', color: '#dc2626', fontFamily: 'sans-serif' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Erro Crítico na Aplicação</h1>
          <div style={{ backgroundColor: '#fee2e2', padding: '1rem', borderRadius: '0.5rem', overflow: 'auto' }}>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error?.toString()}</pre>
            <br />
            <pre style={{ fontSize: '0.875rem' }}>{this.state.error?.stack}</pre>
          </div>
          <p style={{ marginTop: '1rem', color: '#4b5563' }}>Verifique o console do navegador (F12) para mais detalhes.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);