import {useRef, useCallback} from 'react';
import {
  Platform,
  View,
  StyleSheet,
  Pressable,
  Animated,
  type GestureResponderEvent,
} from 'react-native';
import {Tabs} from 'expo-router';
import {type ThemeShape, type DSShape} from '@/constants';
import {makeStyleFactory} from '@/utils';
import {Icon, type IconName} from '@/utils/icons';

const ANIMATION_CONFIG = {
  scale: {
    pressed: 0.85,
    normal: 1,
  },
  spring: {
    speed: 50,
    bounciness: 8,
  },
  ripple: {
    radius: 40,
  },
} as const;

type TabButtonProps = {
  children: React.ReactNode;
  onPressIn?: ((e: GestureResponderEvent) => void) | null;
  onPressOut?: ((e: GestureResponderEvent) => void) | null;
  accessibilityState?: {selected?: boolean};
};

type TabIconProps = {
  color: string;
  size?: number;
  focused: boolean;
};

type TabItem = {
  name: string;
  label: string;
  icon: IconName;
};

type ReactTabsProps = {
  tabs: TabItem[];
  theme: ThemeShape;
  ds: DSShape;
  insetBottom: number;
};

function TabButton({
  children,
  onPressIn,
  onPressOut,
  theme,
  styles,
  ...rest
}: TabButtonProps & {
  theme: ThemeShape;
  styles: ReturnType<typeof createStyles>;
}) {
  const scaleAnim = useRef(
    new Animated.Value(ANIMATION_CONFIG.scale.normal),
  ).current;

  const handlePressIn = (e: GestureResponderEvent) => {
    Animated.spring(scaleAnim, {
      toValue: ANIMATION_CONFIG.scale.pressed,
      useNativeDriver: true,
      speed: ANIMATION_CONFIG.spring.speed,
      bounciness: ANIMATION_CONFIG.spring.bounciness,
    }).start();
    onPressIn?.(e);
  };

  const handlePressOut = (e: GestureResponderEvent) => {
    Animated.spring(scaleAnim, {
      toValue: ANIMATION_CONFIG.scale.normal,
      useNativeDriver: true,
      speed: ANIMATION_CONFIG.spring.speed,
      bounciness: ANIMATION_CONFIG.spring.bounciness,
    }).start();
    onPressOut?.(e);
  };

  return (
    <Pressable
      {...rest}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tabButtonContainer}
      android_ripple={{
        color: theme.highlight,
        borderless: true,
        radius: ANIMATION_CONFIG.ripple.radius,
      }}
    >
      <Animated.View
        style={[styles.tabButton, {transform: [{scale: scaleAnim}]}]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}

export function ReactTabs({tabs, theme, ds, insetBottom}: ReactTabsProps) {
  const styles = createStyles(theme, ds, insetBottom);

  const renderTabButton = useCallback(
    (props: TabButtonProps) => (
      <TabButton {...props} theme={theme} styles={styles} />
    ),
    [theme, styles],
  );

  const renderTabIcon = useCallback(
    (props: TabIconProps, icon: IconName) => {
      const {color, size, focused} = props;
      const iconSize = size ?? ds.iconSize.lg;

      if (Platform.OS === 'android') {
        return (
          <View
            style={[
              styles.iconContainer,
              focused && styles.iconContainerActive,
            ]}
          >
            <Icon name={icon} size={iconSize} color={color} />
          </View>
        );
      }

      return <Icon name={icon} size={iconSize} color={color} />;
    },
    [ds.iconSize.lg, styles.iconContainer, styles.iconContainerActive],
  );

  return (
    <View style={styles.container}>
      <Tabs
        initialRouteName="home"
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.tabIconSelected,
          tabBarInactiveTintColor: theme.icon,
          tabBarStyle: styles.tabBar,
          tabBarButton: Platform.OS === 'android' ? renderTabButton : undefined,
        }}
      >
        {tabs.map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: tab.label,
              tabBarIcon: (props) => renderTabIcon(props, tab.icon),
            }}
          />
        ))}
      </Tabs>
    </View>
  );
}

const createStyles = makeStyleFactory(
  (theme: ThemeShape, ds: DSShape, insetBottom: number) =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: theme.background,
      },
      tabBar: {
        height: ds.layout.tabBarHeight + insetBottom * 1.2,
        paddingTop: ds.spacing.md,
        paddingBottom: insetBottom + ds.spacing.md,
        backgroundColor: theme.navigationBar,
      },
      tabButtonContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: ds.spacing.xs,
      },
      tabButton: {
        alignItems: 'center',
        justifyContent: 'center',
      },
      iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: ds.iconSize.lg + ds.spacing.md * 2,
        height: ds.iconSize.lg + ds.spacing.xs * 2,
        borderRadius: ds.borderRadius.full,
      },
      iconContainerActive: {
        backgroundColor: theme.highlight,
      },
    }),
  (theme, ds, insetBottom) => `${theme.version.toString()}|${insetBottom}`,
);
