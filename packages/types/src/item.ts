import type {JsonValue} from './tenant';

export type TrackingMode = 'abstract' | 'standard' | 'serialized';

export interface ItemLocationData {
  id: string;
  name: string;
  code: string;
  quantity: number;
}

export interface ItemLocationInput {
  location_id: string;
  quantity: number;
}

export interface ItemAttachment {
  id: string;
  filename: string;
  original_filename: string;
  file_type: string;
  extension?: string | null;
  size: number;
  file_path: string;
  created_at?: string;
}

export interface Item {
  id: string;
  name: string;
  code: string;
  barcode?: string | null;
  description?: string | null;
  tracking_mode: TrackingMode;
  price?: number | null;
  serial_number?: string | null;
  notes?: string | null;
  is_active: boolean;
  specifications?: Record<string, JsonValue> | null;
  tracking_changed_at?: string | null;
  tracking_change_reason?: string | null;
  user_id?: string | null;
  parent_item_id?: string | null;
  item_relation_id?: string | null;
  total_quantity: number;
  thumbnail?: ItemAttachment | null;
  created_at: string;
  updated_at: string;
}

export interface ItemDetail extends Item {
  locations?: ItemLocationData[] | null;
  attachments?: ItemAttachment[] | null;
}

export interface ItemCreate {
  name: string;
  code: string;
  barcode?: string | null;
  description?: string | null;
  tracking_mode?: TrackingMode;
  price?: number | null;
  serial_number?: string | null;
  notes?: string | null;
  is_active?: boolean;
  specifications?: Record<string, JsonValue> | null;
  tracking_change_reason?: string | null;
  user_id?: string | null;
  parent_item_id?: string | null;
  item_relation_id?: string | null;
  locations?: ItemLocationInput[];
}

export type ItemUpdate = Partial<
  Pick<
    Item,
    | 'name'
    | 'code'
    | 'barcode'
    | 'description'
    | 'tracking_mode'
    | 'price'
    | 'serial_number'
    | 'notes'
    | 'is_active'
    | 'specifications'
    | 'tracking_change_reason'
    | 'user_id'
    | 'parent_item_id'
    | 'item_relation_id'
  >
>;
