import React, {useRef, useEffect, useMemo, useCallback} from 'react';
import {StyleSheet, View} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import {HeaderButton, ThemedText} from '@/components/ui';
import {type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {AppIcons} from '@/utils';
import {makeStyleFactory} from '@/utils/style-factory';

type FilterItemsModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function FilterItemsModal({visible, onClose}: FilterItemsModalProps) {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['50%'], []);

  useEffect(() => {
    if (visible) {
      bottomSheetModalRef.current?.present();
    }
  }, [visible]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
      />
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      onDismiss={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetView style={styles.container}>
        <View style={styles.header}>
          <ThemedText variant="body">Filters</ThemedText>
          <HeaderButton
            icon={AppIcons.navigation.close}
            onPress={onClose}
            iconColorToken="text"
            accessibilityLabel="Close filters"
            iconSize="lg"
            style={styles.headerButton}
          />
        </View>
        <View style={styles.content}>
          <ThemedText>Filter options will go here</ThemedText>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      background: {
        backgroundColor: theme.secondbackground,
        borderRadius: ds.components.card.borderRadius,
      },
      handleIndicator: {
        backgroundColor: theme.border,
      },
      container: {
        flex: 1,
      },
      header: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: ds.spacing.md,
        paddingVertical: ds.spacing.sm,
        position: 'relative',
      },
      headerButton: {
        position: 'absolute',
        right: ds.spacing.md,
      },
      content: {
        padding: ds.spacing.lg,
      },
    }),
  (ds, theme) => `${ds.version}|${theme.version}`,
);
