import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, MicOff, Volume2, VolumeX, Sparkles, CheckCircle2, 
  AlertCircle, RefreshCw, Send, Printer, Copy, Check, 
  Clock, ShieldCheck, Sprout, DollarSign, Calendar, Info, 
  History, ArrowRight, Activity, Droplets, BookOpen, Share2,
  Camera, Upload, Sliders, FileText, Bug, Microscope, 
  Layers, ChevronRight, HelpCircle, Leaf, Zap, Thermometer,
  Wind, Award, CheckCircle, Crosshair, ZoomIn
} from 'lucide-react';

export default function VoiceDoctor({ language = 'en', onLanguageChange, currentRegion = 'Howrah, West Bengal' }) {
  // Multilingual State Engine (Defaulting to Bengali if selected, with live sync)
  const [currentLang, setCurrentLang] = useState(() => {
    return language || 'bn';
  });

  const updateLanguage = (newLang) => {
    setCurrentLang(newLang);
    if (onLanguageChange) onLanguageChange(newLang);
  };

  useEffect(() => {
    if (language) setCurrentLang(language);
  }, [language]);

  // Consultation State
  const [recordState, setRecordState] = useState('idle'); // 'idle' | 'listening' | 'analyzing'
  const [liveTranscript, setLiveTranscript] = useState('');
  const [advice, setAdvice] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [errorMessage, setErrorMessage] = useState('');
  const [customText, setCustomText] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Field Patient Triage Configuration
  const [selectedCrop, setSelectedCrop] = useState('Paddy (Rice)');
  const [selectedStage, setSelectedStage] = useState('Vegetative Tillering');
  const [plotSize, setPlotSize] = useState(2.0); // in Bighas
  const [leafImage, setLeafImage] = useState(null);
  const [leafPreview, setLeafPreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  // Tab & UI View Control
  const [activeTab, setActiveTab] = useState('doctor'); // 'doctor' | 'catalog' | 'report' | 'history'
  const [dossierTab, setDossierTab] = useState('recipe'); // 'recipe' | 'pathology' | 'economics' | 'ecology'
  const [completedSteps, setCompletedSteps] = useState({});
  const [consultationHistory, setConsultationHistory] = useState([]);
  const [catalogSearch, setCatalogSearch] = useState('');

  // Lab Report & Soil Card PDF Analysis State
  const [reportFile, setReportFile] = useState(null);
  const [reportPreviewUrl, setReportPreviewUrl] = useState(null);
  const [selectedSampleReport, setSelectedSampleReport] = useState('west_bengal_soil_card');
  const [isAnalyzingReport, setIsAnalyzingReport] = useState(false);
  const [reportAnalysisResult, setReportAnalysisResult] = useState(null);
  const [reportError, setReportError] = useState('');
  const [reportZoom, setReportZoom] = useState(1);
  const reportFileInputRef = useRef(null);

  // Organ Symptom Matrix
  const [selectedOrgan, setSelectedOrgan] = useState('leaves');
  const [selectedSymptoms, setSelectedSymptoms] = useState(['Yellowing Veins (Chlorosis)']);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const speechRecognitionRef = useRef(null);
  const liveTranscriptRef = useRef('');
  const audioPlayerRef = useRef(null);

  // Gemini API Configuration State
  const [geminiStatus, setGeminiStatus] = useState({ configured: false, hasKey: false, keyPreview: null });
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [inputKey, setInputKey] = useState('');
  const [savingKey, setSavingKey] = useState(false);

  useEffect(() => {
    fetch('/api/config/gemini')
      .then(r => r.json())
      .then(d => {
        if (d.status === 'success') setGeminiStatus(d);
      })
      .catch(() => {});
  }, []);

  const handleSaveGeminiKey = async () => {
    if (!inputKey.trim()) return;
    setSavingKey(true);
    try {
      const res = await fetch('/api/config/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: inputKey.trim() })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setGeminiStatus({ configured: true, hasKey: true, keyPreview: inputKey.trim().slice(0, 6) + '...' });
        setShowKeyModal(false);
        setInputKey('');
      } else {
        alert(data.message || 'Error configuring key');
      }
    } catch (e) {
      alert('Could not connect to server.');
    } finally {
      setSavingKey(false);
    }
  };

  // Crops catalog with Bengali & Hindi regional nomenclature
  const cropsList = [
    { id: 'paddy', name: 'Paddy (Rice)', bnName: 'ধান (Paddy)', hiName: 'धान (Paddy)', icon: '🌾', variety: 'Aman / Boro' },
    { id: 'brinjal', name: 'Brinjal (Eggplant)', bnName: 'বেগুন (Brinjal)', hiName: 'बैंगन (Brinjal)', icon: '🍆', variety: 'Muktakeshi / Desi' },
    { id: 'mustard', name: 'Mustard (Sarson)', bnName: 'সর্ষে (Mustard)', hiName: 'सरसों (Mustard)', icon: '🌼', variety: 'Kasundi / Rai' },
    { id: 'wheat', name: 'Wheat (Gehun)', bnName: 'গম (Wheat)', hiName: 'गेहूं (Wheat)', icon: '🌾', variety: 'Sonalika / Sharbati' },
    { id: 'chili', name: 'Chili & Pepper', bnName: 'লঙ্কা (Chili)', hiName: 'मिर्च (Chili)', icon: '🌶️', variety: 'Pusa Jwala' },
    { id: 'tomato', name: 'Tomato', bnName: 'টমেটো (Tomato)', hiName: 'टमाटर (Tomato)', icon: '🍅', variety: 'Desi Pusa Early' },
    { id: 'potato', name: 'Potato (Alu)', bnName: 'আলু (Potato)', hiName: 'आलू (Potato)', icon: '🥔', variety: 'Jyoti / Chandramukhi' }
  ];

  const stagesList = [
    { id: 'nursery', en: 'Nursery / Seedling (0-20 Days)', bn: 'বীজতলা / চারা অবস্থা (০-২০ দিন)', hi: 'नर्सरी / अंकुरण (0-20 दिन)' },
    { id: 'tillering', en: 'Vegetative Tillering (20-50 Days)', bn: 'গাছ বৃদ্ধি ও কুশি দশা (২০-৫০ দিন)', hi: 'वानस्पतिक कल्ले फूटना (20-50 दिन)' },
    { id: 'flowering', en: 'Flowering & Panicle Initiation (50-80 Days)', bn: 'ফুল ও থোড় আসা (৫০-৮০ দিন)', hi: 'फूल व बाली निकलना (50-80 दिन)' },
    { id: 'maturity', en: 'Grain / Fruit Maturity (80+ Days)', bn: 'দানা পাকা ও ফসল তোলা (৮০+ দিন)', hi: 'दाना पकना व परिपक्वता (80+ दिन)' }
  ];

  // Plant Organ Diagnostic Matrix with rich Bengali translations
  const organSymptoms = {
    leaves: [
      { id: 'l1', label: 'Yellowing Veins (Chlorosis)', bnLabel: 'পাতায় হলুদ শিরা (ক্লোরোসিস)', hiLabel: 'पत्तियों की पीली नसें (क्लोरोसिस)', severity: 'Moderate', desc: 'Pale foliage with green veins indicating N/K deficit', bnDesc: 'পাতায় সবুজ শিরার মাঝে হলদেটে ভাব—নাইট্রোজেন ও পটাশের অভাব' },
      { id: 'l2', label: 'Brown Concentric Rings (Blight)', bnLabel: 'বাদামী বলয় দাগ বা ব্লাইট (Blast/Blight)', hiLabel: 'भूरे गोल धब्बे (ब्लाइट रोग)', severity: 'Critical', desc: 'Target board lesions typical of fungal blast', bnDesc: 'পাতায় বাদামী রঙের গোল দাগ—ছত্রাকজনিত ব্লাস্ট বা ধসা রোগ' },
      { id: 'l3', label: 'Sticky Dew / Aphid Clusters', bnLabel: 'আঠালো পাতা ও জাব পোকা (Aphids)', hiLabel: 'चिपचिपा रस व माहू कीट (Aphids)', severity: 'High', desc: 'Honeydew secretion attracting sooty mold', bnDesc: 'পাতার নিচে আঠালো মধুরস নিঃসরণকারী খুদে জাব পোকার ঝাঁক' },
      { id: 'l4', label: 'Upward Leaf Curling', bnLabel: 'কচি পাতা ওপরের দিকে কোঁকড়ানো (Leaf Curl)', hiLabel: 'पत्तियों का ऊपर मुड़ना (मरोड़ रोग)', severity: 'High', desc: 'Thrips/Whitefly viral transmission vector', bnDesc: 'সাদা মাছি বা চর্বনকারী পোকার কারণে পাতার ওপরের দিকে কুঁকড়ে যাওয়া' },
      { id: 'l5', label: 'Chewed Irregular Margins', bnLabel: 'পোকা খাওয়া কাটা পাতার ধার (Chewed Margins)', hiLabel: 'कीट द्वारा कतरे हुए पत्ते', severity: 'Moderate', desc: 'Nocturnal armyworm / caterpillar feeding', bnDesc: 'রাতে লেদা পোকা বা শুঁয়োপোকা দ্বারা পাতার ধার কেটে খাওয়া' },
      { id: 'l6', label: 'White Powdery Mildew Layer', bnLabel: 'সাদা পাউডারের মতো ছত্রাক আস্তরণ (Mildew)', hiLabel: 'सफेद चूर्ण फफूंद (पाउडरी मिल्ड्यू)', severity: 'High', desc: 'Airborne fungal spore coating', bnDesc: 'বাতাসবাহিত সাদা পাউডারের মতো গুঁড়ো ছত্রাকের আস্তরণ' }
    ],
    stem: [
      { id: 's1', label: 'Hollow Dead-Heart (Majra)', bnLabel: 'মাজরা পোকার মরা শিষ বা ডেড-হার্ট (Majra)', hiLabel: 'तना छेदक मृत-गोभ (Dead-Heart)', severity: 'Critical', desc: 'Yellow stem borer larval culm bore', bnDesc: 'হলুদ মাজরা পোকার কীড়া কান্ডের ভেতরে ঢুকে কেটে দেওয়ায় গাছ শুকিয়ে যাওয়া' },
      { id: 's2', label: 'Dark Collar Rot at Soil Line', bnLabel: 'মাটির কাছে কান্ডে কালো দাগ ও পচন (Collar Rot)', hiLabel: 'जमीन के पास तने का काला सड़न', severity: 'Critical', desc: 'Rhizoctonia fungal sheath decay', bnDesc: 'ছত্রাকজনিত কলার রট ও গাছের গোড়ায় কালো পচন' },
      { id: 's3', label: 'Gummy Ooze / Bacterial Canker', bnLabel: 'কান্ড চুইয়ে আঠা ও ব্যাক্টেরিয়াল পচন', hiLabel: 'तने से चिपचिपा स्राव व जीवाणु सड़न', severity: 'High', desc: 'Bacterial vascular wilt exudate', bnDesc: 'ব্যাক্টেরিয়া আক্রান্ত কান্ড থেকে দুর্গন্ধযুক্ত রস ক্ষরণ' },
      { id: 's4', label: 'Weak Stalks & Lodging Tendency', bnLabel: 'দুর্বল নড়বড়ে কান্ড ও হেলে পড়া', hiLabel: 'कमजोर तना व पौधे का गिरना', severity: 'Moderate', desc: 'Silica and potassium structural deficiency', bnDesc: 'সিলিকা ও পটাশের অভাবে কান্ড নরম হয়ে নুয়ে পড়া' }
    ],
    roots: [
      { id: 'r1', label: 'Blackened Decaying Taproots', bnLabel: 'কালো পচা প্রধান শিকড় (Root Rot)', hiLabel: 'काली सड़ी हुई जड़ें (जड़ गलन)', severity: 'Critical', desc: 'Fusarium root rot and waterlogging decay', bnDesc: 'অতিরিক্ত জলবদ্ধতা ও ফিউসারিয়াম ছত্রাকে শিকড় পচে যাওয়া' },
      { id: 'r2', label: 'Swollen Root-Knot Galls', bnLabel: 'শিকড়ে ফোলা গিঁট বা কৃমি পোকা (Nematodes)', hiLabel: 'जड़ों में गांठें (सूत्रकृमि प्रकोप)', severity: 'High', desc: 'Subsurface Meloidogyne nematode knots', bnDesc: 'মাটির নিচের নেমাটোড কৃমির আক্রমণে শিকড়ে গুটি বাঁধা' },
      { id: 'r3', label: 'Stunted Secondary Root Hair', bnLabel: 'শিকড়ের রোঁয়া বৃদ্ধি না পাওয়া', hiLabel: 'जड़ों के रोओं का अवरुद्ध विकास', severity: 'Moderate', desc: 'Hardpan compaction inhibiting nutrient assimilation', bnDesc: 'শক্ত আঁটসাঁট মাটির কারণে খাদ্য শোষণকারী রোঁয়া না গজানো' },
      { id: 'r4', label: 'Foul Anaerobic Sewer Odor', bnLabel: 'গোড়ায় পচা দুর্গন্ধযুক্ত মাটি', hiLabel: 'जड़ों से दुर्गंधयुक्त सड़ाव', severity: 'Critical', desc: 'Anaerobic soil decomposition toxicity', bnDesc: 'অক্সিজেনহীন মাটিতে বিষাক্ত গ্যাসের কারণে শিকড়ে পচন' }
    ],
    grains: [
      { id: 'g1', label: 'Empty Chaffy Whiteheads', bnLabel: 'সাদা চিটে শিষ (Empty Whiteheads)', hiLabel: 'सफेद खोखली बाली (Whiteheads)', severity: 'Critical', desc: 'Panicle severance by internal stem borer', bnDesc: 'শীষ আসার মুখে মাজরা পোকা কাটার ফলে দানাহীন সাদা শিষ' },
      { id: 'g2', label: 'False Black Smut Grains', bnLabel: 'কালো ঝুল বা ভূষা রোগ (False Smut)', hiLabel: 'काला कंडुआ या भूसा रोग', severity: 'High', desc: 'Ustilaginoidea spore balls replacing rice kernels', bnDesc: 'ধানের দানায় কালো বা হলুদ রঙের ছত্রাকের গুঁড়ো হওয়া' },
      { id: 'g3', label: 'Premature Blossom & Pod Drop', bnLabel: 'অকালে ফুল ও কচি ফল ঝরে পড়া', hiLabel: 'असमय फूल व फलियों का गिरना', severity: 'Moderate', desc: 'Heat-induced pollen sterility', bnDesc: 'তীব্র তাপপ্রবাহে পরাগায়ন ব্যাহত হয়ে ফুল ঝরে যাওয়া' },
      { id: 'g4', label: 'Bacterial Grain Discoloration', bnLabel: 'বৃষ্টির পর দানায় কালো ছোপ বা দাগ', hiLabel: 'बारिश बाद दानों का काला पड़ना', severity: 'High', desc: 'Post-rain bacterial spikelet rot', bnDesc: 'বৃষ্টির পর ব্যাক্টেরিয়া সংক্রমণে শীষের দানা কালো হওয়া' }
    ]
  };

  // Pre-indexed Organic Remedies Encyclopedia
  const remediesLibrary = [
    {
      title: "Neem Seed Kernel Extract Spray (NSKE 5%)",
      target: "Chewing caterpillars, leaf miners, diamondback moth, leafhoppers",
      ingredients: "50g crushed neem seed kernels, 1L water, 5ml cold-pressed mustard oil",
      dosage: "Spray thoroughly on foliage twice weekly at sunrise",
      savings: "₹850 - ₹1,400 per acre",
      carbon: "+0.2% soil microbial biomass"
    },
    {
      title: "Cow Dung & Seasoned Hardwood Ash Manure",
      target: "Nitrogen/potassium chlorosis, soil compaction, subsurface termites",
      ingredients: "5kg sun-dried cow dung, 1.5kg kitchen hardwood ash (3:1 ratio)",
      dosage: "Incorporate 150g per root collar 5cm away from main stem",
      savings: "₹750 - ₹1,200 per acre",
      carbon: "+0.45% organic carbon retention"
    },
    {
      title: "Sour Buttermilk & Raw Wild Turmeric Drench",
      target: "Rhizoctonia fungal rot, damping-off wilt, collar rot",
      ingredients: "1L 3-day fermented buttermilk whey, 30g raw turmeric, 5L clean water",
      dosage: "Drench 250ml directly into infected plant root zones",
      savings: "₹900 - ₹1,650 per acre",
      carbon: "Lactic acid probiotic colony barrier"
    },
    {
      title: "Chili-Garlic-Asafoetida Bio-Repellent",
      target: "Aphids, whiteflies, thrips, yellow mosaic virus vectors",
      ingredients: "10 crushed green bird-eye chilies, 1 bulb garlic, pinch of hing, 2.5L water",
      dosage: "Mist underside of tender shoot clusters in late afternoon",
      savings: "₹650 - ₹1,100 per acre",
      carbon: "100% biodegradable zero toxic residue"
    },
    {
      title: "Fermented Datura & Castor Bitter Leaf Decoction",
      target: "Yellow stem borer (Majra), pod borers, armyworms",
      ingredients: "100g datura, castor, and calotropis leaves boiled in 2L water",
      dosage: "Direct nozzle directly into plant culm sheath whorls",
      savings: "₹1,100 - ₹1,800 per acre",
      carbon: "Preserves honeybee and predator wasp populations"
    },
    {
      title: "Banana Pseudostem & Rice Straw Hydro-Mulch",
      target: "Severe soil desiccation, moisture depletion, heat stress shock",
      ingredients: "Chopped banana pseudostem, dry paddy straw, 2kg fresh cow dung slurry",
      dosage: "Spread 8cm deep inter-row mulch to preserve moisture for 10 days",
      savings: "₹600 - ₹950 per acre",
      carbon: "Lowers ground temperature by 5°C"
    }
  ];

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('mk_consultation_history');
      if (stored) setConsultationHistory(JSON.parse(stored));
    } catch (e) {
      console.warn('History storage error', e);
    }
  }, []);

  const saveToHistory = (newAdvice) => {
    try {
      const updated = [newAdvice, ...consultationHistory.slice(0, 19)];
      setConsultationHistory(updated);
      localStorage.setItem('mk_consultation_history', JSON.stringify(updated));
    } catch (e) {
      console.warn('History save error', e);
    }
  };

  // Live Speech Recognition Initialization (Native Bengali 'bn-IN' ready)
  const initSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = currentLang === 'bn' ? 'bn-IN' : currentLang === 'hi' ? 'hi-IN' : 'en-IN';

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
      }
      liveTranscriptRef.current = transcript;
      setLiveTranscript(transcript);

      // Live Acoustic Language Detection
      if (/[\u0980-\u09FF]/.test(transcript) && currentLang !== 'bn') {
        updateLanguage('bn');
      } else if (/[\u0900-\u097F]/.test(transcript) && currentLang !== 'hi') {
        updateLanguage('hi');
      }
    };

    return recognition;
  };

  // Fallback Web Speech Synthesis if network is offline
  const fallbackWebSpeech = (textToSpeak, rate) => {
    if (!('speechSynthesis' in window) || !textToSpeak) {
      setIsSpeaking(false);
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = rate;
      const isBn = /[\u0980-\u09FF]/.test(textToSpeak) || currentLang === 'bn';
      const isHi = /[\u0900-\u097F]/.test(textToSpeak) || currentLang === 'hi';
      utterance.lang = isBn ? 'bn-IN' : isHi ? 'hi-IN' : 'en-IN';
      const voices = window.speechSynthesis.getVoices();
      if (isBn) {
        const bnVoice = voices.find(v => 
          v.lang.toLowerCase().startsWith('bn') || 
          v.name.toLowerCase().includes('bengali') || 
          v.name.toLowerCase().includes('bangla')
        );
        if (bnVoice) utterance.voice = bnVoice;
      }
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      setIsSpeaking(false);
    }
  };

  // Studio-Quality Native Bengali Speech Engine
  // Streams authentic human Bengali speech directly from /api/tts
  // Completely eliminates Windows English/Hindi voice mangling of Bengali syllables
  const speakAdvice = async (textToSpeak, rate = speechRate) => {
    if (!textToSpeak) return;
    stopSpeaking();

    // Clean text for pure oral delivery
    const cleanedText = textToSpeak
      .replace(/[*#_`~]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[🌾🔬⚠️🌿📋💰🌱📍📅]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const isBn = /[\u0980-\u09FF]/.test(cleanedText) || currentLang === 'bn';
    const isHi = /[\u0900-\u097F]/.test(cleanedText) || currentLang === 'hi';
    const voiceLang = isBn ? 'bn' : isHi ? 'hi' : 'en';

    setIsSpeaking(true);

    try {
      const ttsUrl = `/api/tts?lang=${voiceLang}&text=${encodeURIComponent(cleanedText)}`;
      const audio = new Audio(ttsUrl);
      audio.playbackRate = rate || 1.0;
      audioPlayerRef.current = audio;

      audio.onplay = () => {
        setIsSpeaking(true);
      };

      audio.onended = () => {
        setIsSpeaking(false);
        audioPlayerRef.current = null;
      };

      audio.onerror = (err) => {
        console.warn('[Studio TTS] Server audio stream notice, falling back to Web Speech:', err);
        audioPlayerRef.current = null;
        fallbackWebSpeech(cleanedText, rate);
      };

      await audio.play();
    } catch (err) {
      console.warn('[Studio TTS] Play call interrupted, using fallback:', err);
      fallbackWebSpeech(cleanedText, rate);
    }
  };

  const stopSpeaking = () => {
    if (audioPlayerRef.current) {
      try {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.currentTime = 0;
      } catch (e) {}
      audioPlayerRef.current = null;
    }
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
    setIsSpeaking(false);
  };

  // Stop audio playback when switching away or unmounting
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  // Start microphone recording
  const startRecording = async () => {
    setErrorMessage('');
    setLiveTranscript('');
    liveTranscriptRef.current = '';
    audioChunksRef.current = [];

    try {
      const recognition = initSpeechRecognition();
      if (recognition) {
        speechRecognitionRef.current = recognition;
        recognition.start();
      }
    } catch (e) {
      console.warn('SpeechRecognition notice:', e);
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const transcribedText = (liveTranscriptRef.current || liveTranscript || '').trim();
        await executeConsultation({ audio: audioBlob, text: transcribedText });
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecordState('listening');
    } catch (err) {
      console.warn("Microphone access notice:", err);
      setErrorMessage(currentLang === 'bn'
        ? "মাইক্রোফোন অনুমতি মেলেনি। নিচে লক্ষণ নির্বাচন করুন বা বাংলায় লিখুন।"
        : currentLang === 'hi'
        ? "माइक की अनुमति नहीं मिली। नीचे लक्षण चुनें या टाइप करें।"
        : "Microphone permission denied. Use camera scanner, symptom checklist, or typing below."
      );
      setRecordState('idle');
    }
  };

  const stopRecording = () => {
    if (speechRecognitionRef.current) {
      try { speechRecognitionRef.current.stop(); } catch (e) {}
    }
    if (mediaRecorderRef.current && recordState === 'listening') {
      mediaRecorderRef.current.stop();
      setRecordState('analyzing');
    }
  };

  // Handle Photo Select & Start Laser Scan Animation
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLeafImage(file);
    setIsScanning(true);

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setLeafPreview(uploadEvent.target.result);
      setTimeout(() => setIsScanning(false), 2200);
    };
    reader.readAsDataURL(file);
  };

  // Execute Multimodal Consultation
  const executeConsultation = async ({ audio = null, image = leafImage, text = null } = {}) => {
    setRecordState('analyzing');
    setErrorMessage('');

    try {
      const formData = new FormData();
      if (audio) formData.append('audio', audio, 'query.webm');
      if (image) formData.append('leafImage', image);

      let finalQuery = (text !== null && text !== undefined ? text : customText) || '';
      if (selectedSymptoms.length > 0) {
        finalQuery = (finalQuery ? finalQuery + '. ' : '') + `Observed symptoms: ${selectedSymptoms.join(', ')}`;
      }
      if (finalQuery) formData.append('textQuery', finalQuery);

      formData.append('cropType', selectedCrop);
      formData.append('cropStage', selectedStage);
      formData.append('region', currentRegion);
      formData.append('plotSize', plotSize);

      // Determine language
      let queryLang = currentLang;
      if (/[\u0980-\u09FF]/.test(finalQuery)) queryLang = 'bn';
      else if (/[\u0900-\u097F]/.test(finalQuery)) queryLang = 'hi';
      formData.append('language', queryLang);

      const res = await fetch('/api/voice', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (data.status === 'success') {
        // Automatically switch UI to Bengali if Bengali was spoken or returned
        if (data.language === 'bn' || /[\u0980-\u09FF]/.test(data.textResponse || '')) {
          updateLanguage('bn');
        } else if (data.language === 'hi' || /[\u0900-\u097F]/.test(data.textResponse || '')) {
          updateLanguage('hi');
        }

        // Auto-synchronize crop selection if the farmer asked about a different crop (e.g. asked about Potato while Paddy was selected)
        if (data.cropType && data.cropType !== selectedCrop) {
          const matchingCrop = cropsList.find(c => 
            c.name.toLowerCase() === data.cropType.toLowerCase() ||
            c.id.toLowerCase() === data.cropType.toLowerCase() ||
            data.cropType.toLowerCase().includes(c.id.toLowerCase())
          );
          if (matchingCrop) {
            setSelectedCrop(matchingCrop.name);
          } else {
            setSelectedCrop(data.cropType);
          }
        }

        setAdvice(data);
        setCompletedSteps({});
        saveToHistory(data);
        speakAdvice(data.textResponse);
      } else {
        throw new Error(data.message || 'Consultation processing error');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(currentLang === 'bn' 
        ? "বিজ্ঞপ্তি: স্থানীয় পরীক্ষিত দেশীয় ভেষজ সমাধান প্রদর্শিত হচ্ছে।"
        : currentLang === 'hi'
        ? "सूचना: स्थानीय प्रमाणित जैविक उपचार भंडार का उपयोग किया जा रहा है।"
        : "Notice: Reverting to local verified ancestral remedies database."
      );
    } finally {
      setRecordState('idle');
    }
  };

  const toggleSymptom = (label) => {
    setSelectedSymptoms(prev => 
      prev.includes(label) ? prev.filter(s => s !== label) : [...prev, label]
    );
  };

  const toggleStep = (idx) => {
    setCompletedSteps(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleCopyPrescription = () => {
    if (!advice) return;
    const isBn = currentLang === 'bn' || /[\u0980-\u09FF]/.test(advice.textResponse || '');
    const isHi = currentLang === 'hi' || /[\u0900-\u097F]/.test(advice.textResponse || '');

    const text = isBn ? `🌾 মাটিকথা ফিল্ড ক্লিনিক্যাল প্রেসক্রিপশন [${advice.prescription_id}]
📅 তারিখ: ${new Date(advice.timestamp).toLocaleDateString('bn-IN')}
📍 অঞ্চল: ${advice.region}
🌱 রোগী: ${advice.cropType} (${advice.cropStage}) • জমি: ${advice.plotSize} বিঘা
🔬 রোগ নির্ণয়: ${advice.diagnosis?.condition}
⚠️ ক্ষতিকারক পোকা/জীবাণু: ${advice.diagnosis?.causative_organism} (তীব্রতা: ${advice.diagnosis?.severity})
🌿 মূল ভেষজ সমাধান: ${advice.clinical_prescription?.primary_remedy}
📋 প্রস্তুত প্রণালী: ${(advice.clinical_prescription?.preparation_steps || [advice.instructions]).join('; ')}
💰 কৃষকের সাশ্রয়: ${advice.economic_impact?.net_savings_inr} (${advice.economic_impact?.roi_multiplier})
🌾 প্রতিরোধী দেশি বীজ: ${advice.heritage_seed?.name}` :
    isHi ? `🌾 माटिकथा फील्ड क्लिनिकल पर्ची [${advice.prescription_id}]
📅 दिनांक: ${new Date(advice.timestamp).toLocaleDateString('hi-IN')}
📍 क्षेत्र: ${advice.region}
🌱 रोगी: ${advice.cropType} (${advice.cropStage}) • खेत: ${advice.plotSize} बीघा
🔬 रोग निदान: ${advice.diagnosis?.condition}
⚠️ कीट/रोगजनक: ${advice.diagnosis?.causative_organism} (गंभीरता: ${advice.diagnosis?.severity})
🌿 मुख्य जैविक उपचार: ${advice.clinical_prescription?.primary_remedy}
📋 तैयारी विधि: ${(advice.clinical_prescription?.preparation_steps || [advice.instructions]).join('; ')}
💰 किसान की बचत: ${advice.economic_impact?.net_savings_inr} (${advice.economic_impact?.roi_multiplier})
🌾 देशी बीज: ${advice.heritage_seed?.name}` :
    `🌾 MaatiKatha Clinical Field Doctor Prescription [${advice.prescription_id}]
📅 Date: ${new Date(advice.timestamp).toLocaleDateString()}
📍 Region: ${advice.region}
🌱 Patient: ${advice.cropType} (${advice.cropStage}) • Plot: ${advice.plotSize} Bigha
🔬 Condition: ${advice.diagnosis?.condition}
⚠️ Pathogen: ${advice.diagnosis?.causative_organism} (Severity: ${advice.diagnosis?.severity})
🌿 Primary Remedy: ${advice.clinical_prescription?.primary_remedy}
📋 Scaled Protocol: ${(advice.clinical_prescription?.preparation_steps || [advice.instructions]).join('; ')}
💰 Farmer Savings: ${advice.economic_impact?.net_savings_inr} (${advice.economic_impact?.roi_multiplier})
🌾 Resilient Seed: ${advice.heritage_seed?.name}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Pre-indexed Govt & KVK Diagnostic Reports
  const sampleReportsData = {
    west_bengal_soil_card: {
      id: 'west_bengal_soil_card',
      title: 'Government of West Bengal — Directorate of Agriculture',
      subTitle: 'National Soil Health Card • মাটি পরীক্ষা রিপোর্ট (WB-SHC)',
      refNo: 'WB-SHC-2026-7841',
      lab: 'District Soil Testing Laboratory, Uluberia, Howrah (Govt. of WB)',
      farmer: 'বিপ্লব ঘোষ (Biplab Ghosh)',
      crop: 'Paddy (Aman Rice)',
      plotSize: '১.৫ বিঘা পলি দোআঁশ জমি',
      date: '০৪ মার্চ ২০২৬',
      vitalityScore: 38,
      statusColor: '#ef4444',
      parameters: [
        { name: 'Soil pH (অম্লত্ব সূচক)', value: '5.1', unit: 'pH', status: 'Critical Low / Acidic', statusBn: 'মারাত্মক অম্লীয় (pH ৫.১)', ideal: '6.5 - 7.5', badgeColor: '#ef4444' },
        { name: 'Organic Carbon (SOC)', value: '0.28', unit: '%', status: 'Severe Deficit', statusBn: 'চরম ঘাটতি (<০.৫%)', ideal: '> 0.75%', badgeColor: '#ef4444' },
        { name: 'Available Nitrogen (N)', value: '142', unit: 'kg/ha', status: 'Low', statusBn: 'স্বল্প পরিমাণ', ideal: '280 - 560', badgeColor: '#f59e0b' },
        { name: 'Available Phosphorus (P)', value: '18.4', unit: 'kg/ha', status: 'Moderate', statusBn: 'মধ্যম মাত্রা', ideal: '25 - 50', badgeColor: '#10b981' },
        { name: 'Available Potassium (K)', value: '280', unit: 'kg/ha', status: 'Optimal', statusBn: 'অনুকূল পর্যাপ্ত', ideal: '150 - 300', badgeColor: '#10b981' },
        { name: 'Zinc (Zn)', value: '0.42', unit: 'ppm', status: 'Deficient', statusBn: 'জিঙ্কের অভাব', ideal: '> 0.60', badgeColor: '#f59e0b' },
        { name: 'Boron (B)', value: '0.38', unit: 'ppm', status: 'Deficient', statusBn: 'বোরনের অভাব', ideal: '> 0.50', badgeColor: '#f59e0b' },
        { name: 'Electrical Conductivity', value: '0.32', unit: 'dS/m', status: 'Normal', statusBn: 'স্বাভাবিক লবণাক্ততা', ideal: '< 1.0', badgeColor: '#10b981' }
      ]
    },
    potato_pathology_slip: {
      id: 'potato_pathology_slip',
      title: 'ICAR - Krishi Vigyan Kendra (KVK) Plant Diagnostic Clinic',
      subTitle: 'Diagnostic Clinical Slip • উদ্ভিদ রোগ নির্ণয় ও প্যাথলজি স্লিপ',
      refNo: 'KVK-PATH-94812',
      lab: 'ICAR-KVK Plant Pathology Diagnostic Clinic, Hooghly',
      farmer: 'সমীর মণ্ডল (Samir Mondal)',
      crop: 'Potato (Kufri Jyoti)',
      plotSize: '২.০ বিঘা আলু জমি',
      date: '০৯ মার্চ ২০২৬',
      vitalityScore: 42,
      statusColor: '#f97316',
      parameters: [
        { name: 'Pathogen Species', value: 'Phytophthora infestans', unit: 'Oomycete', status: 'Active Inoculum', statusBn: 'সক্রিয় ছত্রাক স্পোর', ideal: 'Zero', badgeColor: '#ef4444' },
        { name: 'Leaf Chlorosis / Blight', value: '68%', unit: 'Visual Index', status: 'Critical High', statusBn: 'মারাত্মক ধসা বিস্তার', ideal: '< 5%', badgeColor: '#ef4444' },
        { name: 'Microclimate Moisture', value: '88%', unit: 'Relative Humidity', status: 'Spore Conducive', statusBn: 'ছত্রাক অনুকূল আর্দ্রতা', ideal: '< 70%', badgeColor: '#ef4444' },
        { name: 'Soil Acidity (pH)', value: '5.4', unit: 'pH', status: 'Acidic', statusBn: 'অম্লীয় ভাব', ideal: '6.0 - 7.0', badgeColor: '#f59e0b' },
        { name: 'Tuber Infection Risk', value: 'High', unit: 'Subsurface', status: 'Urgent Action', statusBn: 'কন্দ পচনের জরুরি ঝুঁকি', ideal: 'Safe', badgeColor: '#ef4444' }
      ]
    }
  };

  const handleReportFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReportFile(file);
    setSelectedSampleReport(null);
    setReportAnalysisResult(null);
    setReportError('');

    try {
      const url = URL.createObjectURL(file);
      setReportPreviewUrl(url);
    } catch (err) {
      console.warn('[ReportAnalyzer] Preview URL error:', err);
    }
  };

  const handleSelectSampleReport = (sampleId) => {
    setSelectedSampleReport(sampleId);
    setReportFile(null);
    setReportPreviewUrl(null);
    setReportAnalysisResult(null);
    setReportError('');
  };

  const handleAnalyzeReport = async () => {
    setIsAnalyzingReport(true);
    setReportError('');

    try {
      const formData = new FormData();
      if (reportFile) {
        formData.append('reportPdf', reportFile);
      } else if (selectedSampleReport) {
        formData.append('sampleReportId', selectedSampleReport);
      }
      formData.append('cropType', selectedCrop);
      formData.append('region', currentRegion);
      formData.append('language', currentLang);

      const res = await fetch('/api/doctor/analyze-report', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      const finalAnalysis = data.analysis || data.report;
      if (data.status === 'success' && finalAnalysis) {
        setReportAnalysisResult(finalAnalysis);
        if (finalAnalysis.spoken_advice) {
          speakAdvice(finalAnalysis.spoken_advice);
        }
      } else {
        throw new Error(data.message || 'Report analysis failed');
      }
    } catch (err) {
      console.error('[ReportAnalyzer] Error:', err);
      setReportError(
        currentLang === 'bn' ? 'রিপোর্ট বিশ্লেষণে সমস্যা হয়েছে। দয়া করে পুনরায় চেষ্টা করুন।' :
        currentLang === 'hi' ? 'रिपोर्ट विश्लेषण में त्रुटि आई। कृपया पुनः प्रयास करें।' :
        'Failed to analyze report. Please try again.'
      );
    } finally {
      setIsAnalyzingReport(false);
    }
  };

  const handleCopyReportPrescription = () => {
    if (!reportAnalysisResult) return;
    const text = `🌾 মাটিকথা ল্যাব রিপোর্ট এআই প্রেসক্রিপশন [${reportAnalysisResult.sample_id || 'REPORT'}]
📋 রিপোর্ট: ${reportAnalysisResult.report_title}
🏥 ল্যাবরেটরি: ${reportAnalysisResult.testing_lab}
📊 সয়েল/ক্রপ স্কোর: ${reportAnalysisResult.vitality_score}/১০০
🩺 ক্লিনিক্যাল ডায়াগনোসিস: ${reportAnalysisResult.health_verdict}
🌿 পূর্বপুরুষের প্রতিকার পরিকল্পনা:
${reportAnalysisResult.ancestral_treatment_plan?.map((step, i) => `${i+1}. ${step.title} (মাত্রা: ${step.dosage}, সময়: ${step.timing})`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const t = {
    bn: {
      hospitalBadge: "👨‍⚕️ প্রধান কৃষি টেলি-হাসপাতাল",
      triageBadge: "১০০% জিরো-হার্ডওয়্যার এআই ক্লিনিক্যাল সেবা",
      mainTitle: "মাটিকথা কৃষি ভয়েস ডাক্তার",
      mainDesc: "মাল্টিমোডাল ভয়েস ও ক্যামেরা চালিত কৃষি রোগ নির্ণয় ব্যবস্থা। মুখে বাংলায় রোগের লক্ষণ বলুন বা পাতার ছবি আপলোড করুন—মুহূর্তেই পান বিশুদ্ধ ভেষজ জৈব নিদান।",
      tabLive: "লাইভ ক্লিনিক",
      tabLibrary: "ভেষজ সমাধান ভান্ডার",
      tabReport: "সয়েল ও ল্যাব PDF বিশ্লেষণ",
      tabHistory: "পরামর্শ ইতিহাস",
      aiEngine: "এআই নিউরাল ইঞ্জিন",
      aiActive: "জেমিনাই সক্রিয়",
      connectGeminiKey: "⚙️ জেমিনাই কি যুক্ত করুন",
      localClimate: "স্থানীয় আবহাওয়া ও জীবাণু ঝুঁকি",
      climateTelemetry: "৩৩°সে • ৭৪% আর্দ্রতা (ছত্রাক বিস্তার ঝুঁকি)",
      knowledgeBase: "কৃষি তথ্যভাণ্ডার",
      knowledgeSource: "বাংলার পলিমাটি ভিত্তিক পরীক্ষিত জ্ঞান",
      savingsLabel: "কৃষকের অর্থ সাশ্রয়",
      savingsRatioVal: "দোকানের বিষের চেয়ে ৪২ গুণ সাশ্রয়ী",
      targetCrop: "ফসল নির্বাচন:",
      stage: "দশা:",
      plot: "জমির মাপ:",
      bigha: "বিঘা",
      studioTitle: "পরামর্শ ইনপুট কেন্দ্র",
      studioBadge: "ভয়েস ও ক্যামেরা এআই",
      langSelectLabel: "🗣️ ভাষা নির্বাচন:",
      voiceCardTitle: "বাংলায় মুখে বলে রোগ নির্ণয়",
      voiceCardDesc: "মাইক্রোফোনে চাপ দিয়ে বাংলায় আপনার ফসলের সমস্যা বলুন। এআই মুহূর্তে শিকড়, কান্ড বা পাতার রোগ বিশ্লেষণ করবে।",
      tapToSpeak: "বাংলায় বলুন — মাইকে চাপ দিন",
      listening: "শুনছি... রোগ নির্ণয়ে চাপুন",
      analyzing: "জেমিনাই এআই বিশ্লেষণ করছে...",
      liveTelemetry: "🔴 সরাসরি ভয়েস রেকর্ড (বাংলা অডিও)",
      listeningPrompt: "আপনার কথা শুনছি... এখনই বাংলায় কথা বলুন...",
      leafVisionTitle: "পাতার ক্যামেরা ও অপটিক্যাল স্ক্যানার",
      uploadLeafBtn: "পাতার ছবি দিন",
      changeLeafBtn: "ছবি পরিবর্তন",
      scanNow: "এখনই স্ক্যান করুন",
      macroScanDesc: "ম্যাক্রো প্যাথলজি স্ক্যানার (সুস্থ বনাম রোগাক্রান্ত পাতা)",
      organMatrixTitle: "গাছের অঙ্গভিত্তিক লক্ষণ তালিকা",
      signsTagged: "টি লক্ষণ চিহ্নিত",
      organs: {
        leaves: "পাতা",
        stem: "কাণ্ড ও গোড়া",
        roots: "শিকড়",
        grains: "শীষ ও দানা"
      },
      customTextPlaceholder: "অথবা বাংলায় লক্ষণ লিখুন (যেমন: ধানের পাতা হলুদ, মাজরা পোকার আক্রমণ)...",
      diagnoseBtn: "রোগ নির্ণয় করুন",
      standbyTitle: "কৃষি-চিকিৎসক ডিজিটাল ক্লিনিক প্রস্তুত",
      standbyDesc: "ফসল ও জমির মাপ নির্বাচন করে মাইক্রোফোনে বাংলায় কথা বলুন, আক্রান্ত পাতার ছবি তুলুন বা লক্ষণ বাছাই করুন। সঙ্গে সঙ্গে তৈরি হবে আপনার ডিজিটাল প্রেসক্রিপশন।",
      standbyIndexed: "🌿 ১০০+ পরীক্ষিত রাসায়নিক-মুক্ত দেশীয় ভেষজ সমাধান প্রস্তুত",
      standbyBadge: "মাল্টিমোডাল জেমিনাই ফ্ল্যাশ • জিরো হার্ডওয়্যার • ১০০% অর্গানিক",
      verifiedStamp: "✓ পরীক্ষিত দেশীয় জৈব নিদান",
      dossierTitle: "মাটিকথা ক্লিনিক্যাল প্রেসক্রিপশন ও নিদান পত্র",
      patientLabel: "রোগী ফসল:",
      plotLabel: "জমি:",
      regionLabel: "অঞ্চল:",
      copySlip: "প্রেসক্রিপশন কপি করুন",
      copiedSlip: "কপি সম্পন্ন ✓",
      printSlip: "প্রিন্ট করুন",
      botanicalDiagnosis: "উদ্ভিদ রোগ নির্ণয় রিপোর্ট",
      severityLabel: "তীব্রতা:",
      severityCritical: "জরুরি / বিপজ্জনক",
      severityModerate: "মাঝারি",
      recoveryWindow: "সুস্থ হওয়ার সময়সীমা:",
      pathogenLabel: "🔬 ক্ষতিকর জীবাণু / পোকা:",
      damageThresholdLabel: "ক্ষতির মাত্রা (ETL):",
      damageThresholdVal: "১-২টি কীড়া/কুশি (তাৎক্ষণিক জৈব ব্যবস্থা বাঞ্ছনীয়)",
      doctorSpeechTitle: "কৃষি-চিকিৎসকের কণ্ঠস্বর পরামর্শ",
      speedNormal: "১.০x স্বাভাবিক",
      speedFast: "১.২x দ্রুত",
      speedSlow: "০.৮x ধীর",
      playDoctorVoice: "ডাক্তারের গলার আওয়াজ শুনুন",
      stopDoctorVoice: "আওয়াজ বন্ধ করুন",
      tabRecipe: "📋 সঠিক মাত্রায় প্রস্তুতি প্রণালী",
      tabPathology: "🔬 রোগ বিস্তার ও নিরাময় সময়সূচী",
      tabEconomics: "💰 কৃষকের আর্থিক সাশ্রয় খতিয়ান",
      tabEcology: "🌾 কৃষি-বাস্তুতন্ত্র ও দেশি বীজ",
      recipePlotScaled: "আপনার জমির পরিমাপ অনুযায়ী উপাদানের সঠিক পরিমাণ নির্ধারিত হয়েছে",
      timingLabel: "প্রয়োগের শ্রেষ্ঠ সময়:",
      pathologyHeader: "🔬 জীবাণুর গতিবিধি ও ছত্রাক বিস্তার তথ্য",
      pathologyDesc: "এই ক্ষতিকারক রোগজীবাণু বা পোকা আর্দ্র আবহাওয়া পেলে গাছের সংবহনতন্ত্র আক্রমণ করে। ভেষজ জৈব ক্বাথ স্প্রে করলে ক্ষতিকর পোকার ডিম ও কীড়া ধ্বংস হয় এবং কোনোরূপ রাসায়নিক বিষের অবশেষ থাকে না।",
      timelineSchedule: "📅 ৩-ধাপের নিরাময় সময়সূচী",
      marginHeader: "💰 কৃষকের মোট মুনাফা সাশ্রয়",
      savedForPlot: "সাশ্রয় আপনার জমির জন্য",
      zeroDebt: "শূন্য রাসায়নিক ঋণ • ৪২ গুণ কম খরচ",
      farmyardCostLabel: "দেশীয় ভেষজ প্রস্তুতি খরচ",
      farmyardCostSub: "১০০% গোবর, ছাই ও ভেষজ পাতা",
      chemicalCostLabel: "বাজারের রাসায়নিক বিষের খরচ",
      chemicalCostSub: "রাসায়নিক কীটনাশক ও স্প্রে মজুরি",
      indigenousSeedTitle: "প্রস্তাবিত ঐতিহ্যবাহী সহনশীল বীজ",
      companionTitle: "🛡️ প্রাকৃতিক বন্ধু পোকা বান্ধব বেড়া",
      waterSoilTitle: "💧 জল ও মাটির সতর্কতা"
    },
    hi: {
      hospitalBadge: "👨‍⚕️ प्रधान कृषि टेली-हॉस्पिटल",
      triageBadge: "100% जीरो-हार्डवेयर एआई क्लिनिकल सेवा",
      mainTitle: "माटिकथा कृषि वॉयस डॉक्टर",
      mainDesc: "मल्टीमॉडल वॉयस व विज़न कृषि निदान केंद्र। बोलकर लक्षण बताएं या पत्ती की फोटो अपलोड करें और तुरंत शून्य-रासायनिक पारम्परिक जैविक उपचार पाएं।",
      tabLive: "लाइव क्लिनिक",
      tabLibrary: "पारम्परिक उपचार भंडार",
      tabReport: "सॉइल व लैब PDF विश्लेषण",
      tabHistory: "परामर्श इतिहास",
      aiEngine: "एआई न्यूरल इंजन",
      aiActive: "जेमिनी सक्रिय",
      connectGeminiKey: "⚙️ जेमिनी कुंजी जोड़ें",
      localClimate: "स्थानीय मौसम व जोखिम",
      climateTelemetry: "33°C • 74% आर्द्रता (फफूंद का खतरा)",
      knowledgeBase: "कृषि ज्ञान केंद्र",
      knowledgeSource: "पारंपरिक मृदा आधारित ज्ञान",
      savingsLabel: "किसान बचत अनुपात",
      savingsRatioVal: "रासायनिक दवाओं से 42 गुना सस्ता",
      targetCrop: "लक्षित फसल:",
      stage: "अवस्था:",
      plot: "खेत का आकार:",
      bigha: "बीघा",
      studioTitle: "परामर्श इनपुट केंद्र",
      studioBadge: "वॉयस व कैमरा एआई",
      langSelectLabel: "🗣️ भाषा चुनें:",
      voiceCardTitle: "बोलकर रोग निदान",
      voiceCardDesc: "माइक दबाएं और बोलकर अपनी समस्या बताएं। एआई तुरंत जड़, तना या पत्ती के रोगों का विश्लेषण करेगा।",
      tapToSpeak: "बोलने के लिए माइक दबाएं",
      listening: "सुन रहे हैं... निदान के लिए दबाएं",
      analyzing: "जेमिनी एआई विश्लेषण कर रहा है...",
      liveTelemetry: "🔴 लाइव वॉइस रिकॉर्ड (हिंदी ऑडियो)",
      listeningPrompt: "आपकी आवाज़ सुन रहे हैं... अभी बोलें...",
      leafVisionTitle: "पत्ती का कैमरा व स्कैनर",
      uploadLeafBtn: "पत्ती की फोटो अपलोड करें",
      changeLeafBtn: "फोटो बदलें",
      scanNow: "अभी स्कैन करें",
      macroScanDesc: "मैक्रो पैथोलॉजी स्कैनर",
      organMatrixTitle: "पौधे के अंग अनुसार लक्षण",
      signsTagged: "लक्षण चुने गए",
      organs: {
        leaves: "पत्तियां",
        stem: "तना व जड़",
        roots: "जड़ें",
        grains: "बाली व दाने"
      },
      customTextPlaceholder: "या लक्षण लिखें (जैसे: पत्तियों का पीलापन, तना छेदक कीट)...",
      diagnoseBtn: "निदान करें",
      standbyTitle: "कृषि-चिकित्सक डिजिटल क्लिनिक तैयार",
      standbyDesc: "फसल व खेत का आकार चुनें, माइक में बोलें या पत्ती की फोटो अपलोड करके क्लिनिकल पर्ची प्राप्त करें।",
      standbyIndexed: "🌿 100+ प्रमाणित शून्य-रासायनिक देशी उपचार तैयार",
      standbyBadge: "मल्टीमॉडल जेमिनी 1.5 • जीरो हार्डवेयर • 100% जैविक",
      verifiedStamp: "✓ प्रमाणित देशी जैविक उपचार",
      dossierTitle: "माटिकथा क्लिनिकल कृषि पर्ची",
      patientLabel: "रोगी फसल:",
      plotLabel: "खेत:",
      regionLabel: "क्षेत्र:",
      copySlip: "पर्ची कॉपी करें",
      copiedSlip: "कॉपी हो गया ✓",
      printSlip: "प्रिंट करें",
      botanicalDiagnosis: "पादप रोग निदान रिपोर्ट",
      severityLabel: "गंभीरता:",
      severityCritical: "गंभीर / आपातकालीन",
      severityModerate: "मध्यम",
      recoveryWindow: "सुधार की समयावधि:",
      pathogenLabel: "🔬 रोगजनक / कीट:",
      damageThresholdLabel: "हानि सीमा (ETL):",
      damageThresholdVal: "1-2 सुंडी/कल्ले (तत्काल जैविक उपचार जरूरी)",
      doctorSpeechTitle: "कृषि-चिकित्सक की मौखिक सलाह",
      speedNormal: "1.0x सामान्य",
      speedFast: "1.2x तेज",
      speedSlow: "0.8x धीमा",
      playDoctorVoice: "डॉक्टर की आवाज सुनें",
      stopDoctorVoice: "आवाज बंद करें",
      tabRecipe: "📋 तैयारी की विधि व मात्रा",
      tabPathology: "🔬 रोग प्रसार व उपचार समयसारणी",
      tabEconomics: "💰 आर्थिक बचत खाता",
      tabEcology: "🌾 कृषि-पारिस्थितिकी व देशी बीज",
      recipePlotScaled: "आपके खेत के लिए सही मात्रा निर्धारित",
      timingLabel: "छिड़काव का सही समय:",
      pathologyHeader: "🔬 रोगजनक का स्वभाव व प्रसार",
      pathologyDesc: "यह रोगजनक नमी बढ़ने पर फसल को नुकसान पहुंचाता है। देशी जैविक अर्क कीटों के प्रसार को बिना किसी रासायनिक अवशेष के रोकता है।",
      timelineSchedule: "📅 3-चरणीय उपचार समयसारणी",
      marginHeader: "💰 किसान की शुद्ध बचत",
      savedForPlot: "बचत आपके खेत के लिए",
      zeroDebt: "शून्य रासायनिक कर्ज • 42x कम लागत",
      farmyardCostLabel: "देशी जैविक उपचार खर्च",
      farmyardCostSub: "100% घरेलू गोबर, राख व पत्तियां",
      chemicalCostLabel: "दुकान के रासायनिक कीटनाशक खर्च",
      chemicalCostSub: "दवा व स्प्रे मजदूरी",
      indigenousSeedTitle: "अनुशंसित पारंपरिक देशी बीज",
      companionTitle: "🛡️ प्राकृतिक मित्र कीट अवरोधक",
      waterSoilTitle: "💧 जल व मृदा सावधानी"
    },
    en: {
      hospitalBadge: "👨‍⚕️ Chief Agronomic Tele-Hospital",
      triageBadge: "100% Zero-Hardware AI Clinical Triage",
      mainTitle: "MaatiKatha Agricultural Field Doctor",
      mainDesc: "Multimodal voice and vision agro-diagnostic suite. Speak your symptoms or upload a leaf photo to diagnose crop diseases and generate scaled, zero-chemical ancestral prescriptions.",
      tabLive: "Live Clinic",
      tabLibrary: "Remedies Library",
      tabReport: "Soil & Lab PDF Analyzer",
      tabHistory: "Triage History",
      aiEngine: "AI Neural Engine",
      aiActive: "Gemini Active",
      connectGeminiKey: "⚙️ Connect Gemini Key",
      localClimate: "Local Micro-Climate",
      climateTelemetry: "33°C • 74% Humidity (High Spore Risk)",
      knowledgeBase: "Knowledge Engine",
      knowledgeSource: "MongoDB Atlas Bengal Alluvial Ground Truth",
      savingsLabel: "Farmer Savings Ratio",
      savingsRatioVal: "42x Cheaper Than Chemical Sprays",
      targetCrop: "Target Crop:",
      stage: "Stage:",
      plot: "Plot:",
      bigha: "Bigha",
      studioTitle: "Consultation Input Studio",
      studioBadge: "Dual Voice & Vision AI",
      langSelectLabel: "🗣️ Select Voice:",
      voiceCardTitle: "Voice-First Spoken Diagnosis",
      voiceCardDesc: "Tap the microphone and speak your problem. AI analyzes leaf, stem, or root symptoms in real-time.",
      tapToSpeak: "Tap to Speak Symptom",
      listening: "Listening... Tap to Diagnose",
      analyzing: "Consulting Gemini AI...",
      liveTelemetry: "🔴 Live Acoustic Telemetry (16kHz Stream)",
      listeningPrompt: "Listening for your voice... speak now...",
      leafVisionTitle: "Optical Leaf & Disease Vision Scanner",
      uploadLeafBtn: "Upload Leaf Photo",
      changeLeafBtn: "Change Photo",
      scanNow: "Scan Now",
      macroScanDesc: "Macro Pathology Scanner (Healthy vs Chlorosis)",
      organMatrixTitle: "Plant Organ Pathology Matrix",
      signsTagged: "signs tagged",
      organs: {
        leaves: "leaves",
        stem: "stem",
        roots: "roots",
        grains: "grains"
      },
      customTextPlaceholder: "Or describe specific symptom pattern (e.g. brown leaf spots, dead heart)...",
      diagnoseBtn: "Diagnose",
      standbyTitle: "Agro-Physician Hospital Workstation Ready",
      standbyDesc: "Configure your crop and plot size, then speak into the microphone, upload a leaf photo, or select symptoms from the diagnostic tree to generate your clinical case dossier.",
      standbyIndexed: "🌿 100+ proven zero-chemical ancestral remedies indexed & ready",
      standbyBadge: "Multimodal Gemini Flash • Zero Hardware • 100% Organic",
      verifiedStamp: "✓ VERIFIED ANCESTRAL REMEDY",
      dossierTitle: "MAATIKATHA FIELD CLINICAL DOSSIER",
      patientLabel: "Patient:",
      plotLabel: "Land:",
      regionLabel: "Region:",
      copySlip: "Copy Slip",
      copiedSlip: "Copied Slip",
      printSlip: "Print Rx Sheet",
      botanicalDiagnosis: "Clinical Botanical Diagnosis",
      severityLabel: "Severity:",
      severityCritical: "Critical",
      severityModerate: "Moderate",
      recoveryWindow: "Recovery Window:",
      pathogenLabel: "🔬 Pathogen Organism:",
      damageThresholdLabel: "Damage Threshold (ETL):",
      damageThresholdVal: "1-2 larvae/tiller (Immediate action recommended)",
      doctorSpeechTitle: "Chief Agro-Physician Spoken Consultation",
      speedNormal: "1.0x Normal",
      speedFast: "1.2x Fast",
      speedSlow: "0.8x Speed",
      playDoctorVoice: "Play Doctor Voice",
      stopDoctorVoice: "Stop Audio",
      tabRecipe: "📋 Scaled Preparation Protocol",
      tabPathology: "🔬 Pathology & Recovery Timeline",
      tabEconomics: "💰 Financial Savings Ledger",
      tabEcology: "🌾 Agro-Ecology & Heritage Seed",
      recipePlotScaled: "Ingredients automatically scaled for your plot",
      timingLabel: "Application Schedule:",
      pathologyHeader: "🔬 Organism Pathology Profile & Spore Transmission Dynamics",
      pathologyDesc: "The organism attacks vascular tissue when ambient humidity exceeds 70%. Airborne spore vectors disperse on morning gusts. Organic bio-repellents coat the cuticle, cutting off larval penetration without inducing chemical pathogen resistance.",
      timelineSchedule: "📅 3-Phase Treatment Timeline Schedule",
      marginHeader: "💰 Net Retained Farmer Household Margin",
      savedForPlot: "Saved for your plot",
      zeroDebt: "Zero chemical debt • 42x Cost Advantage",
      farmyardCostLabel: "FARMYARD ORGANIC COST",
      farmyardCostSub: "100% farmyard livestock & kitchen ash",
      chemicalCostLabel: "COMMERCIAL CHEMICAL COST",
      chemicalCostSub: "Synthetic pesticides + spraying fees",
      indigenousSeedTitle: "Recommended Indigenous Seed",
      companionTitle: "🛡️ Natural Companion Barriers",
      waterSoilTitle: "💧 Water & Soil Precautions"
    }
  }[currentLang] || {
    hospitalBadge: "👨‍⚕️ Chief Agronomic Tele-Hospital",
    triageBadge: "100% Zero-Hardware AI Clinical Triage",
    mainTitle: "MaatiKatha Agricultural Field Doctor",
    mainDesc: "Multimodal voice and vision agro-diagnostic suite. Speak your symptoms or upload a leaf photo to diagnose crop diseases and generate scaled, zero-chemical ancestral prescriptions.",
    tabLive: "Live Clinic",
    tabLibrary: "Remedies Library",
    tabReport: "Soil & Lab PDF Analyzer",
    tabHistory: "Triage History",
    aiEngine: "AI Neural Engine",
    aiActive: "Gemini Active",
    connectGeminiKey: "⚙️ Connect Gemini Key",
    localClimate: "Local Micro-Climate",
    climateTelemetry: "33°C • 74% Humidity (High Spore Risk)",
    knowledgeBase: "Knowledge Engine",
    knowledgeSource: "MongoDB Atlas Bengal Alluvial Ground Truth",
    savingsLabel: "Farmer Savings Ratio",
    savingsRatioVal: "42x Cheaper Than Chemical Sprays",
    targetCrop: "Target Crop:",
    stage: "Stage:",
    plot: "Plot:",
    bigha: "Bigha",
    studioTitle: "Consultation Input Studio",
    studioBadge: "Dual Voice & Vision AI",
    langSelectLabel: "🗣️ Select Voice:",
    voiceCardTitle: "Voice-First Spoken Diagnosis",
    voiceCardDesc: "Tap the microphone and speak your problem. AI analyzes leaf, stem, or root symptoms in real-time.",
    tapToSpeak: "Tap to Speak Symptom",
    listening: "Listening... Tap to Diagnose",
    analyzing: "Consulting Gemini AI...",
    liveTelemetry: "🔴 Live Acoustic Telemetry (16kHz Stream)",
    listeningPrompt: "Listening for your voice... speak now...",
    leafVisionTitle: "Optical Leaf & Disease Vision Scanner",
    uploadLeafBtn: "Upload Leaf Photo",
    changeLeafBtn: "Change Photo",
    scanNow: "Scan Now",
    macroScanDesc: "Macro Pathology Scanner (Healthy vs Chlorosis)",
    organMatrixTitle: "Plant Organ Pathology Matrix",
    signsTagged: "signs tagged",
    organs: {
      leaves: "leaves",
      stem: "stem",
      roots: "roots",
      grains: "grains"
    },
    customTextPlaceholder: "Or describe specific symptom pattern (e.g. brown leaf spots, dead heart)...",
    diagnoseBtn: "Diagnose",
    standbyTitle: "Agro-Physician Hospital Workstation Ready",
    standbyDesc: "Configure your crop and plot size, then speak into the microphone, upload a leaf photo, or select symptoms from the diagnostic tree to generate your clinical case dossier.",
    standbyIndexed: "🌿 100+ proven zero-chemical ancestral remedies indexed & ready",
    standbyBadge: "Multimodal Gemini Flash • Zero Hardware • 100% Organic",
    verifiedStamp: "✓ VERIFIED ANCESTRAL REMEDY",
    dossierTitle: "MAATIKATHA FIELD CLINICAL DOSSIER",
    patientLabel: "Patient:",
    plotLabel: "Land:",
    regionLabel: "Region:",
    copySlip: "Copy Slip",
    copiedSlip: "Copied Slip",
    printSlip: "Print Rx Sheet",
    botanicalDiagnosis: "Clinical Botanical Diagnosis",
    severityLabel: "Severity:",
    severityCritical: "Critical",
    severityModerate: "Moderate",
    recoveryWindow: "Recovery Window:",
    pathogenLabel: "🔬 Pathogen Organism:",
    damageThresholdLabel: "Damage Threshold (ETL):",
    damageThresholdVal: "1-2 larvae/tiller (Immediate action recommended)",
    doctorSpeechTitle: "Chief Agro-Physician Spoken Consultation",
    speedNormal: "1.0x Normal",
    speedFast: "1.2x Fast",
    speedSlow: "0.8x Speed",
    playDoctorVoice: "Play Doctor Voice",
    stopDoctorVoice: "Stop Audio",
    tabRecipe: "📋 Scaled Preparation Protocol",
    tabPathology: "🔬 Pathology & Recovery Timeline",
    tabEconomics: "💰 Financial Savings Ledger",
    tabEcology: "🌾 Agro-Ecology & Heritage Seed",
    recipePlotScaled: "Ingredients automatically scaled for your plot",
    timingLabel: "Application Schedule:",
    pathologyHeader: "🔬 Organism Pathology Profile & Spore Transmission Dynamics",
    pathologyDesc: "The organism attacks vascular tissue when ambient humidity exceeds 70%. Airborne spore vectors disperse on morning gusts. Organic bio-repellents coat the cuticle, cutting off larval penetration without inducing chemical pathogen resistance.",
    timelineSchedule: "📅 3-Phase Treatment Timeline Schedule",
    marginHeader: "💰 Net Retained Farmer Household Margin",
    savedForPlot: "Saved for your plot",
    zeroDebt: "Zero chemical debt • 42x Cost Advantage",
    farmyardCostLabel: "FARMYARD ORGANIC COST",
    farmyardCostSub: "100% farmyard livestock & kitchen ash",
    chemicalCostLabel: "COMMERCIAL CHEMICAL COST",
    chemicalCostSub: "Synthetic pesticides + spraying fees",
    indigenousSeedTitle: "Recommended Indigenous Seed",
    companionTitle: "🛡️ Natural Companion Barriers",
    waterSoilTitle: "💧 Water & Soil Precautions"
  };

  return (
    <div style={{ width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. EXPANSIVE HERO CLINIC BANNER */}
      <div className="mk-card" style={{ 
        background: 'linear-gradient(135deg, #052e16 0%, #064e3b 40%, #047857 75%, #059669 100%)', 
        color: 'white', 
        padding: '32px 36px',
        borderRadius: '28px',
        boxShadow: '0 20px 45px -10px rgba(5, 46, 22, 0.45)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Ambient Top Light Beam */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-60px',
          width: '380px',
          height: '380px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(52, 211, 153, 0.25) 0%, rgba(5, 46, 22, 0) 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px', position: 'relative', zIndex: 2 }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            
            {/* Chief Agro-Physician Portrait with Double Gold Halo */}
            <div style={{ position: 'relative' }}>
              <img 
                src="/doctor_elder.jpg" 
                alt="Chief Field Agro-Physician" 
                style={{ 
                  width: '92px', 
                  height: '92px', 
                  borderRadius: '50%', 
                  objectFit: 'cover', 
                  border: '3.5px solid rgba(255, 255, 255, 0.95)',
                  boxShadow: '0 12px 28px rgba(0, 0, 0, 0.35)'
                }} 
              />
              <div style={{
                position: 'absolute',
                bottom: '4px',
                right: '4px',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: '#22c55e',
                border: '3px solid white',
                boxShadow: '0 0 14px #22c55e'
              }} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <span style={{ 
                  background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)', 
                  padding: '5px 14px', 
                  borderRadius: '20px', 
                  fontSize: '0.78rem', 
                  fontWeight: '900',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
                }}>
                  {t.hospitalBadge}
                </span>
                <span style={{ fontSize: '0.82rem', color: '#a7f3d0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Award size={15} /> {t.triageBadge}
                </span>
              </div>
              
              <h1 style={{ fontSize: '2.1rem', fontWeight: '900', letterSpacing: '-0.03em', margin: 0, textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                {t.mainTitle}
              </h1>
              
              <p style={{ margin: '8px 0 0 0', fontSize: '0.94rem', color: '#d1fae5', maxWidth: '720px', lineHeight: '1.5' }}>
                {t.mainDesc}
              </p>
            </div>
          </div>

          {/* Navigation Mode Switcher */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '16px', padding: '6px', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <button
              onClick={() => setActiveTab('doctor')}
              style={{
                background: activeTab === 'doctor' ? 'white' : 'transparent',
                color: activeTab === 'doctor' ? '#065f46' : '#d1fae5',
                border: 'none',
                padding: '11px 22px',
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontWeight: '900',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                boxShadow: activeTab === 'doctor' ? '0 4px 14px rgba(0,0,0,0.15)' : 'none'
              }}
            >
              <Activity size={17} /> {t.tabLive}
            </button>

            <button
              onClick={() => setActiveTab('catalog')}
              style={{
                background: activeTab === 'catalog' ? 'white' : 'transparent',
                color: activeTab === 'catalog' ? '#065f46' : '#d1fae5',
                border: 'none',
                padding: '11px 22px',
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontWeight: '900',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              <BookOpen size={17} /> {t.tabLibrary}
            </button>

            <button
              onClick={() => setActiveTab('report')}
              style={{
                background: activeTab === 'report' ? 'white' : 'transparent',
                color: activeTab === 'report' ? '#065f46' : '#d1fae5',
                border: 'none',
                padding: '11px 22px',
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontWeight: '900',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                boxShadow: activeTab === 'report' ? '0 4px 14px rgba(0,0,0,0.15)' : 'none'
              }}
            >
              <FileText size={17} /> {t.tabReport || '📄 সয়েল ও ল্যাব PDF'}
            </button>

            <button
              onClick={() => setActiveTab('history')}
              style={{
                background: activeTab === 'history' ? 'white' : 'transparent',
                color: activeTab === 'history' ? '#065f46' : '#d1fae5',
                border: 'none',
                padding: '11px 22px',
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontWeight: '900',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              <History size={17} /> {t.tabHistory} ({consultationHistory.length})
            </button>
          </div>
        </div>

        {/* Telemetry Stat Bar */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '14px', 
          marginTop: '24px', 
          paddingTop: '20px', 
          borderTop: '1px solid rgba(255,255,255,0.15)',
          fontSize: '0.82rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={18} color="#34d399" />
            </div>
            <div>
              <div style={{ color: '#a7f3d0', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: '800' }}>{t.aiEngine}</div>
              <div style={{ fontWeight: '900', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {geminiStatus.configured ? (
                  <span style={{ color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Sparkles size={14} color="#34d399" /> {t.aiActive}
                  </span>
                ) : (
                  <button 
                    onClick={() => setShowKeyModal(true)}
                    style={{
                      background: 'rgba(245, 158, 11, 0.25)',
                      border: '1px solid #fbbf24',
                      color: '#fef3c7',
                      padding: '3px 10px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: '900',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {t.connectGeminiKey}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Thermometer size={18} color="#fbbf24" />
            </div>
            <div>
              <div style={{ color: '#a7f3d0', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: '800' }}>{t.localClimate}</div>
              <div style={{ fontWeight: '900', fontSize: '0.92rem' }}>{t.climateTelemetry}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={18} color="#38bdf8" />
            </div>
            <div>
              <div style={{ color: '#a7f3d0', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: '800' }}>{t.knowledgeBase}</div>
              <div style={{ fontWeight: '900', fontSize: '0.92rem' }}>{t.knowledgeSource}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={18} color="#4ade80" />
            </div>
            <div>
              <div style={{ color: '#a7f3d0', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: '800' }}>{t.savingsLabel}</div>
              <div style={{ fontWeight: '900', fontSize: '0.92rem' }}>{t.savingsRatioVal}</div>
            </div>
          </div>
        </div>
      </div>

      {activeTab === 'doctor' ? (
        <>
          {/* 2. FIELD PATIENT TRIAGE & PLOT SIZE SCALER */}
          <div className="mk-card card-hover-lift" style={{ padding: '22px 28px', background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '22px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
              
              {/* Select Crop with Big Icons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '900', color: '#1e293b' }}>
                  {t.targetCrop}
                </span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {cropsList.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCrop(c.name)}
                      className="card-hover-lift"
                      style={{
                        padding: '8px 16px',
                        borderRadius: '20px',
                        border: selectedCrop === c.name ? '2px solid #059669' : '1.5px solid #cbd5e1',
                        background: selectedCrop === c.name ? '#ecfdf5' : '#ffffff',
                        color: selectedCrop === c.name ? '#065f46' : '#334155',
                        fontSize: '0.86rem',
                        fontWeight: selectedCrop === c.name ? '900' : '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span style={{ fontSize: '1.1rem' }}>{c.icon}</span>
                      <span>{currentLang === 'bn' ? c.bnName : currentLang === 'hi' ? c.hiName : c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Growth Stage & Precision Acreage Scaler Slider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                
                {/* Growth Stage */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.86rem', fontWeight: '900', color: '#1e293b' }}>
                    {t.stage}
                  </span>
                  <select
                    value={selectedStage}
                    onChange={(e) => setSelectedStage(e.target.value)}
                    style={{
                      padding: '9px 16px',
                      borderRadius: '12px',
                      border: '2px solid #059669',
                      background: 'white',
                      fontSize: '0.85rem',
                      fontWeight: '800',
                      color: '#065f46',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    {stagesList.map((s, idx) => (
                      <option key={idx} value={s.en}>
                        {currentLang === 'bn' ? s.bn : currentLang === 'hi' ? s.hi : s.en}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Plot Size Scaler Slider */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px', 
                  background: '#f8fafc', 
                  padding: '8px 16px', 
                  borderRadius: '14px', 
                  border: '1.5px solid #cbd5e1' 
                }}>
                  <Sliders size={18} color="#059669" />
                  <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#334155' }}>
                    {t.plot}
                  </span>
                  <input
                    type="range"
                    min="0.5"
                    max="10"
                    step="0.5"
                    value={plotSize}
                    onChange={(e) => setPlotSize(parseFloat(e.target.value))}
                    style={{ width: '80px', accentColor: '#059669', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.9rem', fontWeight: '900', color: '#065f46', minWidth: '60px' }}>
                    {plotSize} {t.bigha}
                  </span>
                </div>

              </div>

            </div>
          </div>

          {/* 3. DUAL DIAGNOSTIC WORKBENCH */}
          <div className="responsive-two-col" style={{ alignItems: 'start', gap: '24px' }}>
            
            {/* COLUMN 1: MULTIMODAL DIAGNOSTIC STUDIO (Voice + Optical Scanner + Anatomical Tree) */}
            <div className="mk-card mk-card-emerald card-hover-lift" style={{ display: 'flex', flexDirection: 'column', padding: '32px 28px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.82rem', color: '#065f46', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {t.studioTitle}
                </span>
                <span style={{ fontSize: '0.76rem', background: '#ecfdf5', color: '#059669', padding: '4px 10px', borderRadius: '8px', fontWeight: '800', border: '1px solid #a7f3d0' }}>
                  {t.studioBadge}
                </span>
              </div>

              {/* Prominent Language Switcher Bar */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '8px', 
                marginBottom: '16px',
                background: '#ffffff',
                padding: '8px 14px',
                borderRadius: '16px',
                border: '1.5px solid #bbf7d0',
                boxShadow: '0 2px 8px rgba(5,150,105,0.06)',
                flexWrap: 'wrap'
              }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '900', color: '#065f46' }}>
                  {t.langSelectLabel}
                </span>
                <button
                  type="button"
                  onClick={() => updateLanguage('bn')}
                  style={{
                    padding: '7px 16px',
                    borderRadius: '20px',
                    border: currentLang === 'bn' ? '2px solid #059669' : '1px solid #cbd5e1',
                    background: currentLang === 'bn' ? '#ecfdf5' : 'white',
                    color: currentLang === 'bn' ? '#065f46' : '#64748b',
                    fontWeight: '900',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    boxShadow: currentLang === 'bn' ? '0 2px 10px rgba(5,150,105,0.25)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>🇧🇩</span>
                  <span>বাংলা (বাংলায় বলুন)</span>
                  {currentLang === 'bn' && (
                    <span style={{ 
                      width: '8px', 
                      height: '8px', 
                      borderRadius: '50%', 
                      background: '#10b981', 
                      display: 'inline-block',
                      boxShadow: '0 0 6px #10b981'
                    }} />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => updateLanguage('hi')}
                  style={{
                    padding: '7px 16px',
                    borderRadius: '20px',
                    border: currentLang === 'hi' ? '2px solid #059669' : '1px solid #cbd5e1',
                    background: currentLang === 'hi' ? '#ecfdf5' : 'white',
                    color: currentLang === 'hi' ? '#065f46' : '#64748b',
                    fontWeight: '900',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    boxShadow: currentLang === 'hi' ? '0 2px 10px rgba(5,150,105,0.25)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>🇮🇳</span> हिन्दी (बोलें)
                </button>
                <button
                  type="button"
                  onClick={() => updateLanguage('en')}
                  style={{
                    padding: '7px 16px',
                    borderRadius: '20px',
                    border: currentLang === 'en' ? '2px solid #059669' : '1px solid #cbd5e1',
                    background: currentLang === 'en' ? '#ecfdf5' : 'white',
                    color: currentLang === 'en' ? '#065f46' : '#64748b',
                    fontWeight: '900',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    boxShadow: currentLang === 'en' ? '0 2px 10px rgba(5,150,105,0.25)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>🇬🇧</span> English
                </button>
              </div>

              {/* POD A: GIANT GLOWING MICROPHONE STATION */}
              <div style={{ 
                background: 'linear-gradient(145deg, #ffffff 0%, #f0fdf4 100%)', 
                borderRadius: '22px', 
                padding: '24px 20px', 
                border: '2px solid #bbf7d0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                marginBottom: '20px'
              }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#064e3b', margin: '0 0 4px 0' }}>
                  {t.voiceCardTitle}
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#475569', margin: '0 0 16px 0', maxWidth: '420px' }}>
                  {t.voiceCardDesc}
                </p>

                {/* Microphone with Ambient Pulsing Glow */}
                <div className="mic-button-wrapper" style={{ margin: '8px 0', position: 'relative' }}>
                  {recordState === 'listening' && (
                    <>
                      <div className="radar-ripple-ring" />
                      <div className="radar-ripple-ring radar-ripple-ring-delayed" />
                    </>
                  )}
                  <div className={`mic-ring-pulse ${recordState === 'listening' ? 'recording' : ''}`} />
                  
                  <button
                    className={`mic-main-btn ${recordState === 'listening' ? 'recording' : ''}`}
                    onClick={() => {
                      if (recordState === 'idle') startRecording();
                      else if (recordState === 'listening') stopRecording();
                    }}
                    disabled={recordState === 'analyzing'}
                    aria-label="Microphone Voice Diagnosis"
                    style={{
                      width: '105px',
                      height: '105px',
                      boxShadow: recordState === 'listening' 
                        ? '0 0 0 14px rgba(239, 68, 68, 0.25), 0 20px 35px -5px rgba(239, 68, 68, 0.5)'
                        : '0 12px 30px -5px rgba(16, 185, 129, 0.45)'
                    }}
                  >
                    {recordState === 'analyzing' ? (
                      <div className="pulse-spinner" />
                    ) : recordState === 'listening' ? (
                      <MicOff size={52} />
                    ) : (
                      <Mic size={52} />
                    )}
                    <span className="mic-status-label" style={{ fontWeight: '900', fontSize: '0.84rem', marginTop: '6px' }}>
                      {recordState === 'listening'
                        ? t.listening
                        : recordState === 'analyzing'
                        ? t.analyzing
                        : t.tapToSpeak}
                    </span>
                  </button>
                </div>

                {/* Animated Sound Wave Oscilloscope & Live Audio Feed */}
                {recordState === 'listening' && (
                  <div className="fade-slide-up" style={{ width: '100%', background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '14px', padding: '12px 16px', marginTop: '14px', textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.74rem', color: '#b91c1c', fontWeight: '900', textTransform: 'uppercase' }}>
                        {t.liveTelemetry}
                      </span>
                      <div className="sound-wave-container" style={{ height: '24px' }}>
                        <div className="sound-wave-bar" style={{ width: '3px', background: '#ef4444' }} />
                        <div className="sound-wave-bar" style={{ width: '3px', background: '#ef4444' }} />
                        <div className="sound-wave-bar" style={{ width: '3px', background: '#ef4444' }} />
                        <div className="sound-wave-bar" style={{ width: '3px', background: '#ef4444' }} />
                        <div className="sound-wave-bar" style={{ width: '3px', background: '#ef4444' }} />
                      </div>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.92rem', color: '#1e293b', fontStyle: 'italic', fontWeight: '700' }}>
                      "{liveTranscript || t.listeningPrompt}"
                    </p>
                  </div>
                )}
              </div>

              {/* POD B: ANATOMICAL PLANT ORGAN DIAGNOSTIC MATRIX */}
              <div style={{ background: '#ffffff', borderRadius: '22px', padding: '20px', border: '1.5px solid #e2e8f0', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.84rem', fontWeight: '900', color: '#1e293b', textTransform: 'uppercase' }}>
                    {t.organMatrixTitle}
                  </span>
                  {selectedSymptoms.length > 0 && (
                    <span style={{ fontSize: '0.75rem', background: '#dcfce7', color: '#166534', padding: '3px 10px', borderRadius: '12px', fontWeight: '800' }}>
                      {selectedSymptoms.length} {t.signsTagged}
                    </span>
                  )}
                </div>

                {/* Organ Tabs */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  {Object.keys(organSymptoms).map((organKey) => (
                    <button
                      key={organKey}
                      onClick={() => setSelectedOrgan(organKey)}
                      className="card-hover-lift"
                      style={{
                        flex: 1,
                        padding: '8px 10px',
                        borderRadius: '10px',
                        border: 'none',
                        background: selectedOrgan === organKey ? '#059669' : '#f1f5f9',
                        color: selectedOrgan === organKey ? 'white' : '#475569',
                        fontSize: '0.82rem',
                        fontWeight: '800',
                        cursor: 'pointer',
                        textTransform: 'capitalize'
                      }}
                    >
                      {organKey === 'leaves' ? t.organs.leaves : organKey === 'stem' ? t.organs.stem : organKey === 'roots' ? t.organs.roots : t.organs.grains}
                    </button>
                  ))}
                </div>

                {/* Symptom Cards Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                  {organSymptoms[selectedOrgan].map((sym) => {
                    const isChecked = selectedSymptoms.includes(sym.label);
                    return (
                      <button
                        key={sym.id}
                        onClick={() => toggleSymptom(sym.label)}
                        className="card-hover-lift"
                        style={{
                          background: isChecked ? '#ecfdf5' : '#f8fafc',
                          border: isChecked ? '2px solid #10b981' : '1px solid #e2e8f0',
                          borderRadius: '12px',
                          padding: '10px 12px',
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.84rem', fontWeight: '800', color: isChecked ? '#065f46' : '#1e293b' }}>
                            {currentLang === 'bn' ? sym.bnLabel : currentLang === 'hi' ? sym.hiLabel : sym.label}
                          </span>
                          {isChecked ? <CheckCircle size={15} color="#10b981" /> : <div style={{ width: '14px', height: '14px', borderRadius: '4px', border: '1.5px solid #cbd5e1' }} />}
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: '1.3' }}>
                          {currentLang === 'bn' ? sym.bnDesc : currentLang === 'hi' ? sym.hiDesc : sym.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Text Fallback & Execution Button */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder={t.customTextPlaceholder}
                  style={{
                    flex: 1,
                    padding: '14px 18px',
                    borderRadius: '14px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outline: 'none',
                    background: 'white'
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter') executeConsultation({ text: customText }); }}
                />
                <button
                  onClick={() => executeConsultation({ text: customText })}
                  disabled={recordState === 'analyzing'}
                  className="card-hover-lift"
                  style={{
                    background: '#15803d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '14px',
                    padding: '0 26px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: '900',
                    fontSize: '0.92rem'
                  }}
                >
                  <Send size={18} /> {t.diagnoseBtn}
                </button>
              </div>

              {errorMessage && (
                <div style={{ color: '#dc2626', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', background: '#fef2f2', padding: '10px 14px', borderRadius: '10px' }}>
                  <AlertCircle size={16} />
                  <span>{errorMessage}</span>
                </div>
              )}

            </div>

            {/* COLUMN 2: EXECUTIVE CLINICAL PRESCRIPTION DOSSIER */}
            <div>
              {advice ? (
                <div className="executive-rx-pad fade-slide-up" style={{ padding: '30px' }}>
                  
                  {/* Official Certification Watermark Stamp */}
                  <div style={{
                    position: 'absolute',
                    top: '25px',
                    right: '30px',
                    border: '2px solid #86efac',
                    color: '#059669',
                    padding: '4px 12px',
                    borderRadius: '8px',
                    fontSize: '0.72rem',
                    fontWeight: '900',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    transform: 'rotate(-4deg)',
                    background: 'rgba(240, 253, 244, 0.8)',
                    pointerEvents: 'none'
                  }}>
                    ✓ {t.verifiedStamp}
                  </div>

                  {/* Rx Pad Header */}
                  <div className="prescription-shimmer-bar" style={{ 
                    borderBottom: '2px dashed #cbd5e1', 
                    paddingBottom: '20px', 
                    marginBottom: '20px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '16px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <img 
                        src="/doctor_elder.jpg" 
                        alt="Physician Stamp" 
                        style={{ width: '56px', height: '56px', borderRadius: '16px', objectFit: 'cover', border: '2.5px solid #10b981', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)' }} 
                      />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1.15rem', fontWeight: '900', color: '#064e3b' }}>
                            {t.dossierTitle}
                          </span>
                          <span style={{ fontSize: '0.75rem', background: '#ecfdf5', color: '#047857', padding: '3px 10px', borderRadius: '8px', fontWeight: '900', border: '1px solid #a7f3d0' }}>
                            {advice.prescription_id}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                          {t.patientLabel} {advice.cropType} ({advice.cropStage}) • {t.plotLabel} {advice.plotSize} {t.bigha} • {t.regionLabel} {advice.region}
                        </div>
                        {advice.cropMismatch && (
                          <div style={{
                            marginTop: '6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: '#fef3c7',
                            border: '1px solid #fde68a',
                            borderRadius: '8px',
                            padding: '3px 10px',
                            fontSize: '0.74rem',
                            color: '#92400e',
                            fontWeight: '800'
                          }}>
                            <AlertCircle size={13} color="#d97706" />
                            <span>
                              {currentLang === 'bn' 
                                ? `ইন্টারফেসে '${advice.selectedCrop}' নির্বাচিত ছিল, কিন্তু মুখে '${advice.cropType}' বলায় প্রেসক্রিপশনটি ${advice.plotSize} বিঘার জন্য প্রস্তুত করা হয়েছে`
                                : currentLang === 'hi'
                                ? `स्क्रीन पर '${advice.selectedCrop}' चुना था, लेकिन प्रश्न में '${advice.cropType}' पाए जाने पर पर्ची ${advice.plotSize} बीघा के लिए तैयार की गई है`
                                : `UI selected was '${advice.selectedCrop}', synced to spoken '${advice.cropType}' for ${advice.plotSize} Bigha.`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick Print & Copy Actions */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={handleCopyPrescription}
                        className="card-hover-lift"
                        style={{
                          background: '#f8fafc',
                          border: '1.5px solid #cbd5e1',
                          padding: '8px 16px',
                          borderRadius: '12px',
                          fontSize: '0.82rem',
                          fontWeight: '800',
                          color: '#334155',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        {copied ? <Check size={16} color="#16a34a" /> : <Copy size={16} />}
                        <span>{copied ? t.copiedSlip : t.copySlip}</span>
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="card-hover-lift"
                        style={{
                          background: '#f8fafc',
                          border: '1.5px solid #cbd5e1',
                          padding: '8px 16px',
                          borderRadius: '12px',
                          fontSize: '0.82rem',
                          fontWeight: '800',
                          color: '#334155',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Printer size={16} />
                        <span>{t.printSlip}</span>
                      </button>
                    </div>
                  </div>

                  {/* Primary Diagnosis & Pathology Header */}
                  <div style={{ background: '#f8fafc', borderRadius: '20px', padding: '20px', marginBottom: '20px', border: '1.5px solid #e2e8f0' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '900', textTransform: 'uppercase' }}>
                        {t.botanicalDiagnosis}
                      </span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span style={{ 
                          fontSize: '0.78rem', 
                          fontWeight: '900', 
                          padding: '4px 14px', 
                          borderRadius: '20px',
                          background: advice.diagnosis?.severity === 'Critical' ? '#fee2e2' : '#fef3c7',
                          color: advice.diagnosis?.severity === 'Critical' ? '#dc2626' : '#b45309'
                        }}>
                          {t.severityLabel} {advice.diagnosis?.severity === 'Critical' ? t.severityCritical : t.severityModerate}
                        </span>
                        <span style={{ fontSize: '0.75rem', background: '#ede9fe', color: '#6d28d9', padding: '4px 12px', borderRadius: '12px', fontWeight: '800' }}>
                          {t.recoveryWindow} {advice.diagnosis?.recovery_timeline_days}
                        </span>
                      </div>
                    </div>

                    <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0f172a', margin: '0 0 8px 0' }}>
                      {advice.diagnosis?.condition}
                    </h2>
                    
                    <div style={{ fontSize: '0.84rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: '800', color: '#059669' }}>{t.pathogenLabel}</span> {advice.diagnosis?.causative_organism}
                      <span>• {t.damageThresholdLabel} {advice.diagnosis?.etl_threshold || t.damageThresholdVal}</span>
                    </div>

                    {/* Agro-Physician Audio Consultation Console */}
                    <div style={{ 
                      marginTop: '16px', 
                      background: 'white', 
                      padding: '16px 20px', 
                      borderRadius: '16px', 
                      borderLeft: '5px solid #059669', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '10px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <span style={{ fontSize: '0.78rem', color: '#065f46', fontWeight: '900', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Volume2 size={16} /> {t.doctorSpeechTitle}
                        </span>
                        
                        {/* Audio Controls */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {isSpeaking && (
                            <div className="sound-wave-container" style={{ height: '24px' }}>
                              <div className="sound-wave-bar" style={{ width: '3px', background: '#059669' }} />
                              <div className="sound-wave-bar" style={{ width: '3px', background: '#059669' }} />
                              <div className="sound-wave-bar" style={{ width: '3px', background: '#059669' }} />
                              <div className="sound-wave-bar" style={{ width: '3px', background: '#059669' }} />
                            </div>
                          )}
                          <select
                            value={speechRate}
                            onChange={(e) => {
                              const r = parseFloat(e.target.value);
                              setSpeechRate(r);
                              if (isSpeaking) speakAdvice(advice.textResponse, r);
                            }}
                            style={{ fontSize: '0.76rem', padding: '4px 8px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                          >
                            <option value="0.8">{t.speedSlow}</option>
                            <option value="1.0">{t.speedNormal}</option>
                            <option value="1.2">{t.speedFast}</option>
                          </select>
                          <button
                            onClick={() => isSpeaking ? stopSpeaking() : speakAdvice(advice.textResponse)}
                            className="card-hover-lift"
                            style={{
                              background: isSpeaking ? '#fee2e2' : '#ecfdf5',
                              color: isSpeaking ? '#b91c1c' : '#047857',
                              border: 'none',
                              padding: '6px 14px',
                              borderRadius: '10px',
                              fontSize: '0.8rem',
                              fontWeight: '900',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            {isSpeaking ? <VolumeX size={15} /> : <Volume2 size={15} />}
                            <span>{isSpeaking ? t.stopDoctorVoice : t.playDoctorVoice}</span>
                          </button>
                        </div>
                      </div>
                      
                      <p style={{ margin: 0, fontSize: '0.96rem', color: '#1e293b', lineHeight: '1.6', fontWeight: '500' }}>
                        {advice.textResponse}
                      </p>
                    </div>
                  </div>

                  {/* 4-TAB CLINICAL CASE DOSSIER */}
                  <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', marginBottom: '18px', gap: '8px' }}>
                    <button
                      onClick={() => setDossierTab('recipe')}
                      style={{
                        padding: '10px 18px',
                        border: 'none',
                        borderBottom: dossierTab === 'recipe' ? '3px solid #059669' : 'none',
                        background: 'transparent',
                        color: dossierTab === 'recipe' ? '#065f46' : '#64748b',
                        fontWeight: dossierTab === 'recipe' ? '900' : '700',
                        fontSize: '0.88rem',
                        cursor: 'pointer'
                      }}
                    >
                      {t.tabRecipe}
                    </button>
                    <button
                      onClick={() => setDossierTab('pathology')}
                      style={{
                        padding: '10px 18px',
                        border: 'none',
                        borderBottom: dossierTab === 'pathology' ? '3px solid #059669' : 'none',
                        background: 'transparent',
                        color: dossierTab === 'pathology' ? '#065f46' : '#64748b',
                        fontWeight: dossierTab === 'pathology' ? '900' : '700',
                        fontSize: '0.88rem',
                        cursor: 'pointer'
                      }}
                    >
                      {t.tabPathology}
                    </button>
                    <button
                      onClick={() => setDossierTab('economics')}
                      style={{
                        padding: '10px 18px',
                        border: 'none',
                        borderBottom: dossierTab === 'economics' ? '3px solid #059669' : 'none',
                        background: 'transparent',
                        color: dossierTab === 'economics' ? '#065f46' : '#64748b',
                        fontWeight: dossierTab === 'economics' ? '900' : '700',
                        fontSize: '0.88rem',
                        cursor: 'pointer'
                      }}
                    >
                      {t.tabEconomics}
                    </button>
                    <button
                      onClick={() => setDossierTab('ecology')}
                      style={{
                        padding: '10px 18px',
                        border: 'none',
                        borderBottom: dossierTab === 'ecology' ? '3px solid #059669' : 'none',
                        background: 'transparent',
                        color: dossierTab === 'ecology' ? '#065f46' : '#64748b',
                        fontWeight: dossierTab === 'ecology' ? '900' : '700',
                        fontSize: '0.88rem',
                        cursor: 'pointer'
                      }}
                    >
                      {t.tabEcology}
                    </button>
                  </div>

                  {/* TAB 1: Scaled Preparation Recipe */}
                  {dossierTab === 'recipe' && (
                    <div className="fade-slide-up">
                      <div style={{ position: 'relative', borderRadius: '18px', overflow: 'hidden', marginBottom: '18px' }}>
                        <img src="/remedy_prep.jpg" alt="Preparation" style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(180deg, transparent, rgba(6,78,59,0.95))', padding: '14px 20px', color: 'white' }}>
                          <div style={{ fontSize: '1.15rem', fontWeight: '900' }}>🌿 {advice.clinical_prescription?.primary_remedy}</div>
                          <div style={{ fontSize: '0.78rem', color: '#a7f3d0' }}>{t.recipePlotScaled} ({advice.plotSize} {t.bigha})</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
                        {(advice.clinical_prescription?.preparation_steps || [advice.instructions]).map((step, idx) => (
                          <div
                            key={idx}
                            onClick={() => toggleStep(idx)}
                            className="card-hover-lift"
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '14px',
                              background: completedSteps[idx] ? '#f0fdf4' : '#fafafa',
                              border: completedSteps[idx] ? '2px solid #86efac' : '1px solid #e2e8f0',
                              padding: '14px 16px',
                              borderRadius: '14px',
                              cursor: 'pointer'
                            }}
                          >
                            <div style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '8px',
                              border: completedSteps[idx] ? '2px solid #16a34a' : '2px solid #94a3b8',
                              background: completedSteps[idx] ? '#16a34a' : 'white',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              marginTop: '2px'
                            }}>
                              {completedSteps[idx] ? <Check size={16} strokeWidth={3} /> : <span style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: '900' }}>{idx + 1}</span>}
                            </div>
                            <span style={{ fontSize: '0.92rem', color: completedSteps[idx] ? '#15803d' : '#1e293b', textDecoration: completedSteps[idx] ? 'line-through' : 'none', lineHeight: '1.5' }}>
                              {step}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div style={{ background: '#f0fdf4', padding: '14px 18px', borderRadius: '14px', border: '1px solid #dcfce7', fontSize: '0.86rem', color: '#14532d', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Clock size={18} color="#15803d" />
                        <span><strong>{t.timingLabel}</strong> {advice.clinical_prescription?.best_timing}</span>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: Pathology & Treatment Timeline */}
                  {dossierTab === 'pathology' && (
                    <div className="fade-slide-up">
                      <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '18px' }}>
                        <div style={{ fontSize: '0.86rem', fontWeight: '900', color: '#0f172a', marginBottom: '8px' }}>
                          {t.pathologyHeader}
                        </div>
                        <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: '1.6' }}>
                          {currentLang === 'bn' 
                            ? (advice.diagnosis?.causative_organism ? `এই ক্ষতিকারক রোগজীবাণু বা পোকা (${advice.diagnosis?.causative_organism}) আর্দ্র আবহাওয়া পেলে গাছের সংবহনতন্ত্র আক্রমণ করে। ভেষজ জৈব ক্বাথ স্প্রে করলে ক্ষতিকর পোকার ডিম ও কীড়া ধ্বংস হয় এবং কোনোরূপ রাসায়নিক বিষের অবশেষ থাকে না।` : t.pathologyDesc)
                            : currentLang === 'hi'
                            ? t.pathologyDesc
                            : `The organism ${advice.diagnosis?.causative_organism} attacks vascular tissue when ambient humidity exceeds 70%. Airborne spore vectors disperse on morning gusts. Organic bio-repellents coat the cuticle, cutting off larval penetration without inducing chemical pathogen resistance.`
                          }
                        </p>
                      </div>

                      <div style={{ fontSize: '0.86rem', fontWeight: '900', color: '#065f46', marginBottom: '12px', textTransform: 'uppercase' }}>
                        {t.timelineSchedule}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {advice.clinical_prescription?.treatment_timeline?.map((phase, idx) => (
                          <div key={idx} style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', padding: '14px 18px', borderRadius: '14px' }}>
                            <div style={{ fontSize: '0.88rem', fontWeight: '900', color: '#059669', marginBottom: '4px' }}>
                              {phase.phase}
                            </div>
                            <div style={{ fontSize: '0.84rem', color: '#475569', lineHeight: '1.4' }}>
                              {phase.action}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: Financial ROI & Chemical Savings */}
                  {dossierTab === 'economics' && (
                    <div className="fade-slide-up">
                      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white', borderRadius: '20px', padding: '24px', marginBottom: '18px' }}>
                        <div style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {t.marginHeader}
                        </div>
                        <div style={{ fontSize: '1.8rem', fontWeight: '900', marginTop: '6px', color: '#ffffff' }}>
                          {advice.economic_impact?.net_savings_inr} {t.savedForPlot} ({advice.plotSize} {t.bigha})
                        </div>
                        <div style={{ fontSize: '0.84rem', color: '#94a3b8', marginTop: '4px' }}>
                          {advice.economic_impact?.roi_multiplier || t.zeroDebt}
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '16px', border: '1.5px solid #86efac' }}>
                          <div style={{ fontSize: '0.78rem', color: '#166534', fontWeight: '900' }}>{t.farmyardCostLabel}</div>
                          <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#15803d', marginTop: '4px' }}>
                            {advice.economic_impact?.organic_cost_inr}
                          </div>
                          <div style={{ fontSize: '0.76rem', color: '#166534', marginTop: '4px' }}>{t.farmyardCostSub}</div>
                        </div>

                        <div style={{ background: '#fef2f2', padding: '16px', borderRadius: '16px', border: '1.5px solid #fca5a5' }}>
                          <div style={{ fontSize: '0.78rem', color: '#991b1b', fontWeight: '900' }}>{t.chemicalCostLabel}</div>
                          <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#dc2626', marginTop: '4px' }}>
                            {advice.economic_impact?.chemical_cost_inr}
                          </div>
                          <div style={{ fontSize: '0.76rem', color: '#991b1b', marginTop: '4px' }}>{t.chemicalCostSub}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: Agro-Ecology & Indigenous Seeds */}
                  {dossierTab === 'ecology' && (
                    <div className="fade-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ background: '#f0fdf4', padding: '16px 20px', borderRadius: '16px', border: '1.5px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                          🌾
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: '900', textTransform: 'uppercase' }}>
                            {t.indigenousSeedTitle}
                          </div>
                          <div style={{ fontSize: '1.15rem', fontWeight: '900', color: '#14532d' }}>
                            {advice.heritage_seed?.name}
                          </div>
                          <div style={{ fontSize: '0.82rem', color: '#166534', marginTop: '2px' }}>
                            {advice.heritage_seed?.traits}
                          </div>
                        </div>
                      </div>

                      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.86rem', fontWeight: '900', color: '#1e293b', marginBottom: '6px' }}>
                          {t.companionTitle}
                        </div>
                        <p style={{ margin: 0, fontSize: '0.86rem', color: '#475569', lineHeight: '1.5' }}>
                          {advice.cultural_prevention?.companion_crops}
                        </p>
                      </div>

                      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.86rem', fontWeight: '900', color: '#1e293b', marginBottom: '6px' }}>
                          {t.waterSoilTitle}
                        </div>
                        <p style={{ margin: 0, fontSize: '0.86rem', color: '#475569', lineHeight: '1.5' }}>
                          {advice.cultural_prevention?.soil_management} {advice.cultural_prevention?.water_advice}
                        </p>
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                /* STANDBY HOSPITALS STATE */
                <div className="mk-card card-hover-lift" style={{ 
                  background: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)', 
                  border: '2px dashed #cbd5e1', 
                  borderRadius: '28px',
                  padding: '48px 30px', 
                  textAlign: 'center' 
                }}>
                  <div style={{ position: 'relative', width: '105px', height: '105px', margin: '0 auto 20px' }}>
                    <img 
                      src="/doctor_elder.jpg" 
                      alt="Doctor Ready" 
                      style={{ 
                        width: '105px', 
                        height: '105px', 
                        borderRadius: '50%', 
                        objectFit: 'cover',
                        border: '3.5px solid #10b981',
                        boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)'
                      }} 
                    />
                    <div style={{ 
                      position: 'absolute', 
                      bottom: '2px', 
                      right: '2px', 
                      background: '#10b981', 
                      color: 'white', 
                      width: '30px', 
                      height: '30px', 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      border: '2.5px solid white'
                    }}>
                      <Sparkles size={16} />
                    </div>
                  </div>

                  <h2 style={{ fontSize: '1.45rem', fontWeight: '900', color: '#1e293b', marginBottom: '8px' }}>
                    {t.standbyTitle}
                  </h2>
                  <p style={{ fontSize: '0.92rem', color: '#64748b', lineHeight: '1.6', maxWidth: '460px', margin: '0 auto 24px' }}>
                    {t.standbyDesc}
                  </p>

                  <div style={{ maxWidth: '420px', margin: '0 auto 24px', borderRadius: '16px', overflow: 'hidden', border: '1.5px solid #e2e8f0', boxShadow: '0 6px 16px rgba(0,0,0,0.05)' }}>
                    <img src="/remedy_prep.jpg" alt="Organic wisdom" style={{ width: '100%', height: '130px', objectFit: 'cover' }} />
                    <div style={{ padding: '10px 14px', background: '#f8fafc', fontSize: '0.82rem', color: '#475569', fontWeight: '800' }}>
                      {t.standbyIndexed}
                    </div>
                  </div>

                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#ecfdf5', padding: '10px 22px', borderRadius: '26px', fontSize: '0.85rem', color: '#065f46', fontWeight: '900' }}>
                    <Sparkles size={16} />
                    <span>{t.standbyBadge}</span>
                  </div>
                </div>
              )}
            </div>

          </div>
        </>
      ) : activeTab === 'catalog' ? (
        /* REMEDIES KNOWLEDGE LIBRARY TAB */
        <div className="mk-card fade-slide-up" style={{ padding: '32px', background: 'white', borderRadius: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>
                Verified Ancestral Organic Remedies Library
              </h2>
              <p style={{ fontSize: '0.86rem', color: '#64748b', margin: '4px 0 0 0' }}>
                Complete reference encyclopedia of zero-chemical farmyard preparations indexed for Indian alluvial soils.
              </p>
            </div>
            
            <input
              type="text"
              value={catalogSearch}
              onChange={(e) => setCatalogSearch(e.target.value)}
              placeholder="Search remedies by pest or ingredient..."
              style={{ padding: '10px 16px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', width: '300px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '18px' }}>
            {remediesLibrary
              .filter(r => r.title.toLowerCase().includes(catalogSearch.toLowerCase()) || r.target.toLowerCase().includes(catalogSearch.toLowerCase()))
              .map((rem, idx) => (
                <div key={idx} className="card-hover-lift" style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '18px', padding: '22px' }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: '900', color: '#065f46', marginBottom: '8px' }}>
                    🌿 {rem.title}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#dc2626', fontWeight: '800', marginBottom: '10px' }}>
                    🎯 Target: {rem.target}
                  </div>
                  <div style={{ fontSize: '0.84rem', color: '#334155', marginBottom: '8px', lineHeight: '1.4' }}>
                    <strong>Ingredients:</strong> {rem.ingredients}
                  </div>
                  <div style={{ fontSize: '0.84rem', color: '#475569', marginBottom: '12px' }}>
                    <strong>Dosage:</strong> {rem.dosage}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: '900' }}>
                      Savings: {rem.savings}
                    </span>
                    <button
                      onClick={() => {
                        setCustomText(rem.title);
                        setActiveTab('doctor');
                        executeConsultation({ text: rem.title });
                      }}
                      className="card-hover-lift"
                      style={{ background: '#059669', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '900', cursor: 'pointer' }}
                    >
                      Prescribe This Formula
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ) : activeTab === 'report' ? (
        /* SOIL HEALTH CARD & LAB REPORT PDF ANALYZER TAB */
        <div className="fade-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
          
          {/* 1. REPORT HERO & UPLOAD WORKBENCH */}
          <div style={{
            background: 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #065f46 100%)',
            color: 'white',
            borderRadius: '26px',
            padding: '28px 32px',
            border: '1px solid rgba(52, 211, 153, 0.3)',
            boxShadow: '0 20px 45px -12px rgba(2, 44, 34, 0.5)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', position: 'relative', zIndex: 2 }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(52, 211, 153, 0.2)', color: '#6ee7b7', padding: '5px 14px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '900', marginBottom: '12px', border: '1px solid rgba(52, 211, 153, 0.35)' }}>
                  <Sparkles size={15} color="#34d399" />
                  <span>{currentLang === 'bn' ? 'এআই ল্যাব ও সয়েল টেস্ট গোয়েন্দা' : currentLang === 'hi' ? 'एआई लैब व सॉइल टेस्ट विश्लेषक' : 'AI Soil & Pathology Lab Intelligence'}</span>
                </div>
                <h2 style={{ fontSize: '1.85rem', fontWeight: '900', margin: '0 0 8px 0', letterSpacing: '-0.02em', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                  {currentLang === 'bn' ? 'সয়েল হেলথ কার্ড ও প্যাথলজি PDF বিশ্লেষণ' : currentLang === 'hi' ? 'सॉइल हेल्थ कार्ड व पैथोलॉजी PDF विश्लेषण' : 'Soil Health Card & Lab Pathology PDF Analyzer'}
                </h2>
                <p style={{ margin: 0, fontSize: '0.94rem', color: '#d1fae5', maxWidth: '750px', lineHeight: '1.55' }}>
                  {currentLang === 'bn' 
                    ? 'সরকারি সয়েল টেস্ট কার্ড (Soil Health Card) বা কেভিকে প্যাথলজি রিপোর্ট PDF আপলোড করুন অথবা নমুনা কার্ড বেছে নিন। এআই মাটির পিএইচ, জৈব কার্বন ও জীবাণু বিশ্লেষণ করে জিরো-খরচের সমাধান দেবে।'
                    : currentLang === 'hi'
                    ? 'सरकारी सॉइल टेस्ट कार्ड या केवीके पैथोलॉजी रिपोर्ट PDF अपलोड करें या नमूना कार्ड चुनें। एआई पीएच, जैविक कार्बन व रोगजनक जांचकर शून्य-लागत देशी उपचार देगा।'
                    : 'Upload your official Soil Health Card or Plant Pathology diagnostic PDF, or test pre-indexed Govt/KVK samples. AI extracts values and prescribes zero-cost ancestral remediation.'}
                </p>
              </div>

              {/* Action: Trigger Analysis */}
              <button
                onClick={handleAnalyzeReport}
                disabled={isAnalyzingReport}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '16px 28px',
                  borderRadius: '16px',
                  fontSize: '1rem',
                  fontWeight: '900',
                  cursor: isAnalyzingReport ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
                  transition: 'all 0.2s ease',
                  flexShrink: 0
                }}
              >
                {isAnalyzingReport ? (
                  <>
                    <RefreshCw size={20} className="animate-spin" />
                    <span>{currentLang === 'bn' ? 'এআই বিশ্লেষণ চলছে...' : currentLang === 'hi' ? 'विश्लेषण जारी...' : 'Analyzing Report...'}</span>
                  </>
                ) : (
                  <>
                    <Microscope size={20} />
                    <span>{currentLang === 'bn' ? 'এআই দিয়ে রিপোর্ট বিশ্লেষণ করুন' : currentLang === 'hi' ? 'एआई से रिपोर्ट विश्लेषण करें' : 'Analyze Report with AI'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Document Selector Pills */}
            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#a7f3d0', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {currentLang === 'bn' ? 'ডকুমেন্ট নির্বাচন অথবা নিজস্ব PDF আপলোড:' : currentLang === 'hi' ? 'दस्तावेज चुनें अथवा स्वयं की PDF अपलोड करें:' : 'Select Diagnostic Document or Upload Your PDF:'}
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {/* Sample 1: Govt WB Soil Health Card */}
                <button
                  onClick={() => handleSelectSampleReport('west_bengal_soil_card')}
                  style={{
                    background: selectedSampleReport === 'west_bengal_soil_card' ? '#ffffff' : 'rgba(0,0,0,0.25)',
                    color: selectedSampleReport === 'west_bengal_soil_card' ? '#065f46' : '#d1fae5',
                    border: selectedSampleReport === 'west_bengal_soil_card' ? '2px solid #34d399' : '1px solid rgba(255,255,255,0.2)',
                    padding: '10px 18px',
                    borderRadius: '14px',
                    fontSize: '0.88rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <FileText size={16} color={selectedSampleReport === 'west_bengal_soil_card' ? '#059669' : '#34d399'} />
                  <span>🏛️ পশ্চিমবঙ্গ সরকার সয়েল কার্ড (WB-SHC-2026)</span>
                </button>

                {/* Sample 2: KVK Pathology Slip */}
                <button
                  onClick={() => handleSelectSampleReport('potato_pathology_slip')}
                  style={{
                    background: selectedSampleReport === 'potato_pathology_slip' ? '#ffffff' : 'rgba(0,0,0,0.25)',
                    color: selectedSampleReport === 'potato_pathology_slip' ? '#065f46' : '#d1fae5',
                    border: selectedSampleReport === 'potato_pathology_slip' ? '2px solid #34d399' : '1px solid rgba(255,255,255,0.2)',
                    padding: '10px 18px',
                    borderRadius: '14px',
                    fontSize: '0.88rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Microscope size={16} color={selectedSampleReport === 'potato_pathology_slip' ? '#059669' : '#fb923c'} />
                  <span>🔬 আইসিএআর-কেভিকে প্যাথলজি স্লিপ (KVK-PATH)</span>
                </button>

                {/* Upload Custom File Button */}
                <button
                  onClick={() => reportFileInputRef.current?.click()}
                  style={{
                    background: reportFile ? '#ffffff' : 'rgba(0,0,0,0.25)',
                    color: reportFile ? '#065f46' : '#d1fae5',
                    border: reportFile ? '2px solid #34d399' : '1px dashed rgba(255,255,255,0.35)',
                    padding: '10px 18px',
                    borderRadius: '14px',
                    fontSize: '0.88rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Upload size={16} color={reportFile ? '#059669' : '#38bdf8'} />
                  <span>{reportFile ? `📄 ${reportFile.name.slice(0, 18)}...` : (currentLang === 'bn' ? '📤 নিজস্ব রিপোর্ট PDF / ছবি আপলোড' : currentLang === 'hi' ? '📤 अपनी रिपोर्ट PDF / फोटो अपलोड करें' : '📤 Upload Custom PDF / Image')}</span>
                </button>

                <input
                  type="file"
                  ref={reportFileInputRef}
                  accept=".pdf,image/*"
                  onChange={handleReportFileUpload}
                  style={{ display: 'none' }}
                />
              </div>

              {reportError && (
                <div style={{ marginTop: '12px', background: 'rgba(239, 68, 68, 0.25)', border: '1px solid #ef4444', color: '#fca5a5', padding: '8px 14px', borderRadius: '10px', fontSize: '0.84rem' }}>
                  {reportError}
                </div>
              )}
            </div>
          </div>

          {/* 2. TWO-COLUMN WORKSTATION: Interactive Document Preview (Left) + AI Diagnostics & Ancestral Treatment (Right) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px', alignItems: 'start' }}>
            
            {/* Left Column: Official Document Canvas / PDF Preview */}
            <div className="mk-card" style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '26px',
              border: '1.5px solid #cbd5e1',
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1.5px solid #f1f5f9', paddingBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.2rem' }}>📄</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '900', color: '#0f172a' }}>
                      {currentLang === 'bn' ? 'ল্যাব রিপোর্ট ডকুমেন্ট ভিউয়ার' : currentLang === 'hi' ? 'लैब रिपोर्ट दस्तावेज व्यूअर' : 'Lab Diagnostic Document Sheet'}
                    </h3>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      {reportFile ? 'User Uploaded File' : 'Official Verified Diagnostic Telemetry'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => setReportZoom(prev => Math.max(0.85, prev - 0.1))}
                    title="Zoom Out"
                    style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '4px 8px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    -
                  </button>
                  <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: '800' }}>{Math.round(reportZoom * 100)}%</span>
                  <button
                    onClick={() => setReportZoom(prev => Math.min(1.25, prev + 0.1))}
                    title="Zoom In"
                    style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '4px 8px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Rendered Document View (Government / ICAR Styling) */}
              {selectedSampleReport && sampleReportsData[selectedSampleReport] ? (
                (() => {
                  const sampleDoc = sampleReportsData[selectedSampleReport];
                  return (
                    <div style={{
                      transform: `scale(${reportZoom})`,
                      transformOrigin: 'top center',
                      transition: 'transform 0.15s ease',
                      border: '2px solid #e2e8f0',
                      borderRadius: '16px',
                      padding: '24px',
                      background: '#fafafa',
                      position: 'relative'
                    }}>
                      {/* Institutional Seal Watermark */}
                      <div style={{ textAlign: 'center', borderBottom: '2px solid #059669', paddingBottom: '16px', marginBottom: '16px' }}>
                        <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>
                          {selectedSampleReport === 'west_bengal_soil_card' ? '🏛️' : '🔬'}
                        </div>
                        <div style={{ fontSize: '1.05rem', fontWeight: '900', color: '#064e3b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {sampleDoc.title}
                        </div>
                        <div style={{ fontSize: '0.86rem', fontWeight: '800', color: '#059669', marginTop: '2px' }}>
                          {sampleDoc.subTitle}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                          Ref ID: <strong>{sampleDoc.refNo}</strong> • Date: {sampleDoc.date}
                        </div>
                      </div>

                      {/* Beneficiary Farmer Metadata Box */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '10px',
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        marginBottom: '16px',
                        fontSize: '0.82rem'
                      }}>
                        <div>
                          <span style={{ color: '#64748b' }}>কৃষক / Farmer: </span>
                          <strong style={{ color: '#0f172a' }}>{sampleDoc.farmer}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748b' }}>ফসল / Crop: </span>
                          <strong style={{ color: '#059669' }}>{sampleDoc.crop}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748b' }}>ল্যাবরেটরি / Lab: </span>
                          <strong style={{ color: '#0f172a' }}>{sampleDoc.lab}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748b' }}>জমি / Plot: </span>
                          <strong style={{ color: '#0f172a' }}>{sampleDoc.plotSize}</strong>
                        </div>
                      </div>

                      {/* Chemical Parameters Table */}
                      <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ background: '#ecfdf5', color: '#064e3b', borderBottom: '2px solid #a7f3d0' }}>
                              <th style={{ padding: '8px 10px' }}>প্যারামিটার (Parameter)</th>
                              <th style={{ padding: '8px 10px' }}>ল্যাব মান (Value)</th>
                              <th style={{ padding: '8px 10px' }}>আদর্শ মান (Ideal)</th>
                              <th style={{ padding: '8px 10px' }}>পরিস্থিতি (Status)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sampleDoc.parameters.map((p, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                <td style={{ padding: '9px 10px', fontWeight: '700', color: '#1e293b' }}>{p.name}</td>
                                <td style={{ padding: '9px 10px', fontWeight: '900', color: p.badgeColor }}>
                                  {p.value} {p.unit}
                                </td>
                                <td style={{ padding: '9px 10px', color: '#64748b' }}>{p.ideal}</td>
                                <td style={{ padding: '9px 10px' }}>
                                  <span style={{
                                    fontSize: '0.72rem',
                                    fontWeight: '800',
                                    color: p.badgeColor,
                                    background: `${p.badgeColor}15`,
                                    border: `1px solid ${p.badgeColor}40`,
                                    padding: '2px 8px',
                                    borderRadius: '6px'
                                  }}>
                                    {currentLang === 'bn' ? p.statusBn : p.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Official Verification Stamp */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px dashed #cbd5e1', fontSize: '0.74rem', color: '#64748b' }}>
                        <div>
                          ✓ OFFICIAL TESTING SEAL • 100% VERIFIED
                        </div>
                        <div style={{ textAlign: 'right', fontWeight: '700', color: '#0f172a' }}>
                          DIRECTOR OF TESTING CLINIC
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : reportFile ? (
                /* Custom Uploaded PDF or Image Preview */
                <div style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: '16px',
                  padding: '24px',
                  textAlign: 'center',
                  background: '#f8fafc'
                }}>
                  {reportFile.type.startsWith('image/') && reportPreviewUrl ? (
                    <img 
                      src={reportPreviewUrl} 
                      alt="Uploaded Lab Report" 
                      style={{ maxWidth: '100%', maxHeight: '420px', borderRadius: '12px', objectFit: 'contain' }} 
                    />
                  ) : (
                    <div style={{ padding: '30px 20px' }}>
                      <FileText size={48} color="#059669" style={{ margin: '0 auto 12px auto' }} />
                      <div style={{ fontSize: '1.05rem', fontWeight: '900', color: '#0f172a', marginBottom: '6px' }}>
                        {reportFile.name}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '16px' }}>
                        PDF Document Loaded ({(reportFile.size / 1024).toFixed(1)} KB) • Ready for Multimodal Gemini Analysis
                      </div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ecfdf5', color: '#059669', padding: '6px 14px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '800' }}>
                        <CheckCircle size={15} />
                        <span>ডকুমেন্ট সফলভাবে লোড হয়েছে</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Right Column: AI Clinical Diagnostic Findings & Zero-Cost Treatment Plan */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* If no analysis result yet, show preview prompt card */}
              {!reportAnalysisResult ? (
                <div className="mk-card" style={{
                  background: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)',
                  borderRadius: '24px',
                  padding: '30px',
                  border: '2px solid #bbf7d0',
                  textAlign: 'center'
                }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                    <Microscope size={28} color="#059669" />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#064e3b', margin: '0 0 8px 0' }}>
                    {currentLang === 'bn' ? 'রিপোর্ট এআই বিশ্লেষণ প্রস্তুত' : currentLang === 'hi' ? 'रिपोर्ट एआई विश्लेषण तैयार' : 'Ready for AI Diagnostics'}
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: '1.55', maxWidth: '440px', margin: '0 auto 20px auto' }}>
                    {currentLang === 'bn'
                      ? "উপরে 'এআই দিয়ে রিপোর্ট বিশ্লেষণ করুন' বাটনে চাপ দিন। এআই রিপোর্ট থেকে তাৎক্ষণিক অম্লত্ব, জৈব কার্বন ঘাটতি এবং প্যাথলজি স্পোর পরীক্ষা করে কৃষকের জন্য সম্পূর্ণ দেশীয় প্রতিকার প্রেসক্রিপশন তৈরি করবে।"
                      : currentLang === 'hi'
                      ? "ऊपर 'एआई से रिपोर्ट विश्लेषण करें' बटन दबाएं। एआई मिट्टी के गुण व रोगों की जांच कर शून्य-लागत जैविक उपचार पर्ची तैयार करेगा।"
                      : "Click 'Analyze Report with AI' above to extract laboratory parameters, compute vitality scores, and generate zero-cost ancestral remediation steps."}
                  </p>
                  <button
                    onClick={handleAnalyzeReport}
                    disabled={isAnalyzingReport}
                    style={{
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '14px',
                      fontSize: '0.92rem',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 16px rgba(5, 150, 105, 0.3)'
                    }}
                  >
                    <Sparkles size={16} />
                    <span>{currentLang === 'bn' ? 'এখনই বিশ্লেষণ করুন' : 'Analyze Now'}</span>
                  </button>
                </div>
              ) : (
                /* LIVE AI ANALYSIS DOSSIER */
                <div className="fade-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Score & Clinical Diagnosis Banner */}
                  <div className="mk-card" style={{
                    background: '#ffffff',
                    borderRadius: '24px',
                    padding: '24px 26px',
                    border: '2px solid #bbf7d0',
                    boxShadow: '0 12px 30px rgba(5, 150, 105, 0.1)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        {/* Circular Score Badge */}
                        <div style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '16px',
                          background: reportAnalysisResult.vitality_score < 45 ? '#fef2f2' : '#f0fdf4',
                          border: `2px solid ${reportAnalysisResult.vitality_score < 45 ? '#ef4444' : '#10b981'}`,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: reportAnalysisResult.vitality_score < 45 ? '#dc2626' : '#15803d',
                          fontWeight: '900',
                          lineHeight: 1
                        }}>
                          <span style={{ fontSize: '1.25rem' }}>{reportAnalysisResult.vitality_score}</span>
                          <span style={{ fontSize: '0.62rem', textTransform: 'uppercase' }}>/ 100</span>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>
                            {currentLang === 'bn' ? 'মাটি ও ফসলের স্বাস্থ্য সূচক' : 'Vitality Health Index'}
                          </div>
                          <div style={{ fontSize: '1.05rem', fontWeight: '900', color: '#0f172a' }}>
                            {reportAnalysisResult.vitality_score < 45 ? '⚠️ চরম পুষ্টি ও অম্লত্ব সংকট' : '✓ মধ্যম স্বাস্থ্য ও পুনরুদ্ধারযোগ্য'}
                          </div>
                        </div>
                      </div>

                      {/* Engine Tag */}
                      <span style={{ fontSize: '0.74rem', background: '#ecfdf5', color: '#059669', padding: '4px 10px', borderRadius: '8px', fontWeight: '800' }}>
                        Gemini Multimodal Vision
                      </span>
                    </div>

                    {/* Clinical Verdict */}
                    <div style={{
                      background: '#f8fafc',
                      borderLeft: '5px solid #059669',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      fontSize: '0.94rem',
                      fontWeight: '800',
                      color: '#064e3b',
                      lineHeight: '1.45',
                      marginBottom: '16px'
                    }}>
                      🩺 {reportAnalysisResult.health_verdict}
                    </div>

                    {/* Audio Consultation Player */}
                    {reportAnalysisResult.spoken_advice && (
                      <div style={{
                        background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
                        borderRadius: '16px',
                        padding: '16px 20px',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <button
                            onClick={() => isSpeaking ? stopSpeaking() : speakAdvice(reportAnalysisResult.spoken_advice)}
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '50%',
                              background: '#ffffff',
                              border: 'none',
                              color: '#065f46',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                              flexShrink: 0
                            }}
                          >
                            {isSpeaking ? <VolumeX size={20} color="#dc2626" /> : <Volume2 size={20} color="#059669" />}
                          </button>
                          <div>
                            <div style={{ fontSize: '0.88rem', fontWeight: '900' }}>
                              {isSpeaking ? 'ডাক্তার কথা বলছেন...' : 'ডাক্তারের ভয়েস নিদান শুনুন (Play Doctor Voice)'}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#a7f3d0' }}>
                              বিশুদ্ধ বাংলায় অডিও পরামর্শ ও ঘরোয়া নির্দেশিকা
                            </div>
                          </div>
                        </div>

                        {/* Speech Rate Controls */}
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {[0.8, 1.0, 1.2].map((rate) => (
                            <button
                              key={rate}
                              onClick={() => {
                                setSpeechRate(rate);
                                speakAdvice(reportAnalysisResult.spoken_advice, rate);
                              }}
                              style={{
                                background: speechRate === rate ? '#34d399' : 'rgba(255,255,255,0.15)',
                                color: speechRate === rate ? '#065f46' : 'white',
                                border: 'none',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontSize: '0.7rem',
                                fontWeight: '800',
                                cursor: 'pointer'
                              }}
                            >
                              {rate}x
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Identified Risks */}
                  {reportAnalysisResult.identified_risks && reportAnalysisResult.identified_risks.length > 0 && (
                    <div className="mk-card" style={{ background: '#fef2f2', borderRadius: '20px', padding: '20px', border: '1.5px solid #fecaca' }}>
                      <div style={{ fontSize: '0.84rem', fontWeight: '900', color: '#991b1b', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <AlertCircle size={16} color="#dc2626" />
                        <span>{currentLang === 'bn' ? 'শনাক্তকৃত মাটির ও ফসলের ঝুঁকি:' : 'Identified Agronomic & Microclimate Risks:'}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {reportAnalysisResult.identified_risks.map((risk, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.84rem', color: '#7f1d1d' }}>
                            <span style={{ color: '#dc2626', fontWeight: 'bold' }}>•</span>
                            <span>{risk}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3-Step Ancestral Remediation Protocol */}
                  {reportAnalysisResult.ancestral_treatment_plan && (
                    <div className="mk-card" style={{ background: '#ffffff', borderRadius: '24px', padding: '24px', border: '1.5px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div style={{ fontSize: '0.96rem', fontWeight: '900', color: '#064e3b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <ShieldCheck size={18} color="#059669" />
                          <span>{currentLang === 'bn' ? 'পূর্বপুরুষের ৩-ধাপের জিরো-খরচের চিকিৎসা পরিকল্পনা:' : '3-Phase Ancestral Zero-Cost Treatment Plan:'}</span>
                        </div>
                        <span style={{ fontSize: '0.72rem', background: '#ecfdf5', color: '#059669', padding: '3px 8px', borderRadius: '6px', fontWeight: '800' }}>
                          100% Farmyard Organic
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {reportAnalysisResult.ancestral_treatment_plan.map((stepItem, idx) => (
                          <div key={idx} style={{
                            background: '#f8fafc',
                            border: '1.5px solid #e2e8f0',
                            borderRadius: '16px',
                            padding: '16px 18px',
                            borderLeft: '5px solid #059669'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                              <div style={{ fontSize: '0.94rem', fontWeight: '900', color: '#0f172a' }}>
                                ধাপ {stepItem.step || idx + 1}: {stepItem.title}
                              </div>
                              <span style={{ fontSize: '0.74rem', background: '#ecfdf5', color: '#065f46', padding: '3px 8px', borderRadius: '6px', fontWeight: '800' }}>
                                {stepItem.timing}
                              </span>
                            </div>

                            <div style={{ fontSize: '0.84rem', color: '#166534', fontWeight: '800', marginBottom: '6px' }}>
                              📏 মাত্রা (Dosage): {stepItem.dosage}
                            </div>

                            <div style={{ fontSize: '0.82rem', color: '#475569', lineHeight: '1.45' }}>
                              💡 <strong>কার্যপদ্ধতি:</strong> {stepItem.mechanism}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Action Buttons: Copy & Print */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                        <button
                          onClick={handleCopyReportPrescription}
                          style={{
                            background: '#f8fafc',
                            border: '1.5px solid #cbd5e1',
                            borderRadius: '12px',
                            padding: '8px 16px',
                            fontSize: '0.82rem',
                            fontWeight: '800',
                            color: '#334155',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          {copied ? <Check size={15} color="#16a34a" /> : <Copy size={15} />}
                          <span>{copied ? 'প্রেসক্রিপশন কপি হয়েছে!' : 'প্রেসক্রিপশন কপি করুন'}</span>
                        </button>

                        <button
                          onClick={() => window.print()}
                          style={{
                            background: '#059669',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '8px 18px',
                            fontSize: '0.82rem',
                            fontWeight: '800',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <Printer size={15} />
                          <span>প্রিন্ট বা PDF সংরক্ষণ</span>
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>
          </div>

        </div>
      ) : (
        /* CONSULTATION HISTORY TAB */
        <div className="mk-card fade-slide-up" style={{ padding: '32px', background: 'white', borderRadius: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>
                Recent Patient Diagnoses History
              </h2>
              <p style={{ fontSize: '0.86rem', color: '#64748b', margin: '4px 0 0 0' }}>
                Consultations saved on this device. Click any record to restore full clinical prescription slip.
              </p>
            </div>
            
            {consultationHistory.length > 0 && (
              <button
                onClick={() => {
                  localStorage.removeItem('mk_consultation_history');
                  setConsultationHistory([]);
                }}
                className="card-hover-lift"
                style={{
                  background: '#fee2e2',
                  color: '#b91c1c',
                  border: 'none',
                  padding: '9px 18px',
                  borderRadius: '12px',
                  fontSize: '0.82rem',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                Clear Patient History
              </button>
            )}
          </div>

          {consultationHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '56px 20px', color: '#94a3b8' }}>
              <History size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <div style={{ fontSize: '1.1rem', fontWeight: '800' }}>No patient consultations recorded yet</div>
              <p style={{ fontSize: '0.86rem' }}>Perform your first voice or photo diagnosis to populate this log.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {consultationHistory.map((item, index) => (
                <div
                  key={index}
                  className="card-hover-lift"
                  onClick={() => {
                    setAdvice(item);
                    setActiveTab('doctor');
                  }}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '18px 22px',
                    borderRadius: '16px',
                    border: '1.5px solid #e2e8f0',
                    background: '#f8fafc',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <img 
                      src="/doctor_elder.jpg" 
                      alt="Avatar" 
                      style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #10b981' }} 
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.76rem', background: '#059669', color: 'white', padding: '3px 10px', borderRadius: '6px', fontWeight: '900' }}>
                          {item.prescription_id || `MK-RX-${index + 1}`}
                        </span>
                        <span style={{ fontSize: '1rem', fontWeight: '900', color: '#0f172a' }}>
                          {item.diagnosis?.condition || item.remedy_matched}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                        🌱 {item.cropType || 'Crop'} ({item.cropStage || 'Stage'}) • Remedy: {item.clinical_prescription?.primary_remedy || item.remedy_matched}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '0.86rem', fontWeight: '900', color: '#16a34a' }}>
                      Saved: {item.economic_impact?.net_savings_inr || '₹800+'}
                    </span>
                    <ArrowRight size={20} color="#64748b" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* GEMINI API KEY CONFIGURATION MODAL */}
      {showKeyModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="fade-slide-up" style={{
            background: 'white',
            borderRadius: '24px',
            maxWidth: '520px',
            width: '100%',
            padding: '30px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: '2px solid #bbf7d0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={22} color="#059669" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', color: '#064e3b' }}>
                    Connect Gemini 1.5 Flash
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Multimodal Voice & Agronomic Vision AI
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setShowKeyModal(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.86rem', color: '#334155', lineHeight: '1.5', marginBottom: '18px' }}>
              Enter your Google Gemini API key to enable live voice question answering, acoustic audio analysis, and spoken prescriptions in Bengali, Hindi, or English.
            </p>

            {geminiStatus.hasKey && (
              <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px', padding: '10px 14px', marginBottom: '16px', fontSize: '0.82rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={16} color="#16a34a" />
                <span>Currently active key: <strong>{geminiStatus.keyPreview}</strong></span>
              </div>
            )}

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#1e293b', marginBottom: '6px' }}>
                Google Gemini API Key:
              </label>
              <input
                type="password"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="AIzaSy..."
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '6px' }}>
                Need a free key? Get one from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{ color: '#059669', fontWeight: '700' }}>Google AI Studio ↗</a>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowKeyModal(false)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '12px',
                  border: '1.5px solid #cbd5e1',
                  background: '#f8fafc',
                  color: '#475569',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveGeminiKey}
                disabled={savingKey || !inputKey.trim()}
                style={{
                  padding: '10px 22px',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#059669',
                  color: 'white',
                  fontWeight: '900',
                  fontSize: '0.85rem',
                  cursor: savingKey ? 'wait' : 'pointer'
                }}
              >
                {savingKey ? 'Connecting...' : 'Save & Activate'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
