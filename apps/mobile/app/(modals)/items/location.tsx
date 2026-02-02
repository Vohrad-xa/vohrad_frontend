import React, {useRef, useEffect} from 'react';
import type {TextInput} from 'react-native';
import {Platform, StyleSheet, View} from 'react-native';
import {Stack, router} from 'expo-router';
import {
  ModalScrollView,
  Card,
  EmptyState,
  ThemedText,
  ThemedInput,
  HeaderButton,
} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useItemLocation} from '@/features/item';
import {useTheme} from '@/providers';
import {makeStyleFactory, AppIcons} from '@/utils';

const CloseHeaderLeft = () => (
  <HeaderButton
    variant="close"
    onPress={() => router.dismiss()}
    accessibilityLabel="Close"
  />
);

export default function LocationModal() {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);
  const {locations, isEditMode, item, handleQuantityChange} = useItemLocation();
  const firstInputRef = useRef<TextInput>(null);

  // Focus first input
  useEffect(() => {
    if (isEditMode && firstInputRef.current) {
      const timeoutId = setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isEditMode]);

  if (!item) {
    return null;
  }

  if (locations.length === 0) {
    return (
      <EmptyState
        message="No locations found for this item"
        icon={AppIcons.domain.location}
      />
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Locations',
          headerShown: true,
          headerShadowVisible: false,
          headerTransparent: Platform.OS === 'ios',
          headerLeft: Platform.OS === 'ios' ? CloseHeaderLeft : undefined,
          headerTitleAlign: 'center',
        }}
      />
      <ModalScrollView>
        <View>
          {locations.map((location, index) => (
            <View
              key={location.item_location_id ?? location.id}
              style={{gap: ds.spacing.sm}}
            >
              <ThemedText variant="value" style={styles.locationTitle}>
                {location.name}
              </ThemedText>
              <Card>
                <View style={styles.fieldRow}>
                  <ThemedText variant="label" style={styles.fieldLabel}>
                    Code
                  </ThemedText>
                  <ThemedText variant="value">{location.code}</ThemedText>
                </View>
                <Card.Divider />
                <View style={styles.fieldRow}>
                  <ThemedText variant="label" style={styles.fieldLabel}>
                    Quantity
                  </ThemedText>
                  <ThemedInput
                    ref={index === 0 ? firstInputRef : undefined}
                    variant="value"
                    textAlign="right"
                    borderless
                    value={location.quantity}
                    onChangeText={(text) =>
                      handleQuantityChange(
                        location.item_location_id ?? location.id,
                        text,
                      )
                    }
                    editable={isEditMode}
                    keyboardType="decimal-pad"
                    style={styles.quantityInput}
                  />
                </View>
              </Card>
            </View>
          ))}
        </View>
      </ModalScrollView>
    </>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      locationTitle: {
        paddingHorizontal: ds.spacing.lg,
      },
      fieldRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
      fieldLabel: {
        flexShrink: 0,
        marginRight: ds.spacing.md,
      },
      quantityInput: {
        minWidth: 60,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
