import {useRef, useState, useCallback} from 'react';
import {StyleSheet} from 'react-native';
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
  const [hasChanges, setHasChanges] = useState(false);

  const checkForChanges = useCallback(() => {
    const changed = addUserScreenRef.current?.hasChanges() ?? false;
    setHasChanges(changed);
  }, []);

  const handleSave = useCallback(async () => {
    await addUserScreenRef.current?.saveUser();
  }, []);

  const {triggerSuccess} = useSettingsHeader({
    navigation,
    isEditing: true,
    hasChanges,
    onSave: handleSave,
  });

  const handleSaveComplete = useCallback(() => {
    triggerSuccess();
    setTimeout(() => {
      router.back();
    }, 600);
  }, [triggerSuccess, router]);

  return (
    <ModalScrollView style={styles.container}>
      <AddUserScreen
        ref={addUserScreenRef}
        onFieldChange={checkForChanges}
        onSaveComplete={handleSaveComplete}
      />
    </ModalScrollView>
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
