import React, {useCallback} from 'react';
import {ListSection} from '@/components/ui/list-section';
import {ScreenHeader} from '@/components/ui/screen-header';
import {
  Host,
  List,
  Section,
  listSectionMargins,
  listSectionSpacing,
} from '@/modules/sykamore-ui';
import {useTheme} from '@/providers';
import {AppIcons} from '@/utils';
import {
  PRIVACY_ACCOUNT_ROWS,
  PRIVACY_HEADER,
  PRIVACY_LEGAL_ROWS,
  PRIVACY_SECURITY_ROWS,
} from '../constants';

export function PrivacyContent() {
  const {ds} = useTheme();

  const handleRowPress = useCallback(() => {}, []);

  return (
    <Host style={{flex: 1}}>
      <List
        listStyle="automatic"
        modifiers={[listSectionSpacing(ds.spacing.xl)]}
      >
        <Section
          modifiers={[
            listSectionMargins({
              vertical: ds.spacing.xs,
            }),
          ]}
        >
          <ScreenHeader
            icon={AppIcons.ui.privacy}
            title={PRIVACY_HEADER.title}
            description={PRIVACY_HEADER.description}
          />
        </Section>

        <Section>
          {PRIVACY_SECURITY_ROWS.map((row) => (
            <ListSection.Row
              key={row.rowKey}
              icon={row.icon}
              iconColorToken={row.iconColorToken}
              title={row.title}
              onPress={handleRowPress}
            />
          ))}
        </Section>

        <Section>
          {PRIVACY_ACCOUNT_ROWS.map((row) => (
            <ListSection.Row
              key={row.rowKey}
              icon={row.icon}
              iconColorToken={row.iconColorToken}
              title={row.title}
              onPress={handleRowPress}
            />
          ))}
        </Section>

        <Section>
          {PRIVACY_LEGAL_ROWS.map((row) => (
            <ListSection.Row
              key={row.rowKey}
              icon={row.icon}
              iconColorToken={row.iconColorToken}
              title={row.title}
              onPress={handleRowPress}
            />
          ))}
        </Section>
      </List>
    </Host>
  );
}
