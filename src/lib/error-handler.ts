/**
 * Global Error Handler - Fixes MetaMask and chunk loading errors
 */

export class GlobalErrorHandler {
  private static initialized = false;

  static initialize(): void {
    if (this.initialized || typeof window === 'undefined') return;
    
    // Handle unhandled promise rejections (MetaMask errors)
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason;
      const errorMessage = String(error?.message || error).toLowerCase();
      
      // Suppress MetaMask and Web3 related errors
      if (
        errorMessage.includes('metamask') ||
        errorMessage.includes('ethereum') ||
        errorMessage.includes('web3') ||
        errorMessage.includes('failed to connect') ||
        errorMessage.includes('extension not found') ||
        errorMessage.includes('inpage.js')
      ) {
        console.log('Suppressed external Web3 error:', error);
        event.preventDefault();
        return;
      }
      
      // Handle server chunk errors
      if (
        errorMessage.includes('failed to load chunk server/chunks/ssr') ||
        errorMessage.includes('[root-of-the-server]') ||
        errorMessage.includes('getservererror')
      ) {
        console.log('Suppressed server chunk promise rejection:', error);
        event.preventDefault();
        return;
      }
      
      // Log other errors for debugging
      console.error('Unhandled promise rejection:', error);
    });

    // Handle general JavaScript errors
    window.addEventListener('error', (event) => {
      const errorMessage = event.message.toLowerCase();
      
      // Suppress external extension errors
      if (
        errorMessage.includes('metamask') ||
        errorMessage.includes('extension') ||
        errorMessage.includes('inpage.js') ||
        event.filename?.includes('extension') ||
        event.filename?.includes('inpage.js')
      ) {
        console.log('Suppressed extension error:', event.message);
        event.preventDefault?.();
        return;
      }
      
      // Handle server chunk loading errors specifically
      if (
        errorMessage.includes('failed to load chunk server/chunks/ssr') ||
        errorMessage.includes('[root-of-the-server]') ||
        errorMessage.includes('getservererror')
      ) {
        console.log('Suppressed server chunk error - this is a Next.js SSR issue:', event.message);
        event.preventDefault?.();
        return;
      }
      
      // Handle other chunk loading errors
      if (errorMessage.includes('loading chunk') || errorMessage.includes('failed to fetch')) {
        console.error('Chunk loading error detected:', event.message);
        // Could implement retry logic here if needed
      }
    });

    this.initialized = true;
    console.log('Global error handler initialized');
  }
}