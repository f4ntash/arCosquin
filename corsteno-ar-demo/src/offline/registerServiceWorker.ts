export type OfflineStatus = 'ready' | 'offline' | 'online' | 'unsupported' | 'error';

type OfflineStatusCallback = (status: OfflineStatus) => void;

const CRITICAL_OFFLINE_URLS = ['/', '/index.html', '/targets/cosquin-rock.mind'];

export const registerOfflineSupport = async (onStatus: OfflineStatusCallback): Promise<void> => {
  if (!('serviceWorker' in navigator) || !('caches' in window)) {
    onStatus('unsupported');
    return;
  }

  window.addEventListener('online', () => onStatus('online'));
  window.addEventListener('offline', () => onStatus('offline'));

  if (!navigator.onLine) {
    onStatus('offline');
  }

  try {
    await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    await navigator.serviceWorker.ready;
    const cacheReady = await hasCriticalOfflineAssets();

    if (cacheReady) {
      onStatus('ready');
    }
  } catch {
    onStatus('error');
  }
};

const hasCriticalOfflineAssets = async (): Promise<boolean> => {
  const matches = await Promise.all(CRITICAL_OFFLINE_URLS.map((url) => caches.match(url)));
  return matches.every(Boolean);
};
