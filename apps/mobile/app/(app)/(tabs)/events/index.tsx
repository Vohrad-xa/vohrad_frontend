import {useCallback, useMemo, useState} from 'react';
import {Alert} from 'react-native';
import {Stack} from 'expo-router';
import {glassEffect} from '@expo/ui/swift-ui/modifiers';
import {
  Host,
  List,
  Button,
  Section,
  Text,
  Image,
  Switch,
  Picker,
  ContextMenu,
  Divider,
  TextField,
  padding,
  background,
  cornerRadius,
  shadow,
  foregroundStyle,
  tint,
  clipShape,
  frame,
  Label,
  type SwipeActionsConfig,
  Spacer,
  HStack,
  VStack,
  opacity,
  border,
  scaleEffect,
  rotationEffect,
  offset,
  onTapGesture,
  onLongPressGesture,
  blur,
  brightness,
  saturation,
  hueRotation,
  Submenu,
} from '@/modules/sykamore-ui';

export default function EventsPage() {
  const [refreshing, setRefreshing] = useState(false);
  const [lastAction, setLastAction] = useState<string>('None');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [pickerChoice, setPickerChoice] = useState<string | number>('today');
  const [searchText, setSearchText] = useState('Bento launch');

  const leadingActions = useMemo<SwipeActionsConfig>(
    () => ({
      actions: [{id: 'unread', label: 'Unread', systemImage: 'envelope.badge'}],
      allowsFullSwipe: false,
    }),
    [],
  );

  const trailingActions = useMemo<SwipeActionsConfig>(
    () => ({
      actions: [
        {
          id: 'delete',
          label: 'Delete',
          systemImage: 'trash',
          role: 'destructive',
        },
        {id: 'edit', label: 'Edit', systemImage: 'pencil', role: 'cancel'},
      ],
      allowsFullSwipe: true,
    }),
    [],
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  }, []);

  const handleSwipeAction = (actionId: string, label: string) => {
    setLastAction(`${label} (${actionId})`);
    Alert.alert('Swipe Action', `Action: ${label}`);
  };

  return (
    <>
      <Stack.Screen options={{title: 'Sykamore UI Demos'}} />

      <Host style={{flex: 1}}>
        <List
          listStyle="automatic"
          showScrollIndicators={false}
          selectEnabled
          refreshEnabled
          refreshing={refreshing}
          onRefresh={handleRefresh}
          trailingSwipeActions={trailingActions}
          leadingSwipeActions={leadingActions}
          onSwipeAction={handleSwipeAction}
        >
          {/* HStack & VStack Layouts */}
          <Section
            title="Layout Stacks"
            footer={
              <Text>
                Native SwiftUI HStack and VStack components with spacing and
                alignment
              </Text>
            }
          >
            <HStack
              spacing={16}
              alignment="center"
              modifiers={[
                padding({all: 16}),
                background('#1e293b'),
                cornerRadius(12),
              ]}
            >
              <Image
                systemName="flame.fill"
                size={24}
                modifiers={[tint('#f97316')]}
              />
              <VStack spacing={4} alignment="leading">
                <Text modifiers={[foregroundStyle('#ffffff')]}>
                  HStack Demo
                </Text>
                <Text modifiers={[foregroundStyle('#94a3b8'), opacity(0.8)]}>
                  Horizontal layout with icon
                </Text>
              </VStack>
            </HStack>

            <VStack
              spacing={12}
              alignment="center"
              modifiers={[
                padding({all: 16}),
                background('#7c3aed22'),
                cornerRadius(12),
                border({color: '#7c3aed', width: 1}),
              ]}
            >
              <Image
                systemName="star.fill"
                size={32}
                modifiers={[tint('#fbbf24')]}
              />
              <Text modifiers={[foregroundStyle('#7c3aed')]}>VStack Demo</Text>
              <Text modifiers={[foregroundStyle('#6b7280'), opacity(0.9)]}>
                Vertical centered layout
              </Text>
            </VStack>

            <HStack spacing={8} alignment="center">
              <Button
                variant="borderedProminent"
                controlSize="small"
                systemImage="square.fill"
                color="#3b82f6"
              >
                Blue
              </Button>
              <Button
                variant="glassProminent"
                controlSize="small"
                systemImage="circle.fill"
                color="#ef4444"
              >
                Red
              </Button>
              <Button
                variant="borderedProminent"
                controlSize="small"
                systemImage="star.fill"
                color="#22c55e"
              >
                Green
              </Button>
            </HStack>
          </Section>

          {/* Button Variants & Styles */}
          <Section
            title="Button Variants"
            footer={
              <Text>
                Different button styles - notice how color affects them
              </Text>
            }
          >
            <VStack spacing={8} alignment="leading">
              <Text modifiers={[opacity(0.7), padding({vertical: 4})]}>
                Bordered: color = icon + text color
              </Text>
              <Button variant="bordered" systemImage="heart" color="#ef4444">
                Bordered Red
              </Button>
              <Button variant="bordered" systemImage="star" color="#f59e0b">
                Bordered Orange
              </Button>

              <Divider />

              <Text modifiers={[opacity(0.7), padding({vertical: 4})]}>
                BorderedProminent: color = background (icon auto-contrasts)
              </Text>
              <Button
                variant="borderedProminent"
                systemImage="heart.fill"
                color="#ef4444"
              >
                Prominent Red
              </Button>
              <Button
                variant="borderedProminent"
                systemImage="star.fill"
                color="#f59e0b"
              >
                Prominent Orange
              </Button>

              <Divider />

              <Text modifiers={[opacity(0.7), padding({vertical: 4})]}>
                Plain: color = icon + text color
              </Text>
              <Button
                variant="plain"
                systemImage="paperplane.fill"
                color="#3b82f6"
              >
                Plain Blue
              </Button>

              <Divider />

              <Text modifiers={[opacity(0.7), padding({vertical: 4})]}>
                Custom: Full control with HStack + Image
              </Text>
              <Button variant="bordered" onPress={() => Alert.alert('Custom')}>
                <HStack spacing={6} alignment="center">
                  <Image
                    systemName="sparkles"
                    size={16}
                    modifiers={[tint('#ec4899')]}
                  />
                  <Text modifiers={[foregroundStyle('#8b5cf6')]}>
                    Custom Colors
                  </Text>
                </HStack>
              </Button>
            </VStack>

            <Divider />

            <HStack spacing={8}>
              <Button
                controlSize="mini"
                variant="borderedProminent"
                systemImage="circle"
              >
                Mini
              </Button>
              <Button
                controlSize="small"
                variant="borderedProminent"
                systemImage="circle"
              >
                Small
              </Button>
              <Button
                controlSize="regular"
                variant="borderedProminent"
                systemImage="circle"
              >
                Regular
              </Button>
              <Button
                controlSize="large"
                variant="borderedProminent"
                systemImage="circle"
              >
                Large
              </Button>
            </HStack>

            <HStack spacing={8}>
              <Button role="default" variant="bordered" systemImage="checkmark">
                Default
              </Button>
              <Button role="cancel" variant="bordered" systemImage="xmark">
                Cancel
              </Button>
              <Button role="destructive" variant="bordered" systemImage="trash">
                Delete
              </Button>
            </HStack>
          </Section>

          {/* Image & SF Symbols */}
          <Section
            title="Images & SF Symbols"
            footer={<Text>Native SF Symbols with modifiers and effects</Text>}
          >
            <HStack spacing={16} alignment="center">
              <Image
                systemName="sun.max.fill"
                size={40}
                modifiers={[
                  tint('#f59e0b'),
                  background('#fef3c7'),
                  clipShape('circle'),
                  frame({width: 60, height: 60}),
                ]}
              />
              <Image
                systemName="moon.stars.fill"
                size={40}
                modifiers={[
                  tint('#6366f1'),
                  background('#e0e7ff'),
                  clipShape('circle'),
                  frame({width: 60, height: 60}),
                ]}
              />
              <Image
                systemName="cloud.rain.fill"
                size={40}
                modifiers={[
                  tint('#3b82f6'),
                  background('#dbeafe'),
                  clipShape('circle'),
                  frame({width: 60, height: 60}),
                ]}
              />
            </HStack>

            <HStack spacing={12}>
              <Image
                systemName="heart.fill"
                size={32}
                modifiers={[
                  tint('#ef4444'),
                  scaleEffect(1.2),
                  shadow({radius: 4, y: 2, color: '#ef444433'}),
                ]}
                onPress={() => Alert.alert('Heart', 'Tapped!')}
              />
              <Image
                systemName="star.fill"
                size={32}
                modifiers={[
                  tint('#fbbf24'),
                  rotationEffect(45),
                  shadow({radius: 4, y: 2, color: '#fbbf2433'}),
                ]}
              />
              <Image
                systemName="bolt.fill"
                size={32}
                modifiers={[
                  tint('#8b5cf6'),
                  offset({y: -4}),
                  shadow({radius: 4, y: 2, color: '#8b5cf633'}),
                ]}
              />
            </HStack>

            <VStack spacing={8}>
              <Image
                systemName="photo.fill"
                size={24}
                modifiers={[
                  foregroundStyle({
                    type: 'linearGradient',
                    colors: ['#f97316', '#ec4899', '#8b5cf6'],
                    startPoint: {x: 0, y: 0},
                    endPoint: {x: 1, y: 1},
                  }),
                ]}
              />
              <Text modifiers={[opacity(0.7)]}>Linear Gradient</Text>
            </VStack>
          </Section>

          {/* Text Styles & Effects */}
          <Section
            title="Text Components"
            footer={<Text>Text with various modifiers and effects</Text>}
          >
            <VStack spacing={8} alignment="leading">
              <Text
                modifiers={[
                  foregroundStyle('#1e293b'),
                  padding({all: 8}),
                  background('#f1f5f9'),
                  cornerRadius(8),
                ]}
              >
                Standard Text with Background
              </Text>
              <Text
                modifiers={[
                  foregroundStyle({
                    type: 'linearGradient',
                    colors: ['#3b82f6', '#8b5cf6', '#ec4899'],
                    startPoint: {x: 0, y: 0},
                    endPoint: {x: 1, y: 0},
                  }),
                  padding({all: 4}),
                ]}
              >
                Gradient Text Effect
              </Text>
              <Text modifiers={[opacity(0.5)]}>Text with 50% Opacity</Text>
              <Text
                modifiers={[
                  foregroundStyle('#ef4444'),
                  shadow({radius: 2, y: 1, color: '#00000033'}),
                ]}
              >
                Text with Shadow
              </Text>
            </VStack>
          </Section>

          {/* Context Menu with Submenu */}
          <Section
            title="Context Menus"
            footer={
              <Text>Long-press to reveal native context menu with submenu</Text>
            }
          >
            <ContextMenu activationMethod="longPress">
              <ContextMenu.Trigger>
                <Button
                  variant="borderedProminent"
                  systemImage="ellipsis.circle"
                  modifiers={[tint('#3b82f6')]}
                >
                  Long-press for menu
                </Button>
              </ContextMenu.Trigger>
              <ContextMenu.Items>
                <Button
                  systemImage="square.and.arrow.up"
                  onPress={() => Alert.alert('Share', 'Sharing...')}
                >
                  Share
                </Button>
                <Button
                  systemImage="star"
                  onPress={() => Alert.alert('Favorite', 'Added to favorites')}
                >
                  Add to Favorites
                </Button>
                <Submenu button={<Button systemImage="folder">Move to</Button>}>
                  <Button
                    systemImage="folder"
                    onPress={() => Alert.alert('Moved', 'Moved to Documents')}
                  >
                    Documents
                  </Button>
                  <Button
                    systemImage="photo"
                    onPress={() => Alert.alert('Moved', 'Moved to Photos')}
                  >
                    Photos
                  </Button>
                  <Button
                    systemImage="archivebox"
                    onPress={() => Alert.alert('Moved', 'Moved to Archive')}
                  >
                    Archive
                  </Button>
                </Submenu>
                <Divider />
                <Button
                  systemImage="trash"
                  role="destructive"
                  onPress={() => Alert.alert('Delete', 'Item deleted')}
                >
                  Delete
                </Button>
              </ContextMenu.Items>
            </ContextMenu>
          </Section>

          {/* Switch & Picker Controls */}
          <Section
            title="Controls & Inputs"
            footer={<Text>Native iOS switches and pickers</Text>}
          >
            <Switch
              value={notificationsEnabled}
              label="Push Notifications"
              systemImage="bell.fill"
              onValueChange={setNotificationsEnabled}
              modifiers={[padding({horizontal: 8})]}
            />
            <Switch
              value={!notificationsEnabled}
              label="Dark Mode"
              systemImage="moon.fill"
              onValueChange={(val) => setNotificationsEnabled(!val)}
              modifiers={[padding({horizontal: 8})]}
            />

            <Divider />

            <Picker
              label="Schedule"
              selection={pickerChoice}
              onSelectionChange={({nativeEvent}) =>
                setPickerChoice(nativeEvent.selection)
              }
            >
              <Button
                systemImage="clock"
                onPress={() => {}}
                modifiers={[{$type: 'tag', tag: 'today'}]}
              >
                Today
              </Button>
              <Button
                systemImage="calendar"
                onPress={() => {}}
                modifiers={[{$type: 'tag', tag: 'this_week'}]}
              >
                This Week
              </Button>
              <Button
                systemImage="calendar.badge.clock"
                onPress={() => {}}
                modifiers={[{$type: 'tag', tag: 'later'}]}
              >
                Later
              </Button>
            </Picker>
          </Section>

          {/* TextField */}
          <Section
            title="Text Fields"
            footer={<Text>Native text input with glass effect</Text>}
          >
            <TextField
              defaultValue={searchText}
              keyboardType="default"
              placeholder="Search events..."
              onChangeText={setSearchText}
              modifiers={[
                padding({horizontal: 12, vertical: 8}),
                cornerRadius(12),
                glassEffect({
                  glass: {
                    variant: 'clear',
                    interactive: true,
                    tint: '#3b82f644',
                  },
                }),
              ]}
            />
            <Button
              systemImage="magnifyingglass"
              onPress={() => Alert.alert('Search', searchText)}
              variant="glass"
              controlSize="large"
              modifiers={[tint('#3b82f6')]}
            >
              Search Now
            </Button>
          </Section>

          {/* Gesture Modifiers */}
          <Section
            title="Gesture Modifiers"
            footer={<Text>Tap and long-press gesture handlers</Text>}
          >
            <VStack spacing={12}>
              <Text
                modifiers={[
                  padding({all: 16}),
                  background('#10b981'),
                  foregroundStyle('#ffffff'),
                  cornerRadius(12),
                  onTapGesture(() => Alert.alert('Tap', 'Tapped!')),
                ]}
              >
                Tap me
              </Text>
              <Text
                modifiers={[
                  padding({all: 16}),
                  background('#f59e0b'),
                  foregroundStyle('#ffffff'),
                  cornerRadius(12),
                  onLongPressGesture(() =>
                    Alert.alert('Long Press', 'Long pressed!'),
                  ),
                ]}
              >
                Long press me
              </Text>
            </VStack>
          </Section>

          {/* Visual Effects */}
          <Section
            title="Visual Effects"
            footer={<Text>Blur, brightness, saturation, and more</Text>}
          >
            <VStack spacing={12}>
              <HStack spacing={8}>
                <Image
                  systemName="photo.fill"
                  size={40}
                  modifiers={[
                    tint('#3b82f6'),
                    background('#dbeafe'),
                    frame({width: 60, height: 60}),
                    clipShape('roundedRectangle', 12),
                  ]}
                />
                <Image
                  systemName="photo.fill"
                  size={40}
                  modifiers={[
                    tint('#3b82f6'),
                    background('#dbeafe'),
                    frame({width: 60, height: 60}),
                    clipShape('roundedRectangle', 12),
                    blur(2),
                  ]}
                />
              </HStack>
              <Text modifiers={[opacity(0.7)]}>Normal vs Blurred</Text>

              <HStack spacing={8}>
                <Image
                  systemName="sparkles"
                  size={40}
                  modifiers={[
                    tint('#f59e0b'),
                    brightness(0.5),
                    frame({width: 50, height: 50}),
                  ]}
                />
                <Image
                  systemName="sparkles"
                  size={40}
                  modifiers={[tint('#f59e0b'), frame({width: 50, height: 50})]}
                />
                <Image
                  systemName="sparkles"
                  size={40}
                  modifiers={[
                    tint('#f59e0b'),
                    brightness(1.5),
                    frame({width: 50, height: 50}),
                  ]}
                />
              </HStack>
              <Text modifiers={[opacity(0.7)]}>Dark, Normal, Bright</Text>

              <HStack spacing={8}>
                <Image
                  systemName="heart.fill"
                  size={40}
                  modifiers={[
                    tint('#ef4444'),
                    saturation(0),
                    frame({width: 50, height: 50}),
                  ]}
                />
                <Image
                  systemName="heart.fill"
                  size={40}
                  modifiers={[
                    tint('#ef4444'),
                    saturation(0.5),
                    frame({width: 50, height: 50}),
                  ]}
                />
                <Image
                  systemName="heart.fill"
                  size={40}
                  modifiers={[
                    tint('#ef4444'),
                    saturation(2),
                    frame({width: 50, height: 50}),
                  ]}
                />
              </HStack>
              <Text modifiers={[opacity(0.7)]}>Grayscale to Saturated</Text>

              <HStack spacing={8}>
                <Image
                  systemName="star.fill"
                  size={40}
                  modifiers={[
                    tint('#fbbf24'),
                    hueRotation(0),
                    frame({width: 50, height: 50}),
                  ]}
                />
                <Image
                  systemName="star.fill"
                  size={40}
                  modifiers={[
                    tint('#fbbf24'),
                    hueRotation(90),
                    frame({width: 50, height: 50}),
                  ]}
                />
                <Image
                  systemName="star.fill"
                  size={40}
                  modifiers={[
                    tint('#fbbf24'),
                    hueRotation(180),
                    frame({width: 50, height: 50}),
                  ]}
                />
              </HStack>
              <Text modifiers={[opacity(0.7)]}>Hue Rotation Effects</Text>
            </VStack>
          </Section>

          {/* Transform Effects */}
          <Section
            title="Transform Effects"
            footer={<Text>Scale, rotation, and offset modifiers</Text>}
          >
            <HStack spacing={16} alignment="center">
              <Image
                systemName="arrow.up.circle.fill"
                size={32}
                modifiers={[tint('#3b82f6'), scaleEffect(0.8)]}
              />
              <Image
                systemName="arrow.up.circle.fill"
                size={32}
                modifiers={[tint('#3b82f6'), scaleEffect(1)]}
              />
              <Image
                systemName="arrow.up.circle.fill"
                size={32}
                modifiers={[tint('#3b82f6'), scaleEffect(1.5)]}
              />
            </HStack>

            <HStack spacing={16} alignment="center">
              <Image
                systemName="star.fill"
                size={32}
                modifiers={[tint('#fbbf24'), rotationEffect(0)]}
              />
              <Image
                systemName="star.fill"
                size={32}
                modifiers={[tint('#fbbf24'), rotationEffect(45)]}
              />
              <Image
                systemName="star.fill"
                size={32}
                modifiers={[tint('#fbbf24'), rotationEffect(90)]}
              />
            </HStack>

            <HStack spacing={16} alignment="center">
              <Image
                systemName="circle.fill"
                size={24}
                modifiers={[tint('#ef4444')]}
              />
              <Image
                systemName="circle.fill"
                size={24}
                modifiers={[tint('#ef4444'), offset({x: 10, y: -5})]}
              />
              <Image
                systemName="circle.fill"
                size={24}
                modifiers={[tint('#ef4444'), offset({x: 20, y: -10})]}
              />
            </HStack>
          </Section>

          {/* Labels */}
          <Section
            title="Labels"
            footer={<Text>Icon-text label combinations</Text>}
          >
            <VStack spacing={8}>
              <Label
                title="Documents Folder"
                icon={
                  <Image
                    systemName="folder.fill"
                    size={20}
                    modifiers={[
                      tint('#3b82f6'),
                      background('#dbeafe'),
                      clipShape('roundedRectangle', 6),
                      frame({width: 28, height: 28}),
                    ]}
                  />
                }
              />
              <Label
                title="Photos Library"
                icon={
                  <Image
                    systemName="photo.fill"
                    size={20}
                    modifiers={[
                      tint('#ec4899'),
                      background('#fce7f3'),
                      clipShape('roundedRectangle', 6),
                      frame({width: 28, height: 28}),
                    ]}
                  />
                }
              />
              <Label
                title="Music Collection"
                icon={
                  <Image
                    systemName="music.note"
                    size={20}
                    modifiers={[
                      tint('#f59e0b'),
                      background('#fef3c7'),
                      clipShape('roundedRectangle', 6),
                      frame({width: 28, height: 28}),
                    ]}
                  />
                }
              />
            </VStack>
          </Section>

          {/* Spacer & Divider */}
          <Section title="Spacers & Dividers">
            <HStack spacing={0}>
              <Text>Left</Text>
              <Spacer />
              <Text>Right</Text>
            </HStack>
            <Divider />
            <Text>Content below divider</Text>
          </Section>

          {/* Swipe Actions Demo */}
          <Section
            title="Swipe Actions"
            header={<Text>Last Action: {lastAction}</Text>}
            footer={
              <Text>Swipe left for delete/edit, swipe right for unread</Text>
            }
          >
            <Button variant="bordered" systemImage="envelope">
              Email Item 1
            </Button>
            <Button variant="bordered" systemImage="envelope">
              Email Item 2
            </Button>
            <Button variant="bordered" systemImage="envelope">
              Email Item 3
            </Button>
          </Section>
        </List>
      </Host>
    </>
  );
}
