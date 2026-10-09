import { createClient } from '@supabase/supabase-js';
import { SessionData } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export async function fetchSessionFromSupabase(pin: string): Promise<SessionData | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('workshop_sessions')
      .select('data')
      .eq('pin', pin.toUpperCase().trim())
      .single();

    if (error || !data) return null;
    return data.data as SessionData;
  } catch (err) {
    console.error('Supabase fetch error:', err);
    return null;
  }
}

export async function saveSessionToSupabase(pin: string, sessionData: SessionData): Promise<boolean> {
  if (!supabase) return false;
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
      console.error('Supabase upsert error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase save error:', err);
    return false;
  }
}
