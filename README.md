# Veyra 🏥

**Health, made clearer.**

Veyra is a full-stack AI-powered health insights platform that helps users understand their medical reports in simple, accessible language. Upload your blood tests, health reports, and audio notes to get intelligent explanations of your results, measurements, and what they mean for your health.

## 📋 Overview

Veyra is a **3-tier microservices architecture**:

1. **Frontend** (Expo/React Native) - Mobile & web UI
2. **Node.js Backend** - API orchestration & AI integration (Groq)
3. **Python Service** - Document & audio processing (OCR, PDF extraction, transcription)

## ✨ Features

- 📄 **Report Upload & Analysis** - Upload PDFs, images, or audio files through an intuitive chat interface
- 🔊 **Audio Transcription** - Record or upload audio notes and get them transcribed automatically
- 🖼️ **OCR & PDF Extraction** - Extract text from scanned reports and multi-page PDFs
- 📊 **Health Dashboard** - View biomarkers, glucose trends, and key measurements in one place
- 🤖 **AI-Powered Insights** - Get plain-language explanations of complex medical terms and results
- 📈 **Trend Tracking** - Track measurements over time with visual charts
- 💬 **Chat History** - Access previous conversations and analyses
- 🔒 **Privacy First** - Your health data is encrypted and never stored without consent
- 🎨 **Clean UI** - Dark mode design optimized for readability and accessibility
- 📱 **Cross-Platform** - Works on iOS, Android, and Web

## 🛠️ Tech Stack

### Frontend (Expo/React Native)
- **Framework**: [Expo 58](https://expo.dev) with React Native 0.88
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction) (file-based)
- **Authentication**: Firebase Auth with AsyncStorage persistence
- **UI**: Custom React Native components with StyleSheet
- **Icons**: [@expo/vector-icons](https://icons.expo.fyi) (Feather)
- **Type Safety**: TypeScript
- **Code Quality**: ESLint

### Node.js Backend
- **Runtime**: Node.js 18+
- **Framework**: Express (or similar)
- **AI**: [Groq SDK](https://console.groq.com) for LLM-powered analysis
- **DB**: Firebase Firestore (user data, analysis results)
- **Dev Tools**: Nodemon for hot-reload
- **Port**: 3001 (default)

### Python Processing Service
- **Runtime**: Python 3.9+
- **Framework**: [FastAPI](https://fastapi.tiangolo.com)
- **OCR**: Tesseract + pytesseract
- **PDF**: PyMuPDF (pymupdf)
- **Audio**: Faster-Whisper (speech-to-text)
- **Image**: Pillow (PIL)
- **Port**: 8000 (default)

## 📦 Prerequisites

**System Requirements:**
- Node.js 18+ (for frontend & backend)
- Python 3.9+ (for Python service)
- pip or conda (Python package manager)
- Tesseract-OCR (Windows: [download](https://github.com/UB-Mannheim/tesseract/wiki), macOS: `brew install tesseract`)

**API Keys:**
- Firebase project credentials
- Groq API key (from [console.groq.com](https://console.groq.com))

## 🚀 Getting Started

### 1. Clone & Install Frontend Dependencies

```bash
git clone <repo-url>
cd veyra
npm install
```

### 2. Set Up Frontend Environment

```bash
cp .env.example .env
```

Fill in `.env` with your credentials:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:3001
```

### 3. Set Up Node.js Backend

```bash
cd veyra-backend
npm install
cp .env.example .env
```

Fill in `veyra-backend/.env`:
```env
GROQ_API_KEY=your_groq_api_key
PORT=3001
```

### 4. Set Up Python Processing Service

```bash
cd veyra-python
python -m venv .venv313
source .venv313/bin/activate  # Windows: .venv313\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

Fill in `veyra-python/.env`:
```env
PORT=8000
TESSERACT_PATH=/usr/bin/tesseract  # or C:\Program Files\Tesseract-OCR\tesseract.exe on Windows
```

### 5. Start All Services

**Terminal 1 - Frontend:**
```bash
npm start
# Select: a (Android), i (iOS), w (Web), or scan QR for Expo Go
```

**Terminal 2 - Node.js Backend:**
```bash
cd veyra-backend
nodemon server.js
# Runs on http://localhost:3001
```

**Terminal 3 - Python Service:**
```bash
cd veyra-python
source .venv313/bin/activate  # Activate virtual environment
uvicorn main:app --reload --port 8000
# Runs on http://localhost:8000
```

## 📁 Project Structure

```
veyra/
├── src/                          # Frontend (Expo/React Native)
│   ├── app/
│   │   ├── (tabs)/               # Tabbed navigation
│   │   │   ├── index.tsx         # Chat & report upload
│   │   │   ├── analysis.tsx      # Report breakdown & insights
│   │   │   └── profile.tsx       # User account settings
│   │   ├── history.tsx           # Chat history (modal)
│   │   ├── login/
│   │   ├── signup/
│   │   ├── forgot-password.tsx
│   │   └── _layout.tsx           # Root navigation
│   ├── components/               # Reusable React components
│   ├── lib/                      # Utilities (Firebase, auth, etc.)
│   └── assets/                   # Icons & images
│
├── veyra-backend/                # Node.js API Server
│   ├── server.js                 # Express app entry point
│   ├── routes/                   # API endpoints
│   ├── middleware/               # Auth, CORS, etc.
│   ├── services/                 # Business logic
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
├── veyra-python/                 # Python Processing Service
│   ├── main.py                   # FastAPI app entry point
│   ├── routers/                  # Endpoints (extract, transcribe)
│   ├── services/                 # Processing logic
│   ├── requirements.txt          # Python dependencies
│   ├── .env.example
│   └── .venv/                    # Virtual environment (local)
│
├── .env.example                  # Frontend env template
├── .gitignore                    # Git ignore rules (all services)
├── package.json
├── app.json                      # Expo config
├── tsconfig.json
└── README.md                     # This file
```

## 📱 Key Screens

### Chat Screen
Upload reports, images, or audio. Get instant AI-powered analysis and explanations.

### Analysis Screen
Detailed breakdown of biomarkers, reference ranges, trends, and health insights.

### History Screen (Modal)
Access previous conversations and re-open earlier analyses.

### Profile Screen
Manage account, view health data, and configure app settings.

## 🔌 API Architecture

### Frontend → Backend Flow
```
Mobile/Web → Expo Router
    ↓
Node.js Backend (3001)
    ├─ Validate request & auth
    ├─ Send file to Python Service (8000)
    ├─ Call Groq AI for analysis
    └─ Save results to Firebase
    ↓
Return analysis to frontend
```

### Backend Endpoints

**POST** `/api/analyze-report`
```json
{
  "userId": "firebase-user-id",
  "fileUrl": "s3://path-to-file.pdf",
  "fileType": "pdf|image|audio"
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "biomarkers": [...],
    "summary": "...",
    "insights": [...],
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Python Service Endpoints

**POST** `/api/extract` - Extract text from PDFs & images
```
Form-data: file (PDF or image)
```

**POST** `/api/transcribe` - Convert audio to text
```
Form-data: file (WAV, MP3, M4A, etc.)
```

**GET** `/api/health` - Service health check

## 🔐 Environment Configuration

| Service | File | Required Variables |
|---------|------|-------------------|
| Frontend | `.env` | Firebase keys, `EXPO_PUBLIC_API_URL` |
| Backend | `veyra-backend/.env` | `GROQ_API_KEY`, `PORT` |
| Python | `veyra-python/.env` | `PORT`, `TESSERACT_PATH` |

**⚠️ Never commit `.env` files!** Use `.env.example` templates instead.

## 🧪 Development

### Hot Reload
- Frontend: Edit `src/app` or `src/components` → auto-refresh
- Backend: Changes auto-restart via Nodemon
- Python: Changes auto-reload via Uvicorn

### TypeScript
- Strict mode enabled
- Type checking on save in your IDE

### Linting
```bash
npm run lint  # Frontend
```

### Testing
```bash
npm run test  # When test suite is set up
```

## 📦 Build & Deployment

### Web
```bash
npm run web
```

### Mobile (EAS Build)
```bash
npm install -g eas-cli
eas build --platform ios   # or android
```

### Python Service (Docker)
```bash
docker build -t veyra-python .
docker run -p 8000:8000 veyra-python
```

## ❓ Troubleshooting

### Frontend

**Port already in use**
```bash
# Find and kill process on port 3001, 8000, etc.
lsof -i :3001  # macOS/Linux
netstat -ano | findstr :3001  # Windows
```

**Expo won't connect**
```bash
expo start -c  # Clear cache
npm install -g expo@latest  # Update CLI
```

**Firebase not initializing**
- Verify all keys in `.env` are correct
- Check Firebase project is active
- Ensure CORS is allowed in Firebase settings

### Backend

**Groq API errors**
- Verify API key in `veyra-backend/.env`
- Check Groq quota at [console.groq.com](https://console.groq.com)
- Rate limiting? Try again in a moment

**Port 3001 in use**
```bash
lsof -i :3001  # Find process
kill -9 <PID>  # Kill it
# Or change PORT in .env
```

### Python Service

**Tesseract not found**
```bash
# Windows: Install from https://github.com/UB-Mannheim/tesseract/wiki
# macOS: brew install tesseract
# Linux: sudo apt-get install tesseract-ocr
# Then update TESSERACT_PATH in .env
```

**Port 8000 in use**
```bash
# Change PORT in veyra-python/.env or:
uvicorn main:app --port 9000
```

**Virtual environment issues**
```bash
cd veyra-python
rm -rf .venv313  # Delete old env
python -m venv .venv313  # Create new
source .venv313/bin/activate  # Activate
pip install -r requirements.txt  # Reinstall
```

## 🤝 Contributing

1. Create a branch: `git checkout -b feature/your-feature`
2. Make changes in your feature branch
3. Test thoroughly (frontend, backend, Python service)
4. Run linting: `npm run lint`
5. Commit with clear messages: `git commit -m "feat: description"`
6. Push: `git push origin feature/your-feature`
7. Open a pull request

## 📄 License

See [LICENSE](./LICENSE) file.

## 📚 Resources

- [Expo Docs](https://docs.expo.dev)
- [React Native](https://reactnative.dev)
- [Firebase](https://firebase.google.com/docs)
- [Groq Console](https://console.groq.com)
- [FastAPI](https://fastapi.tiangolo.com)
- [Tesseract OCR](https://github.com/UB-Mannheim/tesseract/wiki)
- [Whisper (Speech Recognition)](https://openai.com/research/whisper)

## ⚖️ Legal & Compliance

- **Medical Disclaimer**: Veyra is for informational purposes only. It is not a substitute for professional medical advice. Always consult a healthcare professional.
- **Privacy**: We take health data privacy seriously. Ensure HIPAA/GDPR compliance in production.
- **Data Security**: Use HTTPS in production. Encrypt sensitive data at rest and in transit.

## 💬 Support & Feedback

Have questions or found a bug? Open an issue on GitHub or contact the team.

---

**Stay healthy, stay informed.** 💚

---

*Last updated: October 2026*
