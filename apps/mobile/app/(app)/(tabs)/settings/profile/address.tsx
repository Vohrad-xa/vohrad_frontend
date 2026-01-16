import {useRef, useCallback, useLayoutEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {router} from 'expo-router';
import {
  AddressContent,
  type AddressContentHandle,
} from '@/features/settings/profile';
import {getHeaderOptions} from '@/utils/navigation/header-actions';

export default function AddressModal() {
  const navigation = useNavigation();
  const contentRef = useRef<AddressContentHandle>(null);

  const handleSave = useCallback(async () => {
    await contentRef.current?.save();
    router.dismiss();
  }, []);

  useLayoutEffect(() => {
    const options = getHeaderOptions({
      right: [
        {
          type: 'button',
          key: 'save',
          label: 'Save',
          iosSymbol: 'checkmark',
          icon: 'content-save',
          variant: 'prominent',
          onPress: handleSave,
        },
      ],
    });

    navigation.setOptions({
      headerRight: options.headerRight,
      unstable_headerRightItems: options.unstable_headerRightItems,
    });
  }, [navigation, handleSave]);

  return <AddressContent ref={contentRef} />;
}
