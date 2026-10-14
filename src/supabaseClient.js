import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://axeoeumxspzlcctwrmvg.supabase.co";
const supabaseKey = "sb_publishable_6ckZ0wXxF2GE3VUOOLJhVQ_iKo1IgeV";

export const supabase = createClient(supabaseUrl, supabaseKey);
