import {ScrollView} from 'react-native';
import {Avatar, List} from 'react-native-paper';
import {ThemedText} from '@/components/ui';
import {ListRows, type ListRowProps} from '@/components/ui';
import {Palette} from '@/constants';
import {formatDate, getInitials} from '@/utils';
import {PROFILE_FIELDS} from '../constants/profile-constants';
import {useProfile} from '../hooks';

const NOT_SET = 'Not set';

export function ProfileContent() {
  const {
    profileDetails,
    fullName,
    dateOfBirth,
    email,
    phoneNumber,
    city,
    postalCode,
    country,
  } = useProfile();

  const displayName = fullName?.trim() || 'User';
  const initials = getInitials(displayName) ?? 'U';

  const memberSince = profileDetails?.created_at
    ? formatDate(profileDetails.created_at)
    : '—';

  const roleText = profileDetails?.role ?? 'Member';
  const birthDateText = dateOfBirth ? formatDate(dateOfBirth) : NOT_SET;

  const emailText = email ?? NOT_SET;
  const phoneText = phoneNumber ?? NOT_SET;
  const shortAddress =
    [city, postalCode, country].filter(Boolean).join(' ') || NOT_SET;

  const PERSONAL_ROWS = [
    {...PROFILE_FIELDS.name, description: displayName},
    {...PROFILE_FIELDS.dateOfBirth, description: birthDateText},
  ] as const satisfies readonly ListRowProps[];

  const CONTACT_ROWS = [
    {...PROFILE_FIELDS.email, description: emailText},
    {...PROFILE_FIELDS.phoneNumber, description: phoneText},
  ] as const satisfies readonly ListRowProps[];

  const ADDRESS_ROWS = [
    {
      ...PROFILE_FIELDS.address,
      description: shortAddress,
      descriptionNumberOfLines: 1,
      descriptionEllipsizeMode: 'middle',
    },
  ] as const satisfies readonly ListRowProps[];

  return (
    <ScrollView style={{flex: 1}}>
      <List.Item
        title={<ThemedText variant="title1">{displayName}</ThemedText>}
        description={
          <ThemedText variant="footnote" colorToken="muted">
            {roleText} • Since {memberSince}
          </ThemedText>
        }
        right={() => (
          <Avatar.Text
            label={initials}
            labelStyle={{letterSpacing: 2}}
            accessibilityLabel={`${displayName} avatar`}
            color={Palette.white}
            size={48}
          />
        )}
      />

      <List.Section>
        <ListRows rows={PERSONAL_ROWS} />
      </List.Section>

      <List.Section>
        <ListRows rows={CONTACT_ROWS} />
      </List.Section>

      <List.Section>
        <ListRows rows={ADDRESS_ROWS} />
      </List.Section>
    </ScrollView>
  );
}
