import {useRef} from 'react';
import {
  AddressContent,
  useProfileHeader,
  type AddressContentHandle,
} from '@/features/settings/profile';

export default function AddressModal() {
  const contentRef = useRef<AddressContentHandle>(null);
  useProfileHeader({contentRef});
  return <AddressContent ref={contentRef} />;
}
