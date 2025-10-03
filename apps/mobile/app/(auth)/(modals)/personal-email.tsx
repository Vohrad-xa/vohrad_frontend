import React from 'react';
import {StatusBar} from 'react-native';
import {PersonalEmailForm} from '@/features/auth/personal-email-form';
import {useTheme} from '@/providers';

export default function PersonalEmailModal() {
  const {scheme} = useTheme();

  const handleSuccess = () => {};

  return (
    <>
      <StatusBar
        barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'}
      />
      <PersonalEmailForm onSuccess={handleSuccess} />
    </>
  );
}
