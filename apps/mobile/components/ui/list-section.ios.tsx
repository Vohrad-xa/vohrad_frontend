import React from 'react';
import {Section, Label, Spacer, Text, Button, HStack, tint} from 'sykamore-ui';
import {type TokenName} from '@/constants/colors';
import {Icon, AppIcons, type IconName} from '@/utils/icons';

interface ListSectionProps {
  title?: string;
  header?: string;
  footer?: string;
  children: React.ReactNode;
}

interface ListSectionRowProps {
  icon: IconName;
  iconColorToken: TokenName;
  title?: string;
  onPress?: () => void;
  rightComponent?: React.ReactNode;
  hideChevron?: boolean;
  spacing?: number;
}

const ListSectionComponent: React.FC<ListSectionProps> = ({
  title,
  header,
  footer,
  children,
}) => {
  return (
    <Section
      title={title}
      header={header ? <Text>{header}</Text> : undefined}
      footer={footer ? <Text>{footer}</Text> : undefined}
    >
      {children}
    </Section>
  );
};

const ListSectionRow: React.FC<ListSectionRowProps> = ({
  icon,
  iconColorToken,
  title,
  onPress,
  rightComponent,
  hideChevron = false,
}) => {
  const showChevron = !hideChevron && !rightComponent;

  return (
    <Button role="default" onPress={onPress} modifiers={[tint('primary')]}>
      <HStack>
        <Label
          title={title}
          icon={
            <Icon
              name={icon}
              colorToken={iconColorToken}
              useSwiftUI
              container
            />
          }
        />

        {rightComponent}
        {showChevron && (
          <>
            <Spacer />
            <Icon
              name={AppIcons.actions.forward}
              colorToken="muted"
              fontWeight="medium"
              useSwiftUI
              size={13}
            />
          </>
        )}
      </HStack>
    </Button>
  );
};

export const ListSection = Object.assign(ListSectionComponent, {
  Row: ListSectionRow,
});
