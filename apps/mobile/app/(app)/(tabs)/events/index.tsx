import React, {useState} from 'react';
import {StyleSheet, ScrollView, View, Alert} from 'react-native';
import {
  Host,
  Form,
  Section,
  TextField,
  Switch,
  Button,
  Text,
  HStack,
  VStack,
  Image,
  Spacer,
  Picker,
  background,
  clipShape,
  frame,
  tag,
  pickerStyle,
  Toolbar,
} from '@vohrad/swift-ui';
import {Stack} from 'expo-router';
import {ThemedView, ThemedText} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils';

// ============================================
// MOCK DATA FOR LIST
// ============================================
interface ListItem {
  id: string;
  text: string;
  systemImage: string;
}

const INITIAL_ITEMS: ListItem[] = [
  {id: '1', text: 'Item Added', systemImage: 'plus.circle'},
  {id: '2', text: 'User Invited', systemImage: 'person.badge.plus'},
  {id: '3', text: 'Document Uploaded', systemImage: 'doc.badge.plus'},
  {id: '4', text: 'Profile Updated', systemImage: 'person.circle'},
  {id: '5', text: 'Settings Changed', systemImage: 'gearshape'},
];

export default function EventsPage() {
  const {theme, ds} = useTheme();
  const styles = createStyles(theme, ds);

  // ============================================
  // FORM STATE
  // ============================================
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [notifications, setNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [selectedAppearance, setSelectedAppearance] = useState<string | number>(
    0,
  ); // 0=Light, 1=Dark, 2=Auto

  // ============================================
  // LIST STATE
  // ============================================
  const [listItems, setListItems] = useState<ListItem[]>(INITIAL_ITEMS);
  const [editModeEnabled, setEditModeEnabled] = useState(false);
  const [moveEnabled, setMoveEnabled] = useState(true);
  const [deleteEnabled, setDeleteEnabled] = useState(true);
  const [selectEnabled, setSelectEnabled] = useState(false);

  // ============================================
  // HANDLERS
  // ============================================
  const handleSaveForm = () => {
    const appearances = ['Light', 'Dark', 'Auto'];
    Alert.alert(
      'Form Saved',
      `Name: ${name}\nEmail: ${email}\nNotifications: ${notifications}\nDark Mode: ${darkMode}\nAuto Sync: ${autoSync}\nAppearance: ${appearances[selectedAppearance as number]}`,
    );
  };

  const handleDeleteItem = (index: number) => {
    setListItems((prev) => prev.filter((_, i) => i !== index));
    Alert.alert('Item Deleted', `Deleted item at index: ${index}`);
  };

  const handleMoveItem = (from: number, to: number) => {
    setListItems((prev) => {
      const newItems = [...prev];
      const [movedItem] = newItems.splice(from, 1);
      newItems.splice(to, 0, movedItem);
      return newItems;
    });
    Alert.alert('Item Moved', `Moved item from index ${from} to ${to}`);
  };

  const handleSelectionChange = (selectedIndexes: number[]) => {
    Alert.alert(
      'Selection Changed',
      `Selected indexes: ${selectedIndexes.join(', ')}`,
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Expo UI Tutorial',
          headerLargeTitle: true,
        }}
      />
      <ThemedView style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ============================================ */}
          {/* SECTION 1: FORM TUTORIAL */}
          {/* ============================================ */}
          <ThemedText variant="title1" style={styles.sectionTitle}>
            1. Form Component
          </ThemedText>
          <ThemedText
            variant="body"
            colorToken="muted"
            style={styles.description}
          >
            SwiftUI-style Form with Sections, TextFields, and Switches
          </ThemedText>

          <Host style={styles.hostContainer}>
            <Form>
              {/* Profile Section */}
              <Section title="Profile Information">
                <TextField
                  placeholder="Enter your name"
                  defaultValue={name}
                  onChangeText={setName}
                />
                <TextField
                  placeholder="Enter your email"
                  defaultValue={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                />
              </Section>

              {/* Preferences Section */}
              <Section title="Preferences">
                <Switch
                  label="Enable notifications"
                  value={notifications}
                  onValueChange={setNotifications}
                />
                <Switch
                  label="Dark mode"
                  value={darkMode}
                  onValueChange={setDarkMode}
                />
                <Switch
                  label="Auto-sync data"
                  value={autoSync}
                  onValueChange={setAutoSync}
                />
              </Section>

              {/* Save Button */}
              <Section>
                <Button onPress={handleSaveForm}>Save Changes</Button>
              </Section>
            </Form>
          </Host>

          {/* ============================================ */}
          {/* SECTION 2: FORM WITH CUSTOM LAYOUT */}
          {/* ============================================ */}
          <ThemedText variant="title1" style={styles.sectionTitle}>
            2. Form with Custom Layout
          </ThemedText>
          <ThemedText
            variant="body"
            colorToken="muted"
            style={styles.description}
          >
            iOS Settings-like UI with HStack, Icons, and Modifiers
          </ThemedText>

          <Host style={styles.hostContainer}>
            <Form>
              <Section>
                {/* Airplane Mode Row */}
                <HStack spacing={8}>
                  <Image
                    systemName="airplane"
                    color="white"
                    size={18}
                    modifiers={[
                      frame({width: 28, height: 28}),
                      background('#ffa500'),
                      clipShape('roundedRectangle'),
                    ]}
                  />
                  <Text>Airplane Mode</Text>
                  <Spacer />
                  <Switch
                    value={notifications}
                    onValueChange={setNotifications}
                  />
                </HStack>

                {/* WiFi Row */}
                <Button onPress={() => Alert.alert('WiFi', 'WiFi settings')}>
                  <HStack spacing={8}>
                    <Image
                      systemName="wifi"
                      color="white"
                      size={18}
                      modifiers={[
                        frame({width: 28, height: 28}),
                        background('#007aff'),
                        clipShape('roundedRectangle'),
                      ]}
                    />
                    <Text color="primary">Wi-Fi</Text>
                    <Spacer />
                    <Text color="secondary">Home Network</Text>
                    <Image
                      systemName="chevron.right"
                      size={14}
                      color="secondary"
                    />
                  </HStack>
                </Button>

                {/* Bluetooth Row */}
                <Button
                  onPress={() => Alert.alert('Bluetooth', 'Bluetooth settings')}
                >
                  <HStack spacing={8}>
                    <Image
                      systemName="antenna.radiowaves.left.and.right"
                      color="white"
                      size={18}
                      modifiers={[
                        frame({width: 28, height: 28}),
                        background('#007aff'),
                        clipShape('roundedRectangle'),
                      ]}
                    />
                    <Text color="primary">Bluetooth</Text>
                    <Spacer />
                    <Image
                      systemName="chevron.right"
                      size={14}
                      color="secondary"
                    />
                  </HStack>
                </Button>

                {/* Appearance Picker Row */}
                <HStack spacing={8}>
                  <Image
                    systemName="circle.lefthalf.filled"
                    color={theme.icon}
                    size={18}
                    modifiers={[
                      frame({width: 28, height: 28}),
                      // background(theme.card),
                      clipShape('roundedRectangle'),
                    ]}
                  />
                  <Text>Appearance</Text>
                  <Spacer />
                  <Host matchContents>
                    <Picker
                      selection={selectedAppearance}
                      onSelectionChange={({nativeEvent: {selection}}) => {
                        setSelectedAppearance(selection);
                      }}
                      modifiers={[pickerStyle('menu')]}
                    >
                      <Text modifiers={[tag(0)]}>Light</Text>
                      <Text modifiers={[tag(1)]}>Dark</Text>
                      <Text modifiers={[tag(2)]}>Auto</Text>
                    </Picker>
                  </Host>
                </HStack>
              </Section>
            </Form>
          </Host>

          {/* ============================================ */}
          {/* SECTION 3: LIST TUTORIAL */}
          {/* ============================================ */}
          <ThemedText variant="title1" style={styles.sectionTitle}>
            3. List Component
          </ThemedText>
          <ThemedText
            variant="body"
            colorToken="muted"
            style={styles.description}
          >
            Interactive List with Editing, Moving, and Deleting
          </ThemedText>

          {/* List Controls */}
          <Host style={styles.listControlsHost}>
            <Form>
              <Section
                title="List Controls"
                footer={
                  <Text size={12} color="secondary">
                    Configure list editing behaviors
                  </Text>
                }
              >
                <Switch
                  label="Edit Mode"
                  value={editModeEnabled}
                  onValueChange={setEditModeEnabled}
                />
                <Switch
                  label="Allow Move"
                  value={moveEnabled}
                  onValueChange={setMoveEnabled}
                />
                <Switch
                  label="Allow Delete"
                  value={deleteEnabled}
                  onValueChange={setDeleteEnabled}
                />
                <Switch
                  label="Allow Select"
                  value={selectEnabled}
                  onValueChange={setSelectEnabled}
                />
              </Section>
            </Form>
          </Host>

          {/* List */}
          <Host style={styles.listHost}>
            <Toolbar>
              <Toolbar.Item placement="navigationBarLeading">
                <Button systemImage="chevron.left" />
              </Toolbar.Item>
              <Toolbar.Group placement="navigationBarTrailing">
                <Button systemImage="square.and.arrow.up" />
                <Button systemImage="trash" />
              </Toolbar.Group>
            </Toolbar>
          </Host>

          {/* ============================================ */}
          {/* SECTION 4: LAYOUT EXAMPLE */}
          {/* ============================================ */}
          <ThemedText variant="title1" style={styles.sectionTitle}>
            4. Layout with VStack & HStack
          </ThemedText>
          <ThemedText
            variant="body"
            colorToken="muted"
            style={styles.description}
          >
            Organizing components with vertical and horizontal stacks
          </ThemedText>

          <Host style={styles.hostContainer}>
            <VStack spacing={16}>
              <Text>VStack with spacing</Text>
              <HStack spacing={16}>
                <Button onPress={() => Alert.alert('Button 1', 'Pressed!')}>
                  Button 1
                </Button>
                <Button
                  onPress={() => Alert.alert('Button 2', 'Pressed!')}
                  variant="glassProminent"
                >
                  Button 2
                </Button>
              </HStack>
              <Text>Text below buttons</Text>
            </VStack>
          </Host>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </ThemedView>
    </>
  );
}

const createStyles = makeStyleFactory(
  (theme: ThemeShape, ds: DSShape) =>
    StyleSheet.create({
      container: {
        flex: 1,
      },
      scrollContent: {
        paddingTop: ds.spacing.lg,
      },
      sectionTitle: {
        marginTop: ds.spacing.xl,
        marginBottom: ds.spacing.sm,
      },
      description: {
        marginBottom: ds.spacing.lg,
      },
      hostContainer: {
        minHeight: 500,
        marginBottom: ds.spacing.md,
      },
      listControlsHost: {
        minHeight: 180,
        marginBottom: ds.spacing.md,
      },
      listHost: {
        minHeight: 300,
        marginBottom: ds.spacing.md,
      },
      bottomPadding: {
        height: ds.spacing.xxxl,
      },
    }),
  (theme, ds) => themeKey(theme, ds),
);
