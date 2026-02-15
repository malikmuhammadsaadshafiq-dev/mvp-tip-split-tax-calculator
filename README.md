<div align="center">

# Tip Split & Tax Calculator

**Split restaurant bills accurately by item with automatic tax and tip calculations per person.**

![React Native](https://img.shields.io/badge/React%20Native-333?style=flat-square) ![AsyncStorage](https://img.shields.io/badge/AsyncStorage-333?style=flat-square) ![react-native-qrcode-svg](https://img.shields.io/badge/react--native--qrcode--svg-333?style=flat-square)
![Utility Tool](https://img.shields.io/badge/Utility-Tool-success?style=flat-square)
![Type](https://img.shields.io/badge/Type-Mobile%20App-blue?style=flat-square)
![Tests](https://img.shields.io/badge/Tests-11%2F14-brightgreen?style=flat-square)

</div>

---

## Problem

Manually calculating individual shares after adding tax and tip causes math errors, awkward money exchanges, and delays when dining with groups.

## Who Is This For?

Young professionals, students, and groups who frequently dine out together


## Inspiration

Built based on trending product categories and market analysis of high-demand utility tools.


## Features

- **Drag-and-drop items to specific diners with visual split indicators and running totals**
- **Generate QR code payment requests with exact amounts per person including rounding options**

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| React Native | Core dependency |
| AsyncStorage | Core dependency |
| react-native-qrcode-svg | Core dependency |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
- Expo Go app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

### Installation

1. Clone the repository
```bash
git clone https://github.com/malikmuhammadsaadshafiq-dev/mvp-tip-split-tax-calculator.git
cd mvp-tip-split-tax-calculator
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npx expo start
```

4. Scan the QR code with Expo Go (Android) or Camera app (iOS)

## Usage Guide

### Core Workflows

**1. Drag-and-drop items to specific diners with visual split indicators and running totals**
   - Navigate to the relevant section in the app
   - Follow the on-screen prompts to complete the action
   - Results are displayed in real-time

**2. Generate QR code payment requests with exact amounts per person including rounding options**
   - Navigate to the relevant section in the app
   - Follow the on-screen prompts to complete the action
   - Results are displayed in real-time


## Quality Assurance

| Test | Status |
|------|--------|
| Has state management | ✅ Pass |
| Has form/input handling | ✅ Pass |
| Has click handlers (2+) | ⚠️ Needs attention |
| Has demo data | ✅ Pass |
| Has loading states | ✅ Pass |
| Has user feedback | ✅ Pass |
| No placeholder text | ✅ Pass |
| Has CRUD operations | ✅ Pass |
| Has empty states | ✅ Pass |
| Has responsive layout | ✅ Pass |
| Has search/filter | ⚠️ Needs attention |
| Has tab navigation | ⚠️ Needs attention |
| Has data persistence | ✅ Pass |
| No dead links | ✅ Pass |

**Overall Score: 11/14**

## Project Structure

```
├── App.tsx                # Entry point
├── app.json              # Expo configuration
├── package.json          # Dependencies
├── assets/               # Images & fonts
└── src/
    ├── components/       # Reusable UI components
    ├── screens/          # App screens
    └── utils/            # Helper functions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License — use freely for personal and commercial projects.

---

<div align="center">

**Built autonomously by [NeuraFinity MVP Factory](https://github.com/malikmuhammadsaadshafiq-dev/NeuraFinity)** — an AI-powered system that discovers real user needs and ships working software.

</div>
