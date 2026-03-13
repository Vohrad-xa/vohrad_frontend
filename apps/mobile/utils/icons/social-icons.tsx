import AppleSvg from '@/assets/icons/icon-apple.svg';
import GoogleSvg from '@/assets/icons/icon-google.svg';
import LoginSvg from '@/assets/icons/icon-login.svg';
import MicrosoftSvg from '@/assets/icons/icon-microsoft.svg';
import {Palette} from '@/constants';

type SocialIconProps = {size?: number};

const IconSize = 20;

export function AppleIcon({
  size = IconSize,
  color = Palette.black,
}: SocialIconProps & {color?: string}) {
  return <AppleSvg width={size} height={size} fill={color} />;
}

export function GoogleIcon({size = IconSize}: SocialIconProps) {
  return <GoogleSvg width={size} height={size} />;
}

export function MicrosoftIcon({size = IconSize}: SocialIconProps) {
  return <MicrosoftSvg width={size} height={size} />;
}

export function LoginIcon({size = 18}: SocialIconProps) {
  return <LoginSvg width={size} height={size} />;
}
