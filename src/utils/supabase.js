import { createClient } from '@supabase/supabase-js';
import { getConfig } from './configHelper';
const supabaseUrl = getConfig('SUPABASE_URL');
const supabaseKey = getConfig('SUPABASE_KEY');
const supabase = createClient(supabaseUrl, supabaseKey)
export default supabase;