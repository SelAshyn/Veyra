# Veyra 🏥

**Health, made clearer.**

Veyra is an AI-powered health insights application that helps users understand their medical reports in simple, accessible language. Upload your blood tests and health reports, and get intelligent explanations of your results, measurements, and what they mean for your health.

## Features

- 📄 **Report Upload & Analysis** - Upload health reports and blood test results through an intuitive chat interface
- 📊 **Health Dashboard** - View your biomarkers, glucose trends, and key measurements in one place
- 🤖 **AI-Powered Insights** - Get plain-language explanations of complex medical terms and results
- 📈 **Trend Tracking** - Track measurements over time with visual charts
- 🔒 **Privacy First** - Your health information is secure and never stored without consent
- 🎨 **Clean UI** - Dark mode design optimized for readability and accessibility
- 📱 **Cross-Platform** - Works on iOS, Android, and Web (via Expo)

## Tech Stack

- **Framework**: [Expo](https://expo.dev) with [React Native](https://reactnative.dev)
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction) (file-based routing)
- **Authentication**: Firebase Auth with persistent sessions
- **Database**: Firebase
- **UI Components**: React Native with custom styling
- **Icons**: [@expo/vector-icons](https://icons.expo.fyi) (Feather)
- **Fonts**: Inter (via @expo-google-fonts)
- **Language**: TypeScript
- **Linting**: ESLint

## Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- Expo CLI (installed via npm)
- Firebase project configuration (see `.env.example`)

## Getting Started

### 1. Clone & Install

```bash
git clone <repo-url>
cd veyra
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your Firebase credentials:

```bash
cp .env.example .env
```

Required variables:
```
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Start Development

```bash
npm start
```

The output will display options to run on:
- **Android Emulator**: Press `a`
- **iOS Simulator**: Press `i` (macOS only)
- **Web**: Press `w`
- **Expo Go App**: Scan the QR code with the Expo Go mobile app

## Project Structure

```
src/
├── app/                          # App screens (file-based routing)
│   ├── (tabs)/                   # Tabbed interface
│   │   ├── index.tsx             # Home/Chat screen
│   │   ├── analysis.tsx          # Health analysis & report breakdown
│   │   ├── history.tsx           # Report history
│   │   ├── profile.tsx           # User profile & settings
│   │   └── _layout.tsx           # Tab navigation layout
│   ├── login/
│   │   └── index.tsx             # Login screen
│   ├── signup/
│   │   └── index.tsx             # Sign up screen
│   ├── forgot-password.tsx       # Password recovery
│   ├── index.tsx                 # Welcome/landing screen
│   └── _layout.tsx               # Root layout
├── components/                   # Reusable components
│   ├── Button.tsx                # Custom button component
│   └── FeatureCard.tsx           # Feature showcase card
└── lib/                          # Utilities & configuration
    ├── firebase.ts               # Firebase initialization
    └── auth.ts                   # Authentication helpers
```

## Available Scripts

```bash
npm start          # Start Expo dev server
npm run android    # Start Android emulator
npm run ios        # Start iOS simulator (macOS)
npm run web        # Start web version
npm run lint       # Run ESLint
npm run reset-project  # Reset to blank project
```

## Key Screens

### 🏠 Home Screen (Chat)
Upload and analyze health reports. Chat with AI to get explanations of your health data.

### 📊 Analysis Screen
Detailed breakdown of biomarkers, measurements, and trends from uploaded reports. Displays:
- Blood glucose trends
- Cholesterol and hemoglobin levels
- Vitamin measurements
- Out-of-range values
- Plain-language explanations

### 📜 History Screen
View previous reports and analyses.

### 👤 Profile Screen
Manage user account and health information.

## Authentication

Uses Firebase Authentication with persistent sessions:
- Email/password signup and login
- Password reset flow
- Session persisted to AsyncStorage
- Secure credential handling

## Important Notes

- **Medical Disclaimer**: This app is for informational purposes only and not a substitute for professional medical advice. Always consult a healthcare professional.
- **Privacy**: Health data is sensitive. Ensure proper HIPAA/GDPR compliance and secure data handling practices.
- **Report Data**: The analysis screen shows placeholder states until actual report data is available. Never populate with invented patient results.

## Development Tips

- **Hot Reload**: Edit files in `src/app` and `src/components` for fast refresh
- **TypeScript**: Strict typing is enabled; check types with your editor
- **Styling**: Uses React Native StyleSheet for cross-platform consistency
- **Icons**: Browse available icons at [icons.expo.fyi](https://icons.expo.fyi)

## Testing & Debugging

- Use Expo DevTools in development (accessible via QR code in terminal)
- Run ESLint to catch code issues: `npm run lint`
- Test on real devices by building with Expo Go or EAS Build

## Deployment

### Web
```bash
npm run web
```

### Mobile (via EAS Build)
```bash
npm install -g eas-cli
eas build --platform ios  # or android
```

See [Expo Deployment Guide](https://docs.expo.dev/deploy/build-project/) for details.

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes and test thoroughly
3. Run linting: `npm run lint`
4. Commit with clear messages
5. Push and create a pull request

## License

See LICENSE file for details.

## Resources

- [Expo Documentation](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)
- [Firebase Docs](https://firebase.google.com/docs)
- [Expo Router Guide](https://docs.expo.dev/router/introduction)

## Support

For issues, questions, or contributions, please open an issue or contact the development team.

---

**Stay healthy, stay informed.** 💚
