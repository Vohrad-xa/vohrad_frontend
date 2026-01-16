import {useRef} from 'react';
import {
  EmailContent,
  useProfileHeader,
  type EmailContentHandle,
} from '@/features/settings/profile';

export default function EmailModal() {
  const contentRef = useRef<EmailContentHandle>(null);
  useProfileHeader({contentRef});
  return <EmailContent ref={contentRef} />;
}
