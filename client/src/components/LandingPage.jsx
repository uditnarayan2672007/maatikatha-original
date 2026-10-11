import React, { useState, useEffect, useRef } from 'react';
import { signInWithEmail, signUpWithEmail, signInWithGoogle, formatUser } from '../lib/supabase.js';
import LanguageSelector from './LanguageSelector.jsx';
import { LANDING_PAGE_TRANSLATIONS } from '../data/translations.js';

const FEATURES = [
  { icon:'🎙️', title:'AI Voice Doctor', subtitle:'Clinical Diagnosis by Voice', desc:'Describe your crop symptoms in any language. Gemini Flash AI delivers a full clinical pathology report, treatment protocol, and organic-remedy dosage in seconds — no hardware required.', color:'#22c55e', glow:'rgba(34,197,94,0.35)' },
  { icon:'⏳', title:'Generational Time Machine', subtitle:"Reconstruct Your Field's Past", desc:'Upload a photo of your field and select any decade. Our AI reconstructs how your soil, crops, and microclimate looked in that era using real decadal benchmarks and carbon-cycle models.', color:'#818cf8', glow:'rgba(129,140,248,0.35)' },
  { icon:'🧠', title:'Decision Simulator', subtitle:'What-If Scenario Engine', desc:'Simulate multi-season farming decisions before you plant. Compare soil carbon, yield ROI, water footprint, and profitability across dozens of crop-rotation strategies.', color:'#f59e0b', glow:'rgba(245,158,11,0.35)' },
  { icon:'🌦️', title:'Ritu Rakhok', subtitle:'Seasonal Shield & Forecast', desc:'Hyper-local 7-day agro-weather with monsoon onset prediction, frost alerts, and pest pressure index. Real-time OpenWeatherMap data fused with historical patterns.', color:'#38bdf8', glow:'rgba(56,189,248,0.35)' },
  { icon:'📡', title:'Khamar Drishti Radar', subtitle:'Soil Intelligence at a Glance', desc:'A live soil-health radar plot — pH, NPK balance, organic carbon, moisture — rendered as an interactive pentagon chart so you know exactly what your soil lacks.', color:'#f87171', glow:'rgba(248,113,113,0.35)' },
  { icon:'🌱', title:'Ancestral Seeds Vault', subtitle:'Heirloom Crop Database', desc:"Explore thousands of indigenous, heirloom, and rare seed varieties. Filter by region, drought tolerance, yield, and season to rediscover nature's genetic wealth.", color:'#a3e635', glow:'rgba(163,230,53,0.35)' },
  { icon:'🏪', title:'Mandi Market', subtitle:'Live Wholesale Price Board', desc:'Real-time APMC mandi prices for 500+ commodities across India. Price trend charts, arrival volume, and instant SMS export for offline access.', color:'#fb923c', glow:'rgba(251,146,60,0.35)' },
  { icon:'👁️', title:'Computer Vision Analysis', subtitle:'Photo-Powered Crop Scanning', desc:'Point your camera at any leaf, root, or soil sample. Our Vision AI identifies disease, pest damage, or deficiency with 94% accuracy and prescribes an action plan.', color:'#c084fc', glow:'rgba(192,132,252,0.35)' },
];

const STATS = [
  { value:'2.4M+', label:'Farmers Empowered', icon:'👨‍🌾' },
  { value:'94%', label:'AI Diagnosis Accuracy', icon:'🎯' },
  { value:'500+', label:'Crop Varieties Tracked', icon:'🌾' },
  { value:'28 States', label:'Pan-India Coverage', icon:'🗺️' },
];

const TESTIMONIALS = [
  { name:'Ravi Shankar Patel', location:'Vidarbha, Maharashtra', crop:'Cotton & Soybean Farmer', quote:'The Voice Doctor diagnosed my cotton wilt in 30 seconds. I saved my entire crop this Kharif season. This app is a revolution for small farmers like me.', avatar:'👨‍🌾', rating:5 },
  { name:'Lakshmi Devi', location:'Thanjavur, Tamil Nadu', crop:'Paddy & Sugarcane', quote:"Time Machine showed me how my grandfather's fields looked 40 years ago. That insight helped me restore soil health using traditional techniques combined with AI.", avatar:'👩‍🌾', rating:5 },
  { name:'Gurpreet Singh', location:'Ludhiana, Punjab', crop:'Wheat & Maize', quote:'The Decision Simulator saved me Rs. 1.2 lakh last Rabi season by steering me away from a costly crop rotation that would have failed. No other tool does this.', avatar:'👨‍🌾', rating:5 },
];

const INDIAN_STATES = ['Andhra Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal'];

function AuthInput({ icon, type, placeholder, value, onChange }) {
  return (
    <div style={{ position:'relative' }}>
      <span style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', fontSize:'1rem', pointerEvents:'none' }}>{icon}</span>
      <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
        style={{ width:'100%', padding:'12px 14px 12px 40px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px', color:'#fff', fontSize:'0.88rem', outline:'none', fontFamily:'inherit', transition:'border-color 0.2s' }}
        onFocus={e => { e.target.style.borderColor='#22c55e'; e.target.style.background='rgba(34,197,94,0.05)'; }}
        onBlur={e => { e.target.style.borderColor='rgba(255,255,255,0.1)'; e.target.style.background='rgba(255,255,255,0.06)'; }} />
    </div>
  );
}

function LoadingDots() {
  return (
    <span style={{ display:'flex', gap:'4px', alignItems:'center' }}>
      {[0,1,2].map(i => <span key={i} style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#fff', display:'inline-block', animation:`ldB 0.8s ${i*0.15}s infinite` }} />)}
    </span>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  );
}

function AuthModal({ mode, onClose, onAuthSuccess }) {
  const [tab, setTab] = useState(mode || 'login');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '', state: '' });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [step, setStep] = useState(1);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleGoogleSignIn = async () => {
    setError('');
    setNotice('');
    setGoogleLoading(true);
    try {
      // Directly trigger the OAuth redirect — Supabase SDK handles everything
      await signInWithGoogle();
      // Browser will redirect to Google. If we reach here, something went wrong silently.
    } catch (err) {
      console.error('[Google OAuth error]:', err);
      setError(err.message || 'Failed to start Google sign-in. Please try again.');
      setGoogleLoading(false);
    }
    // Note: setGoogleLoading(false) is NOT called on success
    // because the browser redirects away to Google's login page.
  };

  const doLogin = async e => {
    e.preventDefault();
    setError('');
    setNotice('');
    if (!form.email || !form.password) {
      setError('Please fill in both email and password.');
      return;
    }
    setLoading(true);
    try {
      // 1. Primary: Supabase email authentication
      const data = await signInWithEmail(form.email, form.password);
      if (data?.user) {
        const userObj = formatUser(data.user);
        localStorage.setItem('mk_token', data.session?.access_token || 'sb_token');
        localStorage.setItem('mk_user', JSON.stringify(userObj));
        onAuthSuccess(userObj);
        return;
      }
    } catch (sbErr) {
      console.warn('[Supabase Login error, attempting MongoDB fallback]:', sbErr.message);
      // Fallback: Check existing MongoDB user
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email, password: form.password }),
        });
        const data = await res.json();
        if (res.ok && data.user) {
          localStorage.setItem('mk_token', data.token);
          localStorage.setItem('mk_user', JSON.stringify(data.user));
          onAuthSuccess(data.user);
          return;
        }
      } catch (_) {}
      if (sbErr.message && sbErr.message.toLowerCase().includes('email not confirmed')) {
        setError('Please verify your email address before logging in. Check your inbox for the confirmation email, or use Continue with Google.');
      } else {
        setError(sbErr.message || 'Login failed. Please verify credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const doRegister = async e => {
    e.preventDefault();
    setError('');
    setNotice('');
    if (step === 1) {
      if (!form.name || !form.email) {
        setError('Full Name and Email are required.');
        return;
      }
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
      if (!emailOk) {
        setError('Please enter a valid email address.');
        return;
      }
      setStep(2);
    } else {
      if (!form.password || form.password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      setLoading(true);
      try {
        const data = await signUpWithEmail(form.email, form.password, {
          name: form.name,
          phone: form.phone,
          state: form.state,
        });

        // Mirror to MongoDB backend for analytics / sync
        fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
            phone: form.phone,
            state: form.state,
          }),
        }).catch(() => {});

        if (data?.session && data?.user) {
          const userObj = formatUser(data.user);
          localStorage.setItem('mk_token', data.session.access_token);
          localStorage.setItem('mk_user', JSON.stringify(userObj));
          onAuthSuccess(userObj);
        } else if (data?.user) {
          setNotice('Registration successful! Please check your email to verify your address, then sign in.');
          setTab('login');
          setStep(1);
        }
      } catch (sbErr) {
        console.warn('[Supabase Register error, attempting MongoDB fallback]:', sbErr.message);
        try {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: form.name,
              email: form.email,
              password: form.password,
              phone: form.phone,
              state: form.state,
            }),
          });
          const data = await res.json();
          if (res.ok && data.user) {
            localStorage.setItem('mk_token', data.token);
            localStorage.setItem('mk_user', JSON.stringify(data.user));
            onAuthSuccess(data.user);
            return;
          }
        } catch (_) {}
        setError(sbErr.message || 'Registration failed.');
      } finally {
        setLoading(false);
      }
    }
  };

  const btnS = loading => ({
    background: loading ? 'rgba(21,128,61,0.5)' : 'linear-gradient(135deg,#15803d,#166534)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    padding: '14px',
    fontWeight: '800',
    fontSize: '0.95rem',
    cursor: loading ? 'not-allowed' : 'pointer',
    marginTop: '4px',
    boxShadow: loading ? 'none' : '0 4px 20px rgba(21,128,61,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: 'inherit',
    width: '100%',
    transition: 'all 0.2s ease',
  });

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'linear-gradient(145deg,#0a2612,#071a0d)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '24px', padding: '36px', width: '100%', maxWidth: '480px', boxShadow: '0 0 60px rgba(34,197,94,0.15),0 40px 80px rgba(0,0,0,0.6)', position: 'relative', animation: 'authIn 0.3s ease' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.07)', border: 'none', color: '#94a3b8', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <img src="/logo.jpg" alt="MaatiKatha" style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #22c55e', marginBottom: '10px' }} onError={e => { e.target.style.display = 'none'; }} />
          <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.5px' }}>MaatiKatha</h2>
          <p style={{ color: '#4ade80', fontSize: '0.8rem', fontWeight: '600', marginTop: '4px' }}>AI Agriculture Intelligence Platform</p>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '14px', padding: '4px', marginBottom: '18px' }}>
          {['login', 'register'].map(t => (
            <button key={t} onClick={() => { setTab(t); setStep(1); setError(''); setNotice(''); }} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '0.87rem', cursor: 'pointer', transition: 'all 0.2s', background: tab === t ? '#15803d' : 'transparent', color: tab === t ? '#fff' : '#64748b', fontFamily: 'inherit' }}>
              {t === 'login' ? '🔑 Log In' : '✨ Register'}
            </button>
          ))}
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          disabled={loading || googleLoading}
          onClick={handleGoogleSignIn}
          style={{
            width: '100%',
            padding: '13px 16px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            borderRadius: '12px',
            color: '#fff',
            fontWeight: '700',
            fontSize: '0.92rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            cursor: (loading || googleLoading) ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            fontFamily: 'inherit',
            marginBottom: '18px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
          }}
          onMouseEnter={e => { if (!loading && !googleLoading) { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.14)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.35)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
          onMouseLeave={e => { if (!loading && !googleLoading) { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.18)'; e.currentTarget.style.transform = 'translateY(0)'; } }}
        >
          <GoogleIcon />
          <span>{googleLoading ? 'Connecting to Google...' : (tab === 'login' ? 'Continue with Google' : 'Sign up with Google')}</span>
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.12)' }}></div>
          <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' }}>or continue with email</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.12)' }}></div>
        </div>

        {notice && (
          <div style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.35)', borderRadius: '10px', padding: '10px 14px', color: '#86efac', fontSize: '0.82rem', marginBottom: '16px', lineHeight: '1.4' }}>
            📬 {notice}
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '10px 14px', color: '#fca5a5', fontSize: '0.82rem', marginBottom: '16px' }}>
            ⚠️ {error}
          </div>
        )}

        {tab === 'login' && (
          <form onSubmit={doLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <AuthInput icon="📧" type="email" placeholder="Email address" value={form.email} onChange={v => set('email', v)} />
            <AuthInput icon="🔒" type="password" placeholder="Password" value={form.password} onChange={v => set('password', v)} />
            <button type="submit" disabled={loading || googleLoading} style={btnS(loading || googleLoading)}>
              {loading ? <LoadingDots /> : '🚀 Enter MaatiKatha Dashboard'}
            </button>
            <p style={{ color: '#64748b', fontSize: '0.76rem', textAlign: 'center' }}>Secure Supabase Authentication with Google OAuth</p>
          </form>
        )}

        {tab === 'register' && (
          <form onSubmit={doRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
              {[1, 2].map(s => <div key={s} style={{ flex: 1, height: '3px', borderRadius: '4px', background: step >= s ? '#22c55e' : 'rgba(255,255,255,0.1)', transition: 'all 0.3s' }} />)}
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.74rem', marginBottom: '4px' }}>Step {step} of 2 — {step === 1 ? 'Personal Info' : 'Secure Password'}</p>
            {step === 1 && (<>
              <AuthInput icon="👤" type="text" placeholder="Full Name" value={form.name} onChange={v => set('name', v)} />
              <AuthInput icon="📧" type="email" placeholder="Email address" value={form.email} onChange={v => set('email', v)} />
              <AuthInput icon="📱" type="tel" placeholder="Phone number (optional)" value={form.phone} onChange={v => set('phone', v)} />
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem' }}>🗺️</span>
                <select value={form.state} onChange={e => set('state', e.target.value)} style={{ width: '100%', padding: '12px 14px 12px 40px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: form.state ? '#fff' : '#64748b', fontSize: '0.87rem', outline: 'none', appearance: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                  <option value="">Select your state</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s} style={{ background: '#0a2612', color: '#fff' }}>{s}</option>)}
                </select>
              </div>
            </>)}
            {step === 2 && (<>
              <AuthInput icon="🔒" type="password" placeholder="Create a password (min 6 characters)" value={form.password} onChange={v => set('password', v)} />
              <AuthInput icon="✅" type="password" placeholder="Confirm password" value={form.confirmPassword} onChange={v => set('confirmPassword', v)} />
              <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '10px', padding: '12px 14px', fontSize: '0.78rem', color: '#86efac' }}>🌱 Powered by Supabase & MongoDB secure encryption.</div>
            </>)}
            <button type="submit" disabled={loading || googleLoading} style={btnS(loading || googleLoading)}>
              {loading ? <LoadingDots /> : step === 1 ? '→ Continue to Security' : '🌟 Create My Farm Account'}
            </button>
          </form>
        )}
        <p style={{ color: '#475569', fontSize: '0.72rem', textAlign: 'center', marginTop: '18px', lineHeight: '1.5' }}>By continuing you agree to MaatiKatha Terms of Service.<br />Your farm data is encrypted and protected.</p>
      </div>
    </div>
  );
}

export default function LandingPage({ onEnterApp, currentLanguage = 'en', onLanguageChange }) {
  const [internalLang, setInternalLang] = useState(() => {
    try { return localStorage.getItem('mk_user_language') || 'en'; } catch { return 'en'; }
  });
  const activeLang = onLanguageChange ? currentLanguage : internalLang;
  const handleLangSelect = (code) => {
    if (onLanguageChange) onLanguageChange(code);
    else setInternalLang(code);
    try { localStorage.setItem('mk_user_language', code); } catch (e) {}
  };
  const t = LANDING_PAGE_TRANSLATIONS[activeLang] || LANDING_PAGE_TRANSLATIONS.en;

  const [authModal, setAuthModal] = useState(null);
  const [scrollY, setScrollY] = useState(0);
  const [visFeatures, setVisFeatures] = useState(false);
  const featRef = useRef(null);
  const howRef = useRef(null);
  const testRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting && e.target === featRef.current) setVisFeatures(true); });
    }, { threshold: 0.06 });
    if (featRef.current) obs.observe(featRef.current);
    return () => obs.disconnect();
  }, []);

  const scrollTo = ref => ref.current?.scrollIntoView({ behavior: 'smooth' });
  const onAuth = user => { setAuthModal(null); onEnterApp(user); };
  const navBg = scrollY > 60;

  const PBtn = ({ onClick, children }) => (
    <button onClick={onClick} style={{ background:'linear-gradient(135deg,#16a34a,#15803d)', color:'#fff', fontWeight:'800', fontSize:'1rem', padding:'16px 34px', borderRadius:'16px', border:'none', cursor:'pointer', fontFamily:'inherit', boxShadow:'0 8px 28px rgba(22,163,74,0.42)', transition:'all 0.25s', display:'flex', alignItems:'center', gap:'8px' }}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 14px 42px rgba(22,163,74,0.6)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 8px 28px rgba(22,163,74,0.42)'; }}>{children}</button>
  );
  const SBtn = ({ onClick, children }) => (
    <button onClick={onClick} style={{ background:'rgba(255,255,255,0.07)', border:'1.5px solid rgba(255,255,255,0.17)', color:'#fff', fontWeight:'700', fontSize:'1rem', padding:'16px 34px', borderRadius:'16px', cursor:'pointer', fontFamily:'inherit', transition:'all 0.25s', display:'flex', alignItems:'center', gap:'8px' }}
      onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.13)'; }}
      onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.07)'; }}>{children}</button>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800;900&family=Space+Grotesk:wght@400;500;700;800&display=swap');
        .lp { font-family:'Outfit',sans-serif; background:#030d06; color:#fff; overflow-x:hidden; scroll-behavior:smooth; }
        .lp * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes ldB { 0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)} }
        @keyframes authIn { from{opacity:0;transform:translateY(22px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes lpUp { from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)} }
        @keyframes pulse2 { 0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(1.4)} }
        @keyframes floatImg { 0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)} }
        @keyframes marqueeScroll { 0%{transform:translateX(0)} 100%{transform:translateX(-33.33%)} }
        .lp-fcard { opacity:0; transform:translateY(22px); transition:opacity 0.5s ease, transform 0.5s ease, border-color 0.3s, box-shadow 0.3s; }
        .lp-fcard.vis { opacity:1; transform:translateY(0); }
        .lp-fcard:hover { border-color:rgba(255,255,255,0.16) !important; transform:translateY(-5px) !important; box-shadow:0 24px 50px rgba(0,0,0,0.35) !important; }
        .lp-stat:hover { background:rgba(34,197,94,0.04) !important; }
        .lp-tcard { transition:all 0.3s; }
        .lp-tcard:hover { border-color:rgba(34,197,94,0.22) !important; background:rgba(34,197,94,0.04) !important; transform:translateY(-3px); }
        @media(max-width:768px){ .lp-hide-mob{display:none!important} .lp-h1{letter-spacing:-1px!important} }
      `}</style>

      <div className="lp">

        {/* ─── NAVBAR ─── */}
        <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:999, padding:'0 5%', display:'flex', alignItems:'center', justifyContent:'space-between', height:'72px', background: navBg ? 'rgba(3,13,6,0.94)' : 'transparent', backdropFilter: navBg ? 'blur(18px)' : 'none', borderBottom: navBg ? '1px solid rgba(34,197,94,0.12)' : 'none', transition:'all 0.3s ease' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <img src="/logo.jpg" alt="MaatiKatha" style={{ width:'40px', height:'40px', borderRadius:'50%', objectFit:'cover', border:'1.5px solid #22c55e' }} onError={e => { e.target.style.display='none'; }} />
            <div>
              <div style={{ fontWeight:'800', fontSize:'1.15rem', color:'#fff' }}>MaatiKatha</div>
              <div style={{ fontSize:'0.63rem', color:'#4ade80', fontWeight:'700', letterSpacing:'0.8px' }}>STORY OF THE SOIL</div>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap' }}>
            {/* Language Selector Pill in Landing Page Navbar */}
            <LanguageSelector 
              currentLanguage={activeLang} 
              onLanguageChange={handleLangSelect} 
              variant="pill" 
            />

            <button className="lp-hide-mob" onClick={() => scrollTo(featRef)} style={{ color:'#94a3b8', fontSize:'0.86rem', fontWeight:'600', padding:'8px 14px', borderRadius:'10px', background:'transparent', border:'none', cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s' }} onMouseEnter={e=>{e.target.style.color='#4ade80';e.target.style.background='rgba(34,197,94,0.08)'}} onMouseLeave={e=>{e.target.style.color='#94a3b8';e.target.style.background='transparent'}}>{t.nav.features}</button>
            <button className="lp-hide-mob" onClick={() => scrollTo(howRef)} style={{ color:'#94a3b8', fontSize:'0.86rem', fontWeight:'600', padding:'8px 14px', borderRadius:'10px', background:'transparent', border:'none', cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s' }} onMouseEnter={e=>{e.target.style.color='#4ade80';e.target.style.background='rgba(34,197,94,0.08)'}} onMouseLeave={e=>{e.target.style.color='#94a3b8';e.target.style.background='transparent'}}>{t.nav.howItWorks}</button>
            <button className="lp-hide-mob" onClick={() => scrollTo(testRef)} style={{ color:'#94a3b8', fontSize:'0.86rem', fontWeight:'600', padding:'8px 14px', borderRadius:'10px', background:'transparent', border:'none', cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s' }} onMouseEnter={e=>{e.target.style.color='#4ade80';e.target.style.background='rgba(34,197,94,0.08)'}} onMouseLeave={e=>{e.target.style.color='#94a3b8';e.target.style.background='transparent'}}>{t.nav.testimonials}</button>
            <button onClick={() => setAuthModal('login')} style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.13)', color:'#fff', fontSize:'0.86rem', fontWeight:'700', padding:'9px 20px', borderRadius:'12px', cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s' }} onMouseEnter={e=>e.target.style.background='rgba(255,255,255,0.13)'} onMouseLeave={e=>e.target.style.background='rgba(255,255,255,0.07)'}>{t.nav.login}</button>
            <button onClick={() => setAuthModal('register')} style={{ background:'linear-gradient(135deg,#16a34a,#15803d)', color:'#fff', fontSize:'0.86rem', fontWeight:'800', padding:'9px 22px', borderRadius:'12px', border:'none', cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s', boxShadow:'0 4px 14px rgba(22,163,74,0.35)' }} onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-1px)';e.currentTarget.style.boxShadow='0 6px 22px rgba(22,163,74,0.5)'}} onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 4px 14px rgba(22,163,74,0.35)'}}>{t.nav.getStarted}</button>
          </div>
        </nav>

        {/* ─── HERO ─── */}
        <section style={{ minHeight:'100vh', position:'relative', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', overflow:'hidden', padding:'120px 5% 80px' }}>
          <div style={{ position:'absolute', inset:0, backgroundImage:"url('/hero_bg.jpg')", backgroundSize:'cover', backgroundPosition:'center', transform:`translateY(${scrollY*0.22}px)` }} />
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,rgba(3,13,6,0.91) 0%,rgba(5,25,13,0.72) 55%,rgba(3,13,6,0.95) 100%)' }} />

          <div style={{ position:'relative', zIndex:2, maxWidth:'800px', textAlign:'center' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.3)', color:'#4ade80', fontSize:'0.77rem', fontWeight:'700', letterSpacing:'0.4px', padding:'7px 18px', borderRadius:'50px', marginBottom:'30px', animation:'lpUp 0.6s ease both' }}>
              <span style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#22c55e', animation:'pulse2 2s infinite' }} />
              {t.hero.badge}
            </div>
            <h1 className="lp-h1" style={{ fontSize:'clamp(2.6rem,5.5vw,5rem)', fontWeight:'900', lineHeight:'1.06', letterSpacing:'-2px', color:'#fff', marginBottom:'24px', animation:'lpUp 0.6s 0.1s ease both' }}>
              {t.hero.titleLine1}<br /><span style={{ color:'#4ade80' }}>{t.hero.titleLine2}</span> {t.hero.titleLine3}<br /><span style={{ color:'#fbbf24' }}>{t.hero.titleLine4}</span>
            </h1>
            <p style={{ fontSize:'clamp(1rem,2vw,1.17rem)', color:'#94a3b8', lineHeight:'1.76', maxWidth:'640px', margin:'0 auto 42px', animation:'lpUp 0.6s 0.2s ease both' }}>
              {t.hero.subtitle}
            </p>
            <div style={{ display:'flex', gap:'14px', justifyContent:'center', flexWrap:'wrap', marginBottom:'50px', animation:'lpUp 0.6s 0.3s ease both' }}>
              <PBtn onClick={() => setAuthModal('register')}>{t.hero.primaryCta}</PBtn>
              <SBtn onClick={() => setAuthModal('login')}>{t.hero.secondaryCta}</SBtn>
            </div>
            <div style={{ display:'flex', gap:'24px', justifyContent:'center', flexWrap:'wrap', animation:'lpUp 0.6s 0.4s ease both' }}>
              {[['🔒','End-to-End Encrypted'],['🌐','Any Language'],['📴','Offline-Ready'],['⚡','Under 2s AI']].map(([ic,lb]) => (
                <div key={lb} style={{ display:'flex', alignItems:'center', gap:'7px', color:'#64748b', fontSize:'0.8rem', fontWeight:'600' }}><span>{ic}</span>{lb}</div>
              ))}
            </div>
          </div>

          <div style={{ position:'relative', zIndex:2, marginTop:'64px', maxWidth:'920px', width:'100%', animation:'lpUp 0.8s 0.5s ease both' }}>
            <img src="/feature_dashboard.jpg" alt="MaatiKatha AI Dashboard Preview" style={{ width:'100%', borderRadius:'22px', border:'1px solid rgba(34,197,94,0.18)', boxShadow:'0 40px 80px rgba(0,0,0,0.5),0 0 60px rgba(34,197,94,0.1)', animation:'floatImg 6s ease-in-out infinite' }} />
          </div>
        </section>


        {/* ─── BELOW HERO: TRANSITION DIVIDER ─── */}
        <div style={{ position:'relative', height:'2px', background:'linear-gradient(90deg, transparent, rgba(34,197,94,0.5), rgba(251,191,36,0.4), rgba(34,197,94,0.5), transparent)' }}>
          <div style={{ position:'absolute', top:'-30px', left:'50%', transform:'translateX(-50%)', width:'1px', height:'60px', background:'linear-gradient(180deg,transparent,#22c55e,transparent)' }} />
        </div>

        {/* ─── ANIMATED IMPACT COUNTERS ─── */}
        <section style={{ padding:'0', background:'#030d06', overflow:'hidden' }}>
          {/* Marquee scrolling ticker */}
          <div style={{ background:'rgba(34,197,94,0.06)', borderTop:'1px solid rgba(34,197,94,0.12)', borderBottom:'1px solid rgba(34,197,94,0.12)', padding:'14px 0', overflow:'hidden', position:'relative' }}>
            <div style={{ display:'flex', gap:'0', animation:'marqueeScroll 30s linear infinite', whiteSpace:'nowrap', width:'max-content' }}>
              {[...Array(3)].map((_,rep) => (
                <span key={rep} style={{ display:'inline-flex', alignItems:'center', gap:'0' }}>
                  {['🌾 2.4M+ Farmers Empowered','🎯 94% AI Accuracy','📡 Real-Time Soil Intelligence','⏳ Generational Time Machine','🏪 500+ Mandi Commodities Tracked','🌦️ Hyper-Local Weather Forecasts','🌱 Zero-Hardware Platform','🧠 Google Gemini Flash Powered','🗺️ 28 States · 700+ Districts'].map((item,j) => (
                    <span key={j} style={{ display:'inline-flex', alignItems:'center', gap:'40px', padding:'0 40px', color: j % 3 === 0 ? '#4ade80' : j % 3 === 1 ? '#fbbf24' : '#94a3b8', fontSize:'0.82rem', fontWeight:'700', letterSpacing:'0.5px' }}>
                      {item}<span style={{ color:'rgba(255,255,255,0.1)', fontSize:'1.2rem' }}>·</span>
                    </span>
                  ))}
                </span>
              ))}
            </div>
          </div>

          {/* 4 Premium Stat Counter Cards */}
          <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'80px 5%' }}>
            <div style={{ textAlign:'center', marginBottom:'56px' }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.2)', color:'#4ade80', fontSize:'0.73rem', fontWeight:'700', letterSpacing:'1.5px', textTransform:'uppercase', padding:'6px 16px', borderRadius:'50px', marginBottom:'18px' }}>
                📊 Platform Impact
              </div>
              <h2 style={{ fontSize:'clamp(1.8rem,3.5vw,2.8rem)', fontWeight:'900', letterSpacing:'-1px', color:'#fff', marginBottom:'12px', lineHeight:'1.1' }}>
                Numbers That Define<br /><span style={{ color:'#4ade80' }}>a Revolution</span>
              </h2>
              <p style={{ color:'#64748b', fontSize:'0.98rem', maxWidth:'480px', margin:'0 auto', lineHeight:'1.7' }}>
                Every metric below represents a real farmer whose livelihood we've improved with AI-powered intelligence.
              </p>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:'16px' }}>
              {[
                { value:'2.4M+', label:'Farmers Actively Using MaatiKatha', sublabel:'Across 28 states in India', icon:'👨‍🌾', color:'#4ade80', bg:'rgba(34,197,94,0.06)', border:'rgba(34,197,94,0.18)', accent:'#22c55e' },
                { value:'94%', label:'AI Crop Diagnosis Accuracy', sublabel:'Validated across 50+ crop species', icon:'🎯', color:'#fbbf24', bg:'rgba(251,191,36,0.06)', border:'rgba(251,191,36,0.18)', accent:'#f59e0b' },
                { value:'500+', label:'Mandi Commodities Tracked Live', sublabel:'Real-time APMC price feeds', icon:'🌾', color:'#818cf8', bg:'rgba(129,140,248,0.06)', border:'rgba(129,140,248,0.18)', accent:'#6366f1' },
                { value:'<2s', label:'Average AI Response Time', sublabel:'Gemini Flash inference speed', icon:'⚡', color:'#38bdf8', bg:'rgba(56,189,248,0.06)', border:'rgba(56,189,248,0.18)', accent:'#0ea5e9' },
              ].map((s,i) => (
                <div key={i} style={{ background:s.bg, border:`1px solid ${s.border}`, borderRadius:'20px', padding:'32px 28px', position:'relative', overflow:'hidden', transition:'transform 0.3s, box-shadow 0.3s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow=`0 20px 50px rgba(0,0,0,0.3), 0 0 30px ${s.border}`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; }}>
                  {/* Corner glow */}
                  <div style={{ position:'absolute', top:0, right:0, width:'80px', height:'80px', background:`radial-gradient(circle at top right, ${s.border}, transparent 70%)`, borderRadius:'0 20px 0 0', pointerEvents:'none' }} />
                  <div style={{ fontSize:'2rem', marginBottom:'16px' }}>{s.icon}</div>
                  <div style={{ fontSize:'3rem', fontWeight:'900', color:s.color, letterSpacing:'-2px', lineHeight:'1', fontFamily:"'Space Grotesk',sans-serif", marginBottom:'10px' }}>{s.value}</div>
                  <div style={{ color:'#fff', fontSize:'0.92rem', fontWeight:'700', marginBottom:'6px', lineHeight:'1.3' }}>{s.label}</div>
                  <div style={{ color:'#475569', fontSize:'0.76rem', fontWeight:'600' }}>{s.sublabel}</div>
                  {/* Bottom accent bar */}
                  <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'2px', background:`linear-gradient(90deg, ${s.accent}, transparent)`, borderRadius:'0 0 20px 20px' }} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── MISSION STATEMENT BANNER ─── */}
        <section style={{ padding:'0 5% 0', background:'#030d06' }}>
          <div style={{ maxWidth:'1200px', margin:'0 auto', paddingBottom:'80px' }}>
            <div style={{ background:'linear-gradient(135deg, rgba(15,81,50,0.3) 0%, rgba(6,22,16,0.8) 40%, rgba(6,21,26,0.8) 100%)', border:'1px solid rgba(34,197,94,0.15)', borderRadius:'28px', padding:'56px 64px', position:'relative', overflow:'hidden' }}>
              {/* Background grid pattern */}
              <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(34,197,94,0.06) 1px, transparent 1px)', backgroundSize:'28px 28px', borderRadius:'28px', pointerEvents:'none' }} />
              {/* Left glow */}
              <div style={{ position:'absolute', left:'-40px', top:'50%', transform:'translateY(-50%)', width:'200px', height:'200px', background:'radial-gradient(circle, rgba(34,197,94,0.15), transparent 70%)', pointerEvents:'none' }} />

              <div style={{ position:'relative', zIndex:1, display:'flex', gap:'48px', alignItems:'center', flexWrap:'wrap' }}>
                <div style={{ flex:'1 1 300px' }}>
                  <div style={{ display:'inline-flex', alignItems:'center', gap:'6px', background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.25)', color:'#4ade80', fontSize:'0.71rem', fontWeight:'700', letterSpacing:'1.5px', textTransform:'uppercase', padding:'5px 14px', borderRadius:'50px', marginBottom:'22px' }}>
                    🌍 Our Mission
                  </div>
                  <blockquote style={{ fontSize:'clamp(1.2rem,2.5vw,1.8rem)', fontWeight:'800', color:'#fff', lineHeight:'1.45', letterSpacing:'-0.5px', marginBottom:'24px' }}>
                    "We believe every Indian farmer — regardless of literacy, connectivity, or budget — deserves{' '}
                    <span style={{ color:'#4ade80' }}>world-class agricultural intelligence</span>."
                  </blockquote>
                  <p style={{ color:'#64748b', fontSize:'0.92rem', lineHeight:'1.72', maxWidth:'520px' }}>
                    MaatiKatha was born in the fields of West Bengal with a single conviction: the same AI tools available to Fortune 500 agribusinesses should be accessible to a farmer with a basic smartphone. No subscription fees. No fieldwork sensors. No technical expertise.
                  </p>
                </div>
                <div style={{ flex:'0 0 auto', display:'flex', flexDirection:'column', gap:'16px', minWidth:'220px' }}>
                  {[
                    { icon:'✅', text:'Works on any ₹3,000 Android phone' },
                    { icon:'✅', text:'No internet required for basic features' },
                    { icon:'✅', text:'Supports 12+ Indian languages' },
                    { icon:'✅', text:'Free forever for small farmers' },
                    { icon:'✅', text:'Village-level GPS precision' },
                  ].map((item,i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                      <span style={{ color:'#22c55e', fontSize:'1rem', flexShrink:0 }}>{item.icon}</span>
                      <span style={{ color:'#cbd5e1', fontSize:'0.85rem', fontWeight:'600' }}>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── THE PROBLEM WE SOLVE ─── */}
        <section style={{ padding:'0 5% 80px', background:'#030d06' }}>
          <div style={{ maxWidth:'1200px', margin:'0 auto' }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:'20px', alignItems:'stretch' }}>
              {/* Left: Problem */}
              <div style={{ background:'rgba(239,68,68,0.04)', border:'1px solid rgba(239,68,68,0.14)', borderRadius:'22px', padding:'36px', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'3px', background:'linear-gradient(90deg, rgba(239,68,68,0.6), transparent)' }} />
                <div style={{ fontSize:'2rem', marginBottom:'16px' }}>⚠️</div>
                <h3 style={{ fontSize:'1.2rem', fontWeight:'900', color:'#fff', marginBottom:'20px', letterSpacing:'-0.5px' }}>The Harsh Reality<br /><span style={{ color:'#f87171' }}>Indian Farmers Face</span></h3>
                {[
                  '140M small farmers have zero access to agronomists',
                  'Average farm diagnostic costs ₹2,000–₹5,000 per visit',
                  'Crop disease causes 35% annual yield loss',
                  'Soil health data takes 2–3 weeks from labs',
                  'Language and literacy barriers block digital tools',
                  'Market price manipulation costs farmers ₹30,000 cr/yr',
                ].map((p,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:'10px', marginBottom:'12px' }}>
                    <span style={{ color:'#f87171', fontSize:'0.85rem', flexShrink:0, marginTop:'2px' }}>✗</span>
                    <span style={{ color:'#94a3b8', fontSize:'0.85rem', lineHeight:'1.55' }}>{p}</span>
                  </div>
                ))}
              </div>

              {/* Center arrow */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60px' }}>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:'2.5rem', marginBottom:'8px', animation:'pulse2 2s infinite' }}>🤖</div>
                  <div style={{ color:'#4ade80', fontSize:'0.72rem', fontWeight:'700', letterSpacing:'1px', textTransform:'uppercase' }}>MaatiKatha<br />AI Solution</div>
                  <div style={{ color:'#22c55e', fontSize:'2rem', marginTop:'8px' }}>↓</div>
                </div>
              </div>

              {/* Right: Solution */}
              <div style={{ background:'rgba(34,197,94,0.04)', border:'1px solid rgba(34,197,94,0.16)', borderRadius:'22px', padding:'36px', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'3px', background:'linear-gradient(90deg, rgba(34,197,94,0.6), transparent)' }} />
                <div style={{ fontSize:'2rem', marginBottom:'16px' }}>🌟</div>
                <h3 style={{ fontSize:'1.2rem', fontWeight:'900', color:'#fff', marginBottom:'20px', letterSpacing:'-0.5px' }}>What MaatiKatha<br /><span style={{ color:'#4ade80' }}>Delivers Instantly</span></h3>
                {[
                  'AI diagnosis in <2 seconds via voice or photo',
                  'Zero-cost — completely free for small farmers',
                  '94% accurate crop pathology in any language',
                  'Real-time soil intelligence without lab tests',
                  'Works on any basic Android phone offline',
                  'Live APMC mandi prices to fight exploitation',
                ].map((s,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:'10px', marginBottom:'12px' }}>
                    <span style={{ color:'#4ade80', fontSize:'0.85rem', flexShrink:0, marginTop:'2px' }}>✓</span>
                    <span style={{ color:'#cbd5e1', fontSize:'0.85rem', lineHeight:'1.55', fontWeight:'500' }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>


        {/* ─── FEATURES ─── */}
        <section style={{ padding:'100px 5%' }} ref={featRef}>
          <div style={{ maxWidth:'1200px', margin:'0 auto' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'6px', color:'#4ade80', fontSize:'0.74rem', fontWeight:'700', letterSpacing:'1.5px', textTransform:'uppercase', marginBottom:'14px' }}>🚀 Platform Features</div>
            <h2 style={{ fontSize:'clamp(1.8rem,3.5vw,3rem)', fontWeight:'900', letterSpacing:'-1px', color:'#fff', marginBottom:'18px' }}>8 Intelligent Tools<br />Built for Every Farm</h2>
            <p style={{ color:'#64748b', fontSize:'1.02rem', lineHeight:'1.75', maxWidth:'580px', marginBottom:'0' }}>Each tool is powered by cutting-edge AI models and designed for zero-technical-barrier usage — speak, snap, select.</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(288px,1fr))', gap:'18px', marginTop:'56px' }}>
              {FEATURES.map((f,i) => (
                <div key={i} className={`lp-fcard${visFeatures ? ' vis' : ''}`} style={{ '--fg':f.glow, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'20px', padding:'28px', transitionDelay:`${i*0.06}s`, position:'relative', overflow:'hidden' }}>
                  <div style={{ position:'absolute', inset:0, background:`radial-gradient(circle at top left,${f.glow},transparent 70%)`, opacity:0, transition:'opacity 0.4s', pointerEvents:'none' }} className="fcard-glow" />
                  <span style={{ fontSize:'2.4rem', marginBottom:'16px', display:'block' }}>{f.icon}</span>
                  <div style={{ fontSize:'1.08rem', fontWeight:'800', color:'#fff', marginBottom:'4px' }}>{f.title}</div>
                  <div style={{ fontSize:'0.74rem', fontWeight:'700', letterSpacing:'0.5px', textTransform:'uppercase', marginBottom:'12px', color:f.color }}>{f.subtitle}</div>
                  <p style={{ color:'#64748b', fontSize:'0.86rem', lineHeight:'1.68' }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── HOW IT WORKS ─── */}
        <section style={{ padding:'100px 5%', background:'linear-gradient(135deg,#040f08,#030d06)' }} ref={howRef}>
          <div style={{ maxWidth:'1100px', margin:'0 auto', textAlign:'center' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'6px', color:'#4ade80', fontSize:'0.74rem', fontWeight:'700', letterSpacing:'1.5px', textTransform:'uppercase', marginBottom:'14px' }}>📋 Simple Workflow</div>
            <h2 style={{ fontSize:'clamp(1.8rem,3.5vw,3rem)', fontWeight:'900', letterSpacing:'-1px', color:'#fff', marginBottom:'18px' }}>How MaatiKatha Works</h2>
            <p style={{ color:'#64748b', fontSize:'1.02rem', lineHeight:'1.75', maxWidth:'520px', margin:'0 auto' }}>From zero to actionable farm intelligence in under 60 seconds</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:'36px', marginTop:'64px' }}>
              {[
                { ic:'📝', t:'Create Your Free Account', d:'Register in 30 seconds. No credit card, no app download, no hardware purchase required.' },
                { ic:'📍', t:'Set Your Farm Location', d:'GPS auto-detect or select your district from 700+ Indian locations including rural villages.' },
                { ic:'🎙️', t:'Speak or Snap a Photo', d:'Describe your crop problem by voice or upload a photo for instant Gemini AI analysis.' },
                { ic:'📊', t:'Receive Intelligence', d:'Get clinical reports, treatment plans, market prices, and seasonal forecasts in under 2 seconds.' },
              ].map((s,i) => (
                <div key={i} style={{ textAlign:'center' }}>
                  <div style={{ width:'64px', height:'64px', borderRadius:'50%', background:'linear-gradient(135deg,#15803d,#166534)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.7rem', margin:'0 auto 20px', boxShadow:'0 0 32px rgba(21,128,61,0.4)' }}>{s.ic}</div>
                  <div style={{ fontSize:'1rem', fontWeight:'800', color:'#fff', marginBottom:'8px' }}>{s.t}</div>
                  <div style={{ color:'#64748b', fontSize:'0.84rem', lineHeight:'1.65' }}>{s.d}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── TESTIMONIALS ─── */}
        <section style={{ padding:'100px 5%' }} ref={testRef}>
          <div style={{ maxWidth:'1200px', margin:'0 auto' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'6px', color:'#4ade80', fontSize:'0.74rem', fontWeight:'700', letterSpacing:'1.5px', textTransform:'uppercase', marginBottom:'14px' }}>💬 Farmer Stories</div>
            <h2 style={{ fontSize:'clamp(1.8rem,3.5vw,3rem)', fontWeight:'900', letterSpacing:'-1px', color:'#fff', marginBottom:'48px' }}>Trusted by Farmers<br />Across India</h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'20px' }}>
              {TESTIMONIALS.map((t,i) => (
                <div key={i} className="lp-tcard" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'20px', padding:'28px' }}>
                  <div style={{ color:'#fbbf24', fontSize:'1rem', marginBottom:'14px', letterSpacing:'1px' }}>{'★'.repeat(t.rating)}</div>
                  <p style={{ color:'#cbd5e1', fontSize:'0.88rem', lineHeight:'1.72', fontStyle:'italic', marginBottom:'20px' }}>"{t.quote}"</p>
                  <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                    <div style={{ fontSize:'1.8rem', width:'44px', height:'44px', background:'rgba(34,197,94,0.1)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(34,197,94,0.2)', flexShrink:0 }}>{t.avatar}</div>
                    <div>
                      <div style={{ fontWeight:'800', color:'#fff', fontSize:'0.9rem' }}>{t.name}</div>
                      <div style={{ color:'#64748b', fontSize:'0.73rem', marginTop:'2px' }}>{t.crop} · {t.location}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── TECH STRIP ─── */}
        <div style={{ background:'#020a04', borderTop:'1px solid rgba(255,255,255,0.06)', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'38px 5%' }}>
          <div style={{ maxWidth:'1100px', margin:'0 auto', textAlign:'center' }}>
            <div style={{ color:'#374151', fontSize:'0.72rem', fontWeight:'700', letterSpacing:'1.5px', textTransform:'uppercase', marginBottom:'22px' }}>Powered by World-Class Technology</div>
            <div style={{ display:'flex', gap:'36px', justifyContent:'center', flexWrap:'wrap', alignItems:'center' }}>
              {[['🧠','Google Gemini Flash'],['🍃','MongoDB Atlas'],['🌤️','OpenWeatherMap'],['⚡','Node.js Express'],['⚛️','React + Vite'],['👁️','Computer Vision AI']].map(([ic,lb]) => (
                <div key={lb} style={{ display:'flex', alignItems:'center', gap:'7px', color:'#4b5563', fontSize:'0.83rem', fontWeight:'700' }}><span style={{ fontSize:'1.2rem' }}>{ic}</span>{lb}</div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── FINAL CTA ─── */}
        <section style={{ padding:'100px 5%', background:'linear-gradient(135deg,#061c0f,#030d06,#06151a)', textAlign:'center', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', width:'700px', height:'700px', borderRadius:'50%', background:'radial-gradient(circle,rgba(34,197,94,0.07),transparent 70%)', top:'50%', left:'50%', transform:'translate(-50%,-50%)', pointerEvents:'none' }} />
          <div style={{ position:'relative', zIndex:1 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'6px', color:'#4ade80', fontSize:'0.74rem', fontWeight:'700', letterSpacing:'1.5px', textTransform:'uppercase', marginBottom:'14px', justifyContent:'center' }}>🌟 Join the Revolution</div>
            <h2 style={{ fontSize:'clamp(1.8rem,3.8vw,3.2rem)', fontWeight:'900', letterSpacing:'-1px', color:'#fff', marginBottom:'18px' }}>Transform Your Farm<br />with AI Intelligence</h2>
            <p style={{ color:'#64748b', fontSize:'1.02rem', maxWidth:'520px', margin:'0 auto 40px', lineHeight:'1.75' }}>Join 2.4 million farmers already using MaatiKatha to grow smarter, earn more, and protect their land for future generations.</p>
            <div style={{ display:'flex', gap:'14px', justifyContent:'center', flexWrap:'wrap' }}>
              <PBtn onClick={() => setAuthModal('register')}>🌱 Create Free Account</PBtn>
              <SBtn onClick={() => setAuthModal('login')}>Already have an account? Sign in →</SBtn>
            </div>
          </div>
        </section>

        {/* ─── FOOTER ─── */}
        <footer style={{ background:'#020a04', borderTop:'1px solid rgba(255,255,255,0.06)', padding:'60px 5% 36px' }}>
          <div style={{ maxWidth:'1200px', margin:'0 auto' }}>
            <div style={{ display:'flex', gap:'48px', flexWrap:'wrap', marginBottom:'48px' }}>
              <div style={{ flex:2, minWidth:'240px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
                  <img src="/logo.jpg" alt="Logo" style={{ width:'36px', height:'36px', borderRadius:'50%', objectFit:'cover', border:'1.5px solid #22c55e' }} onError={e => e.target.style.display='none'} />
                  <div>
                    <div style={{ color:'#fff', fontWeight:'800', fontSize:'1rem' }}>MaatiKatha</div>
                    <div style={{ color:'#4ade80', fontSize:'0.63rem', fontWeight:'700', letterSpacing:'0.8px' }}>STORY OF THE SOIL</div>
                  </div>
                </div>
                <p style={{ color:'#4b5563', fontSize:'0.82rem', lineHeight:'1.72', maxWidth:'300px' }}>India's most advanced AI-powered agricultural intelligence platform. Empowering farmers with zero-hardware technology since 2024.</p>
              </div>
              {[
                { t:'Platform', ls:['Voice Doctor','Time Machine','Decision Simulator','Ritu Rakhok','Khamar Drishti','Ancestral Seeds','Mandi Market'] },
                { t:'Company', ls:['About Us','Mission & Vision','Research','Press Kit','Careers','Contact Us'] },
                { t:'Legal & Support', ls:['Help Center','Privacy Policy','Terms of Service','Grievance Redressal','API Access','Data Security'] },
              ].map(col => (
                <div key={col.t} style={{ flex:1, minWidth:'140px' }}>
                  <div style={{ color:'#fff', fontWeight:'700', fontSize:'0.84rem', marginBottom:'16px' }}>{col.t}</div>
                  {col.ls.map(l => <span key={l} style={{ display:'block', color:'#4b5563', fontSize:'0.8rem', marginBottom:'10px', cursor:'pointer', transition:'color 0.2s' }} onMouseEnter={e=>e.target.style.color='#4ade80'} onMouseLeave={e=>e.target.style.color='#4b5563'}>{l}</span>)}
                </div>
              ))}
            </div>
            <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:'24px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'12px' }}>
              <div style={{ color:'#374151', fontSize:'0.76rem' }}>© 2024 MaatiKatha Agritech Pvt. Ltd. All rights reserved.</div>
              <div style={{ color:'#374151', fontSize:'0.7rem' }}>Google Gemini Flash · MongoDB Atlas · OpenWeatherMap · React + Vite</div>
            </div>
          </div>
        </footer>

        {/* AUTH MODAL */}
        {authModal && <AuthModal mode={authModal} onClose={() => setAuthModal(null)} onAuthSuccess={onAuth} />}
      </div>
    </>
  );
}

