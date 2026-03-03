import Constants from 'expo-constants';

export type AppVersion = {
  version: string;
  buildNumber: string;
  displayVersion: string;
};

/**
 * Returns the app's semantic version, native build number, and a combined
 *
 * display string sourced from the native runtime via expo-constants.
 */
export function getAppVersion(): AppVersion {
  const version =
    Constants.expoConfig?.version ?? Constants.nativeAppVersion ?? '0.0.0';
  const buildNumber = Constants.nativeBuildVersion ?? '';
  const displayVersion = buildNumber ? `${version} (${buildNumber})` : version;
  return {version, buildNumber, displayVersion};
}

/**
 * Derives a stable numeric version from an object's content by hashing its sorted JSON.
 *
 * - Key order is normalized before hashing so the same data always produces the same version.
 */

function Hash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export function generateVersion<T extends object>(obj: T): number {
  const sortedObj = Object.keys(obj)
    .sort()
    .reduce((acc, key) => {
      acc[key as keyof T] = obj[key as keyof T];
      return acc;
    }, {} as T);

  return Hash(JSON.stringify(sortedObj));
}
