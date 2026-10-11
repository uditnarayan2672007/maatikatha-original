MaatiKatha
A zero-hardware, voice-first farming assistant that combines ancestral agricultural wisdom with AI predictive modeling to help small-scale farmers prevent crop loss.
🛑 The Problem
Small-scale farmers are suffering devastating crop losses and falling into debt due to unpredictable climate change and a heavy reliance on soil-degrading chemicals. They have lost traditional, climate-resilient farming knowledge. Current agritech solutions are inaccessible because they rely on expensive physical hardware (like IoT soil sensors) and use English-first, text-heavy interfaces that alienate rural users.
Key pain points include:
•	Climate Confusion: Crops destroyed by unseasonal weather due to reliance on traditional calendar dates.
•	High Financial Costs: Debt from buying expensive chemical fertilizers instead of natural remedies.
•	Surprise Outbreaks: Discovering pests only after crops are visibly infected.
•	Language & Tech Barriers: Inability to read complex English menus or type on standard apps.
💡 The Solution
MaatiKatha is a mobile-friendly web application built on the principle of "Zero-Hardware." It relies entirely on voice AI and climate data to act as a multilingual field doctor, a simulator for future decisions, and a historical timeline of soil health. By using simple buttons and voice commands in regional languages (like Bengali or Hindi), farmers receive instant, traditional, and preventative farming advice.
✨ Key Features
•	MaatiKatha Voice Doctor: A giant microphone button that records the farmer’s spoken problem (e.g., "My leaves are yellow"), processes it via AI, and plays back a low-cost, traditional remedy in their native language.
•	"What-If" / Time Machine Slider: An interactive timeline where dragging left shows historical soil degradation (1975–2026), and dragging right simulates farm decisions (e.g., "Add Cow Dung") to view projected yield outcomes.
•	"RituRakhok" Dashboard: A simple weather screen that reads real-time forecasts and outputs three hardcoded, easy-to-understand ancestral action steps (e.g., "Heavy rain in 2 days. Delay sowing.").
🎥 Demo
[Insert Link to Live Demo Video or Hosted App Here]
📸 Screenshots
![MaatiKatha Voice Doctor Interface]([Insert Image Link Here]) Caption: The voice-first interface designed for users with limited digital literacy.
![Time Machine Simulator]([Insert Image Link Here]) Caption: Visualizing historical soil degradation and simulating future decisions.
🛠 Tech Stack
•	Frontend: React (Vite), Tailwind CSS, Lucide React (Icons).
•	Backend: Node.js with Express.js.
•	Database: SQLite / Hybrid MongoDB + Firebase (with fallback to local mockData.json).
•	AI Engine 1 (Voice & Logic): Google Gemini API.
•	AI Engine 2 (Predictive Modeling): xAI Grok API.
•	Weather Service: OpenWeatherMap API.
🏗 Architecture Overview
•	Front-End: A single-page mobile frame with zero-router screen state. Manages tabs via simple React state. Uses the browser's built-in MediaRecorder for audio capture and window.speechSynthesis for native audio playback.
•	Back-End: An Express API bridge orchestrates calls between the frontend and external AI services, protecting API keys from the browser. Uploaded voice files are held temporarily in RAM using multer.memoryStorage().
•	Data Strategy: Leverages pre-seeded records and hardcoded historical data for the MVP to ensure reliability during hackathon presentations.
📂 Project Structure
Plaintext
maatikatha/
│
├── client/                     # Frontend: React + Tailwind CSS (Vite)
│   ├── public/                # Static assets (soil icons, seed logos)
│   ├── src/
│   │   ├── components/
│   │   │   ├── VoiceDoctor.jsx      # Screen 1: Audio record, status card
│   │   │   ├── TimeMachine.jsx      # Screen 2: 1975-2026 slider + simulator
│   │   │   ├── RituRakhok.jsx       # Screen 3: Live weather & action cards
│   │   │   └── BottomNav.jsx        # Accessible mobile navigation tabs
│   │   ├── App.jsx                  # Primary layout & state management
│   │   ├── main.jsx                 # React DOM entrypoint
│   │   └── index.css                # Tailwind directives
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── server/                     # Backend: Node.js + Express
│   ├── data/
│   │   └── mockData.json            # Hardcoded historical climate & yield
│   ├── server.js                    # Express server & API routes
│   ├── .env                         # Private API keys
│   ├── .gitignore                   
│   └── package.json
│
└── README.md
⚙️ Prerequisites
•	Node.js (v18+)
•	npm or yarn
•	API Keys for Google Gemini, xAI Grok, and OpenWeatherMap
💻 Installation
1.	Clone the repository:
Bash
git clone [repository-url]
cd maatikatha
2.	Install frontend dependencies:
Bash
cd client
npm install
3.	Install backend dependencies:
Bash
cd ../server
npm install
🔐 Environment Variables
Create a .env file in the server/ directory and add the following keys:
Code snippet
GEMINI_API_KEY=[Your Google Gemini Key]
GROK_API_KEY=[Your xAI Grok Key]
WEATHER_API_KEY=[Your OpenWeatherMap Key]
(Note: Never prefix these with VITE_ to ensure they are strictly kept on the server.)
▶️ How to Run Frontend
In the client/ directory, start the Vite development server:
Bash
npm run dev
The app will be available at http://localhost:5173.
▶️ How to Run Backend
In the server/ directory, start the Express server:
Bash
node server.js
The server will run on http://localhost:5000.
🗄 Database Setup
For the hackathon MVP, the app uses a provided SQLite schema or falls back to mockData.json.
1.	Ensure your local SQL environment is set up.
2.	Run the provided SQL creation script to generate the regions, historical_climate, remedies_catalog, and community_alerts tables.
3.	The SQL script will automatically seed the initial mock data required for the demo.
📡 API Documentation
1. Voice Doctor API
•	HTTP Method: POST
•	URL: /api/voice
•	Purpose: Transcribes raw audio via Gemini, references the database, and returns a natural remedy.
•	Request Body: multipart/form-data (audio buffer).
•	Example Success Response: 200 OK
JSON
{
  "status": "success",
  "textResponse": "আপনার গাছের পাতা হলুদ হয়ে যাচ্ছে...",
  "remedy_matched": "Cow Dung & Ash Manure"
}
2. Time Machine API
•	HTTP Method: GET
•	URL: /api/history
•	Purpose: Fetches decadal climate data for the timeline slider.
•	Request Parameters: region_id (Optional, Integer).
•	Example Success Response: 200 OK
JSON
{
  "status": "success",
  "region": "Howrah",
  "data": [ { "decade_year": 1980, "avg_temp_c": 28.5, "soil_carbon_pct": 1.80, "yield_impact_pct": 10 } ]
}
3. What-If Simulator API
•	HTTP Method: POST
•	URL: /api/simulate
•	Purpose: Passes a farmer's proposed action to Grok for a projected crop/financial outcome.
•	Request Body: application/json (scenario details).
•	Example Success Response: 200 OK
JSON
{
  "status": "success",
  "projection": { "stress_increase_pct": 40, "yield_variation_pct": -15, "cost_savings_inr": 0, "warning_message": "..." }
}
4. RituRakhok Dashboard API
•	HTTP Method: GET
•	URL: /api/weather
•	Purpose: Fetches real-time weather and local warnings to provide a 3-step action plan.
•	Request Parameters: region_id (Required, Integer).
•	Example Success Response: 200 OK
JSON
{
  "status": "success",
  "weather": { "current_temp": 34.2, "forecast": "Heavy Rain" },
  "active_alerts": [ { "alert_type": "Weather", "message": "..." } ],
  "action_plan": [ "Delay sowing seeds by 2 days." ]
}
🧪 Testing
•	Manual Testing: Ensure both client and server are running. Test the microphone input in a clear environment. Check network tabs for API routing success between port 5173 and 5000.
•	Automated Testing: [Insert Testing Framework/Instructions Here, e.g., Jest]
🚀 Deployment
•	Frontend (Vercel): Connect the GitHub repository, set the root directory to client, and deploy.
•	Backend (Render): Create a Web Service pointing to the server directory and configure the environment variables (GEMINI_API_KEY, GROK_API_KEY, WEATHER_API_KEY).
🔮 Future Improvements
•	Implement offline mode UI caching for field use without internet.
•	Add SMS fallback for pest alerts to assist farmers without smartphones.
•	Integrate live wind-direction tracking for neighboring farms.
•	Expand the historical climate database with real 50-year records.
👥 Team Members
•	Udit Narayan Ganguly - [Group Leader]
•	Trijit Roy  - [Group Member]
•	[Swadhin Saha] - [Group Member]
