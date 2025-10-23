import React, {useCallback, useEffect, useRef} from 'react';
import {StyleSheet, View, Alert, Platform, Linking} from 'react-native';
import {CameraView, useCameraPermissions} from 'expo-camera';
import {Stack, useRouter} from 'expo-router';
import {HeaderButton, ThemedView, EmptyState} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme, useHaptic} from '@/providers';
import {AppIcons} from '@/utils';
import {Icon} from '@/utils/icons';
import {makeStyleFactory} from '@/utils/style-factory';

export default function ScanModal() {
  const {ds, theme} = useTheme();
  const {triggerHaptic} = useHaptic();
  const router = useRouter();
  const styles = createStyles(ds, theme);
  const [permission, requestPermission] = useCameraPermissions();
  const hasRequestedPermission = useRef(false);

  useEffect(() => {
    const askForPermission = async () => {
      if (!permission || hasRequestedPermission.current) return;

      if (!permission.granted) {
        hasRequestedPermission.current = true;
        const result = await requestPermission();

        if (!result.granted) {
          Alert.alert(
            'Camera Permission Required',
            'Please enable camera access in Settings to scan barcodes and QR codes.',
            [
              {text: 'Cancel', style: 'cancel', onPress: () => router.back()},
              {
                text: 'Open Settings',
                onPress: () => {
                  void Linking.openSettings();
                  router.back();
                },
              },
            ],
          );
        }
      }
    };

    void askForPermission();
  }, [permission, requestPermission, router]);

  const handleBarCodeScanned = useCallback(
    ({data}: {data: string}) => {
      triggerHaptic('success');
      Alert.alert('Scanned', `Scanned data: ${data}`, [
        {text: 'OK', onPress: () => router.back()},
      ]);
    },
    [triggerHaptic, router],
  );

  const handleClose = useCallback(() => {
    triggerHaptic('light');
    router.back();
  }, [triggerHaptic, router]);

  if (!permission?.granted) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Scanner',
            headerShown: true,
            headerTransparent: Platform.OS === 'ios',
            headerBackButtonDisplayMode: 'default',
            headerLeft:
              Platform.OS === 'ios' || Platform.OS === 'web'
                ? () => (
                    <HeaderButton
                      icon={AppIcons.navigation.close}
                      onPress={handleClose}
                      iconColorToken="text"
                      accessibilityLabel="Close scanner"
                      iconSize="xl"
                    />
                  )
                : undefined,
          }}
        />
        <ThemedView style={styles.container}>
          <EmptyState
            message="Camera access is required to scan barcodes and QR codes"
            icon={AppIcons.actions.scan}
          />
        </ThemedView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerShown: true,
          headerTransparent: true,
          headerBackButtonDisplayMode: 'default',
          headerStyle: {
            backgroundColor: 'transparent',
          },
          headerTitleStyle: {
            color: theme.primaryForeground,
          },
          headerBackTitle: 'Back ',
          headerLeft:
            Platform.OS === 'ios' || Platform.OS === 'web'
              ? () => (
                  <HeaderButton
                    icon={AppIcons.navigation.close}
                    onPress={handleClose}
                    iconColorToken="text"
                    accessibilityLabel="Close scanner"
                    iconSize="xl"
                  />
                )
              : undefined,
        }}
      />
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: [
              'qr',
              'ean13',
              'ean8',
              'upc_a',
              'upc_e',
              'code128',
              'code39',
              'itf14',
            ],
          }}
          onBarcodeScanned={handleBarCodeScanned}
        />
        <View style={styles.scanIconContainer}>
          <Icon
            name={AppIcons.actions.scan}
            size={180}
            colorToken="primaryForeground"
            style={styles.scanIcon}
          />
        </View>
      </View>
    </>
  );
}

const createStyles = makeStyleFactory(
  (_ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: theme.background,
        justifyContent: 'center',
        alignItems: 'center',
      },
      cameraContainer: {
        flex: 1,
        width: '100%',
        backgroundColor: theme.background,
      },
      camera: {
        flex: 1,
        width: '100%',
      },
      scanIconContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'none',
      },
      scanIcon: {
        opacity: 0.8,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
