export type CosquinEventName =
  | 'app_opened' | 'session_started' | 'experience_started'
  | 'camera_permission_granted' | 'image_target_detected' | 'current_shows_viewed'
  | 'ar_target_lost' | 'camera_permission_denied' | 'experience_finished'
  | 'favorite_added' | 'favorite_removed' | 'go_to_show_clicked' | 'offline_mode_used'
  | 'navigation_started' | 'direction_viewed' | 'navigation_stopped'
  | 'schedule_viewed' | 'my_schedule_viewed' | 'map_viewed';

export type AnalyticsProperties = Record<string, unknown>;
type AnalyticsPayload = { event: CosquinEventName; userId: string; sessionId: string; occurredAt: number; properties: AnalyticsProperties };
type AnalyticsClientOptions = { apiUrl: string; apiKey: string; debug: boolean };

const getOrCreateId = (storage: Storage, key: string): string => {
  const existing = storage.getItem(key);
  if (existing) return existing;
  const id = crypto.randomUUID();
  storage.setItem(key, id);
  return id;
};

const getOrCreateIdSafely = (getStorage: () => Storage, key: string): string => {
  try {
    return getOrCreateId(getStorage(), key);
  } catch {
    return crypto.randomUUID();
  }
};

export const createCorstenoAnalyticsClient = ({ apiUrl, apiKey, debug }: AnalyticsClientOptions) => {
  const userId = getOrCreateIdSafely(() => localStorage, 'corsteno_anon_id');
  const sessionId = getOrCreateIdSafely(() => sessionStorage, 'corsteno_session_id');
  const endpoint = `${apiUrl.replace(/\/+$/, '')}/v1/events`;

  const track = async (event: CosquinEventName, properties: AnalyticsProperties = {}): Promise<void> => {
    const payload: AnalyticsPayload = { event, userId, sessionId, occurredAt: Date.now(), properties };
    if (debug) console.info('[Analytics] event attempted', { event, endpoint });
    try {
      const response: Response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify(payload),
      });
      if (debug) console.info('[Analytics] event sent', { event, endpoint, status: response.status });
    } catch (error: unknown) {
      if (debug) console.error('[Analytics] event failed', { event, endpoint, error: error instanceof Error ? error.message : String(error) });
    }
  };
  return { track };
};
