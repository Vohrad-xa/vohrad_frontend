import {useRef, useCallback} from 'react';
import {Platform, ScrollView} from 'react-native';
import {useNavigation, useRouter} from 'expo-router';
import {AddUserScreen, type AddUserScreenHandle} from '@/features/settings';
import {useSettingsHeader} from '@/hooks';

export default function AddUserModal() {
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
    <ScrollView scrollEnabled showsVerticalScrollIndicator style={{flex: 1}}>
      {addUserScreen}
    </ScrollView>
  );
}
