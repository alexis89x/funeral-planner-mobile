import { Tabs, useRouter } from 'expo-router';
import React, { useRef } from 'react';
import { TouchableOpacity, Alert } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, BaseColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { switchPlan, getActivePlans } from '@/utils/plans';
import { useNewPlanHandler } from '@/hooks/use-new-plan-handler';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { userProfile, reloadProfile } = useAuth();
  const router = useRouter();
  const isSwitchingRef = useRef(false);
  const { handleNewPlan } = useNewPlanHandler();

  const activePlans = getActivePlans(userProfile);
  const hasMultiplePlans = activePlans.length > 1;
  const myPlanTabTitle = hasMultiplePlans ? 'I miei piani' : 'Il mio piano';

  const handleMyPlanTabPress = async () => {
    if (isSwitchingRef.current) return;

    if (hasMultiplePlans) {
      router.navigate('/(tabs)/my-plans');
      return;
    }

    if (activePlans.length === 0) {
      router.navigate('/(tabs)/my-plans');
      return;
    }

    const plan = activePlans[0];
    const currentPlanId = userProfile?.user?.id_current_plan;

    if (currentPlanId === plan.id) {
      router.navigate({
        pathname: '/(tabs)/my-plan',
        params: { type: plan.type, planId: plan.id.toString() }
      });
      return;
    }

    isSwitchingRef.current = true;
    try {
      await switchPlan(plan.id);
      await reloadProfile();
      router.navigate({
        pathname: '/(tabs)/my-plan',
        params: { type: plan.type, planId: plan.id.toString(), forceReload: Date.now().toString() }
      });
    } catch (error: any) {
      Alert.alert('Errore', error.message || 'Impossibile caricare il piano');
    } finally {
      isSwitchingRef.current = false;
    }
  };

  console.log("USER PROFILE", userProfile);
  const funeralHomeTitle = userProfile?.user?.id_partner_referral
    ? 'La mia onoranza'
    : 'Cerca onoranza';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="my-plan"
        options={{
          title: myPlanTabTitle,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="doc.text.fill" color={color} />,
          headerShown: true,
          headerRight: () => (
            <React.Fragment>
              {hasMultiplePlans && (
                <TouchableOpacity onPress={() => router.push('/(tabs)/my-plans')} style={{ marginRight: 8 }}>
                  <Ionicons name="list-outline" size={26} color={BaseColors.main} />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={handleNewPlan} style={{ marginRight: 16 }}>
                <Ionicons name="add-circle-outline" size={28} color={BaseColors.main} />
              </TouchableOpacity>
            </React.Fragment>
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            handleMyPlanTabPress();
          }
        }}
      />
      <Tabs.Screen
        name="my-plans"
        options={{
          title: 'I miei piani',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="doc.text.fill" color={color} />,
          href: null,
          headerShown: true,
          headerLeft: () => null,
          headerRight: () => (
            <TouchableOpacity onPress={handleNewPlan} style={{ marginRight: 16 }}>
              <Ionicons name="add-circle-outline" size={28} color={BaseColors.main} />
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="funeral-home"
        options={{
          title: funeralHomeTitle,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="building.2.fill" color={color} />,
          headerShown: true,
          headerLeft: () => null,
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: 'Servizi',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="list.bullet" color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="emergenza"
        options={{
          title: 'Emergenza',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="exclamationmark.shield.fill" color={color} />,
          headerShown: false,
          href: null,
        }}
      />
      <Tabs.Screen
        name="altro"
        options={{
          title: 'Altro',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="ellipsis.circle.fill" color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Profilo',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
          href: null,
          headerShown: true,
          headerLeft: () => null,
        }}
      />
      {/* Hidden tabs - kept for future use */}
      <Tabs.Screen
        name="products"
        options={{
          title: 'Prodotti',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="bag.fill" color={color} />,
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Cerca',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="magnifyingglass" color={color} />,
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}

/*
  <Tabs.Screen
    name="explore"
    options={{
      title: 'Altro',
      tabBarIcon: ({ color }) => <IconSymbol size={28} name="ellipsis.circle.fill" color={color} />,
      href: null, // Hide from tab bar
    }}
  />
 */
{/* Test Login - hidden, for debugging */}
/*
<Tabs.Screen
  name="test-login"
  options={{
    title: 'Test Login',
    href: null, // Hide from tab bar
  }}
/>
 */
{/* Legacy home screen - hidden */}
/*
<Tabs.Screen
  name="index"
  options={{
    href: null, // Hide from tab bar
  }}
/>
 */
