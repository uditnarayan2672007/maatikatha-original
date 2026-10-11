import React, { useState, useEffect } from 'react';
import { 
  Wind, AlertTriangle, Shield, Compass, MapPin, Radio, PlusCircle, 
  CheckCircle, Clock, Droplets, RefreshCw, Sparkles, Navigation, 
  Crosshair, Eye, Play, Pause, Zap, Activity, Info, ShieldAlert, 
  Layers, ChevronRight, Check, AlertCircle, Share2
} from 'lucide-react';

export default function KhamarDrishti({ language = 'en', currentRegion, currentLocation }) {
  const lat = currentLocation?.lat || 22.574;
  const lon = currentLocation?.lon || 88.3191;
  const district = currentLocation?.district || currentRegion || 'Howrah';

  // Live telemetry state
  const [liveWeather, setLiveWeather] = useState({
    wind_speed: 4.3,
    wind_direction_deg: 285,
    wind_direction_text: 'West-North-West (WNW)',
    humidity: 73,
    current_temp: 28.8,
    lat: lat,
    lon: lon,
    source: 'Open-Meteo Agro-Forecast API'
  });
  const [loadingWeather, setLoadingWeather] = useState(false);

  // Radar Interactive Controls
  const [radarRangeKm, setRadarRangeKm] = useState(12); // 6, 9, 12, 15
  const [selectedThreatId, setSelectedThreatId] = useState(1);
  const [radarCategoryFilter, setRadarCategoryFilter] = useState('all'); // all, fungal, pest, bio_shield
  const [isSweeping, setIsSweeping] = useState(true);
  const [sweepSpeed, setSweepSpeed] = useState('normal'); // 'normal' (4s), 'fast' (2s)
  const [viewMode, setViewMode] = useState('radar'); // 'radar' or 'matrix'

  // AI Trajectory Analysis state
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Modal State for adding new outbreak
  const [showReportModal, setShowReportModal] = useState(false);
  const [newDisease, setNewDisease] = useState('Late Blight (আলুর নাবী ধসা)');
  const [newDistance, setNewDistance] = useState(5.5);
  const [newDirection, setNewDirection] = useState('WNW');
  const [newCategory, setNewCategory] = useState('fungal');
  const [newSeverity, setNewSeverity] = useState('HIGH');
  const [toastMessage, setToastMessage] = useState('');

  // Direction to degree mapping
  const dirDegreeMap = {
    'N': 0, 'NNE': 22.5, 'NE': 45, 'ENE': 67.5,
    'E': 90, 'ESE': 112.5, 'SE': 135, 'SSE': 157.5,
    'S': 180, 'SSW': 202.5, 'SW': 225, 'WSW': 247.5,
    'W': 270, 'WNW': 292.5, 'NW': 315, 'NNW': 337.5
  };

  // Rich initial mock threat reports for radar tracking
  const [reports, setReports] = useState([
    {
      id: 1,
      disease: 'Late Blight (আলুর নাবী ধসা রোগ / Phytophthora infestans)',
      shortName: 'Late Blight',
      category: 'fungal',
      farmerLocation: `${district} West Basin (কালীপুর সমবায়)`,
      distanceKm: 6.2,
      bearing: 295,
      directionText: 'WNW (West-North-West)',
      reportedHoursAgo: 4,
      severity: 'CRITICAL',
      cropTarget: 'Potato, Tomato',
      isUpwind: true,
      sporeDensity: '840 spores/m³',
      downwindRisk: 'HIGH RISK - Spores arriving in ~36 hours',
      actionAdvice: 'স্পোর আটকাতে জমিতে অবিলম্বে ৫ দিনের পুরনো টক ঘোল (sour buttermilk) ও কাঁচা হলুদ গুঁড়ো স্প্রে করুন।'
    },
    {
      id: 2,
      disease: 'Sheath Blight (ধানের খোল ধসা / Rhizoctonia solani)',
      shortName: 'Sheath Blight',
      category: 'fungal',
      farmerLocation: `${district} River Reach (আমতা বাঁধ অঞ্চল)`,
      distanceKm: 4.1,
      bearing: 270,
      directionText: 'W (West)',
      reportedHoursAgo: 2,
      severity: 'HIGH',
      cropTarget: 'Boro Paddy',
      isUpwind: true,
      sporeDensity: '620 spores/m³',
      downwindRisk: 'HIGH RISK - Spores arriving in ~24 hours',
      actionAdvice: 'জমি থেকে অতিরিক্ত জল নিষ্কাশন করুন এবং কাঠকয়লার ছাই ও ট্রাইকোডার্মা ছড়ান।'
    },
    {
      id: 3,
      disease: 'Yellow Stem Borer (ধানের মাজরা পোকা / Scirpophaga)',
      shortName: 'Stem Borer',
      category: 'pest',
      farmerLocation: `${district} North-West (উদয়নারায়ণপুর)`,
      distanceKm: 8.5,
      bearing: 325,
      directionText: 'NW (North-West)',
      reportedHoursAgo: 12,
      severity: 'MODERATE',
      cropTarget: 'Paddy Tillers',
      isUpwind: true,
      sporeDensity: 'Migratory Moths',
      downwindRisk: 'MODERATE - Downwind flight window in 48h',
      actionAdvice: 'জমির চারধারে দেশীয় গাঁদা ফুলের সীমানা ও নিমের তেল স্প্রে করে জৈব প্রাচীর তৈরি করুন।'
    },
    {
      id: 4,
      disease: 'Brown Plant Hopper (বাদামি ঘাসফড়িং / BPH Swarm)',
      shortName: 'BPH Swarm',
      category: 'pest',
      farmerLocation: `${district} South Reach (উলুবেড়িয়া ক্যানাল)`,
      distanceKm: 10.8,
      bearing: 235,
      directionText: 'SW (South-West)',
      reportedHoursAgo: 16,
      severity: 'MODERATE',
      cropTarget: 'Paddy',
      isUpwind: false,
      sporeDensity: 'Crosswind Swarm',
      downwindRisk: 'WATCHLIST - Crosswind drift vector',
      actionAdvice: 'গাছের গোড়ায় আলো-বাতাস প্রবেশ নিশ্চিত করতে ধানের সারির মাঝে ২০ সেমি ফাঁকা রাখুন।'
    },
    {
      id: 5,
      disease: 'Ancestral Bio-Shield (ত্রিবেণী দেশি নিম ও জৈব প্রতিরোধ বেষ্টনী)',
      shortName: 'Bio-Shield Buffer',
      category: 'bio_shield',
      farmerLocation: `${district} Organic Cluster (বটতলা সমবায়)`,
      distanceKm: 3.2,
      bearing: 200,
      directionText: 'SSW (South-South-West)',
      reportedHoursAgo: 1,
      severity: 'SAFE',
      cropTarget: 'Multi-Crop Sanctuary',
      isUpwind: false,
      sporeDensity: 'Beneficial Predators Active',
      downwindRisk: 'PROTECTED - Biological barrier active',
      actionAdvice: 'বন্ধু পোকা (Ladybird Beetle, Trichogramma) এবং প্রাকৃতিক নিম প্রাচীর এই অঞ্চলে সংক্রমণ আটকে দিচ্ছে।'
    }
  ]);

  const fetchLiveWeather = async () => {
    setLoadingWeather(true);
    try {
      const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
      const data = await res.json();
      if (data.status === 'success' && data.weather) {
        setLiveWeather(data.weather);
      }
    } catch (err) {
      console.warn('[KhamarDrishti] Live weather fetch warning:', err);
    } finally {
      setLoadingWeather(false);
    }
  };

  useEffect(() => {
    fetchLiveWeather();
  }, [lat, lon, district]);

  // Selected threat object
  const activeThreat = reports.find(r => r.id === selectedThreatId) || reports[0];

  // Request AI Trajectory analysis for the active threat
  const runAiAnalysis = async (threatToAnalyze = activeThreat) => {
    setLoadingAi(true);
    setAiAnalysis(null);
    try {
      const response = await fetch('/api/khamardrishti/ai-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threat: threatToAnalyze,
          weather: liveWeather,
          district: district,
          language: language
        })
      });
      const data = await response.json();
      if (data.status === 'success' && data.data) {
        setAiAnalysis(data.data);
      } else {
        throw new Error('AI analysis returned invalid payload');
      }
    } catch (err) {
      console.warn('[KhamarDrishti] AI analyze error:', err);
      // Fallback
      setAiAnalysis({
        threat_level: threatToAnalyze.severity || "HIGH",
        spore_eta_hours: Math.round((threatToAnalyze.distanceKm / (liveWeather.wind_speed || 4)) * 20),
        trajectory_summary: `${liveWeather.wind_direction_text} দিক থেকে আসা বাতাসে ${threatToAnalyze.shortName} জীবাণুর স্পোর আপনার জমির দিকে ধেয়ে আসছে।`,
        microclimate_risk: `বাতাসে আর্দ্রতা ${liveWeather.humidity}% ও তাপমাত্রা ${liveWeather.current_temp}°C ছত্রাকের স্পোর অঙ্কুরোদগমের জন্য অতি অনুকূল।`,
        ancestral_bio_shield: {
          recipe_name: "পূর্বপুরুষের টক ঘোল ও কাঁচা হলুদ স্পোরনাশক দ্রবণ",
          ingredients: [
            "৫ দিনের পুরানো টক ঘোল (বা ছানার জল) - ২ লিটার",
            "বাটা কাঁচা হলুদ - ১০০ গ্রাম",
            "পরিষ্কার জল - ১৫ লিটার",
            "কাঠের ছাইয়ের পরিষ্কার জল - ১ লিটার"
          ],
          preparation_method: "টক ঘোল ও কাঁচা হলুদ মিশিয়ে ২৪ ঘণ্টা রাখুন। এরপর ছেঁকে নিয়ে ভোরে জমিতে স্প্রে করুন।",
          application_window: "আগামীকাল ভোর ৬:০০ থেকে ৮:০০ টার মধ্যে, পাতার শিশির শুকানোর আগেই স্প্রে করুন।"
        },
        community_alert_advice: "পশ্চিম সীমান্তের ৫ কিমি এলাকার সব কৃষককে সীমানা জমিতে জৈব বেষ্টনী তৈরি করার পরামর্শ দিন।"
      });
    } finally {
      setLoadingAi(false);
    }
  };

  // Automatically trigger AI analysis when threat changes if not yet loaded
  useEffect(() => {
    if (activeThreat && activeThreat.category !== 'bio_shield') {
      runAiAnalysis(activeThreat);
    } else {
      setAiAnalysis(null);
    }
  }, [selectedThreatId]);

  // Handle adding new custom report
  const handleAddReport = () => {
    if (!newDisease) return;
    const bearing = dirDegreeMap[newDirection] !== undefined ? dirDegreeMap[newDirection] : 290;
    const distNum = parseFloat(newDistance) || 5.0;

    const newEntry = {
      id: Date.now(),
      disease: newDisease,
      shortName: newDisease.split('(')[0].trim(),
      category: newCategory,
      farmerLocation: `${district} (${newDirection} - ${distNum} km)`,
      distanceKm: distNum,
      bearing: bearing,
      directionText: newDirection,
      reportedHoursAgo: 1,
      severity: newSeverity,
      cropTarget: 'Crops in Corridor',
      isUpwind: true,
      sporeDensity: 'Newly Reported Outbreak',
      downwindRisk: `${newSeverity} RISK - Fresh Vector Alert`,
      actionAdvice: 'আক্রান্ত এলাকার বিপরীতমুখী জমিতে নিম বীজ নির্যাস ও কাঠের ছাই স্প্রে করে সুরক্ষা বৃত্ত তৈরি করুন।'
    };

    setReports(prev => [newEntry, ...prev]);
    setSelectedThreatId(newEntry.id);
    setShowReportModal(false);
    setToastMessage('✅ নতুন প্রাদুর্ভাব সফলভাবে রাডারে যুক্ত হয়েছে!');
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Filtered reports for radar display
  const displayedThreats = reports.filter(r => {
    if (radarCategoryFilter === 'all') return true;
    return r.category === radarCategoryFilter;
  });

  // Multilingual translations
  const t = {
    bn: {
      badge: "📡 ৩৬০° বায়ো-স্পোর ও ভেক্টর ট্র্যাকিং রাডার • লাইভ ওপেন-মেটিও",
      title: "খামারদৃষ্টি • পাড়া-প্রতিবেশী আগাম রোগ প্রতিরোধ রাডার",
      subtitle: "বায়ুমণ্ডলীয় স্পোর প্রবাহ, বাতাসের গতিবেগ ও আর্দ্রতার উপর ভিত্তি করে ৫-১৫ কিমি দূরবর্তী রোগ ও পোকার আক্রমণ আপনার জমিতে পৌঁছানোর ৪৮ ঘণ্টা আগেই রাডারে শনাক্ত করে প্রতিরোধ গাইড দেয়।",
      radarTitle: "৩৬০° বায়ো-স্পোর আর্লি-ওয়ার্নিং রাডার (Bio-Defense Scope)",
      centerFarm: "আপনার জমি (Ground Zero)",
      windVectorTitle: "🌬️ লাইভ আবহাওয়া ও স্পোর প্রক্ষেপণ টেলিমিতি",
      reportBtn: "+ নতুন প্রাদুর্ভাব জানান",
      refresh: "লাইভ রাডার রিফ্রেশ",
      windSpeed: "বাতাসের গতিবেগ",
      windDir: "বায়ুপ্রবাহের অভিমুখ",
      humidity: "বাতাসে আর্দ্রতা",
      temperature: "মাঠের তাপমাত্রা",
      sweepSpeedBtn: "রাডার স্ক্যান স্পিড",
      rangeLabel: "রাডার পরিধি:",
      filterAll: "সব বিপদ",
      filterFungal: "🍄 ছত্রাক স্পোর",
      filterPest: "🐛 ক্ষতিকর পোকা",
      filterBioShield: "🛡️ জৈব সুরক্ষাবলয়",
      viewRadar: "📡 রাডার ভিউ",
      viewMatrix: "📋 থ্রেট ম্যাট্রিক্স",
      aiAnalysisTitle: "🧠 এআই বায়ো-স্পোর প্রক্ষেপণ ও সুরক্ষা সিমুলেশন",
      runAiBtn: "AI সিমুলেশন পুনরায় চালান",
      etaBadge: "স্পোর অবতরণ সময় (ETA)",
      microclimateRisk: "আবহাওয়া ও স্পোর অঙ্কুরোদগম ঝুঁকি",
      ancestralRecipe: "🌿 পূর্বপুরুষের জৈব সুরক্ষা প্রাচীর (Zero-Cost Formula)",
      applicationWindow: "⏰ স্প্রে করার মোক্ষম সময়",
      communityAlert: "📢 পাড়া-প্রতিবেশী সমবায় সতর্কবার্তা",
      modalTitle: "🚨 রাডারে নতুন রোগের প্রাদুর্ভাব রিপোর্ট করুন",
      diseaseName: "আক্রান্ত রোগ / পোকার নাম:",
      distanceLabel: "আপনার জমি থেকে দূরত্ব (কিমি):",
      directionLabel: "কোন দিক থেকে আসছে (অভিমুখ):",
      categoryLabel: "বিপদের ধরন:",
      severityLabel: "তীব্রতার মাত্রা:",
      submitBtn: "রাডারে প্রচার করুন"
    },
    hi: {
      badge: "📡 360° बायो-स्पोर व कीट ट्रैकिंग राडार • ओपन-मेटिओ लाइव",
      title: "खामारदृष्टि • ग्राम स्तरीय कीट व रोग पूर्व-चेतावनी राडार",
      subtitle: "हवा की गति, दिशा व नमी के आधार पर 5-15 किमी दूर से आने वाले बीजाणुओं व कीटों को आपके खेत में पहुँचने से 48 घंटे पहले राडार पर ट्रैक करता है।",
      radarTitle: "360° बायो-स्पोर डिफेंस राडार (Bio-Defense Scope)",
      centerFarm: "आपका खेत (Ground Zero)",
      windVectorTitle: "🌬️ लाइव मौसम व बीजाणु प्रसार टेलीमेट्री",
      reportBtn: "+ नए प्रकोप की सूचना दें",
      refresh: "राडार रीफ्रेश",
      windSpeed: "हवा की गति",
      windDir: "हवा की दिशा",
      humidity: "हवा में नमी",
      temperature: "खेत का तापमान",
      sweepSpeedBtn: "स्कैन गति",
      rangeLabel: "राडার दायरा:",
      filterAll: "सभी खतरे",
      filterFungal: "🍄 फफूंद बीजाणु",
      filterPest: "🐛 कीट प्रकोप",
      filterBioShield: "🛡️ जैविक सुरक्षा घेरा",
      viewRadar: "📡 राडार दृश्य",
      viewMatrix: "📋 विस्तृत सूची",
      aiAnalysisTitle: "🧠 एआई बीजाणु प्रक्षेप व सुरक्षा विश्लेषण",
      runAiBtn: "AI विश्लेषण पुनः चलाएं",
      etaBadge: "पहुंचने का अनुमानित समय (ETA)",
      microclimateRisk: "मौसम व बीजाणु अंकुरण जोखिम",
      ancestralRecipe: "🌿 पारम्परिक जैविक सुरक्षा कवच",
      applicationWindow: "⏰ छिड़काव का सही समय",
      communityAlert: "📢 पड़ोसी खेतों को अलर्ट",
      modalTitle: "🚨 राडार में नए रोग/कीट की सूचना दर्ज करें",
      diseaseName: "रोग या कीट का नाम:",
      distanceLabel: "दूरी (किमी):",
      directionLabel: "दिशा:",
      categoryLabel: "प्रकार:",
      severityLabel: "गंभीरता:",
      submitBtn: "राडार पर दर्ज करें"
    },
    en: {
      badge: "📡 360° Bio-Spore & Vector Tracking Radar • Open-Meteo Live",
      title: "KhamarDrishti • Community Early Warning Radar",
      subtitle: "Tracks downwind airborne fungal spores and migratory pest vectors across a 5-15 km radius, providing ancestral bio-shield defenses 48 hours before arrival.",
      radarTitle: "360° Bio-Spore Early Warning Radar Scope",
      centerFarm: "Your Farm (Ground Zero)",
      windVectorTitle: "🌬️ Live Atmospheric Spore Drift Telemetry",
      reportBtn: "+ Report Outbreak",
      refresh: "Refresh Radar",
      windSpeed: "Wind Velocity",
      windDir: "Wind Direction",
      humidity: "Relative Humidity",
      temperature: "Ambient Temp",
      sweepSpeedBtn: "Scan Speed",
      rangeLabel: "Radar Horizon:",
      filterAll: "All Signals",
      filterFungal: "🍄 Fungal Spores",
      filterPest: "🐛 Insect Pests",
      filterBioShield: "🛡️ Bio-Shield Zones",
      viewRadar: "📡 Radar Scope",
      viewMatrix: "📋 Threat Matrix",
      aiAnalysisTitle: "🧠 AI Spore Trajectory & Bio-Shield Simulation",
      runAiBtn: "Re-run AI Analysis",
      etaBadge: "Projected Arrival ETA",
      microclimateRisk: "Microclimate & Sporulation Risk",
      ancestralRecipe: "🌿 Ancestral Bio-Defense Formulation",
      applicationWindow: "⏰ Strategic Application Window",
      communityAlert: "📢 Community Corridor Alert",
      modalTitle: "🚨 Broadcast Outbreak into Bio-Radar",
      diseaseName: "Pathogen / Pest Name:",
      distanceLabel: "Distance from Farm (km):",
      directionLabel: "Compass Bearing / Direction:",
      categoryLabel: "Vector Type:",
      severityLabel: "Severity Level:",
      submitBtn: "Broadcast to Radar"
    }
  }[language] || {};

  // Color helper for threat category & severity
  const getBlipColor = (cat, sev) => {
    if (cat === 'bio_shield') return '#22c55e'; // Green
    if (sev === 'CRITICAL') return '#ef4444'; // Red
    if (sev === 'HIGH') return '#f97316'; // Orange
    if (cat === 'pest') return '#eab308'; // Yellow
    return '#a855f7'; // Purple
  };

  // Radar size parameters
  const radarSize = 440;
  const radarRadius = radarSize / 2;

  // Radar sweep animation duration
  const sweepDuration = sweepSpeed === 'fast' ? '2s' : '4s';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* CSS Styles for Radar Animations */}
      <style>{`
        @keyframes radarSweep {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes radarBlipPing {
          0% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(2.4); opacity: 0.15; }
          100% { transform: scale(3); opacity: 0; }
        }
        @keyframes radarWindDrift {
          0% { stroke-dashoffset: 40; }
          100% { stroke-dashoffset: 0; }
        }
        .radar-sweep-arm {
          transform-origin: 50% 50%;
          animation: radarSweep ${sweepDuration} linear infinite;
        }
        .radar-sweep-paused {
          animation-play-state: paused !important;
        }
        .radar-grid-ring {
          stroke: rgba(34, 197, 94, 0.22);
          stroke-width: 1.2;
          fill: none;
        }
        .radar-crosshair {
          stroke: rgba(34, 197, 94, 0.28);
          stroke-width: 1;
          stroke-dasharray: 4 4;
        }
      `}</style>

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#064e3b',
          color: '#a7f3d0',
          border: '1px solid #10b981',
          padding: '12px 24px',
          borderRadius: '12px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
          zIndex: 9999,
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Sparkles size={18} color="#34d399" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="mk-card mk-card-terracotta" style={{ padding: '28px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ea580c', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: '800', marginBottom: '10px' }}>
              <Radio size={15} />
              <span>{t.badge}</span>
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#9a3412', marginBottom: '6px' }}>{t.title}</h2>
            <p style={{ fontSize: '0.92rem', color: '#c2410c', maxWidth: '720px', lineHeight: '1.5' }}>{t.subtitle}</p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {/* View Mode Toggle */}
            <div style={{ background: '#ffedd5', padding: '4px', borderRadius: '14px', display: 'flex', gap: '4px', border: '1px solid #fdba74' }}>
              <button
                onClick={() => setViewMode('radar')}
                style={{
                  background: viewMode === 'radar' ? '#ea580c' : 'transparent',
                  color: viewMode === 'radar' ? 'white' : '#9a3412',
                  border: 'none',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Crosshair size={14} />
                <span>{t.viewRadar}</span>
              </button>
              <button
                onClick={() => setViewMode('matrix')}
                style={{
                  background: viewMode === 'matrix' ? '#ea580c' : 'transparent',
                  color: viewMode === 'matrix' ? 'white' : '#9a3412',
                  border: 'none',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Layers size={14} />
                <span>{t.viewMatrix}</span>
              </button>
            </div>

            <button
              onClick={fetchLiveWeather}
              disabled={loadingWeather}
              style={{
                background: '#ffedd5',
                color: '#c2410c',
                border: '1px solid #fdba74',
                padding: '10px 16px',
                borderRadius: '14px',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={15} className={loadingWeather ? 'animate-spin' : ''} />
              <span>{t.refresh}</span>
            </button>

            <button
              onClick={() => setShowReportModal(true)}
              style={{
                background: '#ea580c',
                color: 'white',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '14px',
                fontWeight: '800',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(234, 88, 12, 0.3)'
              }}
            >
              <PlusCircle size={17} />
              <span>{t.reportBtn}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Atmospheric Wind Vector Modeling Card (Live Telemetry) */}
      <div className="mk-card" style={{ background: 'linear-gradient(135deg, #091e14 0%, #03130d 100%)', color: 'white', padding: '22px', borderRadius: '24px', border: '1px solid rgba(34, 197, 94, 0.25)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wind size={20} color="#34d399" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#f0fdf4' }}>
              {t.windVectorTitle}
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#4ade80', padding: '4px 12px', borderRadius: '20px', fontSize: '0.76rem', fontWeight: '700' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px #4ade80' }}></span>
              <span>GPS: {lat.toFixed(2)}°N, {lon.toFixed(2)}°E • {district}</span>
            </div>
          </div>
        </div>

        <div className="responsive-three-col" style={{ gap: '14px' }}>
          {/* Wind Speed */}
          <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(34, 197, 94, 0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#a7f3d0', fontSize: '0.74rem', fontWeight: '700', textTransform: 'uppercase' }}>
              <span>{t.windSpeed}</span>
              <Wind size={15} color="#34d399" />
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: '900', color: '#34d399', marginTop: '6px' }}>
              {liveWeather.wind_speed} <span style={{ fontSize: '0.95rem', fontWeight: '600' }}>km/h</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '4px' }}>
              {liveWeather.wind_speed > 10 ? '⚠️ উচ্চ গতিতে স্পোর বিস্তার প্রবণ' : 'মৃদু বায়ুপ্রবাহ • নিয়ন্ত্রিত বিস্তার'}
            </div>
          </div>

          {/* Wind Direction & Bearing */}
          <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(250, 204, 21, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fef08a', fontSize: '0.74rem', fontWeight: '700', textTransform: 'uppercase' }}>
              <span>{t.windDir}</span>
              <Compass size={15} color="#facc15" />
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: '900', color: '#facc15', marginTop: '6px' }}>
              {liveWeather.wind_direction_text}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '4px' }}>
              দিক কোণ: <b>{liveWeather.wind_direction_deg}°</b> • ডাউনউইন্ড করিডোর
            </div>
          </div>

          {/* Relative Humidity & Temp */}
          <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#bae6fd', fontSize: '0.74rem', fontWeight: '700', textTransform: 'uppercase' }}>
              <span>{t.humidity} & {t.temperature}</span>
              <Droplets size={15} color="#38bdf8" />
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: '900', color: '#38bdf8', marginTop: '6px' }}>
              {liveWeather.humidity}% <span style={{ fontSize: '1rem', fontWeight: '700', color: '#e2e8f0' }}>/ {liveWeather.current_temp}°C</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '4px' }}>
              {liveWeather.humidity > 70 ? '🚨 ছত্রাক স্পোর অঙ্কুরোদগমের জন্য অতি সংবেদনশীল' : 'নিরাপদ আর্দ্রতা স্তর'}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN SECTION: RADAR SCOPE & AI INTELLIGENCE */}
      {viewMode === 'radar' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 490px) 1fr', gap: '24px', alignItems: 'start' }}>
          
          {/* LEFT: THE 360° BIO-RADAR DISPLAY */}
          <div className="mk-card" style={{ 
            background: 'radial-gradient(circle at center, #021a10 0%, #010c07 80%, #000503 100%)', 
            borderRadius: '24px', 
            padding: '20px', 
            border: '2px solid rgba(34, 197, 94, 0.35)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5), inset 0 0 50px rgba(16, 185, 129, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            {/* Radar Header & Controls */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: isSweeping ? '#22c55e' : '#eab308', boxShadow: `0 0 8px ${isSweeping ? '#22c55e' : '#eab308'}` }}></span>
                <span style={{ color: '#86efac', fontSize: '0.82rem', fontWeight: '800', letterSpacing: '0.5px' }}>
                  BIO-RADAR SCOPE • {radarRangeKm} KM
                </span>
              </div>

              {/* Sweep Controls */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => setIsSweeping(!isSweeping)}
                  title={isSweeping ? "Pause Sweep" : "Resume Sweep"}
                  style={{
                    background: 'rgba(34, 197, 94, 0.15)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    color: '#86efac',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {isSweeping ? <Pause size={12} /> : <Play size={12} />}
                  <span>{isSweeping ? 'PAUSE' : 'SCAN'}</span>
                </button>

                <button
                  onClick={() => setSweepSpeed(s => s === 'normal' ? 'fast' : 'normal')}
                  style={{
                    background: 'rgba(34, 197, 94, 0.15)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    color: '#86efac',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  {sweepSpeed === 'normal' ? '1x' : '2x'}
                </button>
              </div>
            </div>

            {/* RADAR CANVAS SVG */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '420px', aspectRatio: '1/1', margin: '0 auto' }}>
              <svg 
                viewBox={`0 0 ${radarSize} ${radarSize}`} 
                style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#020d07', border: '3px solid rgba(34, 197, 94, 0.4)' }}
              >
                <defs>
                  {/* Sweep Gradient (Phosphor Green to Transparent) */}
                  <linearGradient id="sweepTrail" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(34, 197, 94, 0.55)" />
                    <stop offset="100%" stopColor="rgba(34, 197, 94, 0)" />
                  </linearGradient>

                  {/* Radial Background Grid */}
                  <radialGradient id="radarGlassGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgba(34, 197, 94, 0.12)" />
                    <stop offset="70%" stopColor="rgba(34, 197, 94, 0.04)" />
                    <stop offset="100%" stopColor="rgba(0, 0, 0, 0.6)" />
                  </radialGradient>
                </defs>

                {/* Glass Inner Glow */}
                <circle cx={radarRadius} cy={radarRadius} r={radarRadius - 4} fill="url(#radarGlassGlow)" />

                {/* Concentric Range Rings (25%, 50%, 75%, 100% of Max Range) */}
                {[0.25, 0.5, 0.75, 1.0].map((ratio, idx) => {
                  const r = (radarRadius - 24) * ratio;
                  const ringKm = (radarRangeKm * ratio).toFixed(1);
                  return (
                    <g key={idx}>
                      <circle cx={radarRadius} cy={radarRadius} r={r} className="radar-grid-ring" />
                      {/* Distance Ring Label */}
                      <text 
                        x={radarRadius + 4} 
                        y={radarRadius - r + 12} 
                        fill="rgba(74, 222, 128, 0.5)" 
                        fontSize="9" 
                        fontWeight="700" 
                        letterSpacing="0.5px"
                      >
                        {ringKm} km
                      </text>
                    </g>
                  );
                })}

                {/* Cardinal Axes (Crosshairs: N-S, E-W) */}
                <line x1={radarRadius} y1={12} x2={radarRadius} y2={radarSize - 12} className="radar-crosshair" />
                <line x1={12} y1={radarRadius} x2={radarSize - 12} y2={radarRadius} className="radar-crosshair" />

                {/* Diagonal Axis (NW-SE, NE-SW) */}
                <line x1={44} y1={44} x2={radarSize - 44} y2={radarSize - 44} stroke="rgba(34, 197, 94, 0.12)" strokeWidth="1" strokeDasharray="3 3" />
                <line x1={radarSize - 44} y1={44} x2={44} y2={radarSize - 44} stroke="rgba(34, 197, 94, 0.12)" strokeWidth="1" strokeDasharray="3 3" />

                {/* Compass Degree Ticks & Labels */}
                <text x={radarRadius} y={22} textAnchor="middle" fill="#86efac" fontSize="11" fontWeight="900">N (0°)</text>
                <text x={radarSize - 20} y={radarRadius + 4} textAnchor="middle" fill="#86efac" fontSize="11" fontWeight="900">E (90°)</text>
                <text x={radarRadius} y={radarSize - 10} textAnchor="middle" fill="#86efac" fontSize="11" fontWeight="900">S (180°)</text>
                <text x={24} y={radarRadius + 4} textAnchor="middle" fill="#86efac" fontSize="11" fontWeight="900">W (270°)</text>

                <text x={radarSize - 50} y={55} fill="rgba(134, 239, 172, 0.6)" fontSize="9" fontWeight="700">NE</text>
                <text x={radarSize - 50} y={radarSize - 45} fill="rgba(134, 239, 172, 0.6)" fontSize="9" fontWeight="700">SE</text>
                <text x={50} y={radarSize - 45} fill="rgba(134, 239, 172, 0.6)" fontSize="9" fontWeight="700">SW</text>
                <text x={50} y={55} fill="rgba(134, 239, 172, 0.6)" fontSize="9" fontWeight="700">NW</text>

                {/* Live Wind Vector Arrow Stream */}
                {(() => {
                  const rad = (liveWeather.wind_direction_deg * Math.PI) / 180;
                  const arrowLen = radarRadius - 40;
                  // Vector points in direction wind is blowing towards: deg + 180
                  const endX = radarRadius - Math.sin(rad) * arrowLen * 0.7;
                  const endY = radarRadius + Math.cos(rad) * arrowLen * 0.7;
                  return (
                    <g opacity="0.75">
                      <line 
                        x1={radarRadius + Math.sin(rad) * arrowLen * 0.8} 
                        y1={radarRadius - Math.cos(rad) * arrowLen * 0.8} 
                        x2={endX} 
                        y2={endY} 
                        stroke="#38bdf8" 
                        strokeWidth="2.5" 
                        strokeDasharray="6 4"
                        style={{ animation: 'radarWindDrift 1.5s linear infinite' }}
                      />
                      <polygon 
                        points={`${endX},${endY} ${endX - 7},${endY - 7} ${endX + 7},${endY - 7}`}
                        fill="#38bdf8"
                        transform={`rotate(${liveWeather.wind_direction_deg + 90}, ${endX}, ${endY})`}
                      />
                    </g>
                  );
                })()}

                {/* Selected Threat Vector Line to Ground Zero */}
                {activeThreat && (
                  (() => {
                    const rRatio = Math.min(1.0, activeThreat.distanceKm / radarRangeKm);
                    const rDist = (radarRadius - 28) * rRatio;
                    const bRad = (activeThreat.bearing * Math.PI) / 180;
                    const bx = radarRadius + rDist * Math.sin(bRad);
                    const by = radarRadius - rDist * Math.cos(bRad);
                    return (
                      <g>
                        <line 
                          x1={radarRadius} 
                          y1={radarRadius} 
                          x2={bx} 
                          y2={by} 
                          stroke={getBlipColor(activeThreat.category, activeThreat.severity)} 
                          strokeWidth="2" 
                          strokeDasharray="4 3" 
                          opacity="0.85"
                        />
                        {/* Target Reticle around selected blip */}
                        <circle cx={bx} cy={by} r="18" fill="none" stroke={getBlipColor(activeThreat.category, activeThreat.severity)} strokeWidth="1.5" strokeDasharray="3 3" />
                        <line x1={bx - 22} y1={by} x2={bx + 22} y2={by} stroke={getBlipColor(activeThreat.category, activeThreat.severity)} strokeWidth="1" opacity="0.6" />
                        <line x1={bx} y1={by - 22} x2={bx} y2={by + 22} stroke={getBlipColor(activeThreat.category, activeThreat.severity)} strokeWidth="1" opacity="0.6" />
                      </g>
                    );
                  })()
                )}

                {/* ROTATING RADAR SWEEP BEAM */}
                <g className={`radar-sweep-arm ${!isSweeping ? 'radar-sweep-paused' : ''}`}>
                  {/* Sweep Cone Sector */}
                  <path 
                    d={`M ${radarRadius} ${radarRadius} L ${radarRadius} 16 A ${radarRadius - 16} ${radarRadius - 16} 0 0 1 ${radarRadius + 140} ${radarRadius - 80} Z`} 
                    fill="url(#sweepTrail)" 
                    opacity="0.4"
                  />
                  {/* Lead Sweep Line */}
                  <line 
                    x1={radarRadius} 
                    y1={radarRadius} 
                    x2={radarRadius} 
                    y2={16} 
                    stroke="#4ade80" 
                    strokeWidth="2.5" 
                    strokeLinecap="round"
                    filter="drop-shadow(0 0 6px #22c55e)"
                  />
                </g>

                {/* GROUND ZERO: Center Farmer Plot */}
                <circle cx={radarRadius} cy={radarRadius} r="9" fill="#10b981" filter="drop-shadow(0 0 8px #34d399)" />
                <circle cx={radarRadius} cy={radarRadius} r="16" fill="none" stroke="#34d399" strokeWidth="1.5" opacity="0.7" />
                <circle cx={radarRadius} cy={radarRadius} r="3" fill="#ffffff" />
                <text x={radarRadius} y={radarRadius + 28} textAnchor="middle" fill="#a7f3d0" fontSize="9" fontWeight="900" letterSpacing="0.3px">
                  YOUR PLOT (0 KM)
                </text>

                {/* TARGET BLIPS */}
                {displayedThreats.map((threat) => {
                  const rRatio = Math.min(1.0, threat.distanceKm / radarRangeKm);
                  const rDist = (radarRadius - 28) * rRatio;
                  const bRad = (threat.bearing * Math.PI) / 180;
                  const bx = radarRadius + rDist * Math.sin(bRad);
                  const by = radarRadius - rDist * Math.cos(bRad);
                  const color = getBlipColor(threat.category, threat.severity);
                  const isSelected = threat.id === selectedThreatId;

                  return (
                    <g 
                      key={threat.id} 
                      onClick={() => setSelectedThreatId(threat.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Pulsing ring animation */}
                      <circle 
                        cx={bx} 
                        cy={by} 
                        r="7" 
                        fill={color} 
                        opacity="0.3" 
                        style={{ animation: 'radarBlipPing 2.2s cubic-bezier(0, 0.2, 0.8, 1) infinite' }} 
                      />
                      
                      {/* Core Target Dot */}
                      <circle 
                        cx={bx} 
                        cy={by} 
                        r={isSelected ? "8" : "6"} 
                        fill={color} 
                        stroke="#ffffff" 
                        strokeWidth={isSelected ? "2.5" : "1.2"} 
                        filter={`drop-shadow(0 0 8px ${color})`} 
                      />

                      {/* Blip Label */}
                      <rect 
                        x={bx + 8} 
                        y={by - 12} 
                        width={threat.shortName.length * 6.5 + 14} 
                        height="18" 
                        rx="4" 
                        fill="rgba(0, 0, 0, 0.85)" 
                        stroke={color} 
                        strokeWidth="1" 
                      />
                      <text 
                        x={bx + 14} 
                        y={by} 
                        fill="#ffffff" 
                        fontSize="9.5" 
                        fontWeight="800"
                      >
                        {threat.shortName}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Radar Scope Legend & Filter Controls */}
            <div style={{ width: '100%', marginTop: '16px' }}>
              {/* Category Filter Pills */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '12px' }}>
                {[
                  { id: 'all', label: t.filterAll },
                  { id: 'fungal', label: t.filterFungal },
                  { id: 'pest', label: t.filterPest },
                  { id: 'bio_shield', label: t.filterBioShield }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setRadarCategoryFilter(cat.id)}
                    style={{
                      background: radarCategoryFilter === cat.id ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.06)',
                      border: radarCategoryFilter === cat.id ? '1px solid #4ade80' : '1px solid rgba(255, 255, 255, 0.12)',
                      color: radarCategoryFilter === cat.id ? '#86efac' : '#cbd5e1',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Range Selector */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255, 255, 255, 0.05)', padding: '8px 12px', borderRadius: '12px', fontSize: '0.78rem', color: '#94a3b8' }}>
                <span style={{ fontWeight: '700' }}>{t.rangeLabel}</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[6, 9, 12, 15].map(km => (
                    <button
                      key={km}
                      onClick={() => setRadarRangeKm(km)}
                      style={{
                        background: radarRangeKm === km ? '#22c55e' : 'rgba(255, 255, 255, 0.1)',
                        color: radarRangeKm === km ? '#052e16' : '#cbd5e1',
                        border: 'none',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: '800',
                        cursor: 'pointer'
                      }}
                    >
                      {km}km
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: SELECTED TARGET TELEMETRY & AI BIO-SHIELD PREDICTION */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Target Telemetry Card */}
            <div className="mk-card" style={{ 
              background: '#ffffff', 
              padding: '22px', 
              borderRadius: '20px', 
              borderLeft: `6px solid ${getBlipColor(activeThreat.category, activeThreat.severity)}`,
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: '12px', background: activeThreat.category === 'bio_shield' ? '#dcfce7' : '#fee2e2', color: activeThreat.category === 'bio_shield' ? '#15803d' : '#b91c1c', fontSize: '0.74rem', fontWeight: '800', marginBottom: '6px' }}>
                    <Activity size={13} />
                    <span>TARGET LOCKED • {activeThreat.severity}</span>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e293b' }}>
                    {activeThreat.disease}
                  </h3>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#ea580c' }}>
                    {activeThreat.distanceKm} <span style={{ fontSize: '0.85rem' }}>KM</span>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '600' }}>
                    Bearing: {activeThreat.bearing}° ({activeThreat.directionText})
                  </div>
                </div>
              </div>

              {/* Target Specs Strip */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', background: '#f8fafc', padding: '12px', borderRadius: '14px', marginBottom: '14px', border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700' }}>LOCATION</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#334155' }}>{activeThreat.farmerLocation}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700' }}>HOST CROP</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#334155' }}>{activeThreat.cropTarget}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700' }}>SPORE DENSITY</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#334155' }}>{activeThreat.sporeDensity}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700' }}>WIND VECTOR STATUS</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: '800', color: activeThreat.isUpwind ? '#dc2626' : '#16a34a' }}>
                    {activeThreat.isUpwind ? '🚨 DIRECT UPWIND' : '🛡️ LATERAL SAFE'}
                  </div>
                </div>
              </div>

              {/* Quick Action Advice */}
              <div style={{ background: '#fff7ed', padding: '12px 14px', borderRadius: '12px', border: '1px solid #fed7aa', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <Shield size={18} color="#ea580c" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.84rem', color: '#9a3412', lineHeight: '1.4' }}>
                  <b>প্রতিরক্ষা নির্দেশ:</b> {activeThreat.actionAdvice}
                </div>
              </div>
            </div>

            {/* AI SPORE TRAJECTORY & ANCESTRAL SHIELD INTEL CARD */}
            <div className="mk-card" style={{ 
              background: 'linear-gradient(135deg, #022013 0%, #03140c 100%)', 
              color: 'white', 
              padding: '24px', 
              borderRadius: '20px', 
              border: '1px solid rgba(34, 197, 94, 0.3)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.3)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={20} color="#34d399" />
                  <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#a7f3d0' }}>
                    {t.aiAnalysisTitle}
                  </h4>
                </div>

                <button
                  onClick={() => runAiAnalysis(activeThreat)}
                  disabled={loadingAi}
                  style={{
                    background: 'rgba(34, 197, 94, 0.2)',
                    border: '1px solid rgba(34, 197, 94, 0.4)',
                    color: '#86efac',
                    padding: '6px 12px',
                    borderRadius: '10px',
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <RefreshCw size={13} className={loadingAi ? 'animate-spin' : ''} />
                  <span>{t.runAiBtn}</span>
                </button>
              </div>

              {/* AI Content or Loading Spinner */}
              {loadingAi ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(34, 197, 94, 0.2)', borderTopColor: '#34d399', animation: 'radarSweep 1s linear infinite' }} />
                  <div style={{ color: '#86efac', fontWeight: '700', fontSize: '0.88rem' }}>
                    ওপেন-মেটিও বাতাস ভেক্টর ও এআই স্পোর অ্যারোবায়োলজি প্রক্ষেপণ হিসাব করা হচ্ছে...
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                    Groq / Gemini বায়ুমণ্ডলীয় বিস্তার মডেল সক্রিয়
                  </div>
                </div>
              ) : aiAnalysis ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  
                  {/* ETA and Trajectory Physics Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.06)', padding: '12px 16px', borderRadius: '14px', border: '1px solid rgba(34, 197, 94, 0.2)', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '700' }}>{t.etaBadge}</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#facc15' }}>
                        ⚡ ~{aiAnalysis.spore_eta_hours} ঘণ্টা
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ 
                        background: aiAnalysis.threat_level === 'CRITICAL' ? '#ef4444' : aiAnalysis.threat_level === 'HIGH' ? '#ea580c' : '#22c55e', 
                        color: 'white', 
                        padding: '4px 10px', 
                        borderRadius: '12px', 
                        fontSize: '0.75rem', 
                        fontWeight: '800' 
                      }}>
                        ঝুঁকি মাত্রা: {aiAnalysis.threat_level}
                      </span>
                    </div>
                  </div>

                  {/* Atmospheric Vector Drift */}
                  <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '14px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: '800', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Wind size={14} />
                      <span>বায়ুমণ্ডলীয় বিস্তার ও প্রবাহ বলবিদ্যা:</span>
                    </div>
                    <p style={{ fontSize: '0.84rem', color: '#e2e8f0', lineHeight: '1.5', margin: 0 }}>
                      {aiAnalysis.trajectory_summary}
                    </p>
                  </div>

                  {/* Microclimate Risk */}
                  <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '14px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div style={{ fontSize: '0.75rem', color: '#4ade80', fontWeight: '800', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Droplets size={14} />
                      <span>{t.microclimateRisk}:</span>
                    </div>
                    <p style={{ fontSize: '0.84rem', color: '#cbd5e1', lineHeight: '1.5', margin: 0 }}>
                      {aiAnalysis.microclimate_risk}
                    </p>
                  </div>

                  {/* Ancestral Bio-Shield Recipe */}
                  {aiAnalysis.ancestral_bio_shield && (
                    <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: '900', color: '#86efac', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ShieldAlert size={17} color="#4ade80" />
                        <span>{aiAnalysis.ancestral_bio_shield.recipe_name}</span>
                      </div>

                      {/* Ingredients */}
                      {aiAnalysis.ancestral_bio_shield.ingredients && (
                        <div style={{ marginBottom: '8px' }}>
                          <div style={{ fontSize: '0.72rem', color: '#a7f3d0', fontWeight: '700', marginBottom: '4px' }}>প্রয়োজনীয় দেশীয় উপাদান:</div>
                          <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: '#e2e8f0', lineHeight: '1.4' }}>
                            {aiAnalysis.ancestral_bio_shield.ingredients.map((ing, i) => (
                              <li key={i}>{ing}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Preparation */}
                      <div style={{ fontSize: '0.8rem', color: '#d1fae5', lineHeight: '1.4', marginBottom: '8px' }}>
                        <b>প্রস্তুতি ও প্রয়োগ:</b> {aiAnalysis.ancestral_bio_shield.preparation_method}
                      </div>

                      {/* Application Window */}
                      <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '8px 12px', borderRadius: '10px', fontSize: '0.78rem', color: '#fde047', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} />
                        <span>{t.applicationWindow}: {aiAnalysis.ancestral_bio_shield.application_window}</span>
                      </div>
                    </div>
                  )}

                  {/* Community Alert Advice */}
                  {aiAnalysis.community_alert_advice && (
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Info size={14} color="#60a5fa" />
                      <span>{aiAnalysis.community_alert_advice}</span>
                    </div>
                  )}

                </div>
              ) : null}

            </div>

          </div>

        </div>
      )}

      {/* MATRIX VIEW (ALL THREATS DETAILED LIST) */}
      {viewMode === 'matrix' && (
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1e293b', marginBottom: '14px' }}>
            {t.badge} • ৫-১৫ কিমি আঞ্চলিক বিপদ তালিকা
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {reports.map((report) => (
              <div
                key={report.id}
                className="mk-card card-hover-lift"
                style={{
                  borderLeft: `6px solid ${getBlipColor(report.category, report.severity)}`,
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  background: selectedThreatId === report.id ? '#f0fdf4' : 'white',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  setSelectedThreatId(report.id);
                  setViewMode('radar');
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e293b' }}>
                      {report.disease}
                    </span>
                    <span style={{ 
                      background: report.category === 'bio_shield' ? '#dcfce7' : '#fee2e2', 
                      color: report.category === 'bio_shield' ? '#15803d' : '#991b1b', 
                      padding: '3px 10px', 
                      borderRadius: '12px', 
                      fontSize: '0.72rem', 
                      fontWeight: '800' 
                    }}>
                      {report.severity}
                    </span>
                  </div>

                  <span style={{ background: '#fef3c7', color: '#92400e', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '800' }}>
                    {report.downwindRisk}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.82rem', color: '#64748b', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={15} color="#ea580c" />
                    <span>{report.farmerLocation} ({report.distanceKm} km, {report.directionText})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Wind size={15} color="#0284c7" />
                    <span>ভেক্টর গতিবেগ: <b>{liveWeather.wind_speed} km/h</b> ({liveWeather.wind_direction_text})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={15} />
                    <span>{report.reportedHoursAgo} ঘণ্টা পূর্বে রিপোর্ট</span>
                  </div>
                </div>

                <div style={{ background: '#fff7ed', padding: '12px 16px', borderRadius: '12px', border: '1px solid #fed7aa', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#9a3412', marginBottom: '2px' }}>
                      🛡️ পূর্বপুরুষের জৈব সুরক্ষা বিধান:
                    </div>
                    <p style={{ fontSize: '0.86rem', color: '#7c2d12', lineHeight: '1.4', margin: 0 }}>
                      {report.actionAdvice}
                    </p>
                  </div>

                  <button
                    style={{
                      background: '#ea580c',
                      color: 'white',
                      border: 'none',
                      padding: '8px 14px',
                      borderRadius: '10px',
                      fontSize: '0.78rem',
                      fontWeight: '800',
                      cursor: 'pointer',
                      flexShrink: 0,
                      marginLeft: '12px'
                    }}
                  >
                    রাডারে ট্র্যাক করুন
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Broadcast Modal to add new outbreak */}
      {showReportModal && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <h4 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#9a3412', marginBottom: '6px' }}>
              {t.modalTitle}
            </h4>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '16px', lineHeight: '1.4' }}>
              নতুন রোগের খবর দিলে রাডার তাৎক্ষণিকভাবে ওপেন-মেটিও বাতাসের গতিবেগ বিশ্লেষণ করে ডাউনউইন্ড জমিতে আগাম সতর্কবার্তা তৈরি করবে।
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                  {t.diseaseName}
                </label>
                <input
                  type="text"
                  value={newDisease}
                  onChange={(e) => setNewDisease(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    {t.distanceLabel}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="20"
                    value={newDistance}
                    onChange={(e) => setNewDistance(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    {t.directionLabel}
                  </label>
                  <select
                    value={newDirection}
                    onChange={(e) => setNewDirection(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white' }}
                  >
                    <option value="WNW">West-North-West (WNW)</option>
                    <option value="NW">North-West (NW)</option>
                    <option value="W">West (W)</option>
                    <option value="SW">South-West (SW)</option>
                    <option value="N">North (N)</option>
                    <option value="NE">North-East (NE)</option>
                    <option value="E">East (E)</option>
                    <option value="SE">South-East (SE)</option>
                    <option value="S">South (S)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    {t.categoryLabel}
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white' }}
                  >
                    <option value="fungal">ছত্রাক স্পোর (Fungal)</option>
                    <option value="pest">কীটপতঙ্গ / পোকা (Pest)</option>
                    <option value="bacterial">ব্যাকটেরিয়াল (Bacterial)</option>
                    <option value="bio_shield">জৈব সুরক্ষা বেষ্টনী (Bio-Shield)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    {t.severityLabel}
                  </label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white' }}
                  >
                    <option value="CRITICAL">মারাত্মক (CRITICAL)</option>
                    <option value="HIGH">উচ্চ (HIGH)</option>
                    <option value="MODERATE">মাঝারি (MODERATE)</option>
                    <option value="SAFE">সুরক্ষিত (SAFE)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  onClick={() => setShowReportModal(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', background: 'white', fontWeight: '700', cursor: 'pointer' }}
                >
                  বাতিল করুন
                </button>
                <button
                  onClick={handleAddReport}
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#ea580c', color: 'white', fontWeight: '800', cursor: 'pointer' }}
                >
                  {t.submitBtn}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
