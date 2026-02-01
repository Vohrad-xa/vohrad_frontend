import {useRef} from 'react';
import {
  NameContent,
  useProfileHeader,
  type NameContentHandle,
} from '@/features/settings/profile';

export default function NameModal() {
  const contentRef = useRef<NameContentHandle>(null);
  useProfileHeader({contentRef});
  return <NameContent ref={contentRef} />;
}
