# One Word Reader

**Resonance** is a high-speed, "One Word" RSVP (Rapid Serial Visual Presentation) reader designed for focus and accessibility. It allows you to digest books and documents at speeds ranging from 200 to 1000 WPM, with specialized tuning for mobile and desktop interactions.

## 🚀 Live Demo
Available at: [https://one-word-reader-2026.web.app](https://one-word-reader-2026.web.app)

## ✨ Key Features
- **Rapid RSVP Engine**: Smooth delivery of text with calculated Optimal Recognition Point (ORP) highlighting in red.
- **Deadman's Switch (Hold to Read)**: Native-feeling mobile interaction where you hold to read and release to pause, mimicking the desktop spacebar functionality.
- **Support for EPUB & PDF**: Load your own files directly in the browser using localized parsing (`epub.js` and `pdf.js`).
- **Dynamic Theming**: Optimized for iOS/Android with "Light", "Dark", "Sepia", and "Matrix" modes, including status bar synchronization.
- **Auto-Acceleration**: Gradually ramps up to your target WPM to help your brain adjust to higher speeds.
- **Persistence**: Progress and settings are saved locally in your browser (Zustand + localForage).

## 🍏 iOS / Mobile Optimization
- **Safe Area Support**: Respects notches, dynamic islands, and home indicators.
- **PWA Ready**: Add to Home Screen for a native, standalone app experience.
- **Touch-Callout Prevention**: UI prevents accidental system magnifying glass and selection triggers.

## 🛠️ Tech Stack
- **Framework**: React 19 + TypeScript
- **Bundler**: Vite 7
- **Style**: Vanilla CSS (Premium Aesthetics)
- **State Management**: Zustand
- **Animation**: Framer Motion
- **Parsing**: EPUB.js & PDF.js
- **Deployment**: Firebase Hosting

## 📦 Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run developmental server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

## 🛡️ License
MIT License - Copyright (c) 2026

---
*Created with the Antigravity Agentic Framework.*
