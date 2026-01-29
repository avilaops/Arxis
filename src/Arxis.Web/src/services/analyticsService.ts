import axios from 'axios';
import env from '../config/env';

const buildApiBaseUrl = (): string => {
  const base = env.apiUrl.trim();
  if (!base) {
    return '/api';
  }

  const sanitized = base.replace(/\/$/, '');
  return sanitized.endsWith('/api') ? sanitized : `${sanitized}/api`;
};

const API_BASE_URL = buildApiBaseUrl();

interface AnalyticsEvent {
  userId?: string;
  properties?: Record<string, string>;
}

interface PlanInterest extends AnalyticsEvent {
  planName: string;
  planPrice: number;
}

interface UpgradeIntent extends AnalyticsEvent {
  userId: string;
  fromPlan: string;
  toPlan: string;
}

interface CheckoutEvent extends AnalyticsEvent {
  userId: string;
  planName: string;
  amount: number;
}

interface CheckoutCompleted extends CheckoutEvent {
  paymentMethod: string;
}

interface CheckoutAbandoned extends CheckoutEvent {
  reason: string;
}

interface FeatureUsed extends AnalyticsEvent {
  userId: string;
  featureName: string;
}

interface FunnelStep extends AnalyticsEvent {
  funnelName: string;
  stepName: string;
}

class AnalyticsService {
  private userId: string | null = null;

  /**
   * Set current user ID for tracking
   */
  setUser(userId: string) {
    this.userId = userId;
    this.trackEvent('UserIdentified', { userId });
  }

  /**
   * Clear user session
   */
  clearUser() {
    this.userId = null;
  }

  /**
   * Track generic event
   */
  private trackEvent(eventName: string, properties: Record<string, any>) {
    // Send to backend
    this.sendToBackend(eventName, properties);

    // Send to Microsoft Clarity (if available)
    if (window.clarity) {
      window.clarity('event', eventName, properties);
    }

    // Console log in development
    if (import.meta.env.DEV) {
      console.log(`📊 Analytics: ${eventName}`, properties);
    }
  }

  private async sendToBackend(_eventName: string, _properties: Record<string, any>) {
    try {
      // Don't send if no specific endpoint needed
      if (_eventName === 'UserIdentified') return;

      // Map event names to endpoints if needed
      // Most events are handled through specific methods below
    } catch (error) {
      console.error('Failed to send analytics:', error);
    }
  }

  /**
   * Track page view
   */
  trackPageView(pageName: string, properties?: Record<string, string>) {
    this.trackEvent('PageView', {
      pageName,
      userId: this.userId,
      timestamp: new Date().toISOString(),
      ...properties
    });
  }

  /**
   * Track when user views pricing or a specific plan
   */
  async trackPlanInterest(planName: string, planPrice: number) {
    const data: PlanInterest = { planName, planPrice, userId: this.userId || undefined };
    this.trackEvent('PlanInterest', {
      userId: this.userId,
      planName,
      planPrice: planPrice.toString()
    });

    try {
      await axios.post(`${API_BASE_URL}/api/analytics/plan-interest`, {
        userId: this.userId || 'anonymous',
        planName,
        planPrice
      });
    } catch (error) {
      console.error('Failed to track plan interest:', error);
    }
  }

  /**
   * Track upgrade intent
   */
  async trackUpgradeIntent(fromPlan: string, toPlan: string) {
    if (!this.userId) return;

    const data: UpgradeIntent = { userId: this.userId, fromPlan, toPlan };
    this.trackEvent('UpgradeIntent', {
      userId: this.userId,
      fromPlan,
      toPlan
    });

    try {
      await axios.post(`${API_BASE_URL}/api/analytics/upgrade-intent`, {
        userId: this.userId,
        fromPlan,
        toPlan
      });
    } catch (error) {
      console.error('Failed to track upgrade intent:', error);
    }
  }

  /**
   * Track when user starts checkout
   */
  async trackCheckoutStarted(planName: string, amount: number) {
    if (!this.userId) return;

    this.trackEvent('CheckoutStarted', {
      userId: this.userId,
      planName,
      amount: amount.toString()
    });

    try {
      await axios.post(`${API_BASE_URL}/api/analytics/checkout-started`, {
        userId: this.userId,
        planName,
        amount
      });
    } catch (error) {
      console.error('Failed to track checkout started:', error);
    }
  }

  /**
   * Track successful purchase
   */
  async trackCheckoutCompleted(planName: string, amount: number, paymentMethod: string) {
    if (!this.userId) return;

    const data: CheckoutCompleted = { userId: this.userId, planName, amount, paymentMethod };
    this.trackEvent('CheckoutCompleted', {
      userId: this.userId,
      planName,
      amount: amount.toString(),
      paymentMethod
    });

    try {
      await axios.post(`${API_BASE_URL}/api/analytics/checkout-completed`, {
        userId: this.userId,
        planName,
        amount,
        paymentMethod
      });
    } catch (error) {
      console.error('Failed to track checkout completed:', error);
    }
  }

  /**
   * Track abandoned checkout
   */
  async trackCheckoutAbandoned(planName: string, amount: number, reason: string) {
    if (!this.userId) return;

    const data: CheckoutAbandoned = { userId: this.userId, planName, amount, reason };
    this.trackEvent('CheckoutAbandoned', {
      userId: this.userId,
      planName,
      amount: amount.toString(),
      reason
    });

    try {
      await axios.post(`${API_BASE_URL}/api/analytics/checkout-abandoned`, {
        userId: this.userId,
        planName,
        amount,
        reason
      });
    } catch (error) {
      console.error('Failed to track checkout abandoned:', error);
    }
  }

  /**
   * Track feature usage
   */
  async trackFeatureUsed(featureName: string, properties?: Record<string, string>) {
    if (!this.userId) return;

    const data: FeatureUsed = { userId: this.userId, featureName, properties };
    this.trackEvent('FeatureUsed', {
      userId: this.userId,
      featureName,
      ...properties
    });

    try {
      await axios.post(`${API_BASE_URL}/api/analytics/feature-used`, {
        userId: this.userId,
        featureName,
        properties
      });
    } catch (error) {
      console.error('Failed to track feature used:', error);
    }
  }

  /**
   * Track conversion funnel steps
   */
  async trackFunnelStep(funnelName: string, stepName: string, properties?: Record<string, string>) {
    const data: FunnelStep = { funnelName, stepName, userId: this.userId || undefined, properties };
    this.trackEvent('FunnelStep', {
      userId: this.userId,
      funnelName,
      stepName,
      ...properties
    });

    try {
      await axios.post(`${API_BASE_URL}/api/analytics/funnel-step`, {
        userId: this.userId || 'anonymous',
        funnelName,
        stepName,
        properties
      });
    } catch (error) {
      console.error('Failed to track funnel step:', error);
    }
  }

  /**
   * Track button clicks
   */
  trackButtonClick(buttonName: string, location: string) {
    this.trackEvent('ButtonClick', {
      userId: this.userId,
      buttonName,
      location
    });
  }

  /**
   * Track form submissions
   */
  trackFormSubmission(formName: string, success: boolean) {
    this.trackEvent('FormSubmission', {
      userId: this.userId,
      formName,
      success: success.toString()
    });
  }

  /**
   * Track errors
   */
  trackError(errorMessage: string, errorStack?: string, context?: Record<string, any>) {
    this.trackEvent('Error', {
      userId: this.userId,
      errorMessage,
      errorStack: errorStack || '',
      ...context
    });
  }
}

// Singleton instance
const analytics = new AnalyticsService();

export default analytics;

// Type augmentation for window.clarity
declare global {
  interface Window {
    clarity?: (command: string, ...args: any[]) => void;
  }
}
