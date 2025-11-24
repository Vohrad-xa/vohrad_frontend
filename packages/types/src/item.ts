import type {JsonValue} from './tenant';

export type TrackingMode = 'abstract' | 'lot' | 'serialized';

export type ItemSpecifications = Record<string, JsonValue> | null;

export type ItemFilterState = {
  statuses?: Array<'active' | 'inactive'>;
  trackingModes?: Array<TrackingMode>;
  priceMin?: number | null;
  priceMax?: number | null;
  specifications?: ItemSpecifications;
};

export interface ItemLocationData {
  id: string;
  name: string;
  code: string;
  quantity: number;
}

export interface ItemLocationInput {
  location_id: string;
  quantity: number;
  item_lot_id?: string | null;
}

export interface ItemLocationUpdate {
  quantity?: number;
  moved_date?: string | null;
  notes?: string | null;
}

export interface ItemAttachment {
  id: string;
  filename: string;
  original_filename: string;
  file_type: string;
  extension?: string | null;
  size: number;
  file_path: string;
  download_url?: string | null;
  thumbnail_url?: string | null;
  created_at?: string;
  updated_at?: string;
  description?: string | null;
  category?: string | null; // Note: This is for attachment categorization, not item category
  user_id?: string | null;
  deleted_at?: string | null;
  kind?: string | null;
  attachable_type?: string; // Target type (item, location, etc.)
  attachable_id?: string; // Target ID
}

export interface Category {
  id: string;
  name: string;
  path?: string | null;
}

export interface Status {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface UnitOfMeasure {
  id: string;
  name: string;
  code: string;
  symbol?: string | null;
}

export interface Supplier {
  id: string;
  name: string;
}

export interface ItemLotData {
  id: string;
  lot_type: string;
  lot_number: string;
}

type ItemRelationIdentifiers = {
  user_id?: string | null;
  parent_item_id?: string | null;
  item_relation_id?: string | null;
};

type ItemDescriptiveFields = ItemRelationIdentifiers & {
  name: string;
  sku: string;
  barcode?: string | null;
  description?: string | null;
  price?: number | null;
  serial_number?: string | null;
  notes?: string | null;
  specifications?: ItemSpecifications;
  tracking_change_reason?: string | null;
  category_id?: string | null;
  status_id?: string | null;
  unit_id?: string | null;
  supplier_id?: string | null;
  category?: Category | null;
  status?: Status | null;
  unit?: UnitOfMeasure | null;
  supplier?: Supplier | null;
};

type ItemMutableFields = ItemDescriptiveFields & {
  tracking_mode?: TrackingMode;
  is_active?: boolean;
};

export interface Item extends ItemDescriptiveFields {
  id: string;
  tracking_mode: TrackingMode;
  is_active: boolean;
  tracking_changed_at?: string | null;
  total_quantity: number;
  thumbnail?: ItemAttachment | null;
  created_at: string;
  updated_at: string;
}

export interface ItemDetail extends Item {
  locations?: ItemLocationData[] | null;
  lots?: ItemLotData[] | null;
  attachments?: ItemAttachment[] | null;
}

export type ItemCreate = ItemMutableFields & {
  locations?: ItemLocationInput[];
};

export type ItemUpdate = Partial<ItemMutableFields>;
