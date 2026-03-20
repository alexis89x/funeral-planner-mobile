import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, BaseColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/AuthContext';
import { PLAN_STATUS } from "@/models/data.models";
import { APP_BASE_URL } from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { userProfile } = useAuth();
  const router = useRouter();

  const handleNewPlan = () => {
    router.push({
      pathname: '/webview',
      params: {
        url: `${APP_BASE_URL}/public/search-flow?forceMode=mobile&t=${new Date().getTime()}`,
        title: 'Nuova pianificazione',
        injectToken: 'true',
      }
    });
  };

  console.log("USER PROFILE", userProfile);
  // Determina il titolo del tab funeral-home basandosi sul profilo
  const funeralHomeTitle = userProfile?.user?.id_partner_referral
    ? 'La mia onoranza'
    : 'Cerca onoranza';

  const activePlansCount = (userProfile?.owned_plans.filter(r => r.status === PLAN_STATUS.ACTIVE) || []).length;
  // const myPlanTitle = activePlansCount > 1 ? 'I miei piani' : 'Il mio piano';
  const myPlanTitle = 'I miei piani';
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="my-plans"
        options={{
          title: myPlanTitle,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="doc.text.fill" color={color} />,
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
        name="my-plan"
        options={{
          title: 'Il mio piano',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="doc.fill" color={color} />,
          href: null, // Hidden from tab bar - accessed only via navigation
          headerShown: true,
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
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Profilo',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
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
