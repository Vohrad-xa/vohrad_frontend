import React, {forwardRef, useImperativeHandle} from 'react';
import {StyleSheet, View, Pressable} from 'react-native';
import {TextInput, List} from 'react-native-paper';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useRolesList} from '@/features/roles';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';
import {DatePicker, Picker} from 'sykamore-ui/android';
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
  const roleIds = activeRoles.map((role: Role) => role.id);
  const roleNames = activeRoles.map((role: Role) => role.name);
  const selectedIndex = formData.role_id
    ? roleIds.indexOf(formData.role_id)
    : -1;

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
            <Picker
              options={roleNames}
              selectedIndex={selectedIndex}
              variant="menu"
              triggerContentPadding={{start: 12, end: 8}}
              style={{
                borderStyle: 'solid',
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 25,
                height: 35,
              }}
              onOptionSelected={({
                nativeEvent,
              }: {
                nativeEvent: {index: number};
              }) => handleRoleSelect(roleIds[nativeEvent.index])}
            />
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
    }),
  (ds, theme) => themeKey(theme, ds),
);
