import React, {useState, useMemo, useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import {ThemedButton, Input, ThemedText} from '@/components/ui';
import {useTheme} from '@/providers';
import {DesignSystem} from '@/constants/typography';
import {useProfileDetails} from './use-profile-details';

type ThemeType = ReturnType<typeof useTheme>['theme'];

type ProfileRow = {
  key: keyof ProfileState;
  label: string;
  placeholder: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
};

type ProfileState = {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  phoneNumber: string;
};

export function ProfileContentEditable() {
  const {ds, theme} = useTheme();
  const styles = useMemo(() => createStyles(ds, theme), [ds, theme]);

  const profileDetails = useProfileDetails();

  const [profile, setProfile] = useState<ProfileState>({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    phoneNumber: '',
  });

  useEffect(() => {
    if (profileDetails) {
      setProfile({
        firstName: profileDetails.firstName ?? '',
        lastName: profileDetails.lastName ?? '',
        email: profileDetails.email ?? '',
        address: profileDetails.address ?? '',
        phoneNumber: profileDetails.phoneNumber ?? '',
      });
    }
  }, [profileDetails]);

  const fields: ProfileRow[] = [
    {key: 'firstName', label: 'First Name', placeholder: 'First Name'},
    {key: 'lastName', label: 'Last Name', placeholder: 'Last Name'},
    {
      key: 'email',
      label: 'Email Address',
      placeholder: 'Email Address',
      keyboardType: 'email-address',
    },
    {key: 'address', label: 'Address', placeholder: 'Address'},
    {
      key: 'phoneNumber',
      label: 'Phone Number',
      placeholder: 'Phone Number',
      keyboardType: 'phone-pad',
    },
  ];

  const updateField = (key: keyof ProfileState, value: string) => {
    setProfile((prev) => ({...prev, [key]: value}));
  };

  return (
    <View style={styles.container}>
      {fields.map((item) => (
        <View key={item.key} style={styles.fieldContainer}>
          <ThemedText variant="label" colorToken="label" style={styles.label}>
            {item.label}
          </ThemedText>
          <Input
            value={profile[item.key]}
            onChangeText={(text) => updateField(item.key, text)}
            placeholder={item.placeholder}
            keyboardType={item.keyboardType}
          />
        </View>
      ))}

      <View style={styles.actions}>
        <ThemedButton
          title="Save Profile"
          variant="primary"
          onPress={() => {
            // logic here
          }}
        />
      </View>
    </View>
  );
}

const createStyles = (ds: typeof DesignSystem, theme: ThemeType) =>
  StyleSheet.create({
    container: {
      gap: ds.spacing.lg,
      paddingTop: ds.spacing.md,
    },
    fieldContainer: {
      gap: ds.spacing.sm,
    },
    label: {
      paddingLeft: ds.spacing.sm,
    },
    actions: {
      paddingTop: ds.spacing.md,
      paddingBottom: ds.spacing.xxxl + ds.spacing.md,
    },
  });
