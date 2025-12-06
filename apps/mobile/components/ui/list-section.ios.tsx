import React from 'react';
import {Section, HStack, Label, Spacer} from '@expo/ui/swift-ui';
import {type TokenName} from '@/constants/colors';
import {Icon, AppIcons, type IconName} from '@/utils/icons';

interface ListSectionProps {
  title?: string;
  children: React.ReactNode;
}

interface ListSectionRowProps {
  icon: IconName;
  iconColorToken: TokenName;
  title: string;
  onPress?: () => void;
  rightComponent?: React.ReactNode;
  hideChevron?: boolean;
  spacing?: number;
}

const ListSectionComponent: React.FC<ListSectionProps> = ({
  title,
  children,
}) => {
  return <Section title={title}>{children}</Section>;
};

const ListSectionRow: React.FC<ListSectionRowProps> = ({
  icon,
  iconColorToken,
  title,
  onPress,
  rightComponent,
  hideChevron = false,
  spacing = 10,
}) => {
  const showChevron = !hideChevron && !rightComponent;

  return (
    <HStack alignment="center" onPress={onPress} spacing={spacing}>
      <Icon name={icon} colorToken={iconColorToken} useSwiftUI />
      <Label title={title} fixedSize={false} />
      {rightComponent}
      {showChevron && (
        <>
          <Spacer />
          <Icon
            name={AppIcons.navigation.chevronRight}
            useSwiftUI
            noContainer
          />
        </>
      )}
    </HStack>
  );
};

export const ListSection = Object.assign(ListSectionComponent, {
  Row: ListSectionRow,
});
