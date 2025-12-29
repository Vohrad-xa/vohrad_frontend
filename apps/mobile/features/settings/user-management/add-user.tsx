import React, {forwardRef, useImperativeHandle} from 'react';
import {StyleSheet, View, Pressable} from 'react-native';
import {Button, TextInput, List} from 'react-native-paper';
import {SykaMenuView, type SykaMenuAction} from 'syka-menu';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useRolesList} from '@/features/roles';
import {useTheme} from '@/providers';
import {AppIcons} from '@/utils';
import {makeStyleFactory} from '@/utils/style-factory';
import {DatePicker} from 'sykamore-ui/android';
import {useAddUser} from './use-add-user';
import type {Role} from '@sykamore/types';

export type AddUserScreenHandle = {
  saveUser: () => Promise<boolean>;
  hasChanges: () => boolean;
};

type AddUserScreenProps = {
  onSaveComplete?: () => void;
  onFieldChange?: () => void;
};

export const AddUserScreen = forwardRef<
  AddUserScreenHandle,
  AddUserScreenProps
>(({onSaveComplete, onFieldChange}, ref) => {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);

  const {
    formData,
    showDatePicker,
    setShowDatePicker,
    handleFieldChange,
    handleRoleSelect,
    hasChanges,
    saveUser,
    textFields,
  } = useAddUser(onSaveComplete, onFieldChange);

  const {roles} = useRolesList();
  const activeRoles = roles?.filter((role: Role) => role.is_active) ?? [];
  const hasRoles = activeRoles.length > 0;
  const selectedRoleName = hasRoles
    ? (activeRoles.find((role) => role.id === formData.role_id)?.name ??
      'Select role')
    : 'No roles';
  const menuActions: SykaMenuAction[] = hasRoles
    ? activeRoles.map((role) => ({
        id: role.id,
        title: role.name,
        state: formData.role_id === role.id ? 'on' : 'off',
      }))
    : [
        {
          id: 'no-roles',
          title: 'No roles available',
          attributes: {disabled: true},
        },
      ];
  const handleRoleMenuSelect = (roleId: string) => {
    if (!hasRoles || roleId === 'no-roles') return;
    handleRoleSelect(roleId);
  };

  useImperativeHandle(ref, () => ({
    saveUser,
    hasChanges,
  }));

  return (
    <View>
      <List.Section
        title="Role Assignment"
        titleStyle={styles.sectionTitleStyle}
      >
        <List.Item
          style={styles.itemList}
          title="Select role for the new User"
          right={() => (
            <SykaMenuView
              actions={menuActions}
              onPressAction={({nativeEvent}) =>
                handleRoleMenuSelect(nativeEvent.event)
              }
              accessibilityLabel="Select role"
            >
              <Button
                icon={AppIcons.ui.chevronUpDown}
                mode="elevated"
                contentStyle={{flexDirection: 'row-reverse'}}
                accessibilityLabel="Selected role"
                style={styles.rolTriggerButton}
              >
                {selectedRoleName}
              </Button>
            </SykaMenuView>
          )}
        />
      </List.Section>
      <List.Section
        title="User Information"
        style={styles.inputGroup}
        titleStyle={{
          ...styles.sectionTitleStyle,
        }}
      >
        {textFields.map((field) => (
          <TextInput
            key={field.key}
            label={field.label}
            value={(formData[field.key] as string) ?? ''}
            onChangeText={(val) => handleFieldChange(field.key, val)}
            keyboardType={field.keyboardType}
            autoCapitalize={field.autoCapitalize}
            secureTextEntry={field.secureTextEntry}
            textColor={theme.text}
            activeOutlineColor={theme.secondary}
            outlineStyle={styles.input}
            mode="outlined"
          />
        ))}
        <Pressable onPress={() => setShowDatePicker(true)}>
          <TextInput
            label="Date of Birth"
            value={
              formData.date_of_birth
                ? new Date(formData.date_of_birth).toLocaleDateString()
                : ''
            }
            editable={false}
            activeOutlineColor={theme.primary}
            outlineStyle={styles.input}
            mode="outlined"
            pointerEvents="none"
            right={
              <TextInput.Icon
                icon="calendar"
                forceTextInputFocus
                onPress={() => setShowDatePicker(true)}
              />
            }
          />
        </Pressable>
        {showDatePicker && (
          <DatePicker
            initialDate={formData.date_of_birth ?? null}
            onDateSelected={(date) => {
              if (date) {
                handleFieldChange('date_of_birth', date);
              }
              setShowDatePicker(false);
            }}
            onDismiss={() => setShowDatePicker(false)}
            confirmText="OK"
            dismissText="Cancel"
          />
        )}
      </List.Section>
    </View>
  );
});

AddUserScreen.displayName = 'AddUserScreen';

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      inputGroup: {
        gap: ds.spacing.sm,
      },
      input: {
        backgroundColor: theme.card,
        borderRadius: ds.components.input.borderRadius,
        borderWidth: 0,
      },
      sectionTitleStyle: {
        ...ds.typography.sectionTitle,
      },
      itemList: {
        paddingRight: 0,
        paddingLeft: 0,
        paddingVertical: 0,
      },
      rolTriggerButton: {
        width: 115,
        maxWidth: 160,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
