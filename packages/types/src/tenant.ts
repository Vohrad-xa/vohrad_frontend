export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | {[key: string]: JsonValue};

export interface Tenant {
  tenant_id: string;
  sub_domain: string;
  tenant_schema_name: string;
  email: string;
  status: 'active' | 'inactive' | 'suspended';
  telephone?: string | null;
  street?: string | null;
  street_number?: string | null;
  city?: string | null;
  province?: string | null;
  postal_code?: string | null;
  country?: string | null;
  billing_address?: string | null;
  website?: string | null;
  logo?: string | null;
  industry?: string | null;
  tax_id?: string | null;
  remarks?: string | null;
  timezone?: string | null;
  business_hour_start?: string | null;
  business_hour_end?: string | null;
  license_id?: string | null;
  stripe_id?: string | null;
  settings?: Record<string, JsonValue> | null;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface TenantSettingsUpdate {
  timezone?: string | null;
  business_hour_start?: string | null;
  business_hour_end?: string | null;
}

export type TenantProfileUpdate = Partial<
  Pick<
    Tenant,
    | 'telephone'
    | 'street'
    | 'street_number'
    | 'city'
    | 'province'
    | 'postal_code'
    | 'country'
    | 'billing_address'
    | 'website'
    | 'logo'
    | 'industry'
    | 'tax_id'
    | 'remarks'
  >
>;

export interface License {
  created_at: string;
  updated_at: string;
  id: string;
  tenant_id: string;
  name: string;
  price: string;
  seats: number;
  license_key: string;
  starts_at: string;
  ends_at: string;
  status: 'active' | 'inactive' | 'suspended' | 'expired';
  features: JsonValue | null;
  meta: JsonValue | null;
}

export interface TenantLicenseInfo {
  has_license: boolean;
  license: License | null;
  seats_used: number;
  seats_available: number;
  seats_total: number;
  is_active: boolean;
}
