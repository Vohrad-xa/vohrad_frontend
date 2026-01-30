import {useCallback, useMemo} from 'react';
import {useFetchLicenseInfo} from '../hooks';

type UseLicenseInfoManagerOptions = {
  enabled?: boolean;
};

/**
 * License info manager - orchestrates license query with computed values.
 *
 * - ONLY reads from TanStack Query (like attachments pattern)
 * - Provides computed license properties
 * - Clean orchestrator, no UI logic
 */
export function useLicenseInfoManager(
  options: UseLicenseInfoManagerOptions = {},
) {
  const {enabled = false} = options;
  const {data: licenseInfo, isLoading, refetch} = useFetchLicenseInfo(enabled);

  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const computed = useMemo(
    () => ({
      isLicenseActive: licenseInfo?.is_active ?? false,
      hasLicense: licenseInfo?.has_license ?? false,
      seatsRemaining: licenseInfo?.seats_available ?? 0,
      seatsUsed: licenseInfo?.seats_used ?? 0,
      seatsTotal: licenseInfo?.seats_total ?? 0,
      license: licenseInfo?.license ?? null,
    }),
    [licenseInfo],
  );

  return {
    licenseInfo,
    isLoading,
    refresh,
    ...computed,
  };
}
