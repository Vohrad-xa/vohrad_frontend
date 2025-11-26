import {useCallback, useEffect} from 'react';
import {useTenantLicenseInfo, useFetchTenantLicenseInfo} from '../hooks';

type UseLicenseInfoManagerOptions = {
  fetchOnMount?: boolean;
};

export function useLicenseInfoManager(
  options: UseLicenseInfoManagerOptions = {},
) {
  const {fetchOnMount = false} = options;
  const licenseInfo = useTenantLicenseInfo();
  const {fetchLicenseInfo, isLoading} = useFetchTenantLicenseInfo();

  useEffect(() => {
    if (fetchOnMount && !licenseInfo) {
      void fetchLicenseInfo();
    }
  }, [fetchOnMount, licenseInfo, fetchLicenseInfo]);

  const refresh = useCallback(async () => {
    return await fetchLicenseInfo();
  }, [fetchLicenseInfo]);

  const isLicenseActive = licenseInfo?.is_active ?? false;
  const hasLicense = licenseInfo?.has_license ?? false;
  const seatsRemaining = licenseInfo?.seats_available ?? 0;
  const seatsUsed = licenseInfo?.seats_used ?? 0;
  const seatsTotal = licenseInfo?.seats_total ?? 0;
  const license = licenseInfo?.license ?? null;

  return {
    licenseInfo,
    license,
    isLoading,
    refresh,
    hasLicense,
    isLicenseActive,
    seatsRemaining,
    seatsUsed,
    seatsTotal,
  };
}
