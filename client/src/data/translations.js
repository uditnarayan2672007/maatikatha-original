// MaatiKatha Comprehensive Multilingual Translation Catalog
// Languages: English ('en'), Bengali ('bn'), Hindi ('hi')

export const LANGUAGES = [
  {
    code: 'en',
    label: 'English',
    nativeName: 'English',
    shortCode: 'EN',
    flag: '🇬🇧',
    regionTag: 'Global Standard',
    description: 'Universal agrarian language'
  },
  {
    code: 'bn',
    label: 'Bengali',
    nativeName: 'বাংলা',
    shortCode: 'বাং',
    flag: '🇧🇩',
    regionTag: 'পশ্চিমবঙ্গ ও গাঙ্গেয় অঞ্চল',
    description: 'মাটির খাঁটি দেশীয় ভাষা'
  },
  {
    code: 'hi',
    label: 'Hindi',
    nativeName: 'हिन्दी',
    shortCode: 'हिं',
    flag: '🇮🇳',
    regionTag: 'उत्तर व मध्य भारत',
    description: 'राष्ट्रव्यापी सरल भाषा'
  }
];

export const APP_TRANSLATIONS = {
  en: {
    // Branding
    brandTitle: 'MaatiKatha',
    brandTagline: 'Story of the Soil',
    connectedBadge: 'MongoDB Atlas Connected',
    platformType: 'Zero-Hardware Agritech Platform',
    footerEnterprise: 'MaatiKatha — Story of the Soil • Zero-Hardware Agritech Enterprise',
    footerTech: 'Google Gemini Flash • Open-Meteo • ISRIC SoilGrids • AGMARKNET Mandi',
    logOut: 'Log out',

    // Navigation Labels
    nav: {
      dashboard: 'Dashboard',
      doctor: 'Voice Doctor',
      timemachine: 'Time Machine',
      simulator: 'Decision Simulator',
      riturakhok: 'Ritu Rakhok',
      khamardrishti: 'Khamar Drishti (Radar)',
      seeds: 'Ancestral Seeds',
      mandi: 'Mandi Market'
    },

    // Sidebar Language Section
    languageSectionTitle: 'Language / ভাষা / भाषा',
    languageSectionSubtitle: 'Select your preferred farming dialect',
    languageActiveBadge: 'Active Language',

    // Top Action Bar
    topBar: {
      googleMapBtn: 'Google Maps Tracker',
      autoDetectBtn: 'Auto-Detect Location',
      locatingBtn: 'Locating...',
      searchOption: '🔍 Search Any City / Town...',
      liveLocationLabel: 'Live Location',
      gpsLocked: '✓ Live GPS Satellite Lock',
      ipLocated: '✓ Auto-Detected via IP',
      switchedLocation: '✓ Switched to',
      searchLocation: '✓ Found & Switched to'
    },

    // Search Modal
    searchModal: {
      title: '🔍 Search Any City, Town, or District',
      desc: 'Enter any location across India to fetch real-time weather and agro-advisories:',
      placeholder: 'e.g. Howrah, Bardhaman, Varanasi, Patna, Pune...',
      cancelBtn: 'Cancel',
      confirmBtn: 'Confirm Location',
      searching: 'Searching location...'
    },

    // Notifications / Toasts
    langSwitchedNotification: 'Switched language to English'
  },

  bn: {
    // Branding
    brandTitle: 'মাটিকথা',
    brandTagline: 'মাটির না-বলা কথা',
    connectedBadge: 'মঙ্গোডিবি ক্লাউড সংযুক্ত',
    platformType: 'জিরো-হার্ডওয়্যার কৃষি প্রযুক্তি প্ল্যাটফর্ম',
    footerEnterprise: 'মাটিকথা — মাটির না-বলা কথা • জিরো-হার্ডওয়্যার কৃষি এন্টারপ্রাইজ',
    footerTech: 'গুগল জেমিনাই এআই • ওপেন-মেটিও • সয়েলগ্রিডস • লাইভ মান্ডি এপিআই',
    logOut: 'লগ আউট',

    // Navigation Labels
    nav: {
      dashboard: 'ড্যাশবোর্ড',
      doctor: 'ভয়েস ডাক্তার',
      timemachine: 'মাটির টাইম মেশিন',
      simulator: 'ডিসিশন সিমুলেটর',
      riturakhok: 'ঋতুরক্ষক (আবহাওয়া)',
      khamardrishti: 'খামারদৃষ্টি (বায়ু রাডার)',
      seeds: 'ঐতিহ্যবাহী দেশী বীজ',
      mandi: 'কৃষি মান্ডি বাজার'
    },

    // Sidebar Language Section
    languageSectionTitle: 'ভাষা নির্বাচন (Language)',
    languageSectionSubtitle: 'আপনার পছন্দের আঞ্চলিক ভাষা বেছে নিন',
    languageActiveBadge: 'সক্রিয় ভাষা',

    // Top Action Bar
    topBar: {
      googleMapBtn: 'গুগল ম্যাপস ট্র্যাকার',
      autoDetectBtn: 'স্বয়ংক্রিয় অবস্থান নির্ণয়',
      locatingBtn: 'অবস্থান খোঁজা হচ্ছে...',
      searchOption: '🔍 যেকোনো শহর বা গ্রাম খুঁজুন...',
      liveLocationLabel: 'বর্তমান অবস্থান',
      gpsLocked: '✓ লাইভ জিপিএস স্যাটেলাইট লক',
      ipLocated: '✓ নেটওয়ার্ক দ্বারা অবস্থান নির্ণীত',
      switchedLocation: '✓ স্থান পরিবর্তিত:',
      searchLocation: '✓ অনুসন্ধান সফল:'
    },

    // Search Modal
    searchModal: {
      title: '🔍 যেকোনো শহর, জেলা বা গ্রাম খুঁজুন',
      desc: 'ভারতের যেকোনো অঞ্চলের রিয়েল-টাইম আবহাওয়া ও কৃষি পরামর্শের জন্য নাম লিখুন:',
      placeholder: 'যেমন: হাওড়া, বর্ধমান, হুগলি, মেদিনীপুর, বাঁকুড়া...',
      cancelBtn: 'বাতিল',
      confirmBtn: 'অবস্থান নিশ্চিত করুন',
      searching: 'অনুসন্ধান চলছে...'
    },

    // Notifications / Toasts
    langSwitchedNotification: 'ভাষা বাংলায় পরিবর্তিত করা হয়েছে'
  },

  hi: {
    // Branding
    brandTitle: 'माटिकथा',
    brandTagline: 'मिट्टी की अनकही कहानी',
    connectedBadge: 'मोंगोडीबी एटलस कनेक्टेड',
    platformType: 'जीरो-हार्डवेयर कृषि तकनीक मंच',
    footerEnterprise: 'माटिकथा — मिट्टी की अनकही कहानी • जीरो-हार्डवेयर कृषि एंटरप्राइज',
    footerTech: 'गूगल जेमिनी एआई • ओपन-मेटियो • सॉइल-ग्रिड्स • लाइव मंडी एपीआई',
    logOut: 'लॉग आउट',

    // Navigation Labels
    nav: {
      dashboard: 'डैशबोर्ड',
      doctor: 'वॉयस डॉक्टर',
      timemachine: 'मिट्टी टाइम मशीन',
      simulator: 'निर्णय सिम्युलेटर',
      riturakhok: 'ऋतु रक्षक (मौसम)',
      khamardrishti: 'खमार दृष्टि (वायु रडार)',
      seeds: 'पारम्परिक देशी बीज',
      mandi: 'कृषि मंडी बाजार'
    },

    // Sidebar Language Section
    languageSectionTitle: 'भाषा चयन (Language)',
    languageSectionSubtitle: 'अपनी पसंदीदा कृषि भाषा चुनें',
    languageActiveBadge: 'सक्रिय भाषा',

    // Top Action Bar
    topBar: {
      googleMapBtn: 'गूगल मैप्स ट्रैकर',
      autoDetectBtn: 'स्वचालित स्थान पहचान',
      locatingBtn: 'स्थान खोजा जा रहा है...',
      searchOption: '🔍 कोई भी शहर या कस्बा खोजें...',
      liveLocationLabel: 'वर्तमान स्थान',
      gpsLocked: '✓ लाइव जीपीएस सैटेलाइट लॉक',
      ipLocated: '✓ नेटवर्क द्वारा स्थान ज्ञात',
      switchedLocation: '✓ स्थान बदला गया:',
      searchLocation: '✓ खोज सफल:'
    },

    // Search Modal
    searchModal: {
      title: '🔍 कोई भी शहर, कस्बा या जिला खोजें',
      desc: 'रियल-टाइम मौसम और फसल सलाह प्राप्त करने के लिए भारत का कोई भी स्थान दर्ज करें:',
      placeholder: 'जैसे: हावड़ा, वाराणसी, पटना, लखनऊ, मुजफ्फरपुर...',
      cancelBtn: 'रद्द करें',
      confirmBtn: 'स्थान की पुष्टि करें',
      searching: 'खोज जारी है...'
    },

    // Notifications / Toasts
    langSwitchedNotification: 'भाषा बदलकर हिन्दी कर दी गई है'
  }
};

// Landing Page Specific Multilingual Content
export const LANDING_PAGE_TRANSLATIONS = {
  en: {
    nav: {
      features: 'Features',
      howItWorks: 'How It Works',
      testimonials: 'Testimonials',
      login: 'Log In',
      getStarted: 'Get Started Free'
    },
    hero: {
      badge: 'Powered by Google Gemini Flash · Zero-Hardware Platform for Indian Farmers',
      titleLine1: "India's First",
      titleLine2: 'AI-Powered',
      titleLine3: 'Farm Intelligence',
      titleLine4: 'Platform',
      subtitle: 'MaatiKatha transforms how 140 million Indian farmers manage their land — AI voice diagnosis, generational soil reconstruction, live mandi prices, seasonal weather shields, and more. No hardware. No expertise required. Just speak or snap.',
      primaryCta: '🌱 Start for Free — No Credit Card',
      secondaryCta: '🔑 Sign In to Dashboard'
    },
    featuresSection: {
      badge: 'Integrated Agronomic Suite',
      title: 'Built Exclusively for Indian Agriculture',
      subtitle: 'Every tool runs directly from your mobile browser without buying sensors, probes, or expensive hardware.'
    }
  },
  bn: {
    nav: {
      features: 'বৈশিষ্ট্যসমূহ',
      howItWorks: 'কীভাবে কাজ করে',
      testimonials: 'কৃষকদের মতামত',
      login: 'লগ ইন',
      getStarted: 'বিনামূল্যে শুরু করুন'
    },
    hero: {
      badge: 'গুগল জেমিনাই ফ্ল্যাশ চালিত · ভারতীয় কৃষকদের জন্য সম্পূর্ণ বিনামূল্যে জিরো-হার্ডওয়্যার প্ল্যাটফর্ম',
      titleLine1: 'ভারতের প্রথম',
      titleLine2: 'এআই-চালিত',
      titleLine3: 'কৃষি বুদ্ধিমত্তা',
      titleLine4: 'প্ল্যাটফর্ম',
      subtitle: 'মাটিকথা বদলে দিচ্ছে ভারতীয় কৃষির রূপরেখা — মুখে বলে ফসলের রোগ নির্ণয়, মাটির ঐতিহাসিক পুনর্গঠন, লাইভ মান্ডি বাজার দর, এবং আগাম ঝড়-বৃষ্টির সতর্কতা। কোনো বাড়তি যন্ত্র লাগবে না, শুধু মুখে বলুন বা ছবি তুলুন।',
      primaryCta: '🌱 বিনামূল্যে শুরু করুন — কার্ড লাগবে না',
      secondaryCta: '🔑 ড্যাশবোর্ডে লগইন করুন'
    },
    featuresSection: {
      badge: 'সম্মিলিত কৃষি কমান্ড সেন্টার',
      title: 'ভারতীয় কৃষকদের জন্য বিশেষভাবে নির্মিত',
      subtitle: 'কোনো দামী সেন্সর বা হার্ডওয়্যার কেনার দরকার নেই — সবই চলে সাধারণ মোবাইলের ক্যামেরা ও মাইক্রোফোন দিয়ে।'
    }
  },
  hi: {
    nav: {
      features: 'मुख्य सुविधाएं',
      howItWorks: 'यह कैसे काम करता है',
      testimonials: 'किसानों की राय',
      login: 'लॉग इन',
      getStarted: 'मुफ्त में शुरू करें'
    },
    hero: {
      badge: 'गूगल जेमिनी फ्लैश द्वारा संचालित · भारतीय किसानों हेतु 100% जीरो-हार्डवेयर मंच',
      titleLine1: 'भारत का पहला',
      titleLine2: 'एआई-संचालित',
      titleLine3: 'कृषि इंटेलिजेंस',
      titleLine4: 'प्लेटफॉर्म',
      subtitle: 'माटिकथा बदल रहा है 14 करोड़ किसानों का भविष्य — बोलकर फसल रोग का तुरंत इलाज, मिट्टी का 40 वर्षीय इतिहास, लाइव मंडी भाव और मौसमी ढाल। किसी महंगे उपकरण की जरूरत नहीं, बस बोलें या फोटो खींचें।',
      primaryCta: '🌱 मुफ्त में शुरू करें — किसी कार्ड की आवश्यकता नहीं',
      secondaryCta: '🔑 डैशबोर्ड में प्रवेश करें'
    },
    featuresSection: {
      badge: 'सम्पूर्ण कृषि समाधान',
      title: 'भारतीय कृषि के लिए विशेष रूप से विकसित',
      subtitle: 'बिना किसी महंगे सेंसर या मशीन के, सामान्य स्मार्टफोन से खेत की सम्पूर्ण निगरानी और रोग निवारण।'
    }
  }
};
