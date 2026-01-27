import React, {useLayoutEffect} from 'react';
import {Platform} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Palette} from '@/constants';
import {OrganizationInfoView} from '@/features/settings';
import {AppIcons} from '@/utils/icons';
import {getHeaderOptions} from '@/utils/navigation/header-actions';

export default function OrganizationInfoScreen() {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    const options = getHeaderOptions({
      right: [
        {
          type: 'button',
          key: 'save',
          label: 'Save',
          onPress: () => {},
          iosSymbol: AppIcons.actions.save,
          icon: AppIcons.actions.save,
          variant: 'done',
          tintColor: Platform.OS === 'ios' ? Palette.orange : undefined,
        },
      ],
    });

    navigation.setOptions({
      headerRight: options.headerRight,
      unstable_headerRightItems: options.unstable_headerRightItems,
    });
  }, [navigation]);

  return <OrganizationInfoView />;
}
