import { MISSING_ENV } from '@/lib/supabase';

export default function EnvCheck({ children }) {
  if (!MISSING_ENV) return children;

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #ea580c 100%)',
      fontFamily: 'system-ui, sans-serif', padding: '24px'
    }}>
      <div style={{
        background: 'white', borderRadius: '24px', padding: '48px',
        maxWidth: '560px', width: '100%', boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16,
          background: 'linear-gradient(135deg, #7c3aed, #ea580c)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 24, fontSize: 28
        }}>🛠️</div>

        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#111', marginBottom: 8 }}>
          Setup Required
        </h1>
        <p style={{ color: '#6b7280', marginBottom: 32, lineHeight: 1.6 }}>
          Campus Marketplace needs your Supabase credentials to run. Follow these steps:
        </p>

        {[
          { step: '1', title: 'Create a Supabase project', body: <>Go to <a href="https://supabase.com" target="_blank" style={{ color: '#7c3aed' }}>supabase.com</a> → New Project</> },
          { step: '2', title: 'Run the database schema', body: 'Open supabase-schema.sql from the zip, paste it into Supabase → SQL Editor → Run' },
          { step: '3', title: 'Create storage buckets', body: 'Supabase → Storage → New Bucket. Create: listing-images, store-assets, avatars (all Public)' },
          { step: '4', title: 'Add your credentials to .env', body: null, code: true },
        ].map(s => (
          <div key={s.step} style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              background: '#7c3aed', color: 'white', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14
            }}>{s.step}</div>
            <div>
              <p style={{ fontWeight: 600, color: '#111', marginBottom: 4 }}>{s.title}</p>
              {s.code ? (
                <pre style={{
                  background: '#1e1e2e', color: '#cdd6f4', padding: '12px 16px',
                  borderRadius: 8, fontSize: 13, overflowX: 'auto', margin: 0
                }}>{`VITE_SUPABASE_URL=https://xxxx.supabase.co\nVITE_SUPABASE_ANON_KEY=eyJhbGci...`}</pre>
              ) : (
                <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>{s.body}</p>
              )}
            </div>
          </div>
        ))}

        <div style={{
          background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 12,
          padding: '12px 16px', marginTop: 8
        }}>
          <p style={{ color: '#166534', fontSize: 14, margin: 0 }}>
            💡 After editing .env, restart with <code style={{ background: '#dcfce7', padding: '2px 6px', borderRadius: 4 }}>npm run dev</code>
          </p>
        </div>
      </div>
    </div>
  );
}
