import React, { useState } from 'react';
import { 
  ScrollView, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { BaseColors } from '@/constants/theme';
import { useAuth, Plan } from '@/contexts/AuthContext';
import { switchPlan, formatPlanType, formatPaymentStatus, formatDate, getStatusColor } from '@/utils/plans';
import { APP_BASE_URL } from '@/utils/api';

export default function MyPlansScreen() {
  const { userProfile, reloadProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

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
    setIsLoading(true);
    try {
      if (plan.id !== currentPlanId) {
        await switchPlan(plan.id);
        await reloadProfile();
      }
      router.push({
        pathname: '/webview',
        params: {
          url: `${APP_BASE_URL}/plan/upgrade/${plan.id}?forceMode=mobile&standalone=true&t=${new Date().getTime()}`,
          title: 'Upgrade piano',
          injectToken: 'true',
        }
      });
    } catch (error: any) {
      Alert.alert('Errore', error.message || 'Impossibile procedere con l\'upgrade');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewPlan = () => {
    if (plans.length > 1) {
      goToSearchFlow();
      return;
    }

    // Single plan. TODO EVENTUALLY BE ABLE TO SHOW AN UPGRADE.
    /*const plan = plans[0];
    if (plan?.type?.toLowerCase() === 'free') {
      Alert.alert(
        'Nuova pianificazione',
        'Cosa vuoi fare?',
        [
          {
            text: 'Upgrade piano attuale',
            onPress: () => goToUpgrade(plan),
          },
          {
            text: 'Nuova pianificazione',
            onPress: goToSearchFlow,
          },
          { text: 'Annulla', style: 'cancel' },
        ]
      );
    } else {
      goToSearchFlow();
    }*/
    goToSearchFlow();
  };

  const plans = userProfile?.owned_plans || [];
  const currentPlanId = userProfile?.current_plan?.id;

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await reloadProfile();
    } catch (error) {
      console.error('Error refreshing plans:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handlePlanPress = async (plan: Plan) => {
    if (plan.id === currentPlanId) {
      // Plan already selected, go to plan details
      router.push({
        pathname: '/(tabs)/my-plan',
        params: { type: plan.type }
      });
      return;
    }

    /*Alert.alert(
      'Cambia piano',
      `Vuoi passare al piano "${plan.plan_for}"?`,
      [
        { text: 'Annulla', style: 'cancel' },
        { 
          text: 'Conferma', 
          onPress: () => handlePlanSwitch(plan)
        }
      ]
    ); */

    await handlePlanSwitch(plan);
  };

  const handlePlanSwitch = async (plan: Plan) => {
    setIsLoading(true);
    try {
      await switchPlan(plan.id);
      await reloadProfile();

      // Redirect to WebView to see the selected plan
      router.push({
        pathname: '/(tabs)/my-plan',
        params: { type: plan.type }
      });
    } catch (error: any) {
      Alert.alert(
        'Errore',
        error.message || 'Impossibile cambiare piano',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderPlanCard = (plan: Plan) => {
    const isCurrentPlan = plan.id === currentPlanId;
    const statusColor = getStatusColor(plan.payment_status, plan.status);

    return (
      <TouchableOpacity
        key={plan.id}
        style={styles.planCard}
        onPress={() => handlePlanPress(plan)}
        disabled={isLoading}
      >
        {/* Plan Content */}
        <View style={styles.planContent}>
          <View style={styles.planInfo}>
            <ThemedText style={styles.planTitle}>
              {plan.plan_for}
            </ThemedText>
            <View style={styles.badgeContainer}>
              <View style={[styles.typeBadge, { backgroundColor: BaseColors.mainDark }]}>
                <Text style={styles.badgeText}>
                  {formatPlanType(plan.type)}
                </Text>
              </View>
              {/* Payment status commented out as requested */}
              {/* <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                <Text style={styles.statusBadgeText}>
                  {formatPaymentStatus(plan.payment_status)}
                </Text>
              </View> */}
            </View>
            <Text style={styles.detailText}>
              Ultima modifica: {formatDate(plan.modified)}
            </Text>
          </View>
          
          {/* Navigation Caret */}
          <View style={styles.caretContainer}>
            <Ionicons 
              name="chevron-forward" 
              size={24} 
              color={BaseColors.greyMedium} 
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (!userProfile) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={BaseColors.main} />
          <ThemedText style={styles.loadingText}>
            Caricamento profilo...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (plans.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.centerContent}>
          <ThemedText style={styles.emptyTitle}>
            Nessun piano disponibile
          </ThemedText>
          <ThemedText style={styles.emptySubtitle}>
            Contatta la tua onoranza funebre per attivare un piano.
          </ThemedText>
          <TouchableOpacity style={styles.newPlanButton} onPress={handleNewPlan}>
            <Ionicons name="add-circle-outline" size={20} color={BaseColors.white} />
            <Text style={styles.newPlanButtonText}>Nuova pianificazione</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={BaseColors.main} />
          <ThemedText style={styles.loadingText}>
            Caricamento piano in corso...
          </ThemedText>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={BaseColors.main}
          />
        }
      >
        <View style={styles.plansList}>
          {plans.map(renderPlanCard)}
        </View>
        <TouchableOpacity style={styles.newPlanButton} onPress={handleNewPlan}>
          <Ionicons name="add-circle-outline" size={20} color={BaseColors.white} />
          <Text style={styles.newPlanButtonText}>Nuova pianificazione</Text>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  plansList: {
    gap: 16,
  },
  planCard: {
    backgroundColor: BaseColors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: BaseColors.greyLight,
    shadowColor: BaseColors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BaseColors.mainDark,
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: BaseColors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    color: BaseColors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  detailText: {
    fontSize: 14,
    color: BaseColors.greyMedium,
  },
  caretContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: BaseColors.greyMedium,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BaseColors.mainDark,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: BaseColors.greyMedium,
    textAlign: 'center',
    lineHeight: 24,
  },
  newPlanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BaseColors.main,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
    marginTop: 24,
  },
  newPlanButtonText: {
    color: BaseColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});
