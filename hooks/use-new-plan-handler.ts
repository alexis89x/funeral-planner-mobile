import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth, Plan } from '@/contexts/AuthContext';
import { switchPlan } from '@/utils/plans';
import { APP_BASE_URL } from '@/utils/api';

export const useNewPlanHandler = (setIsLoading?: (loading: boolean) => void) => {
  const router = useRouter();
  const { userProfile, reloadProfile } = useAuth();

  const plans = userProfile?.owned_plans || [];
  const currentPlanId = userProfile?.current_plan?.id;

  const goToSearchFlow = () => {
    router.push({
      pathname: '/webview',
      params: {
        url: `${APP_BASE_URL}/public/search-flow?forceMode=mobile&t=${new Date().getTime()}`,
        title: 'Nuova pianificazione',
        injectToken: 'true',
      }
    });
  };

  const goToUpgrade = async (plan: Plan) => {
    setIsLoading?.(true);
    try {
      if (plan.id !== currentPlanId) {
        await switchPlan(plan.id);
        await reloadProfile();
      }
      router.push({
        pathname: '/(tabs)/my-plan',
        params: { type: plan.type, action: 'upgradePlan', forceReload: 'true' }
      });
    } catch (error: any) {
      Alert.alert('Errore', error.message || "Impossibile procedere con l'upgrade");
    } finally {
      setIsLoading?.(false);
    }
  };

  const handleNewPlan = () => {
    if (plans.length > 1) {
      goToSearchFlow();
      return;
    }

    const plan = plans[0];
    if (plan?.type?.toLowerCase() === 'free') {
      Alert.alert(
        'Nuova pianificazione',
        'Cosa vuoi fare?',
        [
          { text: 'Upgrade piano attuale', onPress: () => goToUpgrade(plan) },
          { text: 'Nuova pianificazione', onPress: goToSearchFlow },
          { text: 'Annulla', style: 'cancel' },
        ]
      );
    } else {
      goToSearchFlow();
    }
  };

  return { handleNewPlan };
};
