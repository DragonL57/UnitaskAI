'use client';

import { use } from 'react';
import Home from '@/app/(app)/page';

export default function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <Home sessionId={id} />;
}
