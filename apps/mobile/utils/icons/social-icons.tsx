import GoogleSvg from '@/assets/icons/icon-google.svg';
import MicrosoftSvg from '@/assets/icons/icon-microsoft.svg';
import EmailSvg from '@/assets/icons/icon-password.svg';

type SocialIconProps = {size?: number};

export function GoogleIcon({size = 18}: SocialIconProps) {
  return <GoogleSvg width={size} height={size} />;
}

export function MicrosoftIcon({size = 18}: SocialIconProps) {
  return <MicrosoftSvg width={size} height={size} />;
}

export function EmailIcon({size = 18}: SocialIconProps) {
  return <EmailSvg width={size} height={size} />;
}
