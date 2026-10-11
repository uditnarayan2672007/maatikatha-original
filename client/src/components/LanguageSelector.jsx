import React from 'react';
import { Globe2, Check, Sparkles } from 'lucide-react';
import { LANGUAGES, APP_TRANSLATIONS } from '../data/translations.js';

/**
 * Premium Language Selector Component for MaatiKatha
 * Supports: English ('en'), Bengali ('bn'), Hindi ('hi')
 * Variants:
 *  - 'pill' : Compact segmented control for Top Action Bar and Landing Page Header
 *  - 'sidebar' : Dedicated expanded interactive panel for the Left Navigation Sidebar
 */
export default function LanguageSelector({ 
  currentLanguage = 'en', 
  onLanguageChange,
  variant = 'pill',
  className = ''
}) {
  const currentLangObj = LANGUAGES.find(l => l.code === currentLanguage) || LANGUAGES[0];
  const t = APP_TRANSLATIONS[currentLanguage] || APP_TRANSLATIONS.en;

  // Variant 1: Compact Segmented Pill Control (Header / Action Bar / Landing Page)
  if (variant === 'pill') {
    return (
      <div 
        className={`mk-lang-pill-container ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          background: 'rgba(236, 253, 245, 0.95)',
          border: '1.5px solid #a7f3d0',
          borderRadius: '16px',
          padding: '3px 4px',
          gap: '3px',
          boxShadow: '0 2px 10px rgba(16, 185, 129, 0.08)',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.2s ease'
        }}
        role="group"
        aria-label="Language Selector"
      >
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px', 
            padding: '0 6px 0 6px',
            color: '#065f46',
            fontSize: '0.78rem',
            fontWeight: '800'
          }}
          title="Current Language"
        >
          <Globe2 size={14} color="#15803d" />
        </div>

        {LANGUAGES.map((lang) => {
          const isActive = currentLanguage === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => onLanguageChange && onLanguageChange(lang.code)}
              className={`mk-lang-chip ${isActive ? 'active' : ''}`}
              title={`Switch to ${lang.label} (${lang.nativeName})`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 10px',
                borderRadius: '12px',
                border: 'none',
                background: isActive 
                  ? 'linear-gradient(135deg, #15803d 0%, #0f5132 100%)' 
                  : 'transparent',
                color: isActive ? '#ffffff' : '#047857',
                fontSize: '0.8rem',
                fontWeight: isActive ? '800' : '700',
                cursor: 'pointer',
                transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isActive ? '0 3px 10px rgba(21, 128, 61, 0.28)' : 'none',
                transform: isActive ? 'scale(1.02)' : 'scale(1)',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            >
              <span style={{ fontSize: '0.9rem', lineHeight: 1 }}>{lang.flag}</span>
              <span style={{ letterSpacing: '-0.01em' }}>{lang.nativeName}</span>
              {isActive && (
                <span 
                  style={{ 
                    fontSize: '0.62rem', 
                    background: 'rgba(255, 255, 255, 0.25)', 
                    color: '#ffffff', 
                    padding: '1px 5px', 
                    borderRadius: '6px',
                    fontWeight: '900',
                    marginLeft: '2px'
                  }}
                >
                  {lang.shortCode}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Variant 2: Dedicated Left Sidebar Language Section
  return (
    <div 
      className={`mk-sidebar-lang-section ${className}`}
      style={{
        margin: '12px 14px 16px',
        padding: '14px',
        borderRadius: '18px',
        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)'
      }}
    >
      {/* Section Header */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '10px' 
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div 
            style={{ 
              width: '26px', 
              height: '26px', 
              borderRadius: '8px', 
              background: 'rgba(34, 197, 94, 0.18)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#4ade80'
            }}
          >
            <Globe2 size={15} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.01em' }}>
              {t.languageSectionTitle || 'Language / ভাষা / भाषा'}
            </div>
            <div style={{ fontSize: '0.66rem', color: '#94a3b8' }}>
              {t.languageSectionSubtitle || 'Select farming dialect'}
            </div>
          </div>
        </div>

        <span 
          style={{ 
            fontSize: '0.66rem', 
            fontWeight: '800', 
            color: '#4ade80', 
            background: 'rgba(34, 197, 94, 0.12)', 
            padding: '2px 8px', 
            borderRadius: '8px',
            border: '1px solid rgba(74, 222, 128, 0.25)' 
          }}
        >
          {currentLangObj.shortCode}
        </span>
      </div>

      {/* 3 Interactive Language Selection Tiles */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {LANGUAGES.map((lang) => {
          const isActive = currentLanguage === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => onLanguageChange && onLanguageChange(lang.code)}
              className={`mk-sidebar-lang-card ${isActive ? 'active' : ''}`}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: '12px',
                border: isActive 
                  ? '1.5px solid #22c55e' 
                  : '1px solid rgba(255, 255, 255, 0.08)',
                background: isActive 
                  ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.22) 0%, rgba(21, 128, 61, 0.3) 100%)' 
                  : 'rgba(255, 255, 255, 0.03)',
                color: isActive ? '#ffffff' : '#cbd5e1',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.18s ease',
                fontFamily: 'inherit',
                boxShadow: isActive ? '0 4px 14px rgba(34, 197, 94, 0.2)' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.15rem' }}>{lang.flag}</span>
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: '800', color: isActive ? '#ffffff' : '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{lang.nativeName}</span>
                    <span style={{ fontSize: '0.72rem', color: isActive ? '#86efac' : '#94a3b8', fontWeight: '600' }}>
                      ({lang.label})
                    </span>
                  </div>
                  <div style={{ fontSize: '0.64rem', color: isActive ? '#bbf7d0' : '#64748b' }}>
                    {lang.regionTag}
                  </div>
                </div>
              </div>

              {/* Status Radio Check */}
              <div 
                style={{ 
                  width: '20px', 
                  height: '20px', 
                  borderRadius: '50%', 
                  background: isActive ? '#22c55e' : 'rgba(255, 255, 255, 0.08)',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: isActive ? '0 0 10px rgba(34, 197, 94, 0.6)' : 'none',
                  flexShrink: 0
                }}
              >
                {isActive && <Check size={12} strokeWidth={3} />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
