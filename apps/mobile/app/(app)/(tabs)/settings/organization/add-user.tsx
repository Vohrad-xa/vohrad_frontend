import {useRef, useCallback} from 'react';
import {StyleSheet, Platform} from 'react-native';
import {useNavigation, useRouter} from 'expo-router';
import {ModalScrollView} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {
  AddUserScreen,
  type AddUserScreenHandle,
} from '@/features/settings/organization';
import {useSettingsHeader} from '@/hooks';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils';

export default function AddUserModal() {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);
  const navigation = useNavigation();
  const router = useRouter();
  const addUserScreenRef = useRef<AddUserScreenHandle>(null);

  const handleSave = useCallback(async () => {
    await addUserScreenRef.current?.saveUser();
  }, []);

  const {triggerSuccess} = useSettingsHeader({
    navigation,
    isEditing: true,
    onSave: handleSave,
  });

  const handleSaveComplete = useCallback(() => {
    triggerSuccess();
    setTimeout(() => {
      router.back();
    }, 600);
  }, [triggerSuccess, router]);

  const addUserScreen = (
    <AddUserScreen ref={addUserScreenRef} onSaveComplete={handleSaveComplete} />
  );

  if (Platform.OS === 'ios') {
    return addUserScreen;
  }

  return (
    <ModalScrollView style={styles.container}>{addUserScreen}</ModalScrollView>
  );
}

const createStyles = makeStyleFactory(
  (_ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        flex: 1,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
