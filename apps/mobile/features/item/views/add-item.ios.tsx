import React, {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {Palette} from '@/constants';
import {useItemMutations} from '@/features/item/hooks';
import {useTheme} from '@/providers';
import {Icon, AppIcons, type IconName} from '@/utils';
import {
  Host,
  List,
  Section,
  TextField,
  Picker,
  Button,
  Toggle,
  Text,
  Label,
  HStack,
  Spacer,
  DisclosureGroup,
  accessibilityLabel as a11y,
  foregroundStyle,
  buttonStyle,
  tint,
  monospaced,
  scrollDismissesKeyboard,
  LabeledContent,
  frame,
  multilineTextAlignment,
  listSectionSpacing,
  Image,
  Group,
} from 'sykamore-ui/ios';
import type {ItemCreate, TrackingMode} from '@sykamore/types';

const TRACKING_MODES: Array<{value: TrackingMode; label: string}> = [
  {value: 'abstract', label: 'Abstract'},
  {value: 'lot', label: 'Lot'},
  {value: 'serialized', label: 'Serialized'},
];

type Spec = {id: number; key: string; value: string};

export type AddItemScreenHandle = {
  save: () => Promise<void>;
};

type AddItemScreenProps = {
  onSaveComplete?: () => void;
  onCanSaveChange?: (canSave: boolean) => void;
};

type NavRowProps = {
  systemImage: IconName;
  title: string;
  value?: string;
  a11yLabel: string;
};

function NavRow({systemImage, title, value, a11yLabel}: NavRowProps) {
  return (
    <Button
      modifiers={[
        buttonStyle({style: 'automatic'}),
        tint('primary'),
        a11y(a11yLabel),
      ]}
    >
      <HStack alignment="center" spacing={8}>
        <Label systemImage={systemImage} title={title} />
        <Spacer />
        <Text modifiers={[foregroundStyle('secondary')]}>
          {value ?? 'Not set'}
        </Text>
        <Icon
          useSwiftUI
          name={AppIcons.actions.forward}
          colorToken="muted"
          fontWeight="medium"
          size={13}
        />
      </HStack>
    </Button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export const AddItemScreen = forwardRef<
  AddItemScreenHandle,
  AddItemScreenProps
>(({onSaveComplete, onCanSaveChange}, ref) => {
  const {createItem} = useItemMutations();

  const {ds} = useTheme();
  // ── Identity
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');

  // ── Description
  const [description, setDescription] = useState('');

  // ── Pricing
  const [price, _setPrice] = useState(0);

  // ── Tracking & settings
  const [trackingMode, setTrackingMode] = useState<TrackingMode>('lot');
  const [isActive, setIsActive] = useState(true);

  // ── Notes
  const [notes, setNotes] = useState('');

  // ── Specifications (dynamic key-value pairs)
  const [specs, setSpecs] = useState<Spec[]>([]);
  const [specsExpanded, setSpecsExpanded] = useState(false);
  const nextSpecId = useRef(0);

  // Stable ref so save() always reads the latest values
  const formRef = useRef({
    name,
    sku,
    barcode,
    description,
    price,
    notes,
    trackingMode,
    isActive,
    specs,
  });
  formRef.current = {
    name,
    sku,
    barcode,
    description,
    price,
    notes,
    trackingMode,
    isActive,
    specs,
  };

  const canSave = name.trim().length > 0 && sku.trim().length > 0;

  useEffect(() => {
    onCanSaveChange?.(canSave);
  }, [canSave, onCanSaveChange]);

  const save = useCallback(async () => {
    const f = formRef.current;
    const specsObj = f.specs.reduce<Record<string, string>>(
      (acc, {key, value}) => {
        if (key.trim()) acc[key.trim()] = value;
        return acc;
      },
      {},
    );
    const data: ItemCreate = {
      name: f.name.trim(),
      sku: f.sku.trim(),
      barcode: f.barcode.trim() || null,
      description: f.description.trim() || null,
      price: f.price > 0 ? f.price : null,
      notes: f.notes.trim() || null,
      tracking_mode: f.trackingMode,
      is_active: f.isActive,
      specifications: Object.keys(specsObj).length > 0 ? specsObj : null,
    };
    await createItem(data);
    onSaveComplete?.();
  }, [createItem, onSaveComplete]);

  React.useImperativeHandle(ref, () => ({save}), [save]);

  // ── Spec handlers
  const addSpec = useCallback(() => {
    setSpecs((prev) => [
      ...prev,
      {id: nextSpecId.current++, key: '', value: ''},
    ]);
    setSpecsExpanded(true);
  }, []);

  const updateSpecKey = useCallback((id: number, val: string) => {
    setSpecs((prev) => prev.map((s) => (s.id === id ? {...s, key: val} : s)));
  }, []);

  const updateSpecValue = useCallback((id: number, val: string) => {
    setSpecs((prev) => prev.map((s) => (s.id === id ? {...s, value: val} : s)));
  }, []);

  const removeSpec = useCallback((id: number) => {
    setSpecs((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return (
    <Host style={{flex: 1}}>
      <List
        listStyle="automatic"
        modifiers={[scrollDismissesKeyboard('interactively')]}
      >
        <Group modifiers={[listSectionSpacing(ds.spacing.xl)]}>
          <Section>
            <TextField
              placeholder="Name"
              onChangeText={setName}
              autocapitalization="words"
              submitLabel="next"
              textContentType="name"
              modifiers={[a11y('Item name')]}
            />
            <TextField
              placeholder="SKU"
              onChangeText={setSku}
              autocapitalization="never"
              autocorrection={false}
              submitLabel="next"
              modifiers={[a11y('SKU')]}
            />
            <HStack alignment="center">
              <TextField
                placeholder="Barcode"
                onChangeText={setBarcode}
                autocapitalization="never"
                autocorrection={false}
                keyboardType="numbers-and-punctuation"
                submitLabel="done"
                modifiers={[a11y('Barcode')]}
              />
              <Icon
                useSwiftUI
                name="barcode.viewfinder"
                colorToken="accentBlue"
                size="md"
              />
            </HStack>
          </Section>

          <LabeledContent label="Price">
            <TextField
              placeholder="0.00"
              keyboardType="decimal-pad"
              submitLabel="done"
              modifiers={[
                a11y('Price'),
                frame({maxWidth: 80}),
                monospaced(),
                multilineTextAlignment('trailing'),
              ]}
            />
          </LabeledContent>

          <Section>
            <NavRow
              systemImage={AppIcons.domain.category}
              title="Category"
              a11yLabel="Assign category"
            />
            <NavRow
              systemImage={AppIcons.domain.unitOfMeasure}
              title="Unit of Measure"
              a11yLabel="Assign unit of measure"
            />
            <NavRow
              systemImage="seal"
              title="Status"
              a11yLabel="Assign status"
            />
          </Section>

          <Section
            footer={
              <Text>
                You can assign multiple locations to an item, and specify stock
                levels for each location.
              </Text>
            }
          >
            <Picker
              systemImage="checkmark.seal"
              label="Tracking Mode"
              selection={trackingMode}
              onSelectionChange={({nativeEvent}) =>
                setTrackingMode(nativeEvent.selection as TrackingMode)
              }
            >
              {TRACKING_MODES.map(({value, label}) => (
                <Button
                  key={value}
                  label={label}
                  modifiers={[{$type: 'tag', tag: value}]}
                />
              ))}
            </Picker>
            <NavRow
              systemImage={AppIcons.domain.location}
              title="Locations"
              a11yLabel="Assign locations"
            />
          </Section>
        </Group>

        <Section title="Description & Specifications">
          <TextField
            placeholder="Describe item…"
            onChangeText={setDescription}
            multiline
            submitLabel="done"
            autocorrection
            modifiers={[
              a11y('Description'),
              frame({minHeight: 80, alignment: 'topLeading'}),
            ]}
          />
          <DisclosureGroup
            label="Specifications"
            isExpanded={specsExpanded}
            onIsExpandedChange={(expanded) => {
              setSpecsExpanded(expanded);
              if (expanded && specs.length === 0) {
                addSpec();
              }
            }}
          >
            {specs.map((spec, index) => {
              const isLast = index === specs.length - 1;
              return (
                <HStack key={spec.id} alignment="center">
                  <TextField
                    placeholder="Attribute"
                    defaultValue={spec.key}
                    onChangeText={(val) => updateSpecKey(spec.id, val)}
                    autocorrection={false}
                    submitLabel="next"
                    modifiers={[a11y('Specification attribute')]}
                  />
                  <TextField
                    placeholder="Value"
                    defaultValue={spec.value}
                    onChangeText={(val) => updateSpecValue(spec.id, val)}
                    autocorrection={false}
                    submitLabel="done"
                    modifiers={[a11y('Specification value')]}
                  />
                  {isLast ? (
                    <Image
                      systemName="plus.circle"
                      onPress={addSpec}
                      modifiers={[
                        a11y('Add specification'),
                        foregroundStyle(Palette.blue),
                      ]}
                    />
                  ) : (
                    <Image
                      systemName="minus.circle"
                      onPress={() => removeSpec(spec.id)}
                      modifiers={[
                        a11y('Remove specification'),
                        foregroundStyle(Palette.red),
                      ]}
                    />
                  )}
                </HStack>
              );
            })}
          </DisclosureGroup>
        </Section>

        <Section
          title="Relationships"
          footer={
            <Text>
              Link to a parent item for variants or bundles, or assign a related
              item for cross-references.
            </Text>
          }
        >
          <NavRow
            systemImage="arrow.up.right.square"
            title="Parent Item"
            a11yLabel="Assign parent item"
          />
          <NavRow
            systemImage="link"
            title="Related Item"
            a11yLabel="Assign related item"
          />
          <NavRow
            systemImage={AppIcons.domain.supplier}
            title="Supplier"
            a11yLabel="Assign supplier"
          />
        </Section>

        <Section title="Settings">
          <Toggle
            label="Active"
            isOn={isActive}
            onIsOnChange={setIsActive}
            modifiers={[a11y('Active toggle')]}
          />
        </Section>

        <Section title="Notes">
          <TextField
            placeholder="Internal notes…"
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            submitLabel="done"
            modifiers={[a11y('Notes')]}
          />
        </Section>
      </List>
    </Host>
  );
});

AddItemScreen.displayName = 'AddItemScreen';
