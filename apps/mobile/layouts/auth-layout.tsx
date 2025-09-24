import React from 'react';
import {Platform} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import {useTheme} from '@/providers';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({children}: AuthLayoutProps) {
  const {scheme} = useTheme();

  return (
    <>
      {children}
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
    </>
  );
}