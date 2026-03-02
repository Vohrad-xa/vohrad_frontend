import GoogleSvg from '@/assets/icons/icon-google.svg';
import MicrosoftSvg from '@/assets/icons/icon-microsoft.svg';

type SocialIconProps = {size?: number};

export function GoogleIcon({size = 20}: SocialIconProps) {
  return <GoogleSvg width={size} height={size} />;
}

export function MicrosoftIcon({size = 20}: SocialIconProps) {
  return <MicrosoftSvg width={size} height={size} />;
}
