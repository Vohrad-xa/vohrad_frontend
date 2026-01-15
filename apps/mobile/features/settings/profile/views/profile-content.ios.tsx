import {forwardRef, useImperativeHandle, useEffect, useMemo} from 'react';
import {Palette} from '@/constants';
import {
  Host,
  List,
  Section,
  VStack,
  ZStack,
  Text,
  Circle,
  scrollDismissesKeyboard,
  foregroundStyle,
  listRowBackground,
  listSectionMargins,
  frame,
  font,
  padding,
} from '@/modules/sykamore-ui';
import {useTheme} from '@/providers';
import {getInitials, formatDate, capitalizeName} from '@/utils';
import {useProfileForm, useProfileActions} from '../hooks';
import type {ProfileContentHandle, ProfileContentProps} from '../types';

export const ProfileContentEditable = forwardRef<
  ProfileContentHandle,
  ProfileContentProps
>(({isEditing: _isEditing, onSaveComplete, onFieldChange}, ref) => {
  const {profile, profileDetails} = useProfileForm();
  const {hasChanges, handleSaveProfile} = useProfileActions({onSaveComplete});
  const {ds} = useTheme();

  useImperativeHandle(ref, () => ({
    saveProfile: handleSaveProfile,
    hasChanges,
  }));

  useEffect(() => {
    onFieldChange?.();
  }, [profile, onFieldChange]);

  // Get full name and initials
  const {fullName, initials} = useMemo(() => {
    const name = profileDetails
      ? `${profileDetails.first_name ?? ''} ${profileDetails.last_name ?? ''}`.trim()
      : '';
    return {
      fullName: capitalizeName(name) ?? 'No Name',
      initials: getInitials(name) ?? 'U',
    };
  }, [profileDetails]);

  return (
    <Host style={{flex: 1}}>
      <List
        listStyle="insetGrouped"
        selectionMode="none"
        selectEnabled={false}
        scrollEnabled
        modifiers={[scrollDismissesKeyboard('interactively')]}
      >
        <Section
          modifiers={[listRowBackground('clear'), listSectionMargins({top: 0})]}
        >
          <VStack
            alignment="center"
            spacing={ds.spacing.xxs * 3}
            modifiers={[
              frame({maxWidth: ds.screen.width, alignment: 'center'}),
            ]}
          >
            <ZStack alignment="center">
              <Circle
                modifiers={[
                  frame({width: 100, height: 100}),
                  foregroundStyle({
                    styleType: 'linearGradient',
                    colors: [Palette.blue, Palette.indigo],
                    startPoint: {x: 0.08, y: 0.02},
                    endPoint: {x: 0.92, y: 0.98},
                  }),
                  padding({bottom: ds.spacing.sm}),
                ]}
              />

              <Text
                modifiers={[
                  foregroundStyle({styleType: 'color', color: 'white'}),
                  font({
                    size: ds.typography.ios.largeTitle.baseSize,
                    design: 'rounded',
                    weight: 'semibold',
                  }),
                ]}
              >
                {initials}
              </Text>
            </ZStack>

            <Text
              modifiers={[
                font({
                  size: ds.typography.ios.title1.baseSize,
                  weight: 'semibold',
                }),
              ]}
            >
              {fullName}
            </Text>

            <Text
              modifiers={[
                foregroundStyle({
                  styleType: 'hierarchical',
                  hierarchicalStyle: 'secondary',
                }),
                font({
                  size: ds.typography.ios.footnote.baseSize,
                }),
              ]}
            >
              Since {formatDate(profileDetails?.created_at)}
            </Text>

            <Text
              modifiers={[
                foregroundStyle({
                  styleType: 'angularGradient',
                  colors: [Palette.blue, Palette.indigo],
                  center: {x: 0.8, y: 0.4},
                }),
                font({
                  size: ds.typography.ios.body.baseSize,
                  weight: 'medium',
                }),
              ]}
            >
              {profileDetails?.role || 'member'}
            </Text>
          </VStack>
        </Section>
      </List>
    </Host>
  );
});

ProfileContentEditable.displayName = 'ProfileContentEditableIOS';
