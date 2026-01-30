import {useLicenseInfoManager} from '@sykamore/store';

type UseLicenseInfoOptions = {
  enabled?: boolean;
};

export function useLicenseInfo(options: UseLicenseInfoOptions = {}) {
  const {enabled = true} = options;

  const manager = useLicenseInfoManager({enabled});

  return {
    licenseInfo: manager.licenseInfo,
    license: manager.license,
    isLoading: manager.isLoading,
    refresh: manager.refresh,
    hasLicense: manager.hasLicense,
    isLicenseActive: manager.isLicenseActive,
    seatsRemaining: manager.seatsRemaining,
    seatsUsed: manager.seatsUsed,
    seatsTotal: manager.seatsTotal,
  };
}
