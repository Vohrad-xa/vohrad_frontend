import {useState, useCallback, useMemo, useEffect} from 'react';
import {useOrganizationDetails, useUpdateTenantSettings} from '../hooks';
import type {Tenant} from '@vohrad/types';

type PreferencesFormState = {
  timezone: string;
  business_hour_start: string;
  business_hour_end: string;
};

type BusinessHourCache = {
  start: string;
  end: string;
};

const DEFAULT_BUSINESS_HOUR_START = '09:00';
const DEFAULT_BUSINESS_HOUR_END = '17:00';

export function usePreferencesManager() {
  const organization = useOrganizationDetails();
  const {updateTenantSettings, isLoading} = useUpdateTenantSettings();
  const deviceTimezone = useMemo(() => {
    try {
      const resolved = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (resolved && resolved.length > 0) {
        return resolved;
      }
    } catch (err) {
      if (__DEV__) {
        console.warn('Failed to resolve device timezone', err);
      }
    }
    return '';
  }, []);

  const emptyPreferencesState: PreferencesFormState = useMemo(
    () => ({
      timezone: deviceTimezone,
      business_hour_start: '',
      business_hour_end: '',
    }),
    [deviceTimezone],
  );

  const [businessHoursEnabled, setBusinessHoursEnabled] = useState(false);
  const [cachedBusinessHours, setCachedBusinessHours] =
    useState<BusinessHourCache>({start: '', end: ''});
  const [preferences, setPreferences] = useState<PreferencesFormState>(
    emptyPreferencesState,
  );
  const [initialPreferences, setInitialPreferences] =
    useState<PreferencesFormState>(emptyPreferencesState);

  useEffect(() => {
    if (organization) {
      const rawStart = organization.business_hour_start ?? '';
      const rawEnd = organization.business_hour_end ?? '';
      const hasBusinessHours =
        (rawStart?.length ?? 0) > 0 || (rawEnd?.length ?? 0) > 0;

      const nextPreferences: PreferencesFormState = {
        timezone:
          organization.timezone && organization.timezone.length > 0
            ? organization.timezone
            : deviceTimezone,
        business_hour_start: hasBusinessHours ? rawStart : '',
        business_hour_end: hasBusinessHours ? rawEnd : '',
      };

      setPreferences(nextPreferences);
      setInitialPreferences((prev) => ({
        ...prev,
        timezone: organization.timezone ?? '',
        business_hour_start: rawStart,
        business_hour_end: rawEnd,
      }));
      setBusinessHoursEnabled(hasBusinessHours);
      if (hasBusinessHours) {
        setCachedBusinessHours({start: rawStart, end: rawEnd});
      }
    } else {
      setPreferences(emptyPreferencesState);
      setInitialPreferences(emptyPreferencesState);
      setBusinessHoursEnabled(false);
      setCachedBusinessHours({start: '', end: ''});
    }
  }, [organization, emptyPreferencesState, deviceTimezone]);

  const updateField = useCallback((key: string, value: string) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const computeUpdateValue = useCallback(
    (key: keyof PreferencesFormState): string | null | undefined => {
      const currentValue = preferences[key]?.trim() ?? '';
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

  const hasChanges = useCallback(() => {
    const keys: Array<keyof PreferencesFormState> = [
      'timezone',
      'business_hour_start',
      'business_hour_end',
    ];

    return keys.some((key) => computeUpdateValue(key) !== undefined);
  }, [computeUpdateValue]);

  const submitUpdate = useCallback(async () => {
    const updateData: Record<string, string | null | undefined> = {};
    const keys: Array<keyof PreferencesFormState> = [
      'timezone',
      'business_hour_start',
      'business_hour_end',
    ];

    keys.forEach((key) => {
      const value = computeUpdateValue(key);
      if (value !== undefined) {
        updateData[key] = value;
      }
    });

    await updateTenantSettings(updateData);
    setInitialPreferences({...preferences});
    setCachedBusinessHours({
      start: preferences.business_hour_start,
      end: preferences.business_hour_end,
    });
    setBusinessHoursEnabled(
      preferences.business_hour_start.length > 0 ||
        preferences.business_hour_end.length > 0,
    );
  }, [computeUpdateValue, updateTenantSettings, preferences]);

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
          await updateTenantSettings({
            business_hour_start: null,
            business_hour_end: null,
          });
          setInitialPreferences((prev) => ({
            ...prev,
            business_hour_start: '',
            business_hour_end: '',
          }));
        } catch (error) {
          setBusinessHoursEnabled(previousEnabled);
          setCachedBusinessHours(previousCached);
          setPreferences(previousPreferences);
          setInitialPreferences(previousInitial);
          throw error;
        }
        return;
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
        await updateTenantSettings({
          business_hour_start: nextStart,
          business_hour_end: nextEnd,
        });
        setCachedBusinessHours({start: nextStart, end: nextEnd});
        setInitialPreferences((prev) => ({
          ...prev,
          business_hour_start: nextStart,
          business_hour_end: nextEnd,
        }));
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
    hasChanges,
    submitUpdate,
  };
}
