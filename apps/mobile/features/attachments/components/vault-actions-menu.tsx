import React from 'react';
import {Platform} from 'react-native';
import {SykaMenuView, type SykaMenuAction} from 'syka-menu';
import {HeaderButton} from '@/components/ui';
import {useTheme} from '@/providers';
import {AppIcons} from '@/utils';

interface VaultActionsMenuProps {
  onAddDocument: () => void;
  onScanDocument?: () => void;
  onFilter?: () => void;
}

export function VaultActionsMenu({
  onAddDocument,
  onScanDocument,
  onFilter,
}: VaultActionsMenuProps) {
  const {theme} = useTheme();

  const menuActions: SykaMenuAction[] = [
    {
      title: 'Actions',
      preferredElementSize: 'large',
      subtitle: 'Manage your vault items',
      menuOptions: {displayInline: true},
      subactions: [
        {
          id: 'add-document',
          title: 'Add Document',

          image: Platform.select({
            ios: AppIcons.actions.add,
            android: 'outlined.Add',
          }),
          imageColor: theme.accentBlue,
          subtitle: 'Upload documents to your vault.',
        },
        {
          id: 'scan-document',
          title: 'Scan Document',
          image: Platform.select({
            ios: AppIcons.actions.scan,
            android: 'outlined.DocumentScanner',
          }),
          imageColor: theme.accentBlue,
        },
        {
          id: 'delete',
          title: 'Delete',
          image: Platform.select({
            ios: 'trash',
            android: 'outlined.Delete',
          }),
          imageColor: theme.accentRed,
          separator: true,
          attributes: {destructive: true},
        },
      ],
    },

    {
      id: 'filter-images',
      title: 'Images',
      image: Platform.select({
        ios: AppIcons.files.image,
        android: 'outlined.Image',
      }),
    },
    {
      id: 'filter-documents',
      title: 'Documents',
      image: Platform.select({
        ios: AppIcons.files.document,
        android: 'outlined.Description',
      }),
    },
    {
      id: 'filter-archives',
      title: 'Archives',
      image: Platform.select({
        ios: AppIcons.files.archive,
        android: 'outlined.Archive',
      }),
    },
    {
      id: 'filter-other',
      title: 'Other',
      image: Platform.select({
        ios: AppIcons.files.file,
        android: 'outlined.InsertDriveFile',
      }),
    },
    {
      id: 'support-overview',
      title: 'Support overview',
      subtitle: 'Full menu features',
      image: Platform.select({
        ios: 'questionmark.circle',
        android: 'outlined.Info',
      }),
      imageColor: theme.icon,
      attributes: {keepsMenuPresented: true},
      androidTitleColor: theme.accentBlue,
    },
    {
      id: 'support-email',
      title: 'Email Support',
      subtitle: 'Weekdays 9-5',
      image: Platform.select({ios: 'envelope', android: 'outlined.Email'}),
    },
    {
      id: 'support-call',
      title: 'Call Support',
      image: Platform.select({ios: 'phone', android: 'outlined.Phone'}),
    },
    {
      id: 'support-priority',
      title: 'Priority Support',
      androidTitleColor: theme.accentOrange,
      image: Platform.select({ios: 'star', android: 'outlined.Star'}),
      imageColor: theme.accentOrange,
    },
    {
      id: 'support-disabled',
      title: 'Disabled option',
      attributes: {disabled: true},
      image: Platform.select({
        ios: 'hand.raised',
        android: 'outlined.Clear',
      }),
    },
    {
      id: 'support-alerts',
      title: 'Support alerts',
      state: 'on',
      image: Platform.select({
        ios: 'bell',
        android: 'outlined.Notifications',
      }),
    },
    {
      id: 'support-diagnostics',
      title: 'Share diagnostics',
      state: 'mixed',
      image: Platform.select({
        ios: 'checkmark.circle',
        android: 'outlined.List',
      }),
    },
    {
      title: 'Legal',
      menuOptions: {displayInline: true},
      subactions: [
        {
          id: 'support-terms',
          title: 'Terms of Service',
          image: Platform.select({
            ios: 'doc.text',
            android: 'outlined.Description',
          }),
        },
        {
          id: 'support-privacy',
          title: 'Privacy Policy',
          image: Platform.select({
            ios: 'hand.raised',
            android: 'outlined.Visibility',
          }),
        },
        {
          id: 'support-licenses',
          title: 'Licenses (hidden example)',
          attributes: {hidden: true},
        },
      ],
    },
    {
      title: 'Advanced',
      preferredElementSize: 'medium',
      menuOptions: {displayInline: false},
      subactions: [
        {
          id: 'support-refresh',
          title: 'Refresh status',
          attributes: {keepsMenuPresented: true},
          image: Platform.select({
            ios: 'arrow.clockwise',
            android: 'outlined.Refresh',
          }),
        },
        {
          id: 'support-export',
          title: 'Export logs',
          image: Platform.select({
            ios: 'square.and.arrow.up',
            android: 'outlined.Share',
          }),
        },
        {
          id: 'support-reset',
          title: 'Reset cache',
          attributes: {destructive: true},
          image: Platform.select({ios: 'trash', android: 'outlined.Delete'}),
        },
        {
          id: 'support-delete',
          title: 'Delete account',
          attributes: {destructive: true},
          image: Platform.select({
            ios: 'trash.fill',
            android: 'outlined.Delete',
          }),
        },
        {
          id: 'support-modify-delete',
          title: 'Modify & Delete',
          attributes: {destructive: true},
          image: Platform.select({
            ios: 'trash.fill',
            android: 'outlined.Delete',
          }),
        },
      ],
    },
  ];

  const handleSelect = (actionId: string) => {
    switch (actionId) {
      case 'add-document':
        onAddDocument();
        break;
      case 'scan-document':
        onScanDocument?.();
        break;
      case 'filter-images':
      case 'filter-documents':
      case 'filter-archives':
      case 'filter-other':
        onFilter?.();
        break;
    }
  };

  return (
    <SykaMenuView
      title="menu"
      actions={menuActions}
      onPressAction={({nativeEvent}) => handleSelect(nativeEvent.event)}
      ripple={{
        mode: 'circle',
      }}
    >
      <HeaderButton variant="more" accessibilityLabel="Vault actions" />
    </SykaMenuView>
  );
}
