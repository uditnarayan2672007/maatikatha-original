1. Recommended Tech Stack
•	Frontend: React (powered by Vite) styled with Tailwind CSS. Vite spins up in seconds, while Tailwind gives you pre-made CSS utility classes (like bg-emerald-600 text-white p-4 rounded-2xl) directly inside your JSX tags without writing custom CSS files.
•	UI Icons: Lucide React (lucide-react) for clean, responsive icons (Microphone, Cloud, Leaf, Gauge).
•	Backend Server: Node.js with Express.js. Acts as the central traffic controller, orchestrating calls between the frontend and external AI services.
•	AI Engine 1 (Multimodal & Voice): Google Gemini API (@google/genai or @google/generative-ai). Gemini natively ingests raw audio files directly, eliminating the need to set up a separate speech-to-text transcription service for regional languages like Bengali and Hindi.
•	AI Engine 2 (Decision & Predictive Modeling): xAI Grok API. Integrated using the OpenAI-compatible Node SDK (baseURL: "[https://api.x.ai/v1](https://api.x.ai/v1)"). Handles the rapid logic calculations for the "What-If" Decision Simulator and climate anomaly recommendations.
•	Weather Service: OpenWeatherMap API for real-time 7-day forecast data.
2. Front-End Architecture
•	Single-Page Mobile Frame: Built as a single-page React app constrained to a mobile viewport (max-w-md mx-auto min-h-screen bg-stone-50 shadow-2xl relative pb-20).
•	Zero-Router Screen State: Manage tabs using simple React state rather than complex client-side routing:
JavaScript
const [currentTab, setCurrentTab] = useState('doctor'); // 'doctor' | 'simulator' | 'riturakhok'
•	Audio Pipeline: Uses the browser's built-in navigator.mediaDevices.getUserMedia and MediaRecorder API. When the farmer taps the microphone, the browser captures the audio as a lightweight .webm or .wav Blob and sends it directly to your Node backend via a FormData POST request.
•	Audio Playback: Uses the browser-native window.speechSynthesis (Web Speech API) or an HTML5 <audio> tag playing the base64 audio string returned by the server.
3. Back-End Architecture
•	Express API Bridge: The Node server hides all private API keys from the browser and exposes clean endpoints to the React frontend.
•	Cross-Origin Resource Sharing (cors): Enables requests between the Vite dev server (http://localhost:5173) and the Express server (http://localhost:5000).
•	Memory-Buffer File Handling (multer): Uses multer.memoryStorage() so uploaded voice files are held temporarily in RAM as buffers, passed directly to Gemini, and discarded without touching physical disk storage.
4. Database Choice (Hybrid: MongoDB + Firebase)
•	MongoDB Atlas (Free Tier): Stores structured farming knowledge and historical data.
o	historical_climate: Decadal records (1975–2026) for rainfall, temperature, and soil organic carbon for the Time-Machine slider.
o	remedies_catalog: Curated ancestral remedies and heritage seeds injected into Gemini/Grok prompts.
•	Firebase (Firestore & Storage): Powers real-time features and audio assets.
o	Firestore: Real-time sync for KhamarDrishti (Pest Radar) alerts—pushes neighborhood warnings instantly without needing custom WebSocket servers.
o	Firebase Storage: Caches recorded .webm audio queries and generated voice responses.
•	Hackathon Strategy: Pre-seed 5–10 records before demo day, and wrap DB calls in a try...catch fallback to local JSON to avoid venue Wi-Fi failures during the pitch.
5. Authentication Approach
•	No Authentication: Completely out of scope. Small-scale farmers face immediate friction with sign-up forms, and judges want to test features instantly. The demo URL loads straight into the Voice Doctor interface.
6. External APIs or Services
•	Google Gemini API: Ingests raw regional audio recordings, transcribes the spoken Bengali/Hindi query, and generates low-cost ancestral farming guidance.
•	xAI Grok API: Evaluates user decisions in the "What-If" simulator against current local weather conditions and outputs projected crop yield and cost savings.
•	OpenWeatherMap API: Returns current temperature, humidity, rainfall probability, and wind metrics for the "RituRakhok" dashboard.
7. AI Model Integration
•	Gemini Setup: Initialize using @google/generative-ai. Send the recorded audio buffer directly inside an inline data part:
JavaScript
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  systemInstruction: "You are MaatiKatha, an ancestral Indian farming elder. Answer the farmer's audio query in their native language (Bengali/Hindi). Prescribe only low-cost, natural, ancestral remedies (such as neem extract, cow dung manure, or wood ash). Keep advice under 3 concise sentences."
});
•	Grok Setup: Initialize using standard openai package configured with the xAI base URL:
JavaScript
import OpenAI from "openai";
const grok = new OpenAI({
  apiKey: process.env.GROK_API_KEY,
  baseURL: "https://api.x.ai/v1"
});
8. Complete Request Flow
Flow A: The Voice Doctor (Gemini API)
1.	User Action: Farmer taps the pulsating microphone button in VoiceDoctor.jsx.
2.	Audio Capture: MediaRecorder buffers the recording into an audio Blob.
3.	Frontend to Backend: React sends the Blob inside a FormData object to POST /api/voice.
4.	Backend to Gemini: Express passes the audio buffer to Gemini 1.5 Flash. Gemini processes the speech and returns text advice in Bengali/Hindi.
5.	Backend to Frontend: Server returns { textResponse: "..." }.
6.	Output: React displays the advice card and uses the browser's native speech synthesis to read the advice out loud in the farmer's language.
Flow B: The "What-If" Decision Simulator (Grok API)
1.	User Action: Farmer selects a scenario on WhatIfSimulator.jsx (e.g., "Skip 2 watering cycles" or "Apply organic compost on Day 10") and adjusts the timeline slider.
2.	Frontend to Backend: React sends POST /api/simulate with { scenarioId, dayOffset }.
3.	Backend to Grok: Node passes the scenario parameters plus current weather context to Grok with a prompt requesting a quick impact forecast.
4.	Grok Output: Grok returns a structured projection: estimated stress percentage, yield variation, and cost savings.
5.	Frontend Rendering: React updates the interactive gauges and displays the projected outcome.
9. Folder Structure
Plaintext
maatikatha/
│
├── client/                     # Frontend: React + Tailwind CSS (Vite)
│   ├── public/                 # Static assets (soil icons, seed logos)
│   ├── src/
│   │   ├── components/
│   │   │   ├── VoiceDoctor.jsx       # Screen 1: Audio record, status card, text display
│   │   │   ├── TimeMachine.jsx       # Screen 2: 1975-2026 slider + Grok simulator
│   │   │   ├── RituRakhok.jsx        # Screen 3: Live weather & 3-step action cards
│   │   │   └── BottomNav.jsx         # Accessible mobile navigation tabs
│   │   ├── App.jsx                   # Primary layout & state management
│   │   ├── main.jsx                  # React DOM entrypoint
│   │   └── index.css                 # Tailwind directives (@tailwind base, etc.)
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── server/                     # Backend: Node.js + Express
│   ├── data/
│   │   └── mockData.json             # Hardcoded historical climate & yield stats
│   ├── server.js                     # Express server & API routes
│   ├── .env                          # Private keys (GEMINI_API_KEY, GROK_API_KEY, etc.)
│   ├── .gitignore                    # Ensures .env and node_modules are ignored
│   └── package.json
│
└── README.md
10. Major Components
•	client/src/components/VoiceDoctor.jsx:
o	Renders a prominent recording button styled via Tailwind: className="w-36 h-36 rounded-full bg-emerald-600 shadow-xl flex items-center justify-center animate-pulse active:scale-95"
o	Tracks state transitions: idle -> recording -> analyzing -> speaking.
o	Displays an easy-to-read advisory card showing the query transcript and ancestral remedy.
•	client/src/components/TimeMachine.jsx:
o	Contains the generational range slider (<input type="range" min="1975" max="2026" />).
o	Displays historic soil metrics (organic carbon dropping from 1.8% to 0.4%) pulling from mockData.json.
o	Houses quick-action scenario buttons that trigger the Grok predictive API.
•	client/src/components/RituRakhok.jsx:
o	Calls GET /api/weather and parses the upcoming 7-day forecast.
o	Renders three color-coded action banners: Sowing Shift (+/- Days), Heritage Seed Selection, and Moisture Locking technique.
•	server/server.js:
o	POST /api/voice: Accepts multipart audio via Multer and calls Gemini.
o	POST /api/simulate: Accepts farm decision scenarios and queries Grok.
o	GET /api/weather: Fetches real-time weather from OpenWeatherMap.
o	GET /api/history: Serves static data from mockData.json.
11. Security Considerations
•	Strict Client-Side Key Exclusion: Never use the VITE_ prefix for AI keys. If an API key is named VITE_GEMINI_API_KEY, Vite bundles it into the client-side JavaScript where any inspector can view it. All API calls to Gemini and Grok must originate from server/server.js.
•	Repository Isolation: Ensure .env is declared in server/.gitignore before any commit to protect billable API credentials.
12. Deployment Architecture
•	Frontend Hosting (Vercel): Connect your GitHub repository, set the Root Directory to client, and deploy. Vercel automatically builds Vite projects.
•	Backend Hosting (Render): Create a new "Web Service" on Render pointing to the server directory. In the Render dashboard, add GEMINI_API_KEY, GROK_API_KEY, and WEATHER_API_KEY under Environment Variables.
•	Local Pitch Fallback: Run both systems locally (npm run dev in client on port 5173, and node server.js in server on port 5000). If hackathon venue Wi-Fi becomes unstable, the demo runs offline or via phone hotspot without cloud latency.
13. Simplifications Made for a Hackathon
•	Direct-to-Gemini Audio: Standard architectures require a separate Whisper audio-to-text pipeline before calling an LLM. Gemini accepts raw audio directly, cutting your backend code by half and eliminating one external service dependency.
•	Hardcoded Anomaly Triggers: Rather than crunching complex mathematical regressions for 50-year soil evaporation, mockData.json returns pre-set values across five benchmark decades (1975, 1985, 1995, 2010, 2026).
•	Browser-Based TTS: Using the browser's built-in Web Speech API (window.speechSynthesis) to speak Gemini's Bengali or Hindi text avoids setting up a paid text-to-speech API or managing audio streaming over HTTP.

