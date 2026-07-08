import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pghnhppkwtzozqchrbnf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaG5ocHBrd3R6b3pxY2hyYm5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxNTUyOTAsImV4cCI6MjA5NzczMTI5MH0.uOqI3K4qa8qftPVnUZWH-ekArUFOnf0_hxf5EaSDtWA'
const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  console.log('Finding demo users...')
  
  // 1. Get the actual profiles for the demo users that the user created
  const { data: profiles, error: profileErr } = await supabase
    .from('profiles')
    .select('*')
  
  if (profileErr) {
    console.error('Error fetching profiles:', profileErr)
    return
  }

  const maestro = profiles.find(p => p.role === 'maestro')
  const supervisor = profiles.find(p => p.role === 'supervisor')

  if (!maestro || !supervisor) {
    console.log('Could not find maestro or supervisor in profiles. Existing profiles:', profiles)
    return
  }

  console.log('Found Maestro:', maestro.full_name, maestro.id)
  console.log('Found Supervisor:', supervisor.full_name, supervisor.id)

  // 2. Get active obras
  const { data: obras, error: obrasErr } = await supabase
    .from('obras')
    .select('id, name')
    .eq('status', 'active')
    .limit(3)

  if (obrasErr || !obras.length) {
    console.log('No active obras found')
    return
  }

  console.log('Assigning to obras:', obras.map(o => o.name).join(', '))

  // 3. Assign them
  for (const obra of obras) {
    // Delete existing assignments for this obra for these roles to avoid duplicates
    await supabase.from('obra_assignments').delete().match({ obra_id: obra.id, role: 'maestro' })
    await supabase.from('obra_assignments').delete().match({ obra_id: obra.id, role: 'supervisor' })

    // Insert new assignments
    await supabase.from('obra_assignments').insert([
      { obra_id: obra.id, user_id: maestro.id, role: 'maestro' },
      { obra_id: obra.id, user_id: supervisor.id, role: 'supervisor' }
    ])
  }

  console.log('✅ Done! Maestro and Supervisor are now assigned to obras.')
}

run()
