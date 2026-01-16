import {useRef, useCallback, useLayoutEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {router} from 'expo-router';
import {NameContent, type NameContentHandle} from '@/features/settings/profile';
import {getHeaderOptions} from '@/utils/navigation/header-actions';

export default function NameModal() {
  const navigation = useNavigation();
  const contentRef = useRef<NameContentHandle>(null);

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

  return <NameContent ref={contentRef} />;
}
