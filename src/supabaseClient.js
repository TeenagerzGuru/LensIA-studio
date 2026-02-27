import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lylolespzdsiqankqpqj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5bG9sZXNwemRzaXFhbmtxcHFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNzcyNzYsImV4cCI6MjA4Nzc1MzI3Nn0.mm4V44f0LOBoWGRczBSrCBjXvd4a_bQ9NJ8gwHf2FtI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
