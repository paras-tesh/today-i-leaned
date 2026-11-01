import { createClient } from "@supabase/supabase-js";

// The publishable (anon) key is meant to be public.
// Data is protected by Row Level Security policies in Supabase.
const SUPABASE_URL = "https://axeoeumxspzlcctwrmvg.supabase.co";
const SUPABASE_KEY = "sb_publishable_6ckZ0wXxF2GE3VUOOLJhVQ_iKo1IgeV";

// SDK client (used for authentication)
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// REST config (used for reading/writing facts)
export const FACTS_URL = `${SUPABASE_URL}/rest/v1/facts`;

export const apiHeaders = {
  apikey: SUPABASE_KEY,
  authorization: `Bearer ${SUPABASE_KEY}`,
};
