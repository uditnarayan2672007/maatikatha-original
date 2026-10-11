import React, { useState, useEffect } from 'react';
import { supabase, formatUser, signOut } from './lib/supabase.js';
import LandingPage from './components/LandingPage.jsx';
import Dashboard from './components/Dashboard.jsx';
import VoiceDoctor from './components/VoiceDoctor.jsx';
import GenerationalTimeMachine from './components/GenerationalTimeMachine.jsx';
import WhatIfSimulator from './components/WhatIfSimulator.jsx';
import RituRakhok from './components/RituRakhok.jsx';
import KhamarDrishti from './components/KhamarDrishti.jsx';
import AncestralSeeds from './components/AncestralSeeds.jsx';
import MandiMarket from './components/MandiMarket.jsx';
import GoogleMapTracker from './components/GoogleMapTracker.jsx';
import LanguageSelector from './components/LanguageSelector.jsx';
import { APP_TRANSLATIONS } from './data/translations.js';
import { INDIAN_DISTRICTS } from './data/locations.js';
import { 
  LayoutDashboard, 
  MapPin, 
  Mic, 
  History, 
  Cpu, 
  CloudSun, 
  Radio, 
  Sprout, 
  Store, 
  CheckCircle2, 
  Globe2,
  Navigation,
  Search,
  Crosshair,
  Sparkles
} from 'lucide-react';

export default function App() {
  // Restore session from localStorage on load
  const savedUser = (() => {
    try { return JSON.parse(localStorage.getItem('mk_user')); } catch { return null; }
  })();
  const [currentUser, setCurrentUser] = useState(savedUser); // null = unauthenticated

  // Supabase Auth lifecycle & OAuth listener
  useEffect(() => {
    // 1. Initial Supabase session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u = formatUser(session.user);
        setCurrentUser(u);
        localStorage.setItem('mk_user', JSON.stringify(u));
        localStorage.setItem('mk_token', session.access_token);
      }
    }).catch(err => {
      console.warn('[Supabase] Session get error:', err.message);
    });

    // 2. Listen to Supabase auth events (OAuth callback, login, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED')) {
        const u = formatUser(session.user);
        setCurrentUser(u);
        localStorage.setItem('mk_user', JSON.stringify(u));
        localStorage.setItem('mk_token', session.access_token);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        localStorage.removeItem('mk_user');
        localStorage.removeItem('mk_token');
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (e) {
      console.warn('Logout error:', e);
    }
    localStorage.removeItem('mk_token');
    localStorage.removeItem('mk_user');
    setCurrentUser(null);
  };

  const [currentTab, setCurrentTab] = useState('dashboard'); 
  // 'dashboard' | 'doctor' | 'timemachine' | 'simulator' | 'riturakhok' | 'khamardrishti' | 'seeds' | 'mandi'
  
  // Multilingual State Engine (English 'en', Bengali 'bn', Hindi 'hi')
  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem('mk_user_language') || 'en';
    } catch {
      return 'en';
    }
  });

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    try {
      localStorage.setItem('mk_user_language', newLang);
    } catch (e) {
      console.warn('Language save error:', e);
    }
    const tDict = APP_TRANSLATIONS[newLang] || APP_TRANSLATIONS.en;
    setDetectStatus(tDict.langSwitchedNotification || 'Language updated');
    setTimeout(() => setDetectStatus(''), 3500);
  };

  const t = APP_TRANSLATIONS[language] || APP_TRANSLATIONS.en;

  // Production Location Engine State with LocalStorage Persistence
  const DEFAULT_LOCATION = {
    name: 'Howrah',
    city: 'Howrah',
    district: 'Howrah',
    state: 'West Bengal',
    country: 'India',
    pincode: '711102',
    lat: 22.574,
    lon: 88.3191,
    detectedVia: 'Default'
  };

  const [currentLocation, setCurrentLocation] = useState(() => {
    try {
      const saved = localStorage.getItem('mk_user_location');
      return saved ? JSON.parse(saved) : DEFAULT_LOCATION;
    } catch {
      return DEFAULT_LOCATION;
    }
  });

  const currentRegion = currentLocation.city || currentLocation.name || 'Howrah';
  const currentCoords = { lat: currentLocation.lat, lon: currentLocation.lon };

  const [isDetecting, setIsDetecting] = useState(false);
  const [detectStatus, setDetectStatus] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [customSearchQuery, setCustomSearchQuery] = useState('');
  const [showGoogleMapModal, setShowGoogleMapModal] = useState(false);

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: t.nav.dashboard },
    { id: 'doctor', icon: Mic, label: t.nav.doctor },
    { id: 'timemachine', icon: History, label: t.nav.timemachine },
    { id: 'simulator', icon: Cpu, label: t.nav.simulator },
    { id: 'riturakhok', icon: CloudSun, label: t.nav.riturakhok },
    { id: 'khamardrishti', icon: Radio, label: t.nav.khamardrishti },
    { id: 'seeds', icon: Sprout, label: t.nav.seeds },
    { id: 'mandi', icon: Store, label: t.nav.mandi }
  ];

  const activeTitle = navItems.find(item => item.id === currentTab)?.label || t.nav.dashboard;

  // 1. High-Precision Auto-Location Pipeline (GPS -> Backend Reverse Geocoding -> IP Fallback)
  const autoDetectLocation = (isUserManualClick = false) => {
    setIsDetecting(true);
    setDetectStatus(isUserManualClick ? 'Acquiring GPS Satellite Lock...' : 'Auto-Detecting Live Location...');

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // High-precision reverse geocode via backend
            const res = await fetch(`/api/location/reverse?lat=${latitude}&lon=${longitude}`);
            const data = await res.json();
            if (data.status === 'success' && (data.city || data.district)) {
              const loc = {
                name: data.city || data.district,
                city: data.city || data.district,
                district: data.district || data.city,
                state: data.state || 'West Bengal',
                country: data.country || 'India',
                pincode: data.pincode || '',
                lat: latitude,
                lon: longitude,
                displayName: data.displayName || `${data.city}, ${data.state}`,
                detectedVia: 'GPS'
              };
              setCurrentLocation(loc);
              localStorage.setItem('mk_user_location', JSON.stringify(loc));
              setDetectStatus(`✓ Live GPS: ${loc.city}, ${loc.district}`);
              setTimeout(() => setDetectStatus(''), 4000);
              return;
            }
          } catch (e) {
            console.warn('[Location] GPS reverse lookup notice:', e);
          }
          // If reverse geocode had an issue, fallback to IP
          fallbackToAutoIP();
        },
        (error) => {
          console.warn('[Location] GPS access notice:', error.message);
          fallbackToAutoIP();
        },
        { timeout: 7000, enableHighAccuracy: true, maximumAge: 30000 }
      );
    } else {
      fallbackToAutoIP();
    }
  };

  // Instant IP-based Geolocation Fallback
  const fallbackToAutoIP = async () => {
    try {
      const res = await fetch('/api/location/auto');
      const data = await res.json();
      if (data.status === 'success' && data.city) {
        const loc = {
          name: data.city,
          city: data.city,
          district: data.district || data.city,
          state: data.state || 'West Bengal',
          country: data.country || 'India',
          pincode: data.pincode || '',
          lat: data.lat || 22.574,
          lon: data.lon || 88.3191,
          detectedVia: 'IP'
        };
        setCurrentLocation(loc);
        localStorage.setItem('mk_user_location', JSON.stringify(loc));
        setDetectStatus(`✓ Auto-Detected via IP: ${loc.city}`);
        setTimeout(() => setDetectStatus(''), 4000);
      }
    } catch (err) {
      console.warn('[Location] IP geolocation notice:', err);
    } finally {
      setIsDetecting(false);
    }
  };

  // Automatically trigger location detection on initial app load
  useEffect(() => {
    autoDetectLocation(false);
  }, []);

  // District Dropdown Change Handler
  const handleSelectDistrict = (selectedName) => {
    if (selectedName === '__custom_search__') {
      setShowSearchModal(true);
      return;
    }
    let matchedDistrict = null;
    let matchedState = 'West Bengal';
    for (const group of INDIAN_DISTRICTS) {
      const found = group.districts.find(d => d.name === selectedName);
      if (found) {
        matchedDistrict = found;
        matchedState = group.state.replace(/[\(\)]/g, '').split(' ').pop();
        break;
      }
    }
    if (matchedDistrict) {
      const newLoc = {
        name: matchedDistrict.name,
        city: matchedDistrict.name,
        district: matchedDistrict.name,
        state: matchedState,
        lat: matchedDistrict.lat,
        lon: matchedDistrict.lon,
        detectedVia: 'Manual'
      };
      setCurrentLocation(newLoc);
      localStorage.setItem('mk_user_location', JSON.stringify(newLoc));
      setDetectStatus(`✓ Switched: ${newLoc.name}`);
      setTimeout(() => setDetectStatus(''), 3000);
    }
  };

  // Google Maps Pin Selection Handler
  const handleLocationSelectedFromGoogleMap = (newLoc) => {
    setCurrentLocation(newLoc);
    localStorage.setItem('mk_user_location', JSON.stringify(newLoc));
    setDetectStatus(`✓ Google Map: ${newLoc.city || newLoc.district}`);
    setTimeout(() => setDetectStatus(''), 4000);
  };

  // Custom City/Village Search Submit Handler with real geocoding
  const handleCustomSearchSubmit = async (e) => {
    e.preventDefault();
    if (customSearchQuery.trim()) {
      const query = customSearchQuery.trim();
      setShowSearchModal(false);
      setIsDetecting(true);
      setDetectStatus(`Searching for "${query}"...`);

      try {
        const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', India')}&limit=1`, {
          headers: { 'User-Agent': 'MaatiKatha-Agritech-Portal/2.0' }
        });
        const results = await resp.json();
        if (results && results.length > 0) {
          const first = results[0];
          const newLoc = {
            name: query,
            city: query,
            district: query,
            state: 'India',
            lat: parseFloat(first.lat),
            lon: parseFloat(first.lon),
            displayName: first.display_name,
            detectedVia: 'Search'
          };
          setCurrentLocation(newLoc);
          localStorage.setItem('mk_user_location', JSON.stringify(newLoc));
          setDetectStatus(`✓ Located: ${query}`);
          setTimeout(() => setDetectStatus(''), 4000);
          setCustomSearchQuery('');
          setIsDetecting(false);
          return;
        }
      } catch (err) {
        console.warn('[Search] Geocode error:', err);
      }

      // Fallback
      const newLoc = {
        name: query,
        city: query,
        district: query,
        state: 'West Bengal',
        lat: 22.574,
        lon: 88.3191,
        detectedVia: 'Search'
      };
      setCurrentLocation(newLoc);
      localStorage.setItem('mk_user_location', JSON.stringify(newLoc));
      setDetectStatus(`✓ Located: ${query}`);
      setTimeout(() => setDetectStatus(''), 3000);
      setCustomSearchQuery('');
      setIsDetecting(false);
    }
  };

  // Show landing page if not authenticated
  if (!currentUser) {
    return (
      <LandingPage 
        onEnterApp={(user) => setCurrentUser(user)} 
        currentLanguage={language}
        onLanguageChange={handleLanguageChange}
      />
    );
  }

  return (
    <div className="portal-layout">
      {/* 1. LEFT SIDEBAR NAVIGATION */}
      <aside className="left-sidebar">
        {/* Official Uploaded Logo & Branding */}
        <div className="sidebar-header">
          <div className="sidebar-logo-wrapper" onClick={() => setCurrentTab('dashboard')} style={{ cursor: 'pointer' }}>
            <img 
              src="/logo.jpg" 
              alt="MaatiKatha - Story of the Soil" 
              className="sidebar-logo-img"
              onError={(e) => { e.target.src = '/logo.png'; }}
            />
          </div>
          <div>
            <h1 className="sidebar-brand-title">{t.brandTitle || 'MaatiKatha'}</h1>
            <div className="sidebar-brand-tagline">
              {t.brandTagline || 'Story of the Soil'}
            </div>
          </div>
        </div>

        {/* 8 Feature Navigation Items */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`sidebar-nav-btn ${isActive ? 'active' : ''}`}
                aria-label={item.label}
              >
                <Icon size={19} color={isActive ? '#ffffff' : '#94a3b8'} style={{ flexShrink: 0 }} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Dedicated Language Selector Section in Left Sidebar */}
        <LanguageSelector 
          currentLanguage={language} 
          onLanguageChange={handleLanguageChange} 
          variant="sidebar" 
        />

        {/* Sidebar Telemetry Footer */}
        <div className="sidebar-footer">
          {currentUser && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', background: 'rgba(34,197,94,0.08)', borderRadius: '10px', padding: '8px 10px' }}>
              {currentUser.avatar_url ? (
                <img src={currentUser.avatar_url} alt={currentUser.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #22c55e', flexShrink: 0 }} />
              ) : (
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg,#15803d,#166534)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: '800', color: '#fff', flexShrink: 0 }}>
                  {(currentUser.name || 'U')[0].toUpperCase()}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#fff', fontSize: '0.78rem', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser.name}</div>
                <div style={{ color: '#64748b', fontSize: '0.67rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser.email}</div>
              </div>
              <button onClick={handleLogout} title={t.logOut || "Log out"} style={{ background: 'rgba(255,255,255,0.07)', border: 'none', color: '#94a3b8', width: '26px', height: '26px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0 }}>⏏</button>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4ade80', fontWeight: '700' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span>
            <span>{t.connectedBadge || 'MongoDB Atlas Connected'}</span>
          </div>
          <div style={{ color: '#94a3b8', fontSize: '0.72rem' }}>
            {t.platformType || 'Zero-Hardware Agritech Platform'}
          </div>
        </div>
      </aside>

      {/* 2. RIGHT MAIN CONTENT PANE */}
      <div className="main-content-pane">
        {/* Top Contextual Action Bar */}
        <header className="top-action-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f5132' }}>
              {activeTitle}
            </span>
            {detectStatus ? (
              <span style={{ fontSize: '0.75rem', color: '#15803d', background: '#dcfce7', padding: '3px 10px', borderRadius: '10px', fontWeight: '700', border: '1px solid #bbf7d0' }}>
                {detectStatus}
              </span>
            ) : (
              <span style={{ fontSize: '0.72rem', color: '#047857', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '8px', fontWeight: '600' }}>
                📍 {currentLocation.city || currentLocation.name} ({currentLocation.lat ? Number(currentLocation.lat).toFixed(2) : '22.57'}°N, {currentLocation.lon ? Number(currentLocation.lon).toFixed(2) : '88.32'}°E)
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Top Action Bar Language Changer Pill */}
            <LanguageSelector 
              currentLanguage={language} 
              onLanguageChange={handleLanguageChange} 
              variant="pill" 
            />

            {/* Google Maps Precision Field Tracker Button */}
            <button
              onClick={() => setShowGoogleMapModal(true)}
              title="Open Google Maps Satellite Field Tracker & Plot Pinning"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(135deg, #0e3d23, #0284c7)',
                color: 'white',
                border: 'none',
                padding: '7px 14px',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
                transition: 'all 0.15s ease'
              }}
            >
              <Globe2 size={14} />
              <span>{t.topBar.googleMapBtn}</span>
            </button>

            {/* Auto-Detect My Location GPS Button */}
            <button
              onClick={() => autoDetectLocation(true)}
              disabled={isDetecting}
              title="Automatically detect my exact live location via GPS"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#15803d',
                color: 'white',
                border: 'none',
                padding: '7px 14px',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(21, 128, 61, 0.25)',
                transition: 'all 0.15s ease'
              }}
            >
              {isDetecting ? (
                <div className="pulse-spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} />
              ) : (
                <Navigation size={14} />
              )}
              <span>{isDetecting ? t.topBar.locatingBtn : t.topBar.autoDetectBtn}</span>
            </button>

            {/* Comprehensive All-District Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#ecfdf5', padding: '6px 14px', borderRadius: '12px', border: '1px solid #d1fae5', fontSize: '0.82rem', color: '#065f46', fontWeight: '700' }}>
              <MapPin size={15} color="#15803d" />
              <select
                value={currentRegion}
                onChange={(e) => handleSelectDistrict(e.target.value)}
                style={{ background: 'transparent', border: 'none', fontWeight: '700', color: '#065f46', cursor: 'pointer', outline: 'none', fontSize: '0.84rem', maxWidth: '210px' }}
                aria-label="Select Region"
              >
                <option value={currentRegion}>📍 {currentRegion} ({currentLocation.detectedVia || 'Auto'})</option>
                
                {INDIAN_DISTRICTS.map((stateGroup, i) => (
                  <optgroup key={i} label={stateGroup.state}>
                    {stateGroup.districts.map((d, j) => (
                      <option key={j} value={d.name}>
                        {d.name} ({stateGroup.state.split(' ')[0]})
                      </option>
                    ))}
                  </optgroup>
                ))}

                <option value="__custom_search__">{t.topBar.searchOption}</option>
              </select>
            </div>
          </div>
        </header>

        {/* Dynamic Screen Content */}
        <main className="main-wrapper" style={{ padding: '24px', flex: 1 }}>
          {currentTab === 'dashboard' && (
            <Dashboard 
              language={language} 
              currentRegion={currentRegion} 
              currentLocation={currentLocation}
              onNavigate={(tab) => setCurrentTab(tab)} 
              onOpenGoogleMap={() => setShowGoogleMapModal(true)}
            />
          )}

          {currentTab === 'doctor' && (
            <VoiceDoctor 
              language={language} 
              onLanguageChange={handleLanguageChange}
              currentRegion={currentRegion}
              currentLocation={currentLocation} 
            />
          )}

          {currentTab === 'timemachine' && (
            <GenerationalTimeMachine 
              language={language} 
              currentLocation={currentLocation} 
            />
          )}

          {currentTab === 'simulator' && (
            <WhatIfSimulator 
              language={language} 
              currentLocation={currentLocation} 
            />
          )}

          {currentTab === 'riturakhok' && (
            <RituRakhok 
              language={language} 
              currentRegion={currentRegion} 
              currentLocation={currentLocation} 
            />
          )}

          {currentTab === 'khamardrishti' && (
            <KhamarDrishti 
              language={language} 
              currentRegion={currentRegion} 
              currentLocation={currentLocation} 
            />
          )}

          {currentTab === 'seeds' && (
            <AncestralSeeds 
              language={language} 
              currentLocation={currentLocation} 
            />
          )}

          {currentTab === 'mandi' && (
            <MandiMarket 
              language={language} 
              currentRegion={currentRegion} 
              currentLocation={currentLocation} 
            />
          )}
        </main>

        {/* Professional Enterprise Footer */}
        <footer style={{ background: '#0a2e1a', color: '#94a3b8', borderTop: '1px solid rgba(255, 255, 255, 0.1)', padding: '20px 24px', marginTop: 'auto' }}>
          <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', fontSize: '0.82rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src="/logo.jpg" alt="Logo" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
              <span style={{ fontWeight: '800', color: 'white' }}>{t.footerEnterprise || 'MaatiKatha — Story of the Soil • Zero-Hardware Agritech Enterprise'}</span>
            </div>
            <div style={{ color: '#64748b', fontSize: '0.78rem' }}>
              {t.footerTech || 'Google Gemini Flash • Open-Meteo • ISRIC SoilGrids • AGMARKNET Mandi'}
            </div>
          </div>
        </footer>
      </div>

      {/* Custom City / Village Search Modal */}
      {showSearchModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '420px' }}>
            <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f5132', marginBottom: '8px' }}>
              {t.searchModal.title}
            </h4>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '16px' }}>
              {t.searchModal.desc}
            </p>
            <form onSubmit={handleCustomSearchSubmit}>
              <input
                type="text"
                autoFocus
                value={customSearchQuery}
                onChange={(e) => setCustomSearchQuery(e.target.value)}
                placeholder={t.searchModal.placeholder}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #10b981', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }}
              />
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowSearchModal(false)}
                  style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '9px 16px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}
                >
                  {t.searchModal.cancelBtn}
                </button>
                <button
                  type="submit"
                  style={{ background: '#15803d', color: 'white', border: 'none', padding: '9px 20px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}
                >
                  {t.searchModal.confirmBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Google Maps Precision Location Tracker Modal */}
      <GoogleMapTracker
        isOpen={showGoogleMapModal}
        onClose={() => setShowGoogleMapModal(false)}
        currentLocation={currentLocation}
        onLocationSelected={handleLocationSelectedFromGoogleMap}
        language={language}
      />
    </div>
  );
}

