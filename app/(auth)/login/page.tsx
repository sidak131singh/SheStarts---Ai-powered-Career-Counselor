'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { useUserStore } from '@/store/userStore';

const inp = {
  width: '100%', border: '1.5px solid #D4E5E5', borderRadius: 6, padding: '12px 14px',
  fontSize: '0.9rem', fontWeight: 600, outline: 'none', color: '#0B3540', background: '#fff',
  fontFamily: "'Barlow', sans-serif",
};

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useUserStore();
  const [email, setEmail] = useState('');
  const [name,  setName]  = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const e = email.trim();
    if (!e) return;
    setIsLoading(true);
    setUser(e, name.trim() || undefined);
    router.push('/assessment');
  };

  const handleDemoLogin = () => {
    setUser('priya.sharma@shestarts.demo', 'Priya Sharma');
    router.push('/dashboard');
  };

  return (
    <main style={{ minHeight: '100vh', background: '#0B3540', display: 'flex', fontFamily: "'Barlow', sans-serif", fontWeight: 600 }}>
      {/* Left: image */}
      <div style={{ flex: '1 1 50%', position: 'relative', display: 'none' }} className="lg:block">
        <Image src="/images/1.png" alt="Professional woman" fill style={{ objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent 60%, #0B3540 100%)' }} />
        <div style={{ position: 'absolute', bottom: 60, left: 40 }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '2.5rem', textTransform: 'uppercase', color: '#E2D400', lineHeight: 1.1 }}>
            YOUR COMEBACK<br />STARTS HERE
          </div>
        </div>
      </div>

      {/* Right: form */}
      <div style={{ flex: '1 1 50%', maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 40px' }}>
        <Link href="/" style={{ textDecoration: 'none', marginBottom: 40, display: 'block' }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '1.6rem', lineHeight: 1 }}>
            <span style={{ color: '#00C4BA' }}>SHE</span><span style={{ color: '#E2D400' }}>STARTS</span>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em' }}>CAREER COMPASS</div>
        </Link>

        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '2.2rem', textTransform: 'uppercase', color: '#fff', marginBottom: 6 }}>WELCOME BACK</h1>
          <p style={{ color: '#7EC8C4', fontSize: '0.9rem', fontWeight: 600 }}>Continue your career restart journey</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.1em', color: '#7EC8C4', marginBottom: 6, textTransform: 'uppercase' }}>Your Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Priya Sharma" style={inp} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.1em', color: '#7EC8C4', marginBottom: 6, textTransform: 'uppercase' }}>Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="priya@example.com" required style={inp} />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            style={{ background: '#E2D400', color: '#0B3540', fontWeight: 800, fontSize: '0.9rem', padding: '14px', borderRadius: 6, border: 'none', cursor: 'pointer', letterSpacing: '0.06em', fontFamily: "'Barlow Condensed', sans-serif", marginTop: 4, opacity: isLoading ? 0.6 : 1 }}
          >
            {isLoading ? 'LOADING...' : 'CONTINUE TO ASSESSMENT'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', fontWeight: 700 }}>OR</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
        </div>

        <button
          onClick={handleDemoLogin}
          style={{ border: '1.5px solid rgba(0,196,186,0.4)', color: '#00C4BA', fontWeight: 800, fontSize: '0.85rem', padding: '12px', borderRadius: 6, background: 'transparent', cursor: 'pointer', letterSpacing: '0.06em', fontFamily: "'Barlow', sans-serif" }}
        >
          LOAD DEMO ACCOUNT (PRIYA SHARMA)
        </button>

        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', marginTop: 24, fontWeight: 600 }}>
          New here?{' '}
          <Link href="/signup" style={{ color: '#E2D400', fontWeight: 800, textDecoration: 'none' }}>Create your free account</Link>
        </p>
      </div>
    </main>
  );
}
