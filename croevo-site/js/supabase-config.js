// js/supabase-config.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://prlazkmlxpofsedpomqx.supabase.co'
const supabaseKey = 'sb_publishable_6niljV54T0Z17h7kbqYe2A_ZP8dMWW5'

export const supabase = createClient(supabaseUrl, supabaseKey)