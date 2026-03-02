/**
 * Firebase Analytics wrapper
 * Tracks user events, page views, and conversions
 */

import { logEvent, setUserId, setUserProperties } from 'firebase/analytics';
import { getFirebaseAnalytics } from './config';

/**
 * Log a custom event to Firebase Analytics
 */
export function trackEvent(eventName: string, params?: Record<string, any>): void {
  const analytics = getFirebaseAnalytics();
  if (!analytics) {
    console.debug('[Analytics] Skipped:', eventName, params);
    return;
  }

  try {
    logEvent(analytics, eventName, params);
    console.debug('[Analytics] Event logged:', eventName, params);
  } catch (err) {
    console.error('[Analytics] Failed to log event:', err);
  }
}

/**
 * Log page view event
 */
export function trackPageView(pagePath: string, pageTitle?: string): void {
  trackEvent('page_view', {
    page_path: pagePath,
    page_title: pageTitle || document.title,
    page_location: window.location.href,
  });
}

/**
 * Log user login event
 */
export function trackLogin(method: string): void {
  trackEvent('login', { method });
}

/**
 * Log user signup event
 */
export function trackSignup(method: string): void {
  trackEvent('sign_up', { method });
}

/**
 * Log project creation event
 */
export function trackProjectCreated(projectId: string): void {
  trackEvent('project_created', { project_id: projectId });
}

/**
 * Log task completion event
 */
export function trackTaskCompleted(taskId: string, projectId: string): void {
  trackEvent('task_completed', {
    task_id: taskId,
    project_id: projectId,
  });
}

/**
 * Log chat message sent event
 */
export function trackChatMessage(messageLength: number, hasAttachments: boolean): void {
  trackEvent('chat_message_sent', {
    message_length: messageLength,
    has_attachments: hasAttachments,
  });
}

/**
 * Log AI agent invoked event
 */
export function trackAgentInvoked(agentType: string): void {
  trackEvent('agent_invoked', { agent_type: agentType });
}

/**
 * Log error event
 */
export function trackError(errorMessage: string, errorCode?: string): void {
  trackEvent('error_occurred', {
    error_message: errorMessage,
    error_code: errorCode,
  });
}

/**
 * Set user ID for analytics
 */
export function setAnalyticsUserId(userId: string | null): void {
  const analytics = getFirebaseAnalytics();
  if (!analytics) {
    return;
  }

  try {
    setUserId(analytics, userId);
    console.debug('[Analytics] User ID set:', userId);
  } catch (err) {
    console.error('[Analytics] Failed to set user ID:', err);
  }
}

/**
 * Set user properties for analytics
 */
export function setAnalyticsUserProperties(properties: Record<string, any>): void {
  const analytics = getFirebaseAnalytics();
  if (!analytics) {
    return;
  }

  try {
    setUserProperties(analytics, properties);
    console.debug('[Analytics] User properties set:', properties);
  } catch (err) {
    console.error('[Analytics] Failed to set user properties:', err);
  }
}

/**
 * Track search query
 */
export function trackSearch(searchTerm: string, resultCount: number): void {
  trackEvent('search', {
    search_term: searchTerm,
    result_count: resultCount,
  });
}

/**
 * Track settings changed
 */
export function trackSettingsChanged(settingName: string, settingValue: any): void {
  trackEvent('settings_changed', {
    setting_name: settingName,
    setting_value: String(settingValue),
  });
}
