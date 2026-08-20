import React from 'react';

/**
 * Global Error Boundary
 * Catches any React runtime crash and shows a readable error
 * instead of a completely blank page.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    console.error('[ErrorBoundary] Caught error:', error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, info: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const msg = this.state.error?.message || 'Unknown error';
      const stack = this.state.info?.componentStack || '';

      return (
        <div style={{
          minHeight: '100vh',
          background: '#EDE8DF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter, sans-serif',
          padding: '24px',
        }}>
          <div style={{
            background: '#fff',
            border: '1px solid #C4BEB3',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '640px',
            width: '100%',
            boxShadow: '0 4px 24px rgba(62,78,54,0.10)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '28px' }}>⚠️</span>
              <div>
                <h2 style={{ color: '#3E4E36', fontSize: '18px', fontWeight: 700, margin: 0 }}>
                  Something went wrong
                </h2>
                <p style={{ color: '#70624F', fontSize: '13px', margin: '4px 0 0' }}>
                  A component crashed. See details below.
                </p>
              </div>
            </div>

            <div style={{
              background: '#F8F7F4',
              border: '1px solid #D6CFC2',
              borderRadius: '10px',
              padding: '14px 16px',
              marginBottom: '16px',
            }}>
              <p style={{ color: '#C0392B', fontSize: '13px', fontWeight: 600, margin: '0 0 4px' }}>
                Error:
              </p>
              <code style={{ color: '#3E4E36', fontSize: '12px', wordBreak: 'break-word' }}>
                {msg}
              </code>
            </div>

            {stack && (
              <details style={{ marginBottom: '20px' }}>
                <summary style={{
                  cursor: 'pointer',
                  color: '#70624F',
                  fontSize: '12px',
                  fontWeight: 600,
                  marginBottom: '8px',
                }}>
                  Component Stack (click to expand)
                </summary>
                <pre style={{
                  background: '#F8F7F4',
                  border: '1px solid #D6CFC2',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '11px',
                  color: '#4A4A43',
                  overflowX: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}>
                  {stack}
                </pre>
              </details>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={this.handleReload}
                style={{
                  background: '#3E4E36',
                  color: '#EDE8DF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                🔄 Reload App
              </button>
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  background: 'transparent',
                  color: '#3E4E36',
                  border: '1px solid #C4BEB3',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                ↩ Go to Login
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
