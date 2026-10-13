import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Property, Booking, Message, Profile, WebsiteSettings } from '../types';

let cachedSupabaseClient: SupabaseClient | null = null;
let cachedSupabaseUrl = '';
let cachedSupabaseKey = '';

export function getSupabaseClient(url?: string, key?: string): SupabaseClient | null {
  if (!url || !key || url.includes('YOUR-PROJECT') || key.includes('YOUR-KEY')) {
    return null;
  }
  if (cachedSupabaseClient && cachedSupabaseUrl === url && cachedSupabaseKey === key) {
    return cachedSupabaseClient;
  }
  try {
    cachedSupabaseClient = createClient(url, key);
    cachedSupabaseUrl = url;
    cachedSupabaseKey = key;
    return cachedSupabaseClient;
  } catch (e) {
    console.error('Failed to initialize Supabase client:', e);
    return null;
  }
}

export async function testSupabaseConnection(
  url: string,
  key: string
): Promise<{ success: boolean; message: string }> {
  try {
    const client = createClient(url, key);
    const { error } = await client.from('properties').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          success: true,
          message: 'Connected to Supabase project! (Tables ready for synchronization).',
        };
      }
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Successfully connected to Supabase Cloud database!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Connection failed' };
  }
}

export interface CloudPayload {
  properties: Property[];
  bookings: Booking[];
  messages: Message[];
  profile: Profile;
  settings: WebsiteSettings;
}

/**
 * Fetch data from server cloud storage endpoint
 */
export async function fetchServerCloudData(): Promise<{
  success: boolean;
  data?: CloudPayload;
  error?: string;
}> {
  try {
    const res = await fetch('/api/data');
    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }
    const data = await res.json();
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Server cloud storage unavailable' };
  }
}

/**
 * Sync entire payload to server cloud storage endpoint
 */
export async function syncServerCloudData(
  payload: CloudPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Server sync failed' };
  }
}

// -------------------------------------------------------------
// Cross-Device Admin Authentication Helpers
// -------------------------------------------------------------

export const ADMIN_SESSION_KEY = 'yama_admin_session_token';

export function getStoredAdminSessionToken(): string | null {
  try {
    return localStorage.getItem(ADMIN_SESSION_KEY);
  } catch {
    return null;
  }
}

export function saveAdminSessionToken(token: string): void {
  try {
    localStorage.setItem(ADMIN_SESSION_KEY, token);
  } catch {}
}

export function clearAdminSessionToken(): void {
  try {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  } catch {}
}

export async function loginAdminApi(credentials: {
  key?: string;
  email?: string;
  password?: string;
}): Promise<{ success: boolean; token?: string; message: string; profile?: Profile }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, message: data.message || 'Invalid Master Key' };
    }
    if (data.token) {
      saveAdminSessionToken(data.token);
    }
    return {
      success: true,
      token: data.token,
      message: data.message,
      profile: data.profile,
    };
  } catch (err: any) {
    return {
      success: false,
      message: 'Network error connecting to cloud server. Check connection.',
    };
  }
}

export async function verifyAdminSessionApi(
  token: string
): Promise<{ authenticated: boolean; profile?: Profile }> {
  try {
    const res = await fetch('/api/auth/verify', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      return { authenticated: false };
    }
    const data = await res.json();
    return { authenticated: Boolean(data.authenticated), profile: data.profile };
  } catch {
    return { authenticated: false };
  }
}

export async function logoutAdminApi(token?: string): Promise<void> {
  clearAdminSessionToken();
  if (token) {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ token }),
      });
    } catch {}
  }
}
