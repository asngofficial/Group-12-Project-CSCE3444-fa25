import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import { useDeviceType } from '../hooks/useDeviceType';

type PageWrapperProps = {
  children: ReactNode;
  onNavigate: (page: string) => void;
  currentPage: string;
};

export function PageWrapper({ children, onNavigate, currentPage }: PageWrapperProps) {
  const deviceType = useDeviceType();

  return (
    <>
      {children}
      {/* Only show bottom nav on mobile */}
      {deviceType === 'mobile' && (
        <BottomNav onNavigate={onNavigate} currentPage={currentPage} />
      )}
    </>
  );
}
