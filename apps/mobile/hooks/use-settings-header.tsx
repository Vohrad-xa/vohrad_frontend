import {useLayoutEffect} from 'react';
import {Platform, View, Text, Pressable} from 'react-native';
import {ThemedButton} from '@/components/ui';
import {useTheme} from '@/providers';

type Navigation = {
  setOptions: (options: object) => void;
  goBack: () => void;
};

type UseSettingsHeaderOptions = {
  navigation: Navigation;
  isEditing: boolean;
  hasChanges: boolean;
  onSave: () => void;
};

export function useSettingsHeader({
  navigation,
  isEditing,
  hasChanges,
  onSave,
}: UseSettingsHeaderOptions) {
  const {ds, theme} = useTheme();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerBackTitle: 'Settings',
      headerLeft:
        Platform.OS === 'web'
          ? () => (
              <View style={{paddingHorizontal: ds.spacing.md}}>
                <ThemedButton
                  title="Back"
                  variant="primary"
                  size="sm"
                  onPress={() => navigation.goBack()}
                />
              </View>
            )
          : undefined,
      headerRight: () =>
        Platform.OS === 'web' ? (
          <View style={{paddingHorizontal: ds.spacing.md}}>
            <ThemedButton
              title="Save"
              variant="primary"
              size="sm"
              onPress={onSave}
              disabled={!hasChanges}
            />
          </View>
        ) : (
          <Pressable onPress={onSave} style={{paddingHorizontal: 16}}>
            <Text style={{color: theme.text, fontSize: 17}}>
              {isEditing ? 'Save' : 'Edit'}
            </Text>
          </Pressable>
        ),
    });
  }, [navigation, onSave, isEditing, theme.text, ds.spacing.md, hasChanges]);
}
