import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { PartnerDetail } from '@/components/PartnerDetail';

export default function PartnerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id) return null;

  return <PartnerDetail partnerId={id} showBackButton={true} showPurchaseButton={false} />;
}
