import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { IconProps } from 'react-native-paper/lib/typescript/components/MaterialCommunityIcon';

// Icon provider function for React Native Paper
export const createIcon = ({ name, color, size, ...rest }: IconProps) => {
  return (
    <MaterialCommunityIcons
      name={name}
      color={color}
      size={size}
      {...rest}
    />
  );
};

// Icon provider for React Native Paper
export const MaterialCommunityIconProvider = createIcon;
