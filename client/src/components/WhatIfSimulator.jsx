import React, { useState } from 'react';
import { 
  Sprout, Play, DollarSign, TrendingUp, AlertTriangle, Shield, 
  CheckCircle, Sparkles, Send, Bot, MessageSquare, ArrowRight, 
  Zap, RefreshCw, Sliders, Activity, Info, Clock, Check
} from 'lucide-react';
import SimulationOracleChat from './SimulationOracleChat.jsx';

export default function WhatIfSimulator({ language = 'bn' }) {
  const [selectedScenario, setSelectedScenario] = useState('add_cowdung');
  const [userMessage, setUserMessage] = useState('');
  const [simulatedScenarioTitle, setSimulatedScenarioTitle] = useState('গোবর ও ছাই সার প্রয়োগ');
  const [dayOffset, setDayOffset] = useState(2);
  const [simLoading, setSimLoading] = useState(false);
  const [hasRunSimulation, setHasRunSimulation] = useState(true);
  const [engineUsed, setEngineUsed] = useState('Google Gemini Flash AI');
  const [simulationResult, setSimulationResult] = useState({
    stress_increase_pct: -25,
    yield_variation_pct: 18,
    cost_savings_inr: 1450,
    warning_message: "গোবর ও ছাই সার মাটিতে আর্দ্রতা ধরে রেখে শিকড়ের ব্যাকটেরিয়া সক্রিয় করে।",
    ancestral_tip: "কাঠের ছাই ৩:১ অনুপাতে গোবরের সাথে মিশিয়ে প্রয়োগ করুন।",
    biological_mechanism: "গোবরের হিউমিক অ্যাসিড এবং কাঠের ছাইয়ের সিলিকা মাটির অম্লত্ব বাফার করে এবং শিকড়ের উপকারী ট্রাইকোডার্মা ও নাইট্রোজেন-ফিক্সিং ব্যাকটেরিয়ার ঘনত্ব বাড়ায়।",
    risk_rating: "LOW"
  });

  const t = {
    bn: {
      badge: "AI ভবিষ্যৎ সিদ্ধান্ত পরীক্ষা কেন্দ্র",
      agentBadge: "এআই সিমুলেশন এজেন্ট সক্রিয়",
      title: "'যদি এমন করি?' এআই ডিসিশন সিমুলেটর",
      subtitle: "মাঠে আসল ভুল বা ক্ষতি করার আগেই আপনার পরিকল্পনা লিখে বা অপশন বেছে এআই এজেন্টকে দিয়ে ফলাফল সিমুলেট করুন",
      agentPromptLabel: "কৃষি এআই এজেন্টকে আপনার সিদ্ধান্ত বা প্রশ্ন লিখুন:",
      agentPlaceholder: "যেমন: 'যদি আমি আগামী ৩ দিন জল না দিয়ে শুধু নিম পাতার রস স্প্রে করি তাহলে কী হবে?'...",
      sendAgentBtn: "এজেন্ট দিয়ে সিমুলেট করুন",
      quickPromptsTitle: "💡 দ্রুত সিদ্ধান্ত পরীক্ষা (ক্লিক করুন):",
      quickPrompts: [
        "৩ দিন সেচ বন্ধ রেখে খড়ের মালচিং দিলে কী হবে?",
        "ইউরিয়ার বদলে সরিষার খোল ও কাঠের ছাই দিলে লাভ কেমন?",
        "ভারী বৃষ্টির আগে গোবর সার প্রয়োগের ঝুঁকি কতটা?",
        "নিম পাতার নির্যাস ও কাঁচা হলুদ বাটা স্প্রে করলে ফলন প্রভাব?"
      ],
      orChoosePreset: "অথবা নির্ধারিত চাষের সিদ্ধান্ত বেছে নিন:",
      scenarios: [
        { 
          id: 'add_cowdung', 
          name: 'গোবর ও ছাই সার প্রয়োগ', 
          desc: 'ঐতিহ্যবাহী দেশীয় জৈব পুষ্টি ও আর্দ্রতা লক',
          icon: '🌱',
          badge: 'সবুজ বিকল্প'
        },
        { 
          id: 'skip_water', 
          name: '২ দিন সেচ বন্ধ রাখা', 
          desc: 'জলের অভাব, খরা সংবেদনশীলতা ও শিকড়ের চাপ',
          icon: '💧',
          badge: 'জল সাশ্রয়'
        },
        { 
          id: 'bio_mulch', 
          name: 'খড়ের জৈব মালচিং', 
          desc: 'বাষ্পীভবন রোধ, আগাছা দমন ও অনুজীব বৃদ্ধি',
          icon: '🌾',
          badge: 'মাটি সুরক্ষা'
        },
        { 
          id: 'chemical_urea', 
          name: 'রাসায়নিক ইউরিয়া প্রয়োগ', 
          desc: 'কৃত্রিম সার, লবণাক্ততা বৃদ্ধি ও দীর্ঘমেয়াদী ক্ষতি',
          icon: '🧪',
          badge: 'উচ্চ ঝুঁকি'
        }
      ],
      timingLabel: "কবে কার্যকর করবেন (টাইমিং):",
      runBtn: "নির্বাচিত সিদ্ধান্তের ফলাফল সিমুলেট করুন",
      stressTitle: "ফসলের মানসিক চাপ (Stress Delta)",
      yieldTitle: "ফলন পরিবর্তন (Yield Variation)",
      costTitle: "আর্থিক সাশ্রয় / লাভ (INR)",
      bioTitle: "মাটি ও উদ্ভিদের জৈবিক প্রক্রিয়া (Biological Mechanism):",
      wisdomTitle: "পূর্বপুরুষের পরীক্ষিত সমাধান (Ancestral Protocol):",
      daysUnit: "দিন পর",
      simulating: "এআই এজেন্ট সিমুলেশন গণনা করছে...",
      engineBadge: "নিউরাল কৃষি মডেল"
    },
    hi: {
      badge: "AI भविष्य निर्णय सिमुलेटर",
      agentBadge: "एआई सिमुलेशन एजेंट सक्रिय",
      title: "'क्या होगा अगर?' एआई डिसिजन सिमुलेटर",
      subtitle: "खेत में गलती या नुकसान करने से पहले अपने निर्णय लिखकर या विकल्प चुनकर एआई से परिणाम जांचें",
      agentPromptLabel: "कृषि एआई एजेंट से अपनी योजना या सवाल पूछें:",
      agentPlaceholder: "जैसे: 'यदि मैं अगले 3 दिन पानी न देकर केवल नीम का काढ़ा छिड़कूं तो क्या होगा?'...",
      sendAgentBtn: "एजेंट से सिमुलेट करें",
      quickPromptsTitle: "💡 त्वरित निर्णय सुझाव (क्लिक करें):",
      quickPrompts: [
        "3 दिन सिंचाई रोककर पुआल की मल्चिंग करने पर क्या होगा?",
        "यूरिया की जगह सरसों की खली व लकड़ी की राख से क्या असर होगा?",
        "तेज बारिश से पहले गोबर खाद डालने का कितना जोखिम है?",
        "नीम पत्ती अर्क व कच्ची हल्दी के छिड़काव से फसल पर प्रभाव?"
      ],
      orChoosePreset: "अथवा निर्धारित विकल्प चुनें:",
      scenarios: [
        { 
          id: 'add_cowdung', 
          name: 'गोबर व राख की खाद', 
          desc: 'पारम्परिक देशी पोषण व नमी संरक्षण',
          icon: '🌱',
          badge: 'जैविक विकल्प'
        },
        { 
          id: 'skip_water', 
          name: '2 दिन पानी न दें', 
          desc: 'पानी की कमी, सूखा सहनशीलता व जड़ों का तनाव',
          icon: '💧',
          badge: 'जल परीक्षण'
        },
        { 
          id: 'bio_mulch', 
          name: 'पुआल की जैविक मल्चिंग', 
          desc: 'वाष्पीकरण नियंत्रण व सूक्ष्मजीवों की सुरक्षा',
          icon: '🌾',
          badge: 'मिट्टी सुरक्षा'
        },
        { 
          id: 'chemical_urea', 
          name: 'रासायनिक यूरिया प्रयोग', 
          desc: 'कृत्रिम खाद, लवणता वृद्धि व मिट्टी क्षरण',
          icon: '🧪',
          badge: 'उच्च जोखिम'
        }
      ],
      timingLabel: "कार्यान्वयन समय (टाइमिंग):",
      runBtn: "चयनित निर्णय का सिमुलेशन करें",
      stressTitle: "फसल पर तनाव (Stress Delta)",
      yieldTitle: "उपज में बदलाव (Yield Variation)",
      costTitle: "आर्थिक बचत / लाभ (INR)",
      bioTitle: "मिट्टी व पौधे की जैविक क्रियाविधि:",
      wisdomTitle: "बुजुर्गों का परीक्षित सुझाव (Ancestral Protocol):",
      daysUnit: "दिन बाद",
      simulating: "एआई एजेंट सिमुलेशन गणना कर रहा है...",
      engineBadge: "न्यूरल कृषि मॉडल"
    },
    en: {
      badge: "AI Predictive Decision Simulator",
      agentBadge: "AI Simulation Agent Active",
      title: "'What-If' Agronomic Decision Simulator",
      subtitle: "Message the AI agent with custom hypotheses or pick preset farm actions to predict agronomic impact before risking your field",
      agentPromptLabel: "Message the AI Simulation Agent:",
      agentPlaceholder: "e.g., 'What happens if I withhold water for 3 days and spray sour buttermilk & wood ash?'...",
      sendAgentBtn: "Run Agent Simulation",
      quickPromptsTitle: "💡 Quick Hypothesis Presets (Click to Test):",
      quickPrompts: [
        "Withhold irrigation for 3 days and apply straw mulch?",
        "Replace synthetic urea with mustard cake and wood ash slurry?",
        "Risk of broadcasting cow dung manure 24 hours before heavy rain?",
        "Foliar spray of neem extract and raw turmeric before pest outbreak?"
      ],
      orChoosePreset: "Or Select a Preset Farm Action:",
      scenarios: [
        { 
          id: 'add_cowdung', 
          name: 'Apply Cow Dung & Wood Ash', 
          desc: 'Ancestral organic microbial booster & moisture lock',
          icon: '🌱',
          badge: 'Bio-Organic'
        },
        { 
          id: 'skip_water', 
          name: 'Skip 2 Irrigation Cycles', 
          desc: 'Drought tolerance stress test & root cavitation analysis',
          icon: '💧',
          badge: 'Water Deficit'
        },
        { 
          id: 'bio_mulch', 
          name: 'Apply Rice Straw Bio-Mulch', 
          desc: 'Evaporation barrier, weed suppression & rhizosphere cool',
          icon: '🌾',
          badge: 'Soil Shield'
        },
        { 
          id: 'chemical_urea', 
          name: 'Apply Chemical Urea', 
          desc: 'Synthetic salt stress, root scorch & beneficial microbe loss',
          icon: '🧪',
          badge: 'High Risk'
        }
      ],
      timingLabel: "Execution Timing:",
      runBtn: "Run Predictive Scenario Simulation",
      stressTitle: "Crop Stress Level (Delta)",
      yieldTitle: "Yield Variation Index",
      costTitle: "Financial Net Impact (INR)",
      bioTitle: "Rhizosphere & Biological Mechanism:",
      wisdomTitle: "Ancestral Protocol & Wisdom:",
      daysUnit: "days later",
      simulating: "AI Agent running bio-climatic simulation...",
      engineBadge: "Neural Bio-Engine"
    }
  }[language] || {};

  const activeScenarioObj = t.scenarios?.find(s => s.id === selectedScenario);

  // Run simulation with either custom message or preset scenario
  const executeSimulation = async (customTextOverride = null) => {
    setSimLoading(true);
    const queryToSend = customTextOverride !== null 
      ? customTextOverride 
      : (userMessage.trim() || activeScenarioObj?.name || selectedScenario);

    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: queryToSend,
          query: queryToSend,
          scenarioId: selectedScenario,
          scenarioName: activeScenarioObj ? activeScenarioObj.name : selectedScenario,
          dayOffset: dayOffset,
          regionId: 1,
          language: language
        })
      });

      const data = await res.json();
      if (data.status === 'success' && data.projection) {
        const proj = data.projection;
        setSimulationResult({
          ...proj,
          biological_mechanism: proj.biological_mechanism || proj.agent_insight || proj.warning_message,
          risk_rating: proj.risk_rating || (proj.stress_increase_pct > 20 ? 'HIGH' : proj.stress_increase_pct > 5 ? 'MEDIUM' : 'LOW')
        });
        setSimulatedScenarioTitle(queryToSend);
        setHasRunSimulation(true);
        if (data.engine) setEngineUsed(data.engine);
      }
    } catch (err) {
      console.error('[DecisionSimulator] Error running simulation:', err);
    } finally {
      setSimLoading(false);
    }
  };

  const handleQuickPromptClick = (prompt) => {
    setUserMessage(prompt);
    executeSimulation(prompt);
  };

  const handlePresetSelect = (id) => {
    setSelectedScenario(id);
    const scen = t.scenarios?.find(s => s.id === id);
    if (scen) {
      setUserMessage(scen.name);
      setSimulatedScenarioTitle(scen.name);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', width: '100%' }}>
      
      {/* 1. HERO BANNER - High-Tech Forest Jade Glassmorphism */}
      <div style={{
        background: 'linear-gradient(135deg, #021a0d 0%, #063319 50%, #032112 100%)',
        borderRadius: '26px',
        padding: '30px 34px',
        border: '1px solid rgba(74, 222, 128, 0.25)',
        boxShadow: '0 20px 45px -12px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(74, 222, 128, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Ambient Glow */}
        <div style={{
          position: 'absolute',
          top: '-70px',
          right: '-50px',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(52, 211, 153, 0.18) 0%, rgba(2, 26, 13, 0) 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', position: 'relative', zIndex: 2 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <span style={{
                background: 'rgba(52, 211, 153, 0.15)',
                color: '#34d399',
                border: '1px solid rgba(52, 211, 153, 0.4)',
                padding: '5px 14px',
                borderRadius: '20px',
                fontSize: '0.76rem',
                fontWeight: '900',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                letterSpacing: '0.04em'
              }}>
                <Sparkles size={14} color="#34d399" />
                {t.badge}
              </span>

              <span style={{
                background: 'rgba(250, 204, 21, 0.12)',
                color: '#fde047',
                border: '1px solid rgba(250, 204, 21, 0.3)',
                padding: '5px 12px',
                borderRadius: '20px',
                fontSize: '0.74rem',
                fontWeight: '800',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Bot size={13} color="#fde047" />
                {t.agentBadge}
              </span>
            </div>

            <h1 style={{ fontSize: '1.9rem', fontWeight: '900', color: '#f0fdf4', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
              {t.title}
            </h1>
            <p style={{ fontSize: '0.94rem', color: '#a7f3d0', maxWidth: '720px', margin: 0, lineHeight: '1.55' }}>
              {t.subtitle}
            </p>
          </div>

          <div style={{
            background: 'rgba(5, 46, 22, 0.65)',
            border: '1px solid rgba(74, 222, 128, 0.25)',
            borderRadius: '16px',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 10px #34d399' }} />
            <div>
              <div style={{ fontSize: '0.68rem', color: '#86efac', textTransform: 'uppercase', fontWeight: '800' }}>Engine Status</div>
              <div style={{ fontSize: '0.84rem', color: '#ffffff', fontWeight: '800' }}>{engineUsed}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. DIRECT AI AGENT COMMAND & MESSAGE CONSOLE (The Core Feature) */}
      <div style={{
        background: 'linear-gradient(180deg, #042614 0%, #031c0e 100%)',
        border: '1px solid rgba(52, 211, 153, 0.35)',
        borderRadius: '24px',
        padding: '24px 26px',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
            }}>
              <Bot size={20} color="white" />
            </div>
            <div>
              <div style={{ fontSize: '0.98rem', fontWeight: '900', color: '#f0fdf4' }}>
                {t.agentPromptLabel}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#6ee7b7' }}>
                {language === 'bn' ? 'যেকোনো হাইপোথিসিস বা চাষের প্রশ্ন লিখুন, এআই জৈবিক ফলাফল নির্ণয় করবে' :
                 language === 'hi' ? 'अपनी कोई भी योजना या सवाल लिखें, एआई जैविक नतीजे निकालेगा' :
                 'Formulate any agronomic hypothesis, the agent will predict bio-chemical results'}
              </div>
            </div>
          </div>

          <span style={{ fontSize: '0.75rem', color: '#94a3b8', background: 'rgba(255,255,255,0.06)', padding: '4px 10px', borderRadius: '8px' }}>
            Enter ↵ to Run
          </span>
        </div>

        {/* Input Bar */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 360px' }}>
            <input
              type="text"
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !simLoading) {
                  executeSimulation();
                }
              }}
              placeholder={t.agentPlaceholder}
              style={{
                width: '100%',
                background: 'rgba(2, 20, 10, 0.85)',
                border: '1.5px solid rgba(52, 211, 153, 0.35)',
                borderRadius: '16px',
                padding: '16px 20px',
                color: '#ecfdf5',
                fontSize: '0.96rem',
                fontFamily: 'inherit',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'all 0.2s ease',
                boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.5)'
              }}
            />
          </div>

          <button
            onClick={() => executeSimulation()}
            disabled={simLoading}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
              color: 'white',
              border: 'none',
              padding: '16px 28px',
              borderRadius: '16px',
              fontSize: '0.96rem',
              fontWeight: '900',
              cursor: simLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)',
              transition: 'all 0.2s ease',
              flexShrink: 0
            }}
          >
            {simLoading ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                <span>{language === 'bn' ? 'সিমুলেট হচ্ছে...' : language === 'hi' ? 'गणना जारी...' : 'Simulating...'}</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>{t.sendAgentBtn}</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Hypothesis Chips */}
        <div style={{ marginTop: '18px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#86efac', marginBottom: '8px' }}>
            {t.quickPromptsTitle}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {t.quickPrompts?.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickPromptClick(chip)}
                disabled={simLoading}
                style={{
                  background: 'rgba(6, 78, 59, 0.45)',
                  border: '1px solid rgba(52, 211, 153, 0.25)',
                  color: '#d1fae5',
                  padding: '7px 14px',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'left',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(16, 185, 129, 0.25)';
                  e.currentTarget.style.borderColor = '#34d399';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(6, 78, 59, 0.45)';
                  e.currentTarget.style.borderColor = 'rgba(52, 211, 153, 0.25)';
                }}
              >
                <ArrowRight size={12} color="#34d399" />
                <span>{chip}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. TWO-COLUMN INTERFACE: Preset Actions & Execution Timeline (Left) + AI Projections (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        
        {/* Left Card: Preset Actions & Day Timing */}
        <div style={{
          background: 'rgba(3, 27, 14, 0.85)',
          border: '1px solid rgba(74, 222, 128, 0.2)',
          borderRadius: '24px',
          padding: '24px',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '20px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#f0fdf4', margin: 0 }}>
                {t.orChoosePreset}
              </h3>
              <span style={{ fontSize: '0.72rem', color: '#86efac', background: 'rgba(52, 211, 153, 0.12)', padding: '3px 8px', borderRadius: '8px' }}>
                Preset Options
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
              {t.scenarios?.map((scen) => {
                const isSelected = selectedScenario === scen.id;
                return (
                  <button
                    key={scen.id}
                    onClick={() => handlePresetSelect(scen.id)}
                    style={{
                      background: isSelected ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.22) 0%, rgba(6, 78, 59, 0.35) 100%)' : 'rgba(2, 20, 10, 0.6)',
                      border: isSelected ? '2px solid #34d399' : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '16px',
                      padding: '14px 16px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      boxShadow: isSelected ? '0 4px 16px rgba(16, 185, 129, 0.2)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '1.5rem' }}>{scen.icon}</span>
                      <div>
                        <div style={{ fontSize: '0.94rem', fontWeight: '800', color: isSelected ? '#a7f3d0' : '#e2e8f0' }}>
                          {scen.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                          {scen.desc}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: '800',
                        color: scen.id === 'chemical_urea' ? '#f87171' : '#34d399',
                        background: scen.id === 'chemical_urea' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(52, 211, 153, 0.12)',
                        padding: '2px 8px',
                        borderRadius: '6px'
                      }}>
                        {scen.badge}
                      </span>
                      {isSelected && <Check size={16} color="#34d399" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Timing Slider */}
            <div style={{ marginTop: '20px', background: 'rgba(2, 20, 10, 0.7)', padding: '16px 18px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: '800', color: '#d1fae5', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={15} color="#34d399" />
                  {t.timingLabel}
                </span>
                <span style={{ 
                  color: '#fde047', 
                  fontWeight: '900', 
                  fontSize: '0.92rem',
                  background: 'rgba(250, 204, 21, 0.15)',
                  padding: '3px 10px',
                  borderRadius: '10px',
                  border: '1px solid rgba(250, 204, 21, 0.3)'
                }}>
                  {dayOffset} {t.daysUnit}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={dayOffset}
                onChange={(e) => setDayOffset(Number(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: '#10b981',
                  cursor: 'pointer'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#94a3b8', marginTop: '6px' }}>
                <span>১ দিন (তাৎক্ষণিক)</span>
                <span>৫ দিন (মধ্যবর্তী)</span>
                <span>১০ দিন (দীর্ঘমেয়াদী)</span>
              </div>
            </div>
          </div>

          {/* Run Preset Action Button */}
          <button
            onClick={() => executeSimulation()}
            disabled={simLoading}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              color: 'white',
              border: 'none',
              padding: '15px',
              borderRadius: '16px',
              fontWeight: '900',
              fontSize: '0.98rem',
              cursor: simLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: '0 8px 24px rgba(5, 150, 105, 0.35)',
              transition: 'all 0.2s ease'
            }}
          >
            {simLoading ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                <span>{t.simulating}</span>
              </>
            ) : (
              <>
                <Play size={18} fill="white" />
                <span>{t.runBtn}</span>
              </>
            )}
          </button>
        </div>

        {/* Right Card: AI Simulation Projections & Biological Gauges */}
        <div style={{
          background: 'rgba(3, 27, 14, 0.85)',
          border: '1px solid rgba(74, 222, 128, 0.25)',
          borderRadius: '24px',
          padding: '24px',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '18px'
        }}>
          <div>
            {/* Top Status Strip */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Activity size={15} />
                <span>AI Predictive Modeling Results</span>
              </div>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: '800',
                padding: '3px 10px',
                borderRadius: '8px',
                background: simulationResult.risk_rating === 'HIGH' ? 'rgba(239, 68, 68, 0.2)' : simulationResult.risk_rating === 'MEDIUM' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(52, 211, 153, 0.15)',
                color: simulationResult.risk_rating === 'HIGH' ? '#fca5a5' : simulationResult.risk_rating === 'MEDIUM' ? '#fcd34d' : '#86efac',
                border: `1px solid ${simulationResult.risk_rating === 'HIGH' ? '#ef4444' : simulationResult.risk_rating === 'MEDIUM' ? '#f59e0b' : '#10b981'}`
              }}>
                RISK: {simulationResult.risk_rating || (simulationResult.stress_increase_pct > 20 ? 'HIGH' : 'LOW')}
              </span>
            </div>

            {/* Warning / Summary Banner */}
            <div style={{
              background: simulationResult.stress_increase_pct > 20 ? 'rgba(127, 29, 29, 0.35)' : 'rgba(6, 78, 59, 0.35)',
              borderLeft: `5px solid ${simulationResult.stress_increase_pct > 20 ? '#ef4444' : '#10b981'}`,
              borderRadius: '14px',
              padding: '16px 18px',
              marginBottom: '20px'
            }}>
              <h4 style={{ fontSize: '1.08rem', fontWeight: '800', color: '#f0fdf4', margin: '0 0 6px 0', lineHeight: '1.45' }}>
                📊 {simulationResult.warning_message}
              </h4>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                Simulated for day +{dayOffset} against local alluvial soil telemetry
              </div>
            </div>

            {/* 3 Futuristic Metric Tiles */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '18px' }}>
              
              {/* Stress Level */}
              <div style={{
                background: 'rgba(2, 20, 10, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '700' }}>
                  {t.stressTitle}
                </div>
                <div style={{
                  fontSize: '1.6rem',
                  fontWeight: '900',
                  color: simulationResult.stress_increase_pct > 15 ? '#ef4444' : '#34d399',
                  margin: '8px 0'
                }}>
                  {simulationResult.stress_increase_pct > 0 ? `+${simulationResult.stress_increase_pct}%` : `${simulationResult.stress_increase_pct}%`}
                </div>
                <div style={{
                  fontSize: '0.7rem',
                  color: simulationResult.stress_increase_pct <= 0 ? '#86efac' : '#fca5a5',
                  fontWeight: '700'
                }}>
                  {simulationResult.stress_increase_pct <= 0 ? '✓ চাপ হ্রাস ও সুরক্ষা' : '⚠️ ফসলে ক্ষতিকর চাপ'}
                </div>
              </div>

              {/* Yield Variation */}
              <div style={{
                background: 'rgba(2, 20, 10, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '700' }}>
                  {t.yieldTitle}
                </div>
                <div style={{
                  fontSize: '1.6rem',
                  fontWeight: '900',
                  color: simulationResult.yield_variation_pct >= 0 ? '#34d399' : '#ef4444',
                  margin: '8px 0'
                }}>
                  {simulationResult.yield_variation_pct >= 0 ? `+${simulationResult.yield_variation_pct}%` : `${simulationResult.yield_variation_pct}%`}
                </div>
                <div style={{
                  fontSize: '0.7rem',
                  color: simulationResult.yield_variation_pct >= 0 ? '#86efac' : '#fca5a5',
                  fontWeight: '700'
                }}>
                  {simulationResult.yield_variation_pct >= 0 ? '✓ উচ্চ ফলন সূচক' : '⚠️ ফলন হ্রাসের আশঙ্কা'}
                </div>
              </div>

              {/* Financial Impact */}
              <div style={{
                background: 'rgba(2, 20, 10, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '700' }}>
                  {t.costTitle}
                </div>
                <div style={{
                  fontSize: '1.45rem',
                  fontWeight: '900',
                  color: simulationResult.cost_savings_inr >= 0 ? '#fde047' : '#ef4444',
                  margin: '8px 0'
                }}>
                  {simulationResult.cost_savings_inr >= 0 ? `+₹${simulationResult.cost_savings_inr}` : `-₹${Math.abs(simulationResult.cost_savings_inr)}`}
                </div>
                <div style={{
                  fontSize: '0.7rem',
                  color: simulationResult.cost_savings_inr >= 0 ? '#fef08a' : '#fca5a5',
                  fontWeight: '700'
                }}>
                  {simulationResult.cost_savings_inr >= 0 ? '✓ কৃষকের নিট সাশ্রয়' : '⚠️ অতিরিক্ত আর্থিক খরচ'}
                </div>
              </div>
            </div>

            {/* Biological Mechanism Card */}
            {simulationResult.biological_mechanism && (
              <div style={{
                background: 'rgba(2, 20, 10, 0.7)',
                border: '1px solid rgba(52, 211, 153, 0.2)',
                borderRadius: '14px',
                padding: '14px 16px',
                marginBottom: '14px'
              }}>
                <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#86efac', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sprout size={14} color="#34d399" />
                  {t.bioTitle}
                </div>
                <p style={{ fontSize: '0.85rem', color: '#d1fae5', margin: 0, lineHeight: '1.5' }}>
                  {simulationResult.biological_mechanism}
                </p>
              </div>
            )}

            {/* Ancestral Protocol Card */}
            <div style={{
              background: 'rgba(5, 46, 22, 0.5)',
              border: '1px solid rgba(250, 204, 21, 0.3)',
              borderRadius: '14px',
              padding: '14px 16px'
            }}>
              <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#fde047', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Shield size={14} color="#fde047" />
                {t.wisdomTitle}
              </div>
              <p style={{ fontSize: '0.86rem', color: '#fef3c7', margin: 0, lineHeight: '1.5' }}>
                {simulationResult.ancestral_tip}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Agri-Oracle Contextual AI Chat Interface (Ledger & Deep Hypothesis Testing) */}
      {hasRunSimulation && simulationResult && (
        <SimulationOracleChat
          simulationResult={simulationResult}
          scenarioId={selectedScenario}
          scenarioName={simulatedScenarioTitle}
          dayOffset={dayOffset}
          language={language}
        />
      )}
    </div>
  );
}
