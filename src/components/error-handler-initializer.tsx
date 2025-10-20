'use client';

import { useEffect } from 'react';
import { GlobalErrorHandler } from '@/lib/error-handler';

export function ErrorHandlerInitializer() {
  useEffect(() => {
    // Initialize global error handler on client side
    GlobalErrorHandler.initialize();
  }, []);

  return null; // This component doesn't render anything
}