import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lnnbivrwtvsncsikjbbz.supabase.co'
const supabaseKey = 'sb_publishable_yecsIAzUInTzf_PNv3fn4g_lUbKKmwH'

export const supabase = createClient(supabaseUrl, supabaseKey)