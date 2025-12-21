import {type ViewStyle} from 'react-native';
import {useRolesList} from '@/features/roles';
import {Picker} from '@/modules/sykamore-ui/src/android';
import type {Role} from '@sykamore/types';

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
  const selectedIndex = selectedRoleId ? roleIds.indexOf(selectedRoleId) : -1;

  return (
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
        ...style,
      }}
      onOptionSelected={({nativeEvent}: {nativeEvent: {index: number}}) =>
        onRoleSelect(roleIds[nativeEvent.index])
      }
    />
  );
}
