import {useRef} from 'react';
import {
  PhoneContent,
  useProfileHeader,
  type PhoneContentHandle,
} from '@/features/settings/profile';

export default function PhoneModal() {
  const contentRef = useRef<PhoneContentHandle>(null);
  useProfileHeader({contentRef});
  return <PhoneContent ref={contentRef} />;
}
