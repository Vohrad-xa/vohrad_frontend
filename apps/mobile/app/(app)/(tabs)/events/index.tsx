import {useCallback, useMemo, useState} from 'react';
import {Alert} from 'react-native';
import {Stack} from 'expo-router';
import {
  Host,
  List,
  Button,
  Section,
  Text,
  Image,
  Picker,
  ContextMenu,
  Divider,
  background,
  tint,
  clipShape,
  frame,
  Label,
  type SwipeActionsConfig,
  Spacer,
  HStack,
  VStack,
  glassEffect,
  DateTimePicker,
  foregroundColor,
} from '@/modules/sykamore-ui';

export default function EventsPage() {
  const [refreshing, setRefreshing] = useState(false);
  const [lastAction, setLastAction] = useState<string>('None');
  const [pickerChoice, setPickerChoice] = useState<string | number>('today');

  const leadingActions = useMemo<SwipeActionsConfig>(
    () => ({
      actions: [
        {
          id: 'unread',
          label: 'unread',
          systemImage: 'envelope.badge',
          tint: '#fcc308ff',
          role: 'default',
        },
      ],
      allowsFullSwipe: false,
    }),
    [],
  );

  const trailingActions = useMemo<SwipeActionsConfig>(
    () => ({
      actions: [
        {
          id: 'delete',
          label: 'delete',
          systemImage: 'trash',
          role: 'destructive',
        },
        {
          id: 'edit',
          label: 'edit',
          systemImage: 'pencil',
          tint: '#0886fcff',
          role: 'default',
        },
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
      <Stack.Screen
        options={{
          title: 'Events',
        }}
      />

      <Host style={{flex: 1}}>
        <List
          listStyle="insetGrouped"
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
            <HStack>
              <Label
                title="Favorites"
                icon={
                  <Image
                    systemName="star.fill"
                    size={14}
                    color={'white'}
                    modifiers={[
                      frame({width: 28, height: 28}),
                      glassEffect({
                        glass: {
                          variant: 'regular',
                          tint: '#e0cd05ff',
                        },
                        shape: 'roundedRectangle',
                        cornerRadius: 10,
                      }),
                    ]}
                  />
                }
              />
              <Spacer />
              <Image systemName="chevron.right" size={14} />
            </HStack>
            <HStack>
              <Label
                title="Home"
                icon={
                  <Image
                    systemName="house.fill"
                    color={'white'}
                    size={14}
                    modifiers={[
                      frame({width: 28, height: 28}),
                      glassEffect({
                        glass: {
                          tint: '#0053f8af',
                          variant: 'regular',
                        },
                        shape: 'roundedRectangle',
                        cornerRadius: 10,
                      }),
                    ]}
                  />
                }
              />
              <Spacer />
              <Image systemName="chevron.right" size={14} />
            </HStack>
            <HStack>
              <Label
                title="Profile"
                icon={
                  <Image
                    systemName="person.fill"
                    color={'white'}
                    size={14}
                    modifiers={[
                      frame({width: 28, height: 28}),
                      glassEffect({
                        glass: {
                          tint: '#36ba06ff',
                          variant: 'regular',
                        },
                        shape: 'roundedRectangle',
                        cornerRadius: 10,
                      }),
                    ]}
                  />
                }
              />
              <Spacer />
              <Image systemName="chevron.right" size={14} />
            </HStack>
            <HStack>
              <Label
                title="Settings"
                icon={
                  <Image
                    systemName="gear"
                    color={'white'}
                    size={14}
                    modifiers={[
                      frame({width: 28, height: 28}),
                      glassEffect({
                        glass: {
                          tint: 'purple',
                          variant: 'regular',
                        },
                        shape: 'roundedRectangle',
                        cornerRadius: 10,
                      }),
                    ]}
                  />
                }
              />
              <Spacer />
              <Image systemName="chevron.right" size={14} />
            </HStack>

            <HStack>
              <Label
                title="Notifications"
                icon={
                  <Image
                    systemName="bell.fill"
                    color={'white'}
                    size={14}
                    modifiers={[
                      frame({width: 28, height: 28}),
                      glassEffect({
                        glass: {
                          tint: '#d4190fff',
                          variant: 'regular',
                        },
                        shape: 'roundedRectangle',
                        cornerRadius: 10,
                      }),
                    ]}
                  />
                }
              />
              <Spacer />
              <Image systemName="chevron.right" size={14} />
            </HStack>
            <Picker
              pickerStyle="wheel"
              systemImage="paintbrush.fill"
              label="Appearance"
              selection={pickerChoice}
              onSelectionChange={({nativeEvent}) =>
                setPickerChoice(nativeEvent.selection)
              }
            >
              <Button
                systemImage="star.fill"
                onPress={() => {}}
                modifiers={[{$type: 'tag', tag: 'option1'}]}
              >
                Option 1
              </Button>
              <Button
                systemImage="star.fill"
                onPress={() => {}}
                modifiers={[{$type: 'tag', tag: 'option2'}]}
              >
                Option 2
              </Button>
              <Button
                systemImage="star.fill"
                onPress={() => {}}
                modifiers={[{$type: 'tag', tag: 'option3'}]}
              >
                Option 3
              </Button>
            </Picker>
          </Section>

          {/* Button Variants & Styles */}
          <Section
            title="App Settings"
            footer={<Text>You can customize app settings here</Text>}
          >
            <HStack>
              <Image
                systemName="globe"
                size={14}
                color={'white'}
                modifiers={[
                  frame({width: 28, height: 28}),
                  glassEffect({
                    glass: {
                      tint: '#00670eff',
                      variant: 'clear',
                      interactive: true,
                    },
                    shape: 'roundedRectangle',
                    cornerRadius: 10,
                  }),
                ]}
              />
              <Spacer />
              <Picker
                label="Language"
                selection={pickerChoice}
                onSelectionChange={({nativeEvent}) =>
                  setPickerChoice(nativeEvent.selection)
                }
              >
                <Button systemImage="sun.horizon" onPress={() => {}}>
                  English
                </Button>
                <Button systemImage="moon.fill" onPress={() => {}}>
                  Amazigh
                </Button>
                <Button systemImage="globe" onPress={() => {}}>
                  Dutch
                </Button>
              </Picker>
            </HStack>
          </Section>

          {/* Image & SF Symbols */}
          <Section
            footer={<Text>Native SF Symbols with modifiers and effects</Text>}
          >
            <HStack>
              <Image
                systemName="heart.fill"
                size={14}
                color={'white'}
                modifiers={[
                  frame({width: 28, height: 28}),
                  glassEffect({
                    glass: {
                      tint: '#3c0badff',
                      variant: 'clear',
                      interactive: true,
                    },
                    shape: 'roundedRectangle',
                    cornerRadius: 10,
                  }),
                ]}
              />
              <Spacer />
              <Picker
                label="Icon Style"
                selection={pickerChoice}
                onSelectionChange={({nativeEvent}) =>
                  setPickerChoice(nativeEvent.selection)
                }
              >
                <Label
                  title="Option 1"
                  icon={
                    <Image
                      systemName="star.fill"
                      size={15}
                      modifiers={[
                        frame({width: 20, height: 20}),
                        tint('#facc15ff'),
                      ]}
                    />
                  }
                />
                <Divider />
                <Button
                  onPress={() => {}}
                  modifiers={[{$type: 'tag', tag: 'option2'}]}
                >
                  Option 2
                </Button>
                <Button
                  onPress={() => {}}
                  modifiers={[{$type: 'tag', tag: 'option3'}]}
                >
                  Option 3
                </Button>
                <Button
                  onPress={() => {}}
                  modifiers={[{$type: 'tag', tag: 'option4'}]}
                >
                  Option 4
                </Button>
                <Button
                  systemImage="bell.fill"
                  onPress={() => {}}
                  modifiers={[{$type: 'tag', tag: 'option5'}]}
                >
                  Option 5
                </Button>
                <Button
                  systemImage="house.fill"
                  onPress={() => {}}
                  modifiers={[{$type: 'tag', tag: 'option2'}]}
                >
                  Option 2
                </Button>
                <Button
                  systemImage="star.fill"
                  onPress={() => {}}
                  modifiers={[{$type: 'tag', tag: 'option3'}]}
                >
                  Option 3
                </Button>
                <Button
                  systemImage="gear"
                  onPress={() => {}}
                  modifiers={[{$type: 'tag', tag: 'option4'}]}
                >
                  Option 4
                </Button>
                <Button
                  systemImage="bell.fill"
                  onPress={() => {}}
                  modifiers={[{$type: 'tag', tag: 'option5'}]}
                >
                  Option 5
                </Button>
                <ContextMenu>
                  <ContextMenu.Items>
                    <Button
                      systemImage="star.fill"
                      onPress={() => {}}
                      modifiers={[{$type: 'tag', tag: 'option6'}]}
                    >
                      Option 6
                    </Button>
                    <Button
                      systemImage="star.fill"
                      onPress={() => {}}
                      modifiers={[{$type: 'tag', tag: 'option7'}]}
                    >
                      Option 7
                    </Button>
                  </ContextMenu.Items>
                  <ContextMenu.Trigger>
                    <Button systemImage="ellipsis.circle" onPress={() => {}}>
                      More Options
                    </Button>
                  </ContextMenu.Trigger>
                </ContextMenu>
              </Picker>
            </HStack>
          </Section>

          {/* Labels */}
          <Section
            title="Labels"
            footer={<Text>Icon-text label combinations</Text>}
          >
            <VStack spacing={30}>
              <HStack>
                <Label
                  title="Documents Folder"
                  icon={
                    <Image
                      systemName="folder.fill"
                      size={15}
                      modifiers={[
                        frame({width: 30, height: 30}),
                        background('#f3f4f6'),
                        clipShape('roundedRectangle'),
                      ]}
                    />
                  }
                />
                <Spacer />
                <Image
                  systemName="chevron.right"
                  size={15}
                  modifiers={[tint('#6b7280')]}
                />
              </HStack>

              <HStack>
                <Label
                  title="Photos Library"
                  color={'green'}
                  icon={
                    <Image
                      systemName="photo.fill"
                      size={15}
                      modifiers={[
                        frame({width: 30, height: 30}),
                        background('#ffffffff'),
                        clipShape('roundedRectangle'),
                      ]}
                    />
                  }
                />
                <Spacer />
                <Image
                  systemName="chevron.right"
                  size={15}
                  modifiers={[tint('#6b7280')]}
                />
              </HStack>
              <HStack>
                <Label
                  title="Music Collection"
                  icon={
                    <Image
                      systemName="music.note"
                      size={15}
                      modifiers={[
                        frame({width: 30, height: 30}),
                        background('#f7c90fff'),
                        tint('#f1f0edff'),
                        clipShape('roundedRectangle'),
                      ]}
                    />
                  }
                />
                <Spacer />
                <Image
                  systemName="chevron.right"
                  size={15}
                  modifiers={[tint('#6b7280')]}
                />
              </HStack>
            </VStack>
          </Section>
        </List>
      </Host>
    </>
  );
}
