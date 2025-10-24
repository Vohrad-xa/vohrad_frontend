import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Stack} from 'expo-router';
import {
  ThemedView,
  ModalFlatList,
  ListRow,
  Divider,
  type ListRowData,
} from '@/components/ui';
import {type DSShape} from '@/constants/theme';
import {usePullToRefresh} from '@/hooks';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';

// Example data for items
const exampleItems: ListRowData[] = [
  {
    id: '1',
    name: 'Laptop Dell XPS 15',
    code: 'ITM-001',
    image: {uri: 'https://picsum.photos/100/100?random=1'},
    badge: 'ACTIVE',
    badgeType: 'active',
    count: 5,
  },
  {
    id: '2',
    name: 'Office Chair Ergonomic',
    code: 'ITM-002',
    image: {uri: 'https://picsum.photos/100/100?random=2'},
    badge: 'ERROR',
    badgeType: 'error',
    count: 12,
  },
  {
    id: '3',
    name: 'Conference Room Projector',
    code: 'ITM-003',
    image: {uri: 'https://picsum.photos/100/100?random=3'},
    badge: 'MAINTENANCE',
    badgeType: 'maintenance',
    count: 1,
  },
  {
    id: '4',
    name: 'Monitor 4K UltraWide',
    code: 'ITM-004',
    image: {uri: 'https://picsum.photos/100/100?random=4'},
    badge: 'INACTIVE',
    badgeType: 'inactive',
    count: 8,
  },
  {
    id: '5',
    name: 'Standing Desk Pro',
    code: 'ITM-005',
    image: {uri: 'https://picsum.photos/100/100?random=5'},
    badge: 'SUCCESS',
    badgeType: 'success',
    count: 3,
  },
  {
    id: '6',
    name: 'Wireless Keyboard MX',
    code: 'ITM-006',
    image: {uri: 'https://picsum.photos/100/100?random=6'},
    count: 0,
  },
  {
    id: '7',
    name: 'Noise Cancelling Headphones',
    code: 'ITM-007',
    image: {uri: 'https://picsum.photos/100/100?random=7'},
    badge: 'ACTIVE',
    badgeType: 'active',
    count: 15,
  },
  {
    id: '8',
    name: 'USB-C Hub Adapter',
    code: 'ITM-008',
    image: {uri: 'https://picsum.photos/100/100?random=8'},
    badge: 'ERROR',
    badgeType: 'error',
    count: 2,
  },
  {
    id: '9',
    name: 'MacBook Pro 16"',
    code: 'ITM-009',
    image: {uri: 'https://picsum.photos/100/100?random=9'},
    badge: 'ACTIVE',
    badgeType: 'active',
    count: 4,
  },
  {
    id: '10',
    name: 'iPad Air',
    code: 'ITM-010',
    image: {uri: 'https://picsum.photos/100/100?random=10'},
    badge: 'SUSPENDED',
    badgeType: 'suspended',
    count: 7,
  },
  {
    id: '11',
    name: 'Samsung Galaxy Tab S9',
    code: 'ITM-011',
    image: {uri: 'https://picsum.photos/100/100?random=11'},
    badge: 'ACTIVE',
    badgeType: 'active',
    count: 3,
  },
  {
    id: '12',
    name: 'Logitech MX Master 3',
    code: 'ITM-012',
    image: {uri: 'https://picsum.photos/100/100?random=12'},
    count: 10,
  },
  {
    id: '13',
    name: 'Dell UltraSharp 27"',
    code: 'ITM-013',
    image: {uri: 'https://picsum.photos/100/100?random=13'},
    badge: 'MAINTENANCE',
    badgeType: 'maintenance',
    count: 1,
  },
  {
    id: '14',
    name: 'Herman Miller Aeron Chair',
    code: 'ITM-014',
    image: {uri: 'https://picsum.photos/100/100?random=14'},
    badge: 'ACTIVE',
    badgeType: 'active',
    count: 2,
  },
  {
    id: '15',
    name: 'Sony WH-1000XM5',
    code: 'ITM-015',
    image: {uri: 'https://picsum.photos/100/100?random=15'},
    badge: 'INACTIVE',
    badgeType: 'inactive',
    count: 5,
  },
  {
    id: '16',
    name: 'Microsoft Surface Pro',
    code: 'ITM-016',
    image: {uri: 'https://picsum.photos/100/100?random=16'},
    badge: 'ERROR',
    badgeType: 'error',
    count: 0,
  },
  {
    id: '17',
    name: 'LG OLED 55"',
    code: 'ITM-017',
    image: {uri: 'https://picsum.photos/100/100?random=17'},
    badge: 'ACTIVE',
    badgeType: 'active',
    count: 1,
  },
  {
    id: '18',
    name: 'Apple Magic Keyboard',
    code: 'ITM-018',
    image: {uri: 'https://picsum.photos/100/100?random=18'},
    count: 8,
  },
  {
    id: '19',
    name: 'Varidesk Electric Standing Desk',
    code: 'ITM-019',
    image: {uri: 'https://picsum.photos/100/100?random=19'},
    badge: 'SUCCESS',
    badgeType: 'success',
    count: 3,
  },
  {
    id: '20',
    name: 'Jabra Evolve 75',
    code: 'ITM-020',
    image: {uri: 'https://picsum.photos/100/100?random=20'},
    badge: 'ACTIVE',
    badgeType: 'active',
    count: 6,
  },
  {
    id: '21',
    name: 'Canon PIXMA Printer',
    code: 'ITM-021',
    image: {uri: 'https://picsum.photos/100/100?random=21'},
    badge: 'MAINTENANCE',
    badgeType: 'maintenance',
    count: 2,
  },
  {
    id: '22',
    name: 'Anker PowerHub',
    code: 'ITM-022',
    image: {uri: 'https://picsum.photos/100/100?random=22'},
    count: 15,
  },
  {
    id: '23',
    name: 'Brother HL-L2350DW',
    code: 'ITM-023',
    image: {uri: 'https://picsum.photos/100/100?random=23'},
    badge: 'ERROR',
    badgeType: 'error',
    count: 0,
  },
  {
    id: '24',
    name: 'Google Nest Hub',
    code: 'ITM-024',
    image: {uri: 'https://picsum.photos/100/100?random=24'},
    badge: 'ACTIVE',
    badgeType: 'active',
    count: 4,
  },
  {
    id: '25',
    name: 'Ring Video Doorbell',
    code: 'ITM-025',
    image: {uri: 'https://picsum.photos/100/100?random=25'},
    badge: 'SUSPENDED',
    badgeType: 'suspended',
    count: 1,
  },
];

export default function SupportScreen() {
  const {ds} = useTheme();
  const styles = createStyles(ds);
  const [_searchQuery, setSearchQuery] = useState('');

  const handleRefresh = async () => {
    // TODO: Implement items refresh logic
  };

  const {refreshControl} = usePullToRefresh({
    onRefresh: handleRefresh,
  });

  const renderItem = ({item, index}: {item: ListRowData; index: number}) => (
    <View>
      <ListRow item={item} showImage />
      {index < exampleItems.length - 1 && (
        <View style={styles.dividerContainer}>
          <Divider />
        </View>
      )}
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Items',
          headerSearchBarOptions: {
            obscureBackground: true,
            placement: 'integrated',
            placeholder: 'Search...',
            onChangeText: (event) => {
              setSearchQuery(event.nativeEvent.text);
            },
          },
        }}
      />
      <ThemedView style={styles.container}>
        <ModalFlatList
          data={exampleItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          refreshControl={refreshControl}
        />
      </ThemedView>
    </>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape) =>
    StyleSheet.create({
      container: {
        flex: 1,
      },
      dividerContainer: {
        paddingLeft: ds.spacing.xl + 25 + ds.spacing.md,
        paddingRight: ds.spacing.xl,
      },
    }),
  (ds) => `${ds.version}`,
);
