// Dynamic Expo config using environment variables
// Ensure you provide GOOGLE_MAPS_API_KEY in a local .env (not committed)
const dotenv = require('dotenv');
dotenv.config();

const GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY || '';

module.exports = ({ config }) => ({
  expo: {
    name: 'LugaresPereiraApp',
    slug: 'LugaresPereiraApp',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      config: GOOGLE_KEY ? { googleMapsApiKey: GOOGLE_KEY } : {},
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      config: GOOGLE_KEY ? { googleMaps: { apiKey: GOOGLE_KEY } } : {},
    },
    web: {
      favicon: './assets/favicon.png',
    },
    extra: {
      googleMapsApiKey: GOOGLE_KEY,
    },
  },
});