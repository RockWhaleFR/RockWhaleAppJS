// hooks/useSubscription.js
import { useUserStore } from '../store/useUserStore';
import { SUBSCRIPTION_PLANS, getPlanById } from '../config/subscriptionPlans';

export const useSubscription = () => {
  const { user } = useUserStore();
  
  const currentPlan = getPlanById(user?.subscriptionPlan || 'free');
  
  const hasFeature = (feature) => {
    return currentPlan.features[feature] === true;
  };

  const getLimit = (limit) => {
    return currentPlan.features[limit] || 0;
  };

  const canAccessHabit = (habitId) => {
    const freeHabitIds = [1, 2, 3, 4, 5];
    if (freeHabitIds.includes(habitId)) return true;
    if (currentPlan.id !== 'free') return true;
    return false;
  };

  const isEligibleForTrial = () => {
    return !user?.usedFreeTrial && currentPlan.id === 'free';
  };

  return {
    currentPlan,
    hasFeature,
    getLimit,
    canAccessHabit,
    isEligibleForTrial,
    isFree: currentPlan.id === 'free',
    isFreemium: currentPlan.id === 'freemium',
    isPremium: currentPlan.id === 'premium',
    isEnterprise: currentPlan.id === 'enterprise'
  };
};