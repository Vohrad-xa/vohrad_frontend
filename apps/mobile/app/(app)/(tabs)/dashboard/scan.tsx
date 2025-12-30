import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {StyleSheet, View, Alert, Linking, Platform} from 'react-native';
import {CameraView, useCameraPermissions} from 'expo-camera';
import {useNavigation, router} from 'expo-router';
import {ThemedView, EmptyState} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants';
import {useTheme, useHaptic} from '@/providers';
import {
  AppIcons,
  Icon,
  makeStyleFactory,
  getHeaderOptions,
  type HeaderAction,
} from '@/utils';

export default function ScanScreen() {
  const {ds, theme} = useTheme();
  const {triggerHaptic} = useHaptic();
  const navigation = useNavigation();
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
  }, [permission, requestPermission]);

  const handleBarCodeScanned = useCallback(
    ({data}: {data: string}) => {
      triggerHaptic('success');
      Alert.alert('Scanned', `Scanned data: ${data}`, [
        {text: 'OK', onPress: () => router.back()},
      ]);
    },
    [triggerHaptic],
  );

  const handleToggleTorch = useCallback(() => {
    setEnableTorch((prev) => !prev);
  }, []);

  useLayoutEffect(() => {
    const left: HeaderAction[] =
      Platform.OS === 'ios'
        ? [
            {
              type: 'button',
              key: 'close-scanner',
              label: 'Close',
              accessibilityLabel: 'Close scanner',
              accessibilityHint: 'Closes the barcode scanner',
              iosSymbol: AppIcons.actions.close,
              icon: AppIcons.actions.close,
              onPress: () => router.dismiss(),
            },
          ]
        : [];

    const right: HeaderAction[] = [
      {
        type: 'button',
        variant: 'prominent',
        tintColor: enableTorch ? theme.accentOrange : 'transparent',
        key: 'enable-torch',
        label: enableTorch ? 'Turn off flash' : 'Turn on flash',
        accessibilityLabel: enableTorch ? 'Turn off flash' : 'Turn on flash',
        accessibilityHint: 'Toggles the camera flash',
        iosSymbol: enableTorch
          ? AppIcons.actions.disableTorch
          : AppIcons.actions.enableTorch,
        icon: enableTorch
          ? AppIcons.actions.disableTorch
          : AppIcons.actions.enableTorch,
        onPress: handleToggleTorch,
      },
    ];

    navigation.setOptions(
      getHeaderOptions({
        left,
        right,
      }),
    );
  }, [navigation, enableTorch, handleToggleTorch]);

  if (!permission?.granted) {
    return (
      <ThemedView style={styles.container}>
        <EmptyState
          message="Camera access is required to scan barcodes and QR codes"
          icon={AppIcons.actions.scan}
        />
      </ThemedView>
    );
  }

  return (
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
          colorToken="white"
          style={styles.scanIcon}
        />
      </View>
    </View>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        flex: 1,
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
