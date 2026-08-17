import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error('App error:', error, info); }

  render() {
    if (!this.state.error) return this.props.children;
    const msg = this.state.error?.message || String(this.state.error);
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#fafafa', fontFamily: 'system-ui, sans-serif', padding: 24
      }}>
        <div style={{ maxWidth: 560, width: '100%', background: 'white', borderRadius: 16, padding: 40, boxShadow: '0 4px 24px rgba(0,0,0,.1)' }}>
          <h2 style={{ color: '#dc2626', marginBottom: 12 }}>⚠️ Something went wrong</h2>
          <pre style={{
            background: '#fee2e2', color: '#991b1b', padding: '12px 16px',
            borderRadius: 8, fontSize: 13, overflowX: 'auto', whiteSpace: 'pre-wrap', marginBottom: 20
          }}>{msg}</pre>
          <p style={{ color: '#6b7280', marginBottom: 16, fontSize: 14 }}>Common fixes:</p>
          <ul style={{ color: '#374151', fontSize: 14, paddingLeft: 20, lineHeight: 2 }}>
            <li>Make sure <strong>.env</strong> has your real Supabase URL and anon key</li>
            <li>Make sure you ran <strong>supabase-schema.sql</strong> in your Supabase SQL editor</li>
            <li>Check your browser console (F12) for more details</li>
          </ul>
          <button onClick={() => window.location.reload()} style={{
            marginTop: 20, padding: '10px 24px', background: '#7c3aed',
            color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14
          }}>Reload</button>
        </div>
      </div>
    );
  }
}
