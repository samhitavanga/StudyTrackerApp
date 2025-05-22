'use client';

import dynamic from 'next/dynamic';

// Dynamically import the LogoutButton with no SSR to avoid hydration issues
const LogoutButton = dynamic(
  () => import('./LogoutButton'),
  { ssr: false }
);

export default function LogoutButtonWrapper() {
  return <LogoutButton />;
}
