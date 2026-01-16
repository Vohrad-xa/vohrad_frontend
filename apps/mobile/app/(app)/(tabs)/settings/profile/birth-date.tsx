import {useRef} from 'react';
import {
  DatePickerContent,
  useProfileHeader,
  type DatePickerContentHandle,
} from '@/features/settings/profile';

export default function DatePickerModal() {
  const contentRef = useRef<DatePickerContentHandle>(null);
  useProfileHeader({contentRef});
  return <DatePickerContent ref={contentRef} />;
}
