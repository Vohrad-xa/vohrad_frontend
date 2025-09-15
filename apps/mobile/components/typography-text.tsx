import React from 'react';
import { Text, type TextProps } from 'react-native';

import type { Typography } from '@/constants/typography';
import type { TokenName } from '@/constants/colors';
import { useTypography } from '@/hooks/use-typography';

type Props = TextProps & {
  variant: Typography;
  colorToken?: TokenName;
};

export default function TypographyText({ variant, colorToken, style, ...rest }: Props) {
  const { style: variantStyle } = useTypography();
  return <Text style={[variantStyle(variant, { color: colorToken }), style]} {...rest} />;
}

