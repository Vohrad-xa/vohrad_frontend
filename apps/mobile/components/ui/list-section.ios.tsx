import React from 'react';
import {type TokenName} from '@/constants/colors';
import {
  Section,
  Label,
  Spacer,
  Text,
  Button,
  HStack,
} from '@/modules/sykamore-ui/src/ios';
import {useTheme} from '@/providers';
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
  const {theme} = useTheme();

  return (
    <Button onPress={onPress} color={theme.text}>
      <HStack>
        <Label
          title={title}
          icon={<Icon name={icon} colorToken={iconColorToken} useSwiftUI />}
        />

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
    </Button>
  );
};

export const ListSection = Object.assign(ListSectionComponent, {
  Row: ListSectionRow,
});
