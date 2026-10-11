import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Brain, 
  Send, 
  Terminal, 
  Zap, 
  Leaf, 
  ShieldCheck, 
  Cpu, 
  RotateCcw,
  Compass,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  DollarSign
} from 'lucide-react';

export default function SimulationOracleChat({ 
  simulationResult, 
  scenarioId, 
  scenarioName, 
  dayOffset, 
  language = 'en' 
}) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const ledgerContainerRef = useRef(null);

  // Initial greeting and analysis in the Ledger
  const getInitialOracleMessage = () => {
    const stress = simulationResult?.stress_increase_pct ?? 0;
    const yieldVar = simulationResult?.yield_variation_pct ?? 0;
    const cost = simulationResult?.cost_savings_inr ?? 0;

    if (language === 'bn') {
      return `[সিমুলেশন টেলিমეტ্রি সক্রিয়] [চাপ স্তর: ${stress}%] [ফলন সূচক: ${yieldVar > 0 ? '+' : ''}${yieldVar}%] [আর্থিক প্রভাব: ₹${cost}]\n\n• **কৃষি ওরাকল বিশ্লেষণ প্রস্তুত**: "${scenarioName || scenarioId}" সিদ্ধান্তের জন্য প্রক্ষেপণ গণনা সম্পন্ন হয়েছে।\n• মাটির মূলমণ্ডলের জীবাণু সক্রিয়তা, আবহাওয়া সংবেদনশীলতা অথবা জৈব রসায়নিক পরিবর্তন সম্পর্কে যে কোনো প্রশ্ন বা হাইপোথিসিস উত্থাপন করতে পারেন।`;
    } else if (language === 'hi') {
      return `[सिमुलेशन टेलीमेट्री सक्रिय] [तनाव स्तर: ${stress}%] [उपज सूचकांक: ${yieldVar > 0 ? '+' : ''}${yieldVar}%] [आर्थिक प्रभाव: ₹${cost}]\n\n• **एग्री-ओरेकल विश्लेषण तैयार**: "${scenarioName || scenarioId}" निर्णय के लिए पूर्वानुमान लोड हो चुका है।\n• मिट्टी के सूक्ष्मजीव, मौसम संवेदनशीलता अथवा रासायनिक परिवर्तनों के बारे में अपना परिकल्पनात्मक प्रश्न पूछें।`;
    } else {
      return `[Simulation Telemetry Active] [Stress Delta: ${stress}%] [Yield Index: ${yieldVar > 0 ? '+' : ''}${yieldVar}%] [Cost Delta: ₹${cost}]\n\n• **Agri-Oracle Synthesis Complete**: Projections for "${scenarioName || scenarioId}" are locked into the biological neural engine.\n• You may now formulate hypotheses regarding rhizosphere mechanics, sudden weather variations, or microbial kinetics below.`;
    }
  };

  const [history, setHistory] = useState([
    {
      role: 'oracle',
      content: getInitialOracleMessage(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Update initial message ONLY if the scenario genuinely changes
  const prevScenarioIdRef = useRef(scenarioId);
  useEffect(() => {
    if (prevScenarioIdRef.current !== scenarioId) {
      prevScenarioIdRef.current = scenarioId;
      setHistory([
        {
          role: 'oracle',
          content: getInitialOracleMessage(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [scenarioId]);

  // Auto-scroll ONLY the inner ledger container, NEVER the window or whole page
  useEffect(() => {
    if (ledgerContainerRef.current) {
      ledgerContainerRef.current.scrollTop = ledgerContainerRef.current.scrollHeight;
    }
  }, [history, loading]);

  // Contextual Smart Suggestion Chips based on current scenario & results
  const getDynamicSuggestionChips = () => {
    const stress = simulationResult?.stress_increase_pct ?? 0;

    const chips = [];

    if (stress <= 0) {
      if (language === 'bn') {
        chips.push("চাপ হ্রাসের জৈবিক প্রক্রিয়া ব্যাখ্যা করুন");
        chips.push("এই সময়ে ভারী বৃষ্টি হলে কী ঘটবে?");
        chips.push("বিস্তারিত আর্থিক সাশ্রয় ও খরচের হিসাব");
        chips.push("মাটিতে কোন উপকারী ব্যাকটেরিয়া সক্রিয় হচ্ছে?");
      } else if (language === 'hi') {
        chips.push("तनाव कम होने की जैविक क्रियाविधि समझाएं");
        chips.push("यदि इस दौरान वर्षा हो जाए तो क्या असर होगा?");
        chips.push("विस्तृत आर्थिक बचत व लाभ का विश्लेषण");
        chips.push("कौन से सूक्ष्मजीव सक्रिय हो रहे हैं?");
      } else {
        chips.push("Explain the stress reduction mechanism");
        chips.push("What if it rains during this protocol?");
        chips.push("Detailed financial breakdown & ROI");
        chips.push("Which rhizosphere microbes are multiplying?");
      }
    } else {
      if (language === 'bn') {
        chips.push("শিকড়ের জলশূন্যতা ও অবসাদের বিস্তার ব্যাখ্যা করুন");
        chips.push("তীব্র তাপপ্রবাহে ফসলের ক্ষতি মোকাবিলার উপায়");
        chips.push("জরুরি ভিত্তিতে ফলন রক্ষার পদক্ষেপ");
        chips.push("রাসায়নিক লবণের আস্তরণ কাটানোর প্রাচীন কৌশল");
      } else if (language === 'hi') {
        chips.push("जड़ों में पानी की कमी के प्रभाव को समझाइए");
        chips.push("तीव्र लू व गर्मी में नुकसान से कैसे बचें?");
        chips.push("आपातकालीन उपज सुरक्षा उपाय क्या हैं?");
        chips.push("रासायनिक नमक की पपड़ी कैसे तोड़ें?");
      } else {
        chips.push("Explain root dehydration & osmotic stress");
        chips.push("What if a severe heatwave strikes now?");
        chips.push("Emergency yield stabilization protocol");
        chips.push("How to neutralize chemical salt buildup?");
      }
    }

    // Scenario-specific deep queries
    if (scenarioId === 'add_cowdung') {
      chips.push(language === 'bn' ? "গোবর ও কাঠের ছাইয়ের নিখুঁত অনুপাত কী?" : language === 'hi' ? "गोबर व राख का सटीक अनुपात क्या हो?" : "Optimal cow dung to wood ash ratio?");
    } else if (scenarioId === 'skip_water') {
      chips.push(language === 'bn' ? "স্প্রে দিয়ে কি সেচের অভাব মেটানো সম্ভব?" : language === 'hi' ? "क्या फोलियर स्प्रे से सिंचाई की भरपाई संभव है?" : "Can foliar spray compensate for missed watering?");
    } else if (scenarioId === 'bio_mulch') {
      chips.push(language === 'bn' ? "বিঘা প্রতি কত পুরু খড় বিছানো প্রয়োজন?" : language === 'hi' ? "प्रति बीघा पुआल की कितनी मोटाई आवश्यक है?" : "Optimal straw mulch thickness per bigha?");
    } else if (scenarioId === 'chemical_urea') {
      chips.push(language === 'bn' ? "ইউরিয়া থেকে ধাপে ধাপে জৈবে ফেরার রোডম্যাপ" : language === 'hi' ? "यूरिया से जैविक में बदलने की योजना" : "Stepwise transition plan away from synthetic urea");
    }

    return chips;
  };

  const handleSend = async (textToSend) => {
    const promptQuery = (textToSend || query).trim();
    if (!promptQuery || loading) return;

    const userEntry = {
      role: 'user',
      content: promptQuery,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setHistory(prev => [...prev, userEntry]);
    setQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/simulate/oracle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: promptQuery,
          scenarioId,
          scenarioName,
          dayOffset,
          simulationResult,
          language,
          chatHistory: history.slice(-4)
        })
      });

      const data = await res.json();
      if (data.status === 'success' && data.answer) {
        setHistory(prev => [
          ...prev,
          {
            role: 'oracle',
            content: data.answer,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        throw new Error(data.message || 'Oracle computation error');
      }
    } catch (err) {
      console.error('[Oracle] Request error:', err);
      const fallbackText = language === 'bn'
        ? "[ওরাকল সংকেত: ব্যাকআপ মোড]\n• মূলমণ্ডলে পুষ্টি শোষণ চক্র অব্যাহত রয়েছে। মাটির আর্দ্রতা পরীক্ষা করে ৩ দিন পর পুনরায় পর্যবেক্ষণ করুন।"
        : language === 'hi'
        ? "[ओरेकल सिग्नल: सुरक्षित मोड]\n• जड़ क्षेत्र में सूक्ष्मजैविक प्रक्रिया जारी है। मिट्टी में उचित नमी बनाए रखें।"
        : "[Oracle Signal: Contingency Protocol]\n• Biological buffering remains active. Monitor soil moisture tension and ensure minimal chemical salt interference.";

      setHistory(prev => [
        ...prev,
        {
          role: 'oracle',
          content: fallbackText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Rich response parser for badges, bullet points, and highlighted biological/chemical terms
  const renderFormattedOracleText = (rawText) => {
    // Split into paragraphs / lines
    const lines = rawText.split('\n');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} style={{ height: '4px' }} />;

          // Process markdown headers
          if (trimmed.startsWith('###')) {
            return (
              <div key={idx} style={{ 
                color: '#86efac', 
                fontSize: '0.98rem', 
                fontWeight: '900', 
                marginTop: '10px',
                marginBottom: '4px',
                letterSpacing: '0.02em',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                {trimmed.replace(/^###\s*/, '')}
              </div>
            );
          }

          // Format tokens inside the line
          const formattedContent = parseInlineStyles(line);

          // Check if it is a bullet item
          if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
            return (
              <div 
                key={idx} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '10px', 
                  fontSize: '0.92rem', 
                  lineHeight: '1.65',
                  color: '#e2e8f0',
                  paddingLeft: '4px'
                }}
              >
                <span style={{ color: '#4ade80', fontSize: '1.1rem', lineHeight: '1.4' }}>✦</span>
                <div style={{ flex: 1 }}>{formattedContent}</div>
              </div>
            );
          }

          return (
            <p key={idx} style={{ margin: 0, fontSize: '0.92rem', lineHeight: '1.65', color: '#e2e8f0' }}>
              {formattedContent}
            </p>
          );
        })}
      </div>
    );
  };

  // Parse [Metric Badges], **Bold Words**, and *Microbial / Chemical terms*
  const parseInlineStyles = (text) => {
    // Regex for [Bracketed Badges]
    const parts = [];
    const badgeRegex = /\[(.*?)\]/g;
    let lastIndex = 0;
    let match;

    while ((match = badgeRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(renderTextWithFormatting(text.slice(lastIndex, match.index)));
      }
      parts.push(
        <span
          key={`badge-${match.index}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'rgba(74, 222, 128, 0.15)',
            border: '1px solid #4ade80',
            color: '#86efac',
            padding: '2px 9px',
            borderRadius: '12px',
            fontSize: '0.76rem',
            fontWeight: '900',
            letterSpacing: '0.03em',
            margin: '0 4px',
            verticalAlign: 'middle',
            boxShadow: '0 0 10px rgba(74, 222, 128, 0.25)'
          }}
        >
          {match[1]}
        </span>
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(renderTextWithFormatting(text.slice(lastIndex)));
    }

    return parts;
  };

  const renderTextWithFormatting = (plainStr) => {
    // Highlight biological terms and bold markdown
    const tokens = plainStr.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return tokens.map((token, tIdx) => {
      if (token.startsWith('**') && token.endsWith('**')) {
        return <strong key={tIdx} style={{ color: '#fef08a', fontWeight: '800' }}>{token.slice(2, -2)}</strong>;
      }
      if (token.startsWith('*') && token.endsWith('*')) {
        return (
          <span 
            key={tIdx} 
            style={{ 
              color: '#67e8f9', 
              fontStyle: 'italic', 
              fontWeight: '700',
              textShadow: '0 0 8px rgba(103, 232, 249, 0.3)' 
            }}
          >
            {token.slice(1, -1)}
          </span>
        );
      }
      return token;
    });
  };

  return (
    <div 
      className="oracle-terminal-container"
      style={{
        marginTop: '28px',
        background: 'linear-gradient(145deg, #021a0d 0%, #052416 60%, #041f12 100%)',
        borderRadius: '26px',
        border: '1.5px solid rgba(74, 222, 128, 0.35)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.55), inset 0 0 40px rgba(4, 120, 87, 0.15)',
        backdropFilter: 'blur(16px)',
        padding: '26px 28px',
        color: '#f8fafc',
        position: 'relative',
        overflow: 'hidden',
        animation: 'oracleEntrance 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards'
      }}
    >
      <style>{`
        @keyframes oracleEntrance {
          from {
            opacity: 0;
            transform: translateY(22px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes dnaPulse {
          0% { transform: scaleY(0.4); opacity: 0.3; }
          50% { transform: scaleY(1.2); opacity: 1; }
          100% { transform: scaleY(0.4); opacity: 0.3; }
        }
        .oracle-dna-bar {
          display: inline-block;
          width: 3px;
          height: 18px;
          background: #4ade80;
          border-radius: 2px;
          margin: 0 3px;
          animation: dnaPulse 1.1s ease-in-out infinite;
        }
      `}</style>

      {/* Terminal Title Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingBottom: '16px', 
        borderBottom: '1px solid rgba(74, 222, 128, 0.2)',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '12px', 
            background: 'rgba(74, 222, 128, 0.15)', 
            border: '1.5px solid #4ade80',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(74, 222, 128, 0.3)'
          }}>
            <Brain size={22} color="#86efac" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.72rem', letterSpacing: '0.12em', color: '#4ade80', fontWeight: '900', textTransform: 'uppercase' }}>
                NEURAL ORACLE BIO-TERMINAL
              </span>
              <span style={{ 
                width: '7px', 
                height: '7px', 
                borderRadius: '50%', 
                background: '#4ade80',
                boxShadow: '0 0 8px #4ade80'
              }} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.28rem', fontWeight: '900', color: '#f0fdf4', letterSpacing: '-0.01em' }}>
              {language === 'bn' ? 'সিমুলেশন ওরাকল ইন্টেলিজেন্স লেজার' : language === 'hi' ? 'सिमुलेशन ओरेकल इंटेलिजेंस लेजर' : 'Simulation Oracle Intelligence Ledger'}
            </h3>
          </div>
        </div>

        {/* Status Badge */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          background: 'rgba(6, 78, 59, 0.6)', 
          border: '1px solid rgba(74, 222, 128, 0.3)', 
          padding: '6px 14px', 
          borderRadius: '16px', 
          fontSize: '0.76rem', 
          color: '#86efac', 
          fontWeight: '800' 
        }}>
          <Terminal size={14} color="#4ade80" />
          <span>CONTEXT: {scenarioName || scenarioId} (+{dayOffset}D)</span>
        </div>
      </div>

      {/* Query & Insight Ledger Container */}
      <div 
        ref={ledgerContainerRef}
        className="oracle-ledger-scroll"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          maxHeight: '440px',
          overflowY: 'auto',
          paddingRight: '8px',
          marginBottom: '20px'
        }}
      >
        {history.map((entry, index) => {
          if (entry.role === 'user') {
            return (
              /* User Hypothesis Entry (Indented, Bold, Terminal Style) */
              <div 
                key={index} 
                style={{
                  alignSelf: 'stretch',
                  marginLeft: '24px',
                  padding: '14px 18px',
                  background: 'rgba(2, 44, 25, 0.75)',
                  border: '1px solid rgba(134, 239, 172, 0.3)',
                  borderRadius: '16px',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginBottom: '6px' 
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px', 
                    fontSize: '0.74rem', 
                    fontWeight: '900', 
                    color: '#facc15', 
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase'
                  }}>
                    <Compass size={13} color="#facc15" />
                    <span>FARMER HYPOTHESIS [{String(Math.ceil((index + 1) / 2)).padStart(2, '0')}]</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>
                    {entry.timestamp}
                  </span>
                </div>
                <div style={{ fontSize: '0.96rem', fontWeight: '800', color: '#fef08a', lineHeight: '1.5' }}>
                  "{entry.content}"
                </div>
              </div>
            );
          }

          return (
            /* AI Oracle Insight Entry (Block-quoted with Glowing Left Border) */
            <div 
              key={index} 
              style={{
                alignSelf: 'stretch',
                padding: '20px 22px',
                background: 'rgba(4, 30, 18, 0.85)',
                borderLeft: '4px solid #4ade80',
                borderTop: '1px solid rgba(74, 222, 128, 0.2)',
                borderRight: '1px solid rgba(74, 222, 128, 0.15)',
                borderBottom: '1px solid rgba(74, 222, 128, 0.2)',
                borderRadius: '0 18px 18px 0',
                boxShadow: '0 0 20px rgba(74, 222, 128, 0.12), inset 0 0 30px rgba(0, 0, 0, 0.4)',
                position: 'relative'
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '12px' 
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  fontSize: '0.74rem', 
                  fontWeight: '900', 
                  color: '#4ade80', 
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase'
                }}>
                  <Cpu size={14} color="#4ade80" />
                  <span>ORACLE BIOLOGICAL INSIGHT</span>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>
                  {entry.timestamp}
                </span>
              </div>

              {renderFormattedOracleText(entry.content)}
            </div>
          );
        })}

        {/* Pulsing DNA / Leaf Skeleton Loading Animation */}
        {loading && (
          <div 
            style={{
              padding: '20px 22px',
              background: 'rgba(4, 30, 18, 0.7)',
              borderLeft: '4px solid #facc15',
              borderRadius: '0 18px 18px 0',
              boxShadow: '0 0 20px rgba(250, 204, 21, 0.15)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span className="oracle-dna-bar" style={{ animationDelay: '0.0s' }} />
                <span className="oracle-dna-bar" style={{ animationDelay: '0.2s', background: '#facc15' }} />
                <span className="oracle-dna-bar" style={{ animationDelay: '0.4s' }} />
                <span className="oracle-dna-bar" style={{ animationDelay: '0.6s', background: '#86efac' }} />
                <span className="oracle-dna-bar" style={{ animationDelay: '0.8s' }} />
              </div>
              <span style={{ fontSize: '0.78rem', color: '#fef08a', fontWeight: '900', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {language === 'bn' 
                  ? 'মাটির মূলমণ্ডল ও জৈব রাসায়নিক গতিপ্রকৃতি বিশ্লেষণ চলছে...' 
                  : language === 'hi' 
                  ? 'मृदा जीवविज्ञान व रासायनिक गतिशीलता का विश्लेषण जारी...' 
                  : 'SYNTHESIZING RHIZOSPHERE MICROBIAL & EDAPHIC DYNAMICS...'}
              </span>
            </div>

            {/* Skeleton placeholder bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', opacity: 0.6 }}>
              <div style={{ height: '12px', width: '92%', background: 'rgba(74, 222, 128, 0.2)', borderRadius: '6px' }} />
              <div style={{ height: '12px', width: '78%', background: 'rgba(74, 222, 128, 0.15)', borderRadius: '6px' }} />
              <div style={{ height: '12px', width: '60%', background: 'rgba(74, 222, 128, 0.1)', borderRadius: '6px' }} />
            </div>
          </div>
        )}
      </div>

      {/* Contextual Quick Insight Suggestion Chips */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ 
          fontSize: '0.74rem', 
          fontWeight: '900', 
          color: '#86efac', 
          textTransform: 'uppercase', 
          letterSpacing: '0.08em', 
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <Sparkles size={13} color="#4ade80" />
          <span>{language === 'bn' ? 'প্রাসঙ্গিক দ্রুত অনুসন্ধান' : language === 'hi' ? 'त्वरित अंतर्दृष्टि सुझाव' : 'Contextual Quick Inquiries'}</span>
        </div>

        <div 
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '8px',
            scrollbarWidth: 'none'
          }}
        >
          {getDynamicSuggestionChips().map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              disabled={loading}
              className="card-hover-lift"
              style={{
                flexShrink: 0,
                background: 'rgba(6, 78, 59, 0.55)',
                border: '1px solid rgba(74, 222, 128, 0.35)',
                color: '#e2e8f0',
                padding: '7px 14px',
                borderRadius: '14px',
                fontSize: '0.78rem',
                fontWeight: '800',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(16, 185, 129, 0.35)';
                e.currentTarget.style.borderColor = '#4ade80';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(6, 78, 59, 0.55)';
                e.currentTarget.style.borderColor = 'rgba(74, 222, 128, 0.35)';
                e.currentTarget.style.color = '#e2e8f0';
              }}
            >
              <Zap size={12} color="#facc15" />
              <span>{chip}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stylized Input Console with Glowing Analyze Button */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        style={{
          display: 'flex',
          gap: '10px',
          background: 'rgba(2, 28, 16, 0.95)',
          border: '1.5px solid rgba(74, 222, 128, 0.4)',
          borderRadius: '18px',
          padding: '6px 8px 6px 16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4), inset 0 0 15px rgba(0, 0, 0, 0.5)'
        }}
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            language === 'bn'
              ? 'হাইপোথিসিস লিখুন (যেমন: বৃষ্টির প্রভাব বা শিকড়ের ব্যাকটেরিয়া)...'
              : language === 'hi'
              ? 'परिकल्पना लिखें (जैसे: वर्षा का असर अथवा सूक्ष्मजीवों का व्यवहार)...'
              : 'Formulate your agronomic hypothesis (e.g. rain resilience or microbial kinetics)...'
          }
          disabled={loading}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: '#ffffff',
            fontSize: '0.9rem',
            outline: 'none',
            fontFamily: 'inherit'
          }}
        />

        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="card-hover-lift"
          style={{
            background: query.trim() ? 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)' : 'rgba(22, 101, 52, 0.4)',
            color: query.trim() ? '#ffffff' : '#64748b',
            border: query.trim() ? '1px solid #4ade80' : '1px solid rgba(255,255,255,0.1)',
            padding: '10px 20px',
            borderRadius: '14px',
            fontSize: '0.84rem',
            fontWeight: '900',
            cursor: query.trim() && !loading ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: query.trim() ? '0 0 16px rgba(74, 222, 128, 0.4)' : 'none',
            transition: 'all 0.25s ease'
          }}
        >
          <Leaf size={16} color={query.trim() ? '#86efac' : '#64748b'} />
          <span>{language === 'bn' ? 'বিশ্লেষণ করুন' : language === 'hi' ? 'विश्लेषण करें' : 'Analyze'}</span>
        </button>
      </form>
    </div>
  );
}
