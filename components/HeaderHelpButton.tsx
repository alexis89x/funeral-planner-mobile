import React from 'react';
import { TouchableOpacity, Alert } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BaseColors } from '@/constants/theme';

interface HeaderHelpButtonProps {
  title: string;
  message: string;
}

export function HeaderHelpButton({ title, message }: HeaderHelpButtonProps) {
  return (
    <TouchableOpacity onPress={() => Alert.alert(title, message)} hitSlop={8}>
      <IconSymbol name="info.circle.fill" size={24} color={BaseColors.main} />
    </TouchableOpacity>
  );
}