import {Palette} from '@/constants';
import {
  VStack,
  ZStack,
  Text,
  Circle,
  foregroundStyle,
  frame,
  font,
  listRowBackground,
} from '@/modules/sykamore-ui';
import {useTheme} from '@/providers';
import {Icon, type IconName} from '@/utils';

type ScreenHeaderProps = Readonly<{
  icon: IconName;
  title: string;
  description: string;
}>;

export function ScreenHeader({icon, title, description}: ScreenHeaderProps) {
  const {ds} = useTheme();

  return (
    <VStack
      alignment="center"
      spacing={ds.spacing.sm}
      modifiers={[listRowBackground('transparent')]}
    >
      <ZStack alignment="center">
        <Circle
          modifiers={[
            frame({width: 70, height: 70}),
            foregroundStyle(Palette.lightBlue),
          ]}
        />
        <Icon name={icon} color={Palette.deepblue} useSwiftUI size="xxl" />
      </ZStack>

      <Text modifiers={[font({textStyle: 'title2', weight: 'semibold'})]}>
        {title}
      </Text>

      <Text
        modifiers={[
          foregroundStyle('secondary'),
          font({
            textStyle: 'subheadline',
            design: 'rounded',
          }),
        ]}
      >
        {description}
      </Text>
    </VStack>
  );
}
