import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {useRouter} from 'expo-router';
import {Button, Card, Divider, Surface} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ThemedText} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils';

 
const microsoftLogo = require('../../assets/icons/microsoft.png') as number;

export default function LoginScreen() {
  const {ds, theme, scheme} = useTheme();
  const router = useRouter();
  const styles = createStyles(ds, theme);

  const textColor = scheme === 'dark' ? '#000' : '#fff';
  const buttonColor = scheme === 'dark' ? '#fff' : '#000';

  const navigateToSignIn = () => {
    router.push('/(auth)/sign-in');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Surface
        style={[styles.surface, {backgroundColor: theme.background}]}
        elevation={0}
      >
        <Card.Title title="Welcome" titleStyle={styles.title} />

        <Card.Content style={styles.content}>
          <Button
            mode="contained"
            onPress={navigateToSignIn}
            buttonColor={buttonColor}
            textColor={textColor}
            contentStyle={styles.buttonContent}
            icon={({size}) => (
              <Image
                source={microsoftLogo}
                style={{width: size, height: size}}
              />
            )}
          >
            Continue with Microsoft
          </Button>

          <View style={styles.orRow}>
            <Divider
              style={[styles.divider, {backgroundColor: theme.divider}]}
            />
            <ThemedText variant="label" style={{color: theme.muted}}>
              OR
            </ThemedText>
            <Divider style={styles.divider} />
          </View>

          <Button
            mode="contained"
            onPress={navigateToSignIn}
            buttonColor={buttonColor}
            textColor={textColor}
            contentStyle={styles.buttonContent}
          >
            Continue with Email
          </Button>

          <View style={styles.footer}>
            <ThemedText
              variant="subheadline"
              style={{color: theme.muted, textAlign: 'center'}}
            >
              {"By continuing, you acknowledge Sykamore\u2019s"}
            </ThemedText>

            <ThemedText variant="caption">Privacy Policy</ThemedText>
          </View>
        </Card.Content>
      </Surface>
    </SafeAreaView>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      safe: {flex: 1, backgroundColor: theme.background},

      surface: {
        flex: 1,
        justifyContent: 'center',
      },

      title: {
        textAlign: 'center',
        fontSize: 22,
        paddingBottom: ds.spacing.xl,
      },

      content: {
        gap: ds.spacing.md,
      },

      buttonContent: {
        paddingVertical: ds.spacing.xs,
      },

      orRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: ds.spacing.sm,
      },

      divider: {
        flex: 1,
      },

      footer: {
        alignItems: 'center',
        gap: ds.spacing.xs,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
