import { createClient } from '@supabase/supabase-js';
import { SessionData } from './types';

const DEFAULT_SUPABASE_URL = 'https://nljlhymxnkwajmgsxiqx.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_2lmP1bTfqXKrUvqyumYUeQ_aH7k2XfM';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  DEFAULT_SUPABASE_URL;

const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_ANON_KEY ||
  DEFAULT_SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function fetchSessionFromSupabase(pin: string): Promise<SessionData | null> {
  try {
    const cleanPin = pin.toUpperCase().trim();
    const { data, error } = await supabase
      .from('workshop_sessions')
      .select('data')
      .eq('pin', cleanPin)
      .single();

    if (error) {
      // If code is PGRST116 (no row found), that's expected on first run
      if (error.code !== 'PGRST116') {
        console.warn('Supabase fetch notice:', error.message);
      }
      return null;
    }

    if (!data || !data.data) return null;
    return data.data as SessionData;
  } catch (err) {
    console.error('Supabase fetch error:', err);
    return null;
  }
}

export async function saveSessionToSupabase(pin: string, sessionData: SessionData): Promise<boolean> {
  try {
    const cleanPin = pin.toUpperCase().trim();
    const { error } = await supabase
      .from('workshop_sessions')
      .upsert(
        {
          pin: cleanPin,
          data: sessionData,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'pin' }
      );

    if (error) {
      console.error('Supabase upsert error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase save error:', err);
    return false;
  }
}
