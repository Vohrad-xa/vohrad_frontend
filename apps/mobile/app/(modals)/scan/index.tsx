import React, {useCallback, useEffect, useRef, useState} from 'react';
import {StyleSheet, View, Alert, Platform, Linking} from 'react-native';
import {CameraView, useCameraPermissions} from 'expo-camera';
import {Stack, useRouter} from 'expo-router';
import {ThemedView, EmptyState} from '@/components/ui';
import type {TokenName} from '@/constants/colors';
import {Palette} from '@/constants/colors';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme, useHaptic} from '@/providers';
import {AppIcons, Icon, makeStyleFactory} from '@/utils';
import {
  getHeaderOptions,
  type HeaderAction,
} from '@/utils/navigation/header-actions';

export default function ScanModal() {
  const {ds, theme} = useTheme();
  const {triggerHaptic} = useHaptic();
  const router = useRouter();
  const styles = createStyles(ds, theme);

  const [permission, requestPermission] = useCameraPermissions();
  const [enableTorch, setEnableTorch] = useState(false);
  const hasRequestedPermission = useRef(false);

  useEffect(() => {
    const askForPermission = async () => {
      if (!permission || hasRequestedPermission.current) return;

      if (!permission.granted) {
        hasRequestedPermission.current = true;
        const result = await requestPermission();

        if (!result.granted) {
          Alert.alert(
            'Permission Required',
            'Enable camera access in Settings to be able to scan barcodes and QR codes.',
            [
              {
                text: 'Cancel',
                style: 'destructive',
                onPress: () => router.back(),
              },
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
    router.back();
  }, [router]);

  const handleToggleTorch = useCallback(() => {
    setEnableTorch((prev) => !prev);
  }, []);

  const headerLeftActions: HeaderAction[] =
    Platform.OS === 'ios' || Platform.OS === 'web'
      ? [
          {
            key: 'close',
            label: 'Close scanner',
            iosSymbol: 'xmark',
            icon: 'close',
            variant: 'clear',
            onPress: handleClose,
          },
        ]
      : [];

  const headerRightActions: HeaderAction[] = [
    {
      key: 'torch',
      label: enableTorch ? 'Turn off flash' : 'Turn on flash',
      iosSymbol: enableTorch ? 'flashlight.off.fill' : 'flashlight.on.fill',
      icon: enableTorch ? 'flash-off' : 'flash',
      variant: 'clear',
      onPress: handleToggleTorch,
    },
  ];

  if (!permission?.granted) {
    return (
      <>
        <Stack.Screen
          options={{
            presentation: 'fullScreenModal',
            title: 'Scanner',
            headerShown: true,
            headerTransparent: Platform.OS === 'ios',
            headerBackButtonDisplayMode: 'default',
            ...getHeaderOptions({
              left: headerLeftActions.length ? headerLeftActions : undefined,
            }),
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
          title: 'Scanner',
          headerShown: true,
          headerTransparent: true,
          headerBackButtonDisplayMode: 'default',
          headerStyle: {backgroundColor: 'transparent'},
          ...getHeaderOptions({
            left: headerLeftActions.length ? headerLeftActions : undefined,
            right: headerRightActions,
          }),
        }}
      />
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          enableTorch={enableTorch}
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
            colorToken={Palette.white as TokenName}
            style={styles.scanIcon}
          />
        </View>
      </View>
    </>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: theme.background,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: ds.spacing.lg,
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
