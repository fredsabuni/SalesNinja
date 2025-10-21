/**
 * PWA utilities for service worker registration and app installation
 */

interface BeforeInstallPromptEvent extends Event {
  readonly platforms?: string[];
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

// Register service worker
export const registerServiceWorker = async (): Promise<void> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log('Service Worker not supported');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('Service Worker registered successfully:', registration);

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New content is available, notify user
            console.log('New content available, please refresh');
            
            // You could show a toast notification here
            if (window.confirm('New version available. Refresh to update?')) {
              window.location.reload();
            }
          }
        });
      }
    });

  } catch (error) {
    console.error('Service Worker registration failed:', error);
  }
};

// Check if app can be installed
export const canInstallApp = (): boolean => {
  return 'beforeinstallprompt' in window;
};

// Install app prompt
let deferredPrompt: BeforeInstallPromptEvent | null = null;

export const setupInstallPrompt = (): void => {
  if (typeof window === 'undefined') return;

  window.addEventListener('beforeinstallprompt', (event) => {
    const promptEvent = event as BeforeInstallPromptEvent;
    // Prevent the mini-infobar from appearing on mobile
    promptEvent.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = promptEvent;
    
    // Show install button or banner
    console.log('App can be installed');
  });

  window.addEventListener('appinstalled', () => {
    console.log('App was installed');
    deferredPrompt = null;
  });
};

export const promptInstall = async (): Promise<boolean> => {
  if (!deferredPrompt) {
    console.log('Install prompt not available');
    return false;
  }

  try {
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`User response to install prompt: ${outcome}`);
    
    // Clear the deferredPrompt
    deferredPrompt = null;
    
    return outcome === 'accepted';
  } catch (error) {
    console.error('Error showing install prompt:', error);
    return false;
  }
};

// Check if app is running in standalone mode (installed)
export const isStandalone = (): boolean => {
  if (typeof window === 'undefined') return false;
  const navigatorWithStandalone = window.navigator as NavigatorWithStandalone;
  
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    navigatorWithStandalone.standalone === true ||
    document.referrer.includes('android-app://')
  );
};

// Get app installation status
export const getInstallationStatus = () => {
  return {
    canInstall: canInstallApp() && deferredPrompt !== null,
    isInstalled: isStandalone(),
    isSupported: 'serviceWorker' in navigator,
  };
};