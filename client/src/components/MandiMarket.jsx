import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Store, 
  MapPin, 
  RefreshCw, 
  Key, 
  CheckCircle2, 
  ShieldCheck, 
  Info, 
  Filter, 
  ExternalLink,
  Sparkles,
  BarChart3,
  Calendar
} from 'lucide-react';

export default function MandiMarket({ language, currentRegion, currentLocation }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mandiItems, setMandiItems] = useState([]);
  const [districtBenchmarks, setDistrictBenchmarks] = useState([]);
  const [metaInfo, setMetaInfo] = useState(null);
  const [customApiKey, setCustomApiKey] = useState(() => {
    return localStorage.getItem('mk_data_gov_in_key') || '';
  });
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [saveKeySuccess, setSaveKeySuccess] = useState(false);

  const district = currentLocation?.district || currentRegion || 'Howrah';

  const fetchMandiData = async (keyOverride = customApiKey) => {
    setLoading(true);
    setIsRefreshing(true);
    try {
      const queryKey = keyOverride || '';
      const url = queryKey 
        ? `/api/mandi?state=West+Bengal&apiKey=${encodeURIComponent(queryKey)}`
        : `/api/mandi?state=West+Bengal`;

      const [mRes, bRes] = await Promise.all([
        fetch(url),
        fetch(`/api/v1/mandi/benchmarks?district=${encodeURIComponent(district)}`)
      ]);

      const data = await mRes.json();
      const bData = await bRes.json();

      if (data.status === 'success' && data.records) {
        setMandiItems(data.records);
        setMetaInfo(data);
      }
      if (bData.status === 'success' && bData.benchmarks) {
        setDistrictBenchmarks(bData.benchmarks);
      }
    } catch (err) {
      console.warn('[MandiMarket] Fetch warning:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMandiData();
  }, [district]);

  const handleSaveApiKey = (e) => {
    e.preventDefault();
    localStorage.setItem('mk_data_gov_in_key', customApiKey.trim());
    setSaveKeySuccess(true);
    setTimeout(() => setSaveKeySuccess(false), 2500);
    fetchMandiData(customApiKey.trim());
  };

  const filteredItems = selectedCategory === 'all' 
    ? mandiItems 
    : mandiItems.filter(item => {
        const str = (item.commodity + ' ' + item.crop).toLowerCase();
        if (selectedCategory === 'paddy') return str.includes('paddy') || str.includes('dhan');
        if (selectedCategory === 'oilseed') return str.includes('mustard') || str.includes('sari');
        if (selectedCategory === 'fiber') return str.includes('jute') || str.includes('pat');
        if (selectedCategory === 'vegetables') return str.includes('potato') || str.includes('cauliflower') || str.includes('alu');
        return true;
      });

  const t = {
    bn: {
      badge: "লাইভ পাইকারি মান্ডি দর • AGMARKNET",
      title: "কৃষি মান্ডি বাজার ও ন্যায্য মূল্য সহায়িকা",
      subtitle: "পশ্চিমবঙ্গের কৃষি মান্ডির লাইভ ফসল দর, সরকারি MSP তুলনা ও সর্বোচ্চ মূল্যে বিক্রির কৌশল",
      mandiLocation: "বর্তমান মান্ডি:",
      currentPrice: "প্রতি কুইন্টাল দর:",
      mspLabel: "সরকারি MSP দর:",
      trendLabel: "৭ দিনের প্রবণতা:",
      adviceLabel: "কৃষক পরামর্শ ও কৌশল:",
      apiKeyBadge: "data.gov.in সরকারি API লিংক",
      refreshBtn: "রিফ্রেশ করুন",
      saveKeyBtn: "কী সংরক্ষণ ও ফেচ করুন"
    },
    hi: {
      badge: "लाइव कृषि मंडी भाव • AGMARKNET",
      title: "मंडी बाजार व फसल मूल्य सूचकांक",
      subtitle: "पश्चिम बंगाल की प्रमुख मंडियों के लाइव भाव, सरकारी MSP तुलना व बिक्री की सही रणनीति",
      mandiLocation: "मंडी परिसर:",
      currentPrice: "प्रति क्विंटल भाव:",
      mspLabel: "सरकारी MSP:",
      trendLabel: "7 दिवसीय रुझान:",
      adviceLabel: "किसान सलाह व रणनीति:",
      apiKeyBadge: "data.gov.in सरकारी API लिंक",
      refreshBtn: "रिफ्रेश करें",
      saveKeyBtn: "कुंजी सहेजें व फेच करें"
    },
    en: {
      badge: "Live Wholesale APMC Rates • AGMARKNET",
      title: "Mandi Market Intelligence & Fair Price Ticker",
      subtitle: "Live commodity price benchmarks for West Bengal, MSP comparisons, and optimal selling timing",
      mandiLocation: "Market Center:",
      currentPrice: "Price per Quintal:",
      mspLabel: "Govt MSP Rate:",
      trendLabel: "7-Day Trend:",
      adviceLabel: "Strategic Selling Advice:",
      apiKeyBadge: "data.gov.in Official API Link",
      refreshBtn: "Refresh Live Feed",
      saveKeyBtn: "Save Key & Fetch"
    }
  }[language] || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Banner */}
      <div className="mk-card mk-card-amber" style={{ padding: '28px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#d97706', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: '800', marginBottom: '10px' }}>
              <Store size={15} />
              <span>{t.badge}</span>
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#78350f', marginBottom: '6px' }}>{t.title}</h2>
            <p style={{ fontSize: '0.92rem', color: '#92400e', maxWidth: '640px' }}>{t.subtitle}</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setShowKeyInput(!showKeyInput)}
              style={{
                background: '#fef3c7',
                color: '#92400e',
                border: '1px solid #fcd34d',
                padding: '10px 16px',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '0.84rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Key size={15} />
              <span>{showKeyInput ? 'Hide API Key' : 'Configure data.gov.in Key'}</span>
            </button>

            <button
              onClick={() => fetchMandiData()}
              disabled={isRefreshing}
              style={{
                background: '#d97706',
                color: 'white',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '0.84rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(217, 119, 6, 0.25)'
              }}
            >
              <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
              <span>{t.refreshBtn}</span>
            </button>
          </div>
        </div>

        {/* Live API Telemetry Strip */}
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #fde68a', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', fontSize: '0.8rem', color: '#78350f' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: '9px', height: '9px', borderRadius: '50%', background: metaInfo?.live_connected ? '#16a34a' : '#d97706', boxShadow: '0 0 8px currentColor' }}></span>
            <span style={{ fontWeight: '800' }}>
              {metaInfo?.live_connected ? '🟢 Live data.gov.in Connected' : '🟡 AGMARKNET West Bengal Official Benchmark'}
            </span>
            <span style={{ opacity: 0.8 }}>• Resource: <code>9ef84268-d588-465a-a308-a864a43d0070</code></span>
          </div>

          <a 
            href="https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070" 
            target="_blank" 
            rel="noreferrer" 
            style={{ color: '#b45309', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'underline', fontWeight: '700' }}
          >
            <span>OGD Platform Source Link</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* API Key Configuration Drawer */}
      {showKeyInput && (
        <div className="mk-card" style={{ background: '#fffbeb', border: '2px dashed #f59e0b', padding: '20px', borderRadius: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#92400e', fontWeight: '800', marginBottom: '8px' }}>
            <Key size={18} />
            <span>Connect Your Free data.gov.in API Key</span>
          </div>
          <p style={{ fontSize: '0.84rem', color: '#78350f', marginBottom: '14px', lineHeight: '1.5' }}>
            You can get your free API key at <a href="https://data.gov.in" target="_blank" rel="noreferrer" style={{ textDecoration: 'underline', fontWeight: 'bold' }}>data.gov.in</a> to query the AGMARKNET dataset directly for real-time market arrivals across all 28 states and 700+ districts.
          </p>
          <form onSubmit={handleSaveApiKey} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Paste your data.gov.in API key here..."
              value={customApiKey}
              onChange={(e) => setCustomApiKey(e.target.value)}
              style={{
                flex: '1',
                minWidth: '280px',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid #d97706',
                background: 'white',
                fontSize: '0.88rem',
                fontFamily: 'monospace'
              }}
            />
            <button
              type="submit"
              style={{
                background: '#d97706',
                color: 'white',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '10px',
                fontWeight: '700',
                fontSize: '0.86rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <CheckCircle2 size={16} />
              <span>{t.saveKeyBtn}</span>
            </button>
          </form>
          {saveKeySuccess && (
            <div style={{ marginTop: '10px', color: '#16a34a', fontSize: '0.82rem', fontWeight: '700' }}>
              ✓ API key updated and saved in local storage! Fetching live records...
            </div>
          )}
        </div>
      )}

      {/* Category Filter Pills */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {[
          { id: 'all', label: '🌾 All Commodities' },
          { id: 'paddy', label: '🍚 Paddy / Rice' },
          { id: 'oilseed', label: '🌻 Mustard Oilseed' },
          { id: 'fiber', label: '🌿 Raw Jute (Pat)' },
          { id: 'vegetables', label: '🥔 Potato & Veggies' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: selectedCategory === cat.id ? '2px solid #d97706' : '1px solid #e2e8f0',
              background: selectedCategory === cat.id ? '#fef3c7' : 'white',
              color: selectedCategory === cat.id ? '#92400e' : '#475569',
              fontWeight: '700',
              fontSize: '0.84rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Mandi Commodity Cards Grid */}
      <div className="responsive-two-col">
        {filteredItems.map((item) => (
          <div key={item.id} className="mk-card card-hover-lift" style={{ borderLeft: '6px solid #d97706', padding: '24px' }}>
            
            {/* Header: Commodity & Price */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1e293b' }}>
                  🌾 {item.crop || item.commodity}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', color: '#64748b', marginTop: '4px' }}>
                  <MapPin size={15} color="#d97706" />
                  <span style={{ fontWeight: '600' }}>{item.market}</span>
                  <span style={{ opacity: 0.7 }}>({item.district || 'West Bengal'})</span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0f5132' }}>
                  ₹{Number(item.modal_price).toLocaleString()}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>
                  Modal Price / Quintal
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', fontSize: '0.8rem', fontWeight: '800', color: item.trendUp ? '#15803d' : '#dc2626', marginTop: '2px' }}>
                  {item.trendUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  <span>{item.trend}</span>
                </div>
              </div>
            </div>

            {/* Price Spread & MSP Benchmark */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', background: '#f8fafc', padding: '12px', borderRadius: '12px', fontSize: '0.78rem', color: '#475569', marginBottom: '14px', border: '1px solid #f1f5f9' }}>
              <div>
                <span style={{ color: '#64748b', display: 'block' }}>Min Range</span>
                <b style={{ color: '#0f172a' }}>₹{Number(item.min_price).toLocaleString()}</b>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block' }}>Max Range</span>
                <b style={{ color: '#0f172a' }}>₹{Number(item.max_price).toLocaleString()}</b>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block' }}>Govt MSP</span>
                <b style={{ color: '#16a34a' }}>₹{Number(item.msp_price).toLocaleString()}</b>
              </div>
            </div>

            {/* Arrival Volume Strip */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#64748b', marginBottom: '12px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <BarChart3 size={14} color="#d97706" />
                <span>Daily Arrival:</span>
                <b style={{ color: '#1e293b' }}>{item.arrival_volume}</b>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={14} color="#64748b" />
                <span>State: <b>{item.state || 'West Bengal'}</b></span>
              </span>
            </div>

            {/* Selling Advice Protocol */}
            <div style={{ background: '#fffbeb', padding: '12px 14px', borderRadius: '12px', border: '1px solid #fde68a' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#b45309', marginBottom: '3px' }}>
                💡 {t.adviceLabel}
              </div>
              <p style={{ fontSize: '0.85rem', color: '#78350f', lineHeight: '1.4', margin: 0 }}>
                {item.selling_advice}
              </p>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
