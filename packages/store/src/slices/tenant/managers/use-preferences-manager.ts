import {useState, useCallback, useEffect} from 'react';
import {useOrganizationDetails, useUpdateTenantSettings} from '../hooks';
import type {Tenant} from '@sykamore/types';

type PreferencesFormState = {
  business_hour_start: string;
  business_hour_end: string;
};

type BusinessHourCache = {
  start: string;
  end: string;
};

const DEFAULT_BUSINESS_HOUR_START = '09:00';
const DEFAULT_BUSINESS_HOUR_END = '17:00';
const EMPTY_PREFERENCES_STATE: PreferencesFormState = {
  business_hour_start: '',
  business_hour_end: '',
};

export function usePreferencesManager() {
  const organization = useOrganizationDetails();
  const {updateTenantSettings, isLoading} = useUpdateTenantSettings();

  const [businessHoursEnabled, setBusinessHoursEnabled] = useState(false);
  const [cachedBusinessHours, setCachedBusinessHours] =
    useState<BusinessHourCache>({start: '', end: ''});
  const [preferences, setPreferences] = useState<PreferencesFormState>(
    EMPTY_PREFERENCES_STATE,
  );
  const [initialPreferences, setInitialPreferences] =
    useState<PreferencesFormState>(EMPTY_PREFERENCES_STATE);

  useEffect(() => {
    if (organization) {
      const rawStart = organization.business_hour_start ?? '';
      const rawEnd = organization.business_hour_end ?? '';
      const hasBusinessHours =
        (rawStart?.length ?? 0) > 0 || (rawEnd?.length ?? 0) > 0;

      const nextPreferences: PreferencesFormState = {
        business_hour_start: hasBusinessHours ? rawStart : '',
        business_hour_end: hasBusinessHours ? rawEnd : '',
      };

      setPreferences(nextPreferences);
      setInitialPreferences((prev) => ({
        ...prev,
        business_hour_start: rawStart,
        business_hour_end: rawEnd,
      }));
      setBusinessHoursEnabled(hasBusinessHours);
      if (hasBusinessHours) {
        setCachedBusinessHours({start: rawStart, end: rawEnd});
      }
    } else {
      setPreferences(EMPTY_PREFERENCES_STATE);
      setInitialPreferences(EMPTY_PREFERENCES_STATE);
      setBusinessHoursEnabled(false);
      setCachedBusinessHours({start: '', end: ''});
    }
  }, [organization]);

  const updateField = useCallback(
    (key: keyof PreferencesFormState, value: string) => {
      setPreferences((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    [],
  );

  const computeUpdateValue = useCallback(
    (
      key: keyof PreferencesFormState,
      sourcePreferences: PreferencesFormState = preferences,
    ): string | null | undefined => {
      const currentValue = sourcePreferences[key]?.trim() ?? '';
      const originalValue =
        initialPreferences[key]?.trim() ??
        (organization?.[key as keyof Tenant] as string | undefined)?.trim() ??
        '';

      if (currentValue === originalValue) {
        return undefined;
      }

      if (currentValue.length === 0) {
        return originalValue.length > 0 ? null : undefined;
      }

      return currentValue;
    },
    [preferences, initialPreferences, organization],
  );

  const submitUpdate = useCallback(
    async (overrides: Partial<PreferencesFormState> = {}) => {
      const nextPreferences = {...preferences, ...overrides};
      const updateData: Record<string, string | null | undefined> = {};
      const keys: Array<keyof PreferencesFormState> = [
        'business_hour_start',
        'business_hour_end',
      ];

      keys.forEach((key) => {
        const value = computeUpdateValue(key, nextPreferences);
        if (value !== undefined) {
          updateData[key] = value;
        }
      });

      const updatedTenant = await updateTenantSettings(updateData);
      setPreferences(nextPreferences);
      setInitialPreferences({...nextPreferences});
      setCachedBusinessHours({
        start: nextPreferences.business_hour_start,
        end: nextPreferences.business_hour_end,
      });
      setBusinessHoursEnabled(
        nextPreferences.business_hour_start.length > 0 ||
          nextPreferences.business_hour_end.length > 0,
      );
      return updatedTenant;
    },
    [computeUpdateValue, preferences, updateTenantSettings],
  );

  const toggleBusinessHours = useCallback(
    async (enabled: boolean) => {
      const previousEnabled = businessHoursEnabled;
      const previousPreferences = {...preferences};
      const previousInitial = {...initialPreferences};
      const previousCached = {...cachedBusinessHours};

      if (!enabled) {
        const nextCached = {
          start: preferences.business_hour_start || cachedBusinessHours.start,
          end: preferences.business_hour_end || cachedBusinessHours.end,
        };

        setBusinessHoursEnabled(false);
        setCachedBusinessHours(nextCached);
        setPreferences((prev) => ({
          ...prev,
          business_hour_start: '',
          business_hour_end: '',
        }));

        try {
          const updatedTenant = await updateTenantSettings({
            business_hour_start: null,
            business_hour_end: null,
          });
          setInitialPreferences((prev) => ({
            ...prev,
            business_hour_start: '',
            business_hour_end: '',
          }));
          return updatedTenant;
        } catch (error) {
          setBusinessHoursEnabled(previousEnabled);
          setCachedBusinessHours(previousCached);
          setPreferences(previousPreferences);
          setInitialPreferences(previousInitial);
          throw error;
        }
      }

      const nextStart =
        cachedBusinessHours.start ||
        preferences.business_hour_start ||
        DEFAULT_BUSINESS_HOUR_START;
      const nextEnd =
        cachedBusinessHours.end ||
        preferences.business_hour_end ||
        DEFAULT_BUSINESS_HOUR_END;

      setBusinessHoursEnabled(true);
      setPreferences((prev) => ({
        ...prev,
        business_hour_start: nextStart,
        business_hour_end: nextEnd,
      }));

      try {
        const updatedTenant = await updateTenantSettings({
          business_hour_start: nextStart,
          business_hour_end: nextEnd,
        });
        setCachedBusinessHours({start: nextStart, end: nextEnd});
        setInitialPreferences((prev) => ({
          ...prev,
          business_hour_start: nextStart,
          business_hour_end: nextEnd,
        }));
        return updatedTenant;
      } catch (error) {
        setBusinessHoursEnabled(previousEnabled);
        setCachedBusinessHours(previousCached);
        setPreferences(previousPreferences);
        setInitialPreferences(previousInitial);
        throw error;
      }
    },
    [
      businessHoursEnabled,
      cachedBusinessHours,
      initialPreferences,
      preferences,
      updateTenantSettings,
    ],
  );

  return {
    organization,
    isLoading,
    preferences,
    businessHoursEnabled,
    updateField,
    toggleBusinessHours,
    submitUpdate,
  };
}
