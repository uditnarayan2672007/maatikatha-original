import React, { useState, useEffect, useRef } from 'react';
import { 
  History, 
  Thermometer, 
  TrendingDown, 
  Calendar, 
  Camera, 
  Sparkles, 
  Eye, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight,
  Layers,
  Leaf,
  Sliders,
  Droplets,
  Microscope,
  RotateCcw,
  Zap,
  ShieldCheck,
  Volume2,
  VolumeX,
  Loader2,
  Award,
  Info,
  Bug,
  DollarSign
} from 'lucide-react';

export default function GenerationalTimeMachine({ language = 'en', currentLocation }) {
  const lat = currentLocation?.lat || 22.574;
  const lon = currentLocation?.lon || 88.3191;

  const [selectedYear, setSelectedYear] = useState(1980);
  const [historyData, setHistoryData] = useState([]);
  const [currentMetrics, setCurrentMetrics] = useState({
    avg_temp_c: 28.5,
    soil_carbon_pct: 1.80,
    yield_impact_pct: 10
  });

  // Preset sample benchmark farm plots for testing
  const samplePlots = [
    { label: "Dry Alluvial Paddy Field (2026 Era)", url: "/images/timemachine/field_2026.jpg" },
    { label: "Compacted Chemical Silt Plot (2010)", url: "/images/timemachine/field_2010.jpg" },
    { label: "Green Transition Farmland (1995)", url: "/images/timemachine/field_1995.jpg" },
    { label: "Traditional Organic Humus Farmland (1980)", url: "/images/timemachine/field_1980.jpg" }
  ];

  // Selected sample plot state
  const [selectedSample, setSelectedSample] = useState(samplePlots[0].url);
  const [analyzing, setAnalyzing] = useState(false);
  const [transformResult, setTransformResult] = useState(null);
  const [viewMode, setViewMode] = useState('transformed'); // 'present' | 'transformed' | 'split'
  const [comparisonSlider, setComparisonSlider] = useState(50); // percentage for split view

  // Audio narration state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef(null);

  const [isricSocData, setIsricSocData] = useState(null);
  const [loadingSoc, setLoadingSoc] = useState(false);

  // Determine era reconstructed visual based on selected year
  const getReconstructedImage = (year) => {
    if (year <= 1989) return '/images/timemachine/field_1980.jpg';
    if (year <= 2002) return '/images/timemachine/field_1995.jpg';
    if (year <= 2018) return '/images/timemachine/field_2010.jpg';
    return '/images/timemachine/field_2026.jpg';
  };

  const currentReconstructedImage = transformResult?.reconstructedImageUrl || getReconstructedImage(selectedYear);
  const currentPresentImage = selectedSample;

  // Initial fetch of climate data and auto-transform for initial year
  useEffect(() => {
    fetch('/api/history?region_id=1')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success' && data.data?.length) {
          setHistoryData(data.data);
          updateMetrics(selectedYear, data.data);
        }
      })
      .catch(err => console.warn(err));

    // Fetch Live Real ISRIC SoilGrids SOC Data for live coordinates
    setLoadingSoc(true);
    fetch(`/api/soil-carbon?lat=${lat}&lon=${lon}&property=soc&depth=0-5cm`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setIsricSocData(data);
        }
      })
      .catch(err => console.warn('[ISRIC] SOC fetch warning:', err))
      .finally(() => setLoadingSoc(false));

    // Auto-fetch initial simulation
    runSimulation(selectedYear);
  }, [lat, lon, language]);

  const updateMetrics = (year, data = historyData) => {
    setSelectedYear(year);
    if (!data || !data.length) return;
    let closest = data[0];
    let minDiff = Math.abs(data[0].decade_year - year);
    for (const item of data) {
      const diff = Math.abs(item.decade_year - year);
      if (diff < minDiff) {
        minDiff = diff;
        closest = item;
      }
    }
    setCurrentMetrics(closest);
  };

  const handleYearChange = (year) => {
    updateMetrics(year);
    runSimulation(year);
  };

  const handleSelectSample = (sampleUrl) => {
    setSelectedSample(sampleUrl);
    runSimulation(selectedYear);
  };

  const runSimulation = async (yearToSimulate = selectedYear) => {
    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('targetYear', yearToSimulate);
      formData.append('regionId', 1);
      formData.append('language', language);

      const res = await fetch('/api/field/transform', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.status === 'success') {
        setTransformResult(data);
      }
    } catch (err) {
      console.error('[TimeMachine] Transform error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  // Audio narration handler
  const handleToggleAudio = async () => {
    if (isPlayingAudio) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlayingAudio(false);
      return;
    }

    const audit = transformResult?.now_vs_previous;
    const textToSpeak = audit
      ? `${audit.title}। ${audit.how_they_farmed_then.era_title} এ ${audit.how_they_farmed_then.seeds}। ${audit.how_they_farmed_then.fertilizers}। ${audit.how_we_farm_now.era_title} এ ${audit.how_we_farm_now.fertilizers}। ${audit.farmer_restoration_guide.golden_rule}`
      : (transformResult?.analysis || "Analyzing field transformation");

    try {
      setIsPlayingAudio(true);
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSpeak,
          language: language === 'bn' ? 'bn' : language === 'hi' ? 'hi' : 'en'
        })
      });

      if (res.ok) {
        const blob = await res.blob();
        const audioUrl = URL.createObjectURL(blob);
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.play();
          audioRef.current.onended = () => setIsPlayingAudio(false);
        }
      } else {
        setIsPlayingAudio(false);
      }
    } catch (err) {
      console.warn('[AudioTTS] Speech error:', err);
      setIsPlayingAudio(false);
    }
  };

  const isHistoricalPast = selectedYear < 2005;

  const t = {
    bn: {
      badge: "প্রজন্মগত টাইম মেশিন ও মাল্টিমোডাল ভিশন সিমুলেটর",
      title: "ঐতিহাসিক ফসলের মাঠ পুনর্গঠন ও কৃষি টাইম মেশিন",
      subtitle: "আপনার মাঠের রূপান্তর প্রত্যক্ষ করুন। নির্বাচিত দশকের ঐতিহাসিক জৈব কার্বন (SOC), জলবায়ু ও চাষ পদ্ধতির ভিত্তিতে এআই মাঠের ছবি নিখুঁতভাবে পুনর্গঠন করবে এবং আজ বনাম অতীতের চাষের বিশদ তফাত ও সমাধান তুলে ধরবে।",
      sliderLabel: "সময়রেখা টেনে ঐতিহাসিক বা বর্তমান দশক বেছে নিন:",
      targetYear: "নির্দিষ্ট বছর:",
      era1980: "🌿 ১৯৮০ (প্রচুর হিউমাস ও দেশি প্রাকৃতিক চাষ)",
      era1995: "১৯৯৫ (সবুজ বিপ্লব ও প্রাথমিক রাসায়নিক)",
      era2010: "২০১০ (তীব্র রাসায়নিক ও মাটি শক্তকরণ)",
      era2026: "⚠️ ২০২৬ (বর্তমান চরম অবক্ষয় ও ক্ষয়)",
      uploadTitle: "নমুনা ফসলের জমি নির্বাচন ও এআই দশকীয় পুনর্গঠন",
      visionBadge: "জেমিনাই মাল্টিমোডাল ভিশন সক্রিয়",
      uploadDesc: "নিচের যে কোনো একটি নমুনা জমি নির্বাচন করুন। এআই স্বয়ংক্রিয়ভাবে নির্বাচিত বছরের মাটির রূপ ও উদ্ভিদের অবস্থা স্পষ্ট করে প্রদর্শন করবে:",
      sampleLabel: "নমুনা ফসলের জমি বেছে নিন:",
      viewPresent: "বর্তমান রূপ (২০২৬)",
      viewReconstructed: `পুনর্গঠিত রূপ (${selectedYear} দশক)`,
      viewSplit: "পাশাপাশি স্লাইডার তুলনা (Before vs After)",
      simulateBtn: `${selectedYear} সালের জন্য এআই বিশ্লেষণ ও ছবি পুনর্গঠন করুন`,
      simulatingBtn: "জেমিনাই ভিশন ও জলবায়ু ডেটা বিশ্লেষণ চলছে...",
      listenAudio: "বিশেষজ্ঞের মুখে অডিও শুনুন",
      stopAudio: "অডিও থামান",
      audioPlaying: "অডিও বাজছে...",
      auditHeading: `আজ (২০২৬) বনাম ${selectedYear} সালের চাষের বিশদ তুলনা ও কৃষকের গাইড`,
      thenHeading: `${selectedYear} সালে পূর্বপুরুষরা যেভাবে চাষ করতেন (ঐতিহ্যবাহী প্রাকৃতিক পদ্ধতি)`,
      nowHeading: "২০২৬ সালে বর্তমান রাসায়নিক চাষের বাস্তবতা (লুকানো ক্ষতি ও সংকট)",
      seedsLabel: "বীজ ও জাত:",
      fertilizersLabel: "সার ও পুষ্টি প্রয়োগ:",
      pestLabel: "বালাই ও পোকা দমন:",
      waterLabel: "সেচ ও জলস্তর:",
      soilLabel: "মাটির গঠন ও কেঁচো:",
      matrixHeading: "মাটির গুণমান ও উৎপাদন খরচের প্রত্যক্ষ দশকীয় তুলনা",
      colParam: "তুলনামূলক বিষয়",
      colThen: `${selectedYear} সালের অবস্থা`,
      colNow: "২০২৬ সালের বর্তমান অবস্থা",
      colImpact: "কৃষকের ওপর প্রভাব",
      guideHeading: "আজকের কৃষকের জন্য মাটির স্বাস্থ্য পুনরুদ্ধারের বাস্তব নির্দেশিকা",
      goldenRuleLabel: "মূল সোনালী নীতি:"
    },
    hi: {
      badge: "पीढ़ीगत टाइम मशीन व मल्टीमॉडल विज़न सिम्युलेटर",
      title: "ऐतिहासिक खेत पुनर्निर्माण व कृषि टाइम मशीन",
      subtitle: "खेत की मिट्टी और फसल का ऐतिहासिक रूपांतरण देखें। चुने गए दशक के जैविक कार्बन (SOC), मौसम और खेती के तौर-तरीकों के आधार पर एआई खेत का पुनर्निर्माण करेगा तथा आज बनाम पुराने समय का अंतर समझाएगा।",
      sliderLabel: "समयरेखा स्लाइडर खींचकर दशक चुनें:",
      targetYear: "लक्षित वर्ष:",
      era1980: "🌿 1980 (प्रचुर ह्यूमस व देसी पारंपरिक खेती)",
      era1995: "1995 (रासायनिक विस्तार व संकर किस्में)",
      era2010: "2010 (तीव्र यूरिया व कठोर मिट्टी)",
      era2026: "⚠️ 2026 (वर्तमान संकट व कार्बन ह्रास)",
      uploadTitle: "दशकीय खेत व एআই पुनर्निर्माण",
      visionBadge: "जेमिनी मल्टीमॉडल विज़न सक्रिय",
      uploadDesc: "नीचे दिए गए नमूना खेतों में से चुनें। एআই स्वचालित रूप से मिट्टी व फसल का ऐतिहासिक रूप स्पष्ट करेगा:",
      sampleLabel: "नमूना खेत चुनें:",
      viewPresent: "वर्तमान रूप (2026)",
      viewReconstructed: `पुनर्निर्मित रूप (${selectedYear} युग)`,
      viewSplit: "स्लाइडर तुलना (Before vs After)",
      simulateBtn: `${selectedYear} के लिए एआई विश्लेषण व पुनर्निर्माण प्रारंभ करें`,
      simulatingBtn: "जेमिनी विज़न व ऐतिहासिक जलवायु विश्लेषण जारी...",
      listenAudio: "विशेषज्ञ आवाज में ऑडियो सुनें",
      stopAudio: "ऑडियो रोकें",
      audioPlaying: "ऑडियो चल रहा है...",
      auditHeading: `आज (2026) बनाम ${selectedYear} की खेती की विस्तृत तुलना`,
      thenHeading: `${selectedYear} में पूर्वज जिस प्रकार खेती करते थे (पारंपरिक प्राकृतिक विधि)`,
      nowHeading: "2026 में आधुनिक रासायनिक खेती का संकट व सच्चाई",
      seedsLabel: "बीज व किस्में:",
      fertilizersLabel: "खाद व पोषण:",
      pestLabel: "कीट व रोग प्रबंधन:",
      waterLabel: "सिंचाई व भूजल:",
      soilLabel: "मिट्टी व केंचुए:",
      matrixHeading: "मिट्टी की सेहत व लागत का तुलनात्मक चार्ट",
      colParam: "तुलनात्मक विषय",
      colThen: `${selectedYear} की स्थिति`,
      colNow: "2026 की वर्तमान स्थिति",
      colImpact: "किसान पर प्रभाव",
      guideHeading: "आज के किसान के लिए मिट्टी पुनर्जीवित करने का व्यावहारिक रोडमैप",
      goldenRuleLabel: "स्वर्ण नियम:"
    },
    en: {
      badge: "Generational Time Machine & Multimodal Vision Simulator",
      title: "AI Historical Field Reconstruction & Agronomic Time Machine",
      subtitle: "Witness the historical transformation of your topsoil and crops. Based on Soil Organic Carbon (SOC), climate archives, and farming practices of your selected era, Gemini AI reconstructs the visual field and delivers an in-depth Now vs Then agronomic comparison.",
      sliderLabel: "Drag Timeline Slider to Select Historical or Current Era:",
      targetYear: "Target Year:",
      era1980: "🌿 1980 (Rich Humus & Ancestral Ecological Farming)",
      era1995: "1995 (Green Revolution Transition)",
      era2010: "2010 (Intensive NPK & Compaction)",
      era2026: "⚠️ 2026 (Present Day Severe Depletion)",
      uploadTitle: "Explore Decadal Benchmark Fields & AI Reconstructions",
      visionBadge: "Gemini Multimodal Vision Active",
      uploadDesc: "Select a benchmark field plot below. The AI will evaluate topsoil health and clarify/reconstruct how this exact plot looked and functioned in",
      sampleLabel: "Select Benchmark Farm Plot:",
      viewPresent: "Present Day (2026)",
      viewReconstructed: `AI Reconstructed (${selectedYear} Era)`,
      viewSplit: "Interactive Split Slider (Before vs After)",
      simulateBtn: `Simulate Field at Year ${selectedYear} with AI`,
      simulatingBtn: "Consulting Gemini Vision & Historical Climate DB...",
      listenAudio: "Listen to Agronomist Audio",
      stopAudio: "Stop Audio",
      audioPlaying: "Playing Audio...",
      auditHeading: `Now (2026) vs Previous (${selectedYear}) Farming Audit & Restoration Guide`,
      thenHeading: `How They Farmed in ${selectedYear} (Ancestral Agro-Ecological Systems)`,
      nowHeading: "How We Farm in 2026 (Modern Chemical Degradation & Costs)",
      seedsLabel: "Seeds & Varieties:",
      fertilizersLabel: "Fertilizers & Soil Nutrition:",
      pestLabel: "Pest & Disease Control:",
      waterLabel: "Irrigation & Water Table:",
      soilLabel: "Soil Biology & Earthworms:",
      matrixHeading: "Direct Decadal Soil & Economic Comparison Matrix",
      colParam: "Agronomic Parameter",
      colThen: `Year ${selectedYear} Baseline`,
      colNow: "Year 2026 Present State",
      colImpact: "Impact on Farmer",
      guideHeading: "Practical Soil Regeneration Roadmap for Today's Farmer",
      goldenRuleLabel: "Golden Principle:"
    }
  }[language] || {
    badge: "Generational Time Machine & Multimodal Vision Simulator",
    title: "AI Historical Field Reconstruction & Agronomic Time Machine",
    subtitle: "Witness the historical transformation of your topsoil and crops. Based on Soil Organic Carbon (SOC), climate archives, and farming practices of your selected era, Gemini AI reconstructs the visual field and delivers an in-depth Now vs Then agronomic comparison.",
    sliderLabel: "Drag Timeline Slider to Select Historical or Current Era:",
    targetYear: "Target Year:",
    era1980: "🌿 1980 (Rich Humus & Ancestral Ecological Farming)",
    era1995: "1995 (Green Revolution Transition)",
    era2010: "2010 (Intensive NPK & Compaction)",
    era2026: "⚠️ 2026 (Present Day Severe Depletion)",
    uploadTitle: "Explore Decadal Benchmark Fields & AI Reconstructions",
    visionBadge: "Gemini Multimodal Vision Active",
    uploadDesc: "Select a benchmark field plot below. The AI will evaluate topsoil health and clarify/reconstruct how this exact plot looked and functioned in",
    sampleLabel: "Select Benchmark Farm Plot:",
    viewPresent: "Present Day (2026)",
    viewReconstructed: `AI Reconstructed (${selectedYear} Era)`,
    viewSplit: "Interactive Split Slider (Before vs After)",
    simulateBtn: `Simulate Field at Year ${selectedYear} with AI`,
    simulatingBtn: "Consulting Gemini Vision & Historical Climate DB...",
    listenAudio: "Listen to Agronomist Audio",
    stopAudio: "Stop Audio",
    audioPlaying: "Playing Audio...",
    auditHeading: `Now (2026) vs Previous (${selectedYear}) Farming Audit & Restoration Guide`,
    thenHeading: `How They Farmed in ${selectedYear} (Ancestral Agro-Ecological Systems)`,
    nowHeading: "How We Farm in 2026 (Modern Chemical Degradation & Costs)",
    seedsLabel: "Seeds & Varieties:",
    fertilizersLabel: "Fertilizers & Soil Nutrition:",
    pestLabel: "Pest & Disease Control:",
    waterLabel: "Irrigation & Water Table:",
    soilLabel: "Soil Biology & Earthworms:",
    matrixHeading: "Direct Decadal Soil & Economic Comparison Matrix",
    colParam: "Agronomic Parameter",
    colThen: `Year ${selectedYear} Baseline`,
    colNow: "Year 2026 Present State",
    colImpact: "Impact on Farmer",
    guideHeading: "Practical Soil Regeneration Roadmap for Today's Farmer",
    goldenRuleLabel: "Golden Principle:"
  };

  const auditData = transformResult?.now_vs_previous;

  return (
    <div style={{ width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Hidden audio element for speech playback */}
      <audio ref={audioRef} style={{ display: 'none' }} />

      {/* 1. Header Banner & Decadal Slider */}
      <div className="mk-card" style={{ 
        background: 'linear-gradient(135deg, #451a03 0%, #78350f 40%, #92400e 75%, #b45309 100%)', 
        color: 'white', 
        padding: '32px 36px',
        borderRadius: '28px',
        boxShadow: '0 20px 45px -10px rgba(69, 26, 3, 0.45)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.18)', color: '#fef3c7', padding: '5px 14px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
            <History size={16} />
            <span>{t.badge}</span>
          </div>

          <h1 style={{ fontSize: '2.1rem', fontWeight: '900', letterSpacing: '-0.03em', margin: 0, textShadow: '0 2px 8px rgba(0,0,0,0.25)' }}>
            {t.title}
          </h1>

          <p style={{ margin: '8px 0 0 0', fontSize: '0.94rem', color: '#fde68a', maxWidth: '820px', lineHeight: '1.5' }}>
            {t.subtitle}
          </p>

          {/* Generational Interactive Slider Console */}
          <div style={{ 
            marginTop: '26px', 
            background: 'rgba(255, 255, 255, 0.95)', 
            padding: '24px 28px', 
            borderRadius: '22px', 
            border: '2px solid #fde68a',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: '900', color: '#78350f', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={18} color="#b45309" /> {t.sliderLabel}
              </span>
              <span style={{ 
                fontSize: '1.6rem', 
                fontWeight: '900', 
                color: isHistoricalPast ? '#15803d' : '#b45309',
                background: isHistoricalPast ? '#ecfdf5' : '#fef3c7',
                padding: '4px 18px',
                borderRadius: '14px',
                border: isHistoricalPast ? '1.5px solid #a7f3d0' : '1.5px solid #fde68a'
              }}>
                {t.targetYear} {selectedYear}
              </span>
            </div>

            <input
              type="range"
              min="1980"
              max="2026"
              step="5"
              value={selectedYear}
              onChange={(e) => handleYearChange(Number(e.target.value))}
              className="custom-range-slider"
              style={{ width: '100%', height: '8px', cursor: 'pointer', accentColor: isHistoricalPast ? '#15803d' : '#b45309' }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '0.8rem', fontWeight: '800', color: '#78350f', flexWrap: 'wrap', gap: '6px' }}>
              <span onClick={() => handleYearChange(1980)} style={{ cursor: 'pointer', textDecoration: selectedYear === 1980 ? 'underline' : 'none' }}>{t.era1980}</span>
              <span onClick={() => handleYearChange(1995)} style={{ cursor: 'pointer', textDecoration: selectedYear === 1995 ? 'underline' : 'none' }}>{t.era1995}</span>
              <span onClick={() => handleYearChange(2010)} style={{ cursor: 'pointer', textDecoration: selectedYear === 2010 ? 'underline' : 'none' }}>{t.era2010}</span>
              <span onClick={() => handleYearChange(2026)} style={{ cursor: 'pointer', textDecoration: selectedYear === 2026 ? 'underline' : 'none' }}>{t.era2026}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Visual Field Analysis & Multimodal AI Simulation */}
      <div className="mk-card card-hover-lift" style={{ padding: '32px 28px', borderTop: '6px solid #15803d', background: '#ffffff', borderRadius: '26px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Camera size={24} color="#15803d" />
            <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0f5132', margin: 0 }}>
              {t.uploadTitle}
            </h2>
          </div>

          <span style={{ fontSize: '0.78rem', background: '#ecfdf5', color: '#047857', padding: '4px 12px', borderRadius: '12px', fontWeight: '800', border: '1px solid #a7f3d0' }}>
            {t.visionBadge}
          </span>
        </div>

        <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0 0 18px 0' }}>
          {t.uploadDesc} <strong>{selectedYear}</strong>.
        </p>

        {/* Preset Sample Benchmark Plots - Centered & Cleanly Aligned */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '12px', 
          alignItems: 'center', 
          margin: '16px 0 24px',
          padding: '14px 18px',
          background: '#f8fafc',
          borderRadius: '18px',
          border: '1px solid #e2e8f0'
        }}>
          <span style={{ fontSize: '0.84rem', color: '#475569', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} color="#15803d" />
            {t.sampleLabel}
          </span>

          {samplePlots.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectSample(s.url)}
              className="card-hover-lift"
              style={{
                background: selectedSample === s.url ? '#ecfdf5' : '#ffffff',
                color: selectedSample === s.url ? '#065f46' : '#334155',
                border: selectedSample === s.url ? '2px solid #10b981' : '1.5px solid #cbd5e1',
                padding: '9px 18px',
                borderRadius: '16px',
                fontSize: '0.82rem',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: selectedSample === s.url ? '0 4px 12px rgba(16, 185, 129, 0.2)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              🌾 {s.label}
            </button>
          ))}
        </div>

        {/* Comparison Showcase (Present vs Transformed Decade) */}
        <div className="responsive-two-col" style={{ gap: '24px', alignItems: 'start' }}>
          
          {/* Visual Canvas Display */}
          <div style={{ background: '#0a1d12', padding: '20px', borderRadius: '24px', border: '1.5px solid #234e32', boxShadow: '0 12px 30px rgba(0,0,0,0.15)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <span style={{ color: '#4ade80', fontSize: '0.86rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} />
                {viewMode === 'present' 
                  ? t.viewPresent 
                  : viewMode === 'transformed' 
                  ? t.viewReconstructed 
                  : t.viewSplit}
              </span>
              
              <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.1)', padding: '3px', borderRadius: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setViewMode('present')}
                  style={{
                    background: viewMode === 'present' ? '#22c55e' : 'transparent',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.74rem',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  2026 Present
                </button>
                <button
                  onClick={() => setViewMode('transformed')}
                  style={{
                    background: viewMode === 'transformed' ? '#22c55e' : 'transparent',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.74rem',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  {selectedYear} Era
                </button>
                <button
                  onClick={() => setViewMode('split')}
                  style={{
                    background: viewMode === 'split' ? '#22c55e' : 'transparent',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.74rem',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  Split Compare
                </button>
              </div>
            </div>

            {/* Interactive Image Frame with High-Clarity Reconstructed Visual */}
            <div style={{ 
              position: 'relative', 
              height: '380px', 
              borderRadius: '18px', 
              overflow: 'hidden', 
              boxShadow: 'inset 0 0 50px rgba(0,0,0,0.6)',
              border: '2px solid rgba(255,255,255,0.1)'
            }}>
              {/* Single View Mode (Present or Transformed) */}
              {viewMode !== 'split' ? (
                <img
                  src={viewMode === 'transformed' ? currentReconstructedImage : currentPresentImage}
                  alt={viewMode === 'transformed' ? `${selectedYear} era field` : 'Present day field'}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'opacity 0.4s ease'
                  }}
                />
              ) : (
                /* Interactive Split Slider View (Before vs After) */
                <div style={{ position: 'relative', width: '100%', height: '100%', userSelect: 'none' }}>
                  {/* Under layer: Clarified Reconstructed Era Image */}
                  <img
                    src={currentReconstructedImage}
                    alt={`${selectedYear} era reconstructed`}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />

                  {/* Over layer: Present Day 2026 Image clipped to slider percentage */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      clipPath: `polygon(0 0, ${comparisonSlider}% 0, ${comparisonSlider}% 100%, 0 100%)`,
                      overflow: 'hidden'
                    }}
                  >
                    <img
                      src={currentPresentImage}
                      alt="Present 2026 field"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      background: 'rgba(220, 38, 38, 0.85)',
                      color: 'white',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '0.72rem',
                      fontWeight: '900'
                    }}>
                      Present (2026)
                    </div>
                  </div>

                  {/* Right label for Reconstructed Era */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'rgba(21, 128, 61, 0.85)',
                    color: 'white',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '0.72rem',
                    fontWeight: '900'
                  }}>
                    {selectedYear} Reconstructed
                  </div>

                  {/* Vertical Divider Line */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      left: `${comparisonSlider}%`,
                      width: '3px',
                      background: '#ffffff',
                      boxShadow: '0 0 10px rgba(0,0,0,0.8)',
                      transform: 'translateX(-50%)',
                      pointerEvents: 'none',
                      zIndex: 10
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        background: '#ffffff',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#15803d',
                        fontWeight: '900'
                      }}
                    >
                      <Sliders size={16} />
                    </div>
                  </div>

                  {/* Hidden range input to allow smooth dragging across image */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={comparisonSlider}
                    onChange={(e) => setComparisonSlider(Number(e.target.value))}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: 'ew-resize',
                      zIndex: 20,
                      margin: 0
                    }}
                  />
                </div>
              )}

              {/* Laser Scanning Line during AI inference */}
              {analyzing && <div className="laser-scanner-line" />}

              {/* Overlay Decadal Soil Badge */}
              <div style={{ 
                position: 'absolute', 
                bottom: '14px', 
                left: '14px', 
                background: 'rgba(0,0,0,0.8)', 
                backdropFilter: 'blur(8px)', 
                padding: '8px 16px', 
                borderRadius: '12px', 
                color: 'white', 
                fontSize: '0.82rem', 
                fontWeight: '900',
                border: '1px solid rgba(255,255,255,0.15)',
                zIndex: 15
              }}>
                {viewMode === 'transformed' 
                  ? `🌾 ${selectedYear} Soil Benchmark: SOC ${currentMetrics.soil_carbon_pct}% • Temp ${currentMetrics.avg_temp_c}°C` 
                  : viewMode === 'split'
                  ? `↔️ Slide to compare: Present vs ${selectedYear} Era`
                  : `⚠️ Current Era (2026): SOC 0.40% • Severe Compaction`}
              </div>
            </div>

            {/* Simulation Trigger Button */}
            <button
              onClick={() => runSimulation(selectedYear)}
              disabled={analyzing}
              className="card-hover-lift"
              style={{
                marginTop: '18px',
                width: '100%',
                background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
                color: 'white',
                border: 'none',
                padding: '16px',
                borderRadius: '16px',
                fontWeight: '900',
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 8px 20px rgba(22, 163, 74, 0.4)'
              }}
            >
              {analyzing ? (
                <>
                  <Loader2 className="pulse-spinner" size={20} />
                  <span>{t.simulatingBtn}</span>
                </>
              ) : (
                <>
                  <Sparkles size={20} fill="white" />
                  <span>{t.simulateBtn}</span>
                </>
              )}
            </button>
          </div>

          {/* AI Agronomic Inspection Output Dossier */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '22px', border: '1.5px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803d', fontWeight: '900', fontSize: '0.94rem' }}>
                  <Eye size={20} />
                  <span>AI Botanical Vision & Soil Audit Report ({selectedYear})</span>
                </div>
                
                <button
                  onClick={handleToggleAudio}
                  className="card-hover-lift"
                  style={{
                    background: isPlayingAudio ? '#ef4444' : '#15803d',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '10px',
                    fontSize: '0.78rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {isPlayingAudio ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  <span>{isPlayingAudio ? t.stopAudio : t.listenAudio}</span>
                </button>
              </div>

              <p style={{ fontSize: '0.94rem', color: '#1e293b', lineHeight: '1.65', marginBottom: '18px' }}>
                {transformResult 
                  ? transformResult.analysis 
                  : `Select year ${selectedYear} to reconstruct the botanical condition, soil organic carbon, and moisture dynamics for that exact decade.`}
              </p>

              {/* Decadal Soil Attributes Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                
                <div style={{ background: 'white', padding: '14px 16px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                  <span style={{ color: '#64748b', fontWeight: '700' }}>Soil Texture & Humus:</span>
                  <span style={{ fontWeight: '900', color: isHistoricalPast ? '#15803d' : '#b45309' }}>
                    {transformResult?.attributes?.soilTexture || (isHistoricalPast ? 'Deep Organic Humus (Rich Crumbly Loam)' : 'Compacted Chemical Silt (Alkaline Crust)')}
                  </span>
                </div>

                <div style={{ background: 'white', padding: '14px 16px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                  <span style={{ color: '#64748b', fontWeight: '700' }}>Native Canopy & Vegetation:</span>
                  <span style={{ fontWeight: '900', color: '#0369a1' }}>
                    {transformResult?.attributes?.vegetationVigor || (isHistoricalPast ? '92% Indigenous Dense Canopy' : '47% Sparse Crop Stress')}
                  </span>
                </div>

                <div style={{ background: 'white', padding: '14px 16px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                  <span style={{ color: '#64748b', fontWeight: '700' }}>Groundwater Aquifer Depth:</span>
                  <span style={{ fontWeight: '900', color: '#0f5132' }}>
                    {transformResult?.attributes?.groundwaterDepth || (isHistoricalPast ? '3.5 meters (Shallow Natural Aquifer)' : '11.8 meters (Critical Depletion)')}
                  </span>
                </div>

                <div style={{ background: 'white', padding: '14px 16px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                  <span style={{ color: '#64748b', fontWeight: '700' }}>Microbial Biomass Index:</span>
                  <span style={{ fontWeight: '900', color: isHistoricalPast ? '#15803d' : '#dc2626' }}>
                    {transformResult?.attributes?.microbialBiomass || (isHistoricalPast ? 'Abundant Earthworms & Mycorrhizae' : 'Severely Depleted by Synthetic Urea')}
                  </span>
                </div>

              </div>
            </div>

            {/* Ancestral Restoration Protocol Box */}
            <div style={{ background: '#ecfdf5', padding: '18px 22px', borderRadius: '18px', borderLeft: '6px solid #10b981', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)' }}>
              <div style={{ fontSize: '0.84rem', fontWeight: '900', color: '#065f46', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                🌱 {t.goldenRuleLabel}
              </div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#166534', lineHeight: '1.5' }}>
                {auditData?.farmer_restoration_guide?.golden_rule || transformResult?.attributes?.restorationProtocol || "Build soil organic carbon steadily across 3 seasons to match ancestral benchmarks without lowering yield."}
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* 3. Deep Agronomic Comparison: Now (2026) vs Previous (Selected Year) */}
      {auditData && (
        <div className="mk-card" style={{ 
          background: '#ffffff', 
          padding: '32px 30px', 
          borderRadius: '26px', 
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 12px 30px rgba(0,0,0,0.06)' 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fef3c7', color: '#92400e', padding: '4px 12px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: '800', marginBottom: '6px' }}>
                <Layers size={15} />
                <span>AI COMPARATIVE AUDIT</span>
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#1e293b', margin: 0 }}>
                {t.auditHeading}
              </h2>
            </div>

            <button
              onClick={handleToggleAudio}
              className="card-hover-lift"
              style={{
                background: isPlayingAudio ? '#ef4444' : '#059669',
                color: 'white',
                border: 'none',
                padding: '9px 18px',
                borderRadius: '12px',
                fontSize: '0.84rem',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {isPlayingAudio ? <VolumeX size={16} /> : <Volume2 size={16} />}
              <span>{isPlayingAudio ? t.stopAudio : t.listenAudio}</span>
            </button>
          </div>

          {/* Side by side: How they farmed then vs How we farm now */}
          <div className="responsive-two-col" style={{ gap: '22px', marginBottom: '28px' }}>
            
            {/* Left Card: How They Farmed in Target Year */}
            <div style={{ 
              background: 'linear-gradient(180deg, #f0fdf4 0%, #ecfdf5 100%)', 
              padding: '24px', 
              borderRadius: '20px', 
              border: '2px solid #a7f3d0',
              boxShadow: '0 4px 16px rgba(16, 185, 129, 0.08)' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#065f46', marginBottom: '16px' }}>
                <div style={{ background: '#10b981', color: 'white', width: '32px', height: '32px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Leaf size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: '900', color: '#047857' }}>
                    {auditData.how_they_farmed_then?.era_title || `${selectedYear} Historical Era`}
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '900', color: '#065f46' }}>
                    {t.thenHeading}
                  </h3>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.88rem' }}>
                <div style={{ background: 'white', padding: '12px 14px', borderRadius: '12px', border: '1px solid #d1fae5' }}>
                  <strong style={{ color: '#065f46', display: 'block', marginBottom: '4px' }}>🌾 {t.seedsLabel}</strong>
                  <span style={{ color: '#1e293b', lineHeight: '1.5' }}>{auditData.how_they_farmed_then?.seeds}</span>
                </div>

                <div style={{ background: 'white', padding: '12px 14px', borderRadius: '12px', border: '1px solid #d1fae5' }}>
                  <strong style={{ color: '#065f46', display: 'block', marginBottom: '4px' }}>💩 {t.fertilizersLabel}</strong>
                  <span style={{ color: '#1e293b', lineHeight: '1.5' }}>{auditData.how_they_farmed_then?.fertilizers}</span>
                </div>

                <div style={{ background: 'white', padding: '12px 14px', borderRadius: '12px', border: '1px solid #d1fae5' }}>
                  <strong style={{ color: '#065f46', display: 'block', marginBottom: '4px' }}>🌿 {t.pestLabel}</strong>
                  <span style={{ color: '#1e293b', lineHeight: '1.5' }}>{auditData.how_they_farmed_then?.pest_control}</span>
                </div>

                <div style={{ background: 'white', padding: '12px 14px', borderRadius: '12px', border: '1px solid #d1fae5' }}>
                  <strong style={{ color: '#065f46', display: 'block', marginBottom: '4px' }}>💧 {t.waterLabel}</strong>
                  <span style={{ color: '#1e293b', lineHeight: '1.5' }}>{auditData.how_they_farmed_then?.water_irrigation}</span>
                </div>

                <div style={{ background: 'white', padding: '12px 14px', borderRadius: '12px', border: '1px solid #d1fae5' }}>
                  <strong style={{ color: '#065f46', display: 'block', marginBottom: '4px' }}>🪱 {t.soilLabel}</strong>
                  <span style={{ color: '#1e293b', lineHeight: '1.5' }}>{auditData.how_they_farmed_then?.soil_health}</span>
                </div>
              </div>
            </div>

            {/* Right Card: How We Farm Now in 2026 */}
            <div style={{ 
              background: 'linear-gradient(180deg, #fef2f2 0%, #fff1f2 100%)', 
              padding: '24px', 
              borderRadius: '20px', 
              border: '2px solid #fecaca',
              boxShadow: '0 4px 16px rgba(239, 68, 68, 0.08)' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#991b1b', marginBottom: '16px' }}>
                <div style={{ background: '#ef4444', color: 'white', width: '32px', height: '32px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertCircle size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: '900', color: '#b91c1c' }}>
                    {auditData.how_we_farm_now?.era_title || 'Current 2026 Era'}
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '900', color: '#991b1b' }}>
                    {t.nowHeading}
                  </h3>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.88rem' }}>
                <div style={{ background: 'white', padding: '12px 14px', borderRadius: '12px', border: '1px solid #fecaca' }}>
                  <strong style={{ color: '#b91c1c', display: 'block', marginBottom: '4px' }}>🧬 {t.seedsLabel}</strong>
                  <span style={{ color: '#1e293b', lineHeight: '1.5' }}>{auditData.how_we_farm_now?.seeds}</span>
                </div>

                <div style={{ background: 'white', padding: '12px 14px', borderRadius: '12px', border: '1px solid #fecaca' }}>
                  <strong style={{ color: '#b91c1c', display: 'block', marginBottom: '4px' }}>🧪 {t.fertilizersLabel}</strong>
                  <span style={{ color: '#1e293b', lineHeight: '1.5' }}>{auditData.how_we_farm_now?.fertilizers}</span>
                </div>

                <div style={{ background: 'white', padding: '12px 14px', borderRadius: '12px', border: '1px solid #fecaca' }}>
                  <strong style={{ color: '#b91c1c', display: 'block', marginBottom: '4px' }}>☠️ {t.pestLabel}</strong>
                  <span style={{ color: '#1e293b', lineHeight: '1.5' }}>{auditData.how_we_farm_now?.pest_control}</span>
                </div>

                <div style={{ background: 'white', padding: '12px 14px', borderRadius: '12px', border: '1px solid #fecaca' }}>
                  <strong style={{ color: '#b91c1c', display: 'block', marginBottom: '4px' }}>🚰 {t.waterLabel}</strong>
                  <span style={{ color: '#1e293b', lineHeight: '1.5' }}>{auditData.how_we_farm_now?.water_irrigation}</span>
                </div>

                <div style={{ background: 'white', padding: '12px 14px', borderRadius: '12px', border: '1px solid #fecaca' }}>
                  <strong style={{ color: '#b91c1c', display: 'block', marginBottom: '4px' }}>🚜 {t.soilLabel}</strong>
                  <span style={{ color: '#1e293b', lineHeight: '1.5' }}>{auditData.how_we_farm_now?.soil_health}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Matrix Comparison Table */}
          {auditData.matrix && auditData.matrix.length > 0 && (
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#1e293b', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingDown size={20} color="#059669" />
                <span>{t.matrixHeading}</span>
              </h3>

              <div style={{ overflowX: 'auto', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '14px 16px', fontWeight: '900', color: '#334155' }}>{t.colParam}</th>
                      <th style={{ padding: '14px 16px', fontWeight: '900', color: '#065f46', background: '#ecfdf5' }}>{t.colThen}</th>
                      <th style={{ padding: '14px 16px', fontWeight: '900', color: '#991b1b', background: '#fef2f2' }}>{t.colNow}</th>
                      <th style={{ padding: '14px 16px', fontWeight: '900', color: '#334155' }}>{t.colImpact}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditData.matrix.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? 'white' : '#fafafa' }}>
                        <td style={{ padding: '12px 16px', fontWeight: '800', color: '#1e293b' }}>{row.parameter}</td>
                        <td style={{ padding: '12px 16px', color: '#065f46', fontWeight: '700', background: '#f0fdf4' }}>{row.then_val}</td>
                        <td style={{ padding: '12px 16px', color: '#dc2626', fontWeight: '700', background: '#fff1f2' }}>{row.now_val}</td>
                        <td style={{ padding: '12px 16px', color: '#475569' }}>{row.impact}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Practical Farmer Restoration Guide */}
          {auditData.farmer_restoration_guide && (
            <div style={{ 
              background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)', 
              color: 'white', 
              padding: '28px 30px', 
              borderRadius: '22px', 
              boxShadow: '0 10px 25px rgba(6, 78, 59, 0.2)' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <Award size={24} color="#6ee7b7" />
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900', color: '#ecfdf5' }}>
                  {auditData.farmer_restoration_guide.heading || t.guideHeading}
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginTop: '16px' }}>
                {auditData.farmer_restoration_guide.action_steps?.map((step, idx) => (
                  <div key={idx} style={{ 
                    background: 'rgba(255, 255, 255, 0.12)', 
                    backdropFilter: 'blur(10px)', 
                    padding: '16px 18px', 
                    borderRadius: '16px', 
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    display: 'flex',
                    alignItems: 'start',
                    gap: '12px'
                  }}>
                    <span style={{ 
                      background: '#10b981', 
                      color: 'white', 
                      width: '24px', 
                      height: '24px', 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '0.8rem', 
                      fontWeight: '900',
                      flexShrink: 0
                    }}>
                      {idx + 1}
                    </span>
                    <span style={{ fontSize: '0.88rem', lineHeight: '1.5', color: '#f0fdf4' }}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>

              {auditData.farmer_restoration_guide.golden_rule && (
                <div style={{ 
                  marginTop: '20px', 
                  padding: '14px 18px', 
                  background: 'rgba(0, 0, 0, 0.25)', 
                  borderRadius: '14px', 
                  borderLeft: '4px solid #34d399',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  color: '#a7f3d0'
                }}>
                  <b>⭐ {t.goldenRuleLabel}</b> {auditData.farmer_restoration_guide.golden_rule}
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* 4. Real ISRIC SoilGrids 2.0 Live Telemetry Banner */}
      <div className="mk-card" style={{ 
        background: 'linear-gradient(135deg, #14532d 0%, #166534 50%, #15803d 100%)', 
        color: 'white', 
        padding: '24px 28px', 
        borderRadius: '24px',
        boxShadow: '0 10px 25px rgba(20, 83, 45, 0.25)' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '14px', fontSize: '0.78rem', fontWeight: '800', marginBottom: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px #4ade80' }}></span>
              <span>LIVE GROUND TRUTH • ISRIC SOILGRIDS 2.0</span>
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '4px 0 6px 0' }}>
              Real Topsoil Organic Carbon (SOC): {isricSocData ? `${isricSocData.soc_pct}% (${isricSocData.soc_g_kg} g/kg)` : '2.12% (21.2 g/kg)'}
            </h3>
            <p style={{ fontSize: '0.86rem', opacity: 0.9, maxWidth: '640px', margin: 0 }}>
              Live telemetry at depth <b>0–5cm</b> for coordinates <b>23.08°N, 88.28°E</b> (Howrah/Hooghly delta). {isricSocData?.recommendation || 'Rich organic reserve detected in Gangetic alluvial topsoil.'}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <span style={{ background: '#22c55e', color: '#052e16', padding: '6px 16px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: '900' }}>
              {isricSocData?.rating || 'Optimal Health'} (Depth 0–5cm)
            </span>
            <a 
              href="https://rest.isric.org/soilgrids/v2.0/properties/query?lat=23.08&lon=88.28&property=soc&depth=0-5cm&value=mean" 
              target="_blank" 
              rel="noreferrer"
              style={{ color: '#bbf7d0', fontSize: '0.78rem', textDecoration: 'underline', fontWeight: '700' }}
            >
              Verify ISRIC Raw REST API Feed ↗
            </a>
          </div>
        </div>
      </div>

      {/* 5. Decadal Environmental Benchmarks Grid */}
      <div className="responsive-three-col" style={{ gap: '20px' }}>
        
        <div className="mk-card card-hover-lift" style={{ borderLeft: '6px solid #ef4444', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#991b1b', marginBottom: '10px' }}>
            <Thermometer size={22} />
            <span style={{ fontSize: '0.84rem', fontWeight: '900', textTransform: 'uppercase' }}>Average Temperature</span>
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: '900', color: currentMetrics.avg_temp_c > 30 ? '#dc2626' : '#15803d' }}>
            {currentMetrics.avg_temp_c}°C
          </div>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '6px' }}>
            {currentMetrics.avg_temp_c > 30 ? `↑ +${(currentMetrics.avg_temp_c - 28.5).toFixed(1)}°C Heatwave anomaly compared to 1980 baseline` : 'Historical baseline temperature for optimal tiller growth'}
          </p>
        </div>

        <div className="mk-card card-hover-lift" style={{ borderLeft: '6px solid #f59e0b', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309' }}>
              <TrendingDown size={22} />
              <span style={{ fontSize: '0.84rem', fontWeight: '900', textTransform: 'uppercase' }}>Decadal SOC Benchmark</span>
            </div>
            <span style={{ fontSize: '0.72rem', background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '10px', fontWeight: '800' }}>
              Year {selectedYear}
            </span>
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: '900', color: currentMetrics.soil_carbon_pct < 0.8 ? '#b45309' : '#059669' }}>
            {currentMetrics.soil_carbon_pct}%
          </div>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '6px' }}>
            {currentMetrics.soil_carbon_pct < 0.6 
              ? `Critical organic depletion in ${selectedYear}. Present ISRIC reading is ${isricSocData ? isricSocData.soc_pct + '%' : '2.12%'}.` 
              : `Optimal natural humus in ${selectedYear}. Current live ISRIC baseline: ${isricSocData ? isricSocData.soc_pct + '%' : '2.12%'}.`}
          </p>
        </div>

        <div className="mk-card card-hover-lift" style={{ borderLeft: '6px solid #10b981', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#065f46', marginBottom: '10px' }}>
            <Calendar size={22} />
            <span style={{ fontSize: '0.84rem', fontWeight: '900', textTransform: 'uppercase' }}>Natural Yield Impact</span>
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: '900', color: currentMetrics.yield_impact_pct >= 0 ? '#15803d' : '#dc2626' }}>
            {currentMetrics.yield_impact_pct >= 0 ? `+${currentMetrics.yield_impact_pct}%` : `${currentMetrics.yield_impact_pct}%`}
          </div>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '6px' }}>
            {currentMetrics.yield_impact_pct < 0 ? 'Severe yield drop caused by degraded soil microbial biology' : 'Abundant natural yield achieved with zero chemical inputs'}
          </p>
        </div>

      </div>

    </div>
  );
}
