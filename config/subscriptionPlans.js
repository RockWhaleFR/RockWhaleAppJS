// config/subscriptionPlans.js
export const SUBSCRIPTION_PLANS = {
  FREE: {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    features: {
      maxHabits: 5,
      historyDays: 7,
      hasAdvancedStats: false,
      hasExport: false,
      hasPersonalizedSuggestions: false,
      hasExpertContent: false,
      hasEnterpriseFeatures: false,
      maxNotifications: 1
    }
  },
  FREEMIUM: {
    id: 'freemium',
    name: 'Freemium',
    price: 9.99,
    features: {
      maxHabits: Infinity,
      historyDays: 90,
      hasAdvancedStats: true,
      hasExport: true,
      hasPersonalizedSuggestions: true,
      hasExpertContent: false,
      hasEnterpriseFeatures: false,
      maxNotifications: 3
    }
  },
  PREMIUM: {
    id: 'premium',
    name: 'Premium',
    price: 24.99,
    features: {
      maxHabits: Infinity,
      historyDays: 365,
      hasAdvancedStats: true,
      hasExport: true,
      hasPersonalizedSuggestions: true,
      hasExpertContent: true,
      hasEnterpriseFeatures: false,
      maxNotifications: Infinity
    }
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 49.00,
    features: {
      maxHabits: Infinity,
      historyDays: Infinity,
      hasAdvancedStats: true,
      hasExport: true,
      hasPersonalizedSuggestions: true,
      hasExpertContent: true,
      hasEnterpriseFeatures: true,
      maxNotifications: Infinity
    }
  }
};

export const getPlanById = (planId) => 
  Object.values(SUBSCRIPTION_PLANS).find(plan => plan.id === planId) || SUBSCRIPTION_PLANS.FREE;