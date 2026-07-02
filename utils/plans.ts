/**
 * Plan Service - Handles plan switching and related operations
 */

import { api } from './api';
import { Plan, UserProfile } from '@/contexts/AuthContext';
import { PLAN_STATUS } from '@/models/data.models';
import { THEMES, ACTIVE_THEME } from '@/constants/theme';

/**
 * Switch to a specific plan and reload user profile
 * @param planId - The ID of the plan to switch to
 * @returns Promise<Plan> - The switched plan data
 */
export const getActivePlans = (profile: UserProfile | null) =>
  (profile?.owned_plans || []).filter(p => p.status === PLAN_STATUS.ACTIVE);

export const hasMultiplePlans = (profile: UserProfile | null): boolean =>
  getActivePlans(profile).length > 1;

export const getCurrentPlanId = (profile: UserProfile | null): string => {
  const currentId = profile?.user?.id_current_plan;
  const active = getActivePlans(profile);
  if (currentId && active.find(p => p.id === currentId)) return String(currentId);
  if (active.length > 0) return String(active[0].id);
  return '0';
};

export const resolvePostLoginRoute = (profile: UserProfile | null) => {
  // Domani Sicuro non mostra mai la UI dei piani: si atterra sempre sulla tab
  // "Documenti caricati" (che a sua volta reindirizza a services/uploads).
  if (THEMES[ACTIVE_THEME].tabLayout === 'documenti-contatti') {
    return { pathname: '/(tabs)/services' as const };
  }

  const activePlans = getActivePlans(profile);
  if (activePlans.length === 1) {
    const plan = activePlans[0];
    return {
      pathname: '/(tabs)/my-plan' as const,
      params: { type: plan.type, planId: plan.id.toString() },
    };
  }
  return { pathname: '/(tabs)/my-plans' as const };
};

export const switchPlan = async (planId: number | string): Promise<Plan> => {
  try {
    console.log('🔄 Switching to plan:', planId);
    
    const response = await api.post('plans-switch', {
      id_plan: planId.toString()
    });

    if (response.result === 'ok' && response.data) {
      console.log('✅ Plan switched successfully:', response.data);
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to switch plan');
    }
  } catch (error) {
    console.error('❌ Error switching plan:', error);
    throw error;
  }
};

/**
 * Format plan type for display
 */
export const formatPlanType = (type: string): string => {
  const typeMap: { [key: string]: string } = {
    'free': 'GRATUITO',
    'simplified': 'BASE',
    'advanced': 'AVANZATO',
    'pet': 'ANIMALI',
    'upgrade': 'UPGRADE'
  };
  
  return typeMap[type.toLowerCase()] || type.toUpperCase();
};

/**
 * Format plan status for display
 */
export const formatPlanStatus = (status: number): string => {
  const statusMap: { [key: number]: string } = {
    100: 'ATTIVO',
    200: 'SOSPESO',
    300: 'ARCHIVIATO'
  };
  
  return statusMap[status] || 'SCONOSCIUTO';
};

/**
 * Format payment status for display
 */
export const formatPaymentStatus = (paymentStatus: string): string => {
  const statusMap: { [key: string]: string } = {
    'paid': 'PAGATO',
    'on_hold': 'IN ATTESA',
    'unpaid': 'NON PAGATO'
  };
  
  return statusMap[paymentStatus] || paymentStatus.toUpperCase();
};

/**
 * Get status color for UI display
 */
export const getStatusColor = (paymentStatus: string, planStatus: number): string => {
  // If plan is not active, show as inactive
  if (planStatus !== 100) {
    return '#999999';
  }
  
  // Based on payment status
  switch (paymentStatus) {
    case 'paid':
      return '#28a745'; // Green
    case 'on_hold':
      return '#ffc107'; // Yellow
    case 'unpaid':
      return '#dc3545'; // Red
    default:
      return '#999999'; // Grey
  }
};

/**
 * Format date for display
 */
export const formatDate = (timestamp: string): string => {
  try {
    const date = new Date(parseInt(timestamp));
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    return 'Data non valida';
  }
};
