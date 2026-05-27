import { Suspense } from 'react';
import InviteClient from './InviteClient';

// Server Component Wrapper
export default function InvitePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Loading your invitation...</div>}>
      <InviteClient />
    </Suspense>
  );
}
