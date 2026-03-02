/**
 * Firebase integration for Orchestra MCP
 * Exports all Firebase services
 */

export {
  initializeFirebase,
  getFirebaseApp,
  getFirebaseAnalytics,
  getFirebaseMessaging,
  isFirebaseInitialized,
  firebaseConfig,
} from './config';

export {
  trackEvent,
  trackPageView,
  trackLogin,
  trackSignup,
  trackProjectCreated,
  trackTaskCompleted,
  trackChatMessage,
  trackAgentInvoked,
  trackError,
  trackSearch,
  trackSettingsChanged,
  setAnalyticsUserId,
  setAnalyticsUserProperties,
} from './analytics';

export {
  requestNotificationPermission,
  listenForMessages,
  showNotification,
  handlePushNotification,
} from './messaging';
