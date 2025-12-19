import {Platform, type ViewStyle, Pressable} from 'react-native';
import {ThemedText} from '@/components/ui';
import {PaperMenu} from '@/components/ui/paper-menu';
import {useRolesList} from '@/features/roles';
import type {Role} from '@vohrad/types';

type RolePickerProps = {
  selectedRoleId?: string;
  onRoleSelect: (roleId: string) => void;
  style?: ViewStyle;
};

export function RolePicker({
  selectedRoleId,
  onRoleSelect,
  style,
}: RolePickerProps) {
  const {roles} = useRolesList();

  const activeRoles = roles.filter((role: Role) => role.is_active);
  const roleIds = activeRoles.map((role: Role) => role.id);
  const roleNames = activeRoles.map((role: Role) => role.name);

  const selectedRole = activeRoles.find(
    (role: Role) => role.id === selectedRoleId,
  );
  const displayText = selectedRole?.name ?? 'Select Role';

  if (Platform.OS === 'ios') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const {Host, Picker} = require('@/modules/sykamore-ui/src/ios');
    const selectedIndex = selectedRoleId ? roleIds.indexOf(selectedRoleId) : -1;

    return (
      <Host matchContents style={style} useViewportSizeMeasurement>
        <Picker
          label="Role"
          options={roleNames}
          selectedIndex={selectedIndex}
          variant="menu"
          onOptionSelected={({nativeEvent}: {nativeEvent: {index: number}}) =>
            onRoleSelect(roleIds[nativeEvent.index])
          }
        />
      </Host>
    );
  }

  const actions = roleIds.map((id, index) => ({
    id,
    title: roleNames[index],
    state: selectedRoleId === id ? ('on' as const) : undefined,
  }));

  return (
    <PaperMenu actions={actions} onSelect={(id) => onRoleSelect(id)}>
      <Pressable style={style}>
        <ThemedText variant="label">{displayText}</ThemedText>
      </Pressable>
    </PaperMenu>
  );
}
