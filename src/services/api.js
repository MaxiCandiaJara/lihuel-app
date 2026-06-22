import { supabase } from './supabase'

// ── OBRAS ────────────────────────────────────────────────────

export const fetchObras = async (userId, role) => {
  let query = supabase
    .from('obras')
    .select(`
      *,
      obra_assignments(user_id, role),
      stages(id, stage_type, status)
    `)
    .order('created_at', { ascending: false })

  if (role === 'maestro' || role === 'supervisor') {
    // filter to assigned obras only
    const { data: assignments } = await supabase
      .from('obra_assignments')
      .select('obra_id')
      .eq('user_id', userId)
    const ids = assignments?.map(a => a.obra_id) || []
    if (ids.length === 0) return []
    query = query.in('id', ids)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export const fetchObraById = async (obraId) => {
  const { data, error } = await supabase
    .from('obras')
    .select(`
      *,
      obra_assignments(user_id, role, profiles(id, full_name, role, avatar_url)),
      stages(
        *,
        checklist_items(*),
        stage_photos(*)
      )
    `)
    .eq('id', obraId)
    .single()
  if (error) throw error
  return data
}

export const createObra = async (obraData) => {
  const { data, error } = await supabase
    .from('obras')
    .insert(obraData)
    .select()
    .single()
  if (error) throw error
  return data
}

export const updateObra = async (obraId, updates) => {
  const { data, error } = await supabase
    .from('obras')
    .update(updates)
    .eq('id', obraId)
    .select()
    .single()
  if (error) throw error
  return data
}

// ── ASSIGNMENTS ──────────────────────────────────────────────

export const addAssignment = async (obraId, userId, role) => {
  const { data, error } = await supabase
    .from('obra_assignments')
    .insert({ obra_id: obraId, user_id: userId, role })
    .select()
  if (error) throw error
  return data
}

export const removeAssignment = async (obraId, userId) => {
  const { error } = await supabase
    .from('obra_assignments')
    .delete()
    .eq('obra_id', obraId)
    .eq('user_id', userId)
  if (error) throw error
}

// ── STAGES ───────────────────────────────────────────────────

export const fetchStage = async (stageId) => {
  const { data, error } = await supabase
    .from('stages')
    .select(`
      *,
      checklist_items(*),
      stage_photos(*)
    `)
    .eq('id', stageId)
    .single()
  if (error) throw error
  return data
}

export const submitStage = async (stageId, observations, submittedBy) => {
  const { data, error } = await supabase
    .from('stages')
    .update({
      status: 'in_review',
      observations,
      submitted_at: new Date().toISOString(),
      submitted_by: submittedBy,
    })
    .eq('id', stageId)
    .select()
    .single()
  if (error) throw error
  return data
}

export const reviewStage = async (stageId, approved, comment, reviewedBy) => {
  const { data, error } = await supabase
    .from('stages')
    .update({
      status: approved ? 'approved' : 'rejected',
      rejection_comment: approved ? null : comment,
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewedBy,
    })
    .eq('id', stageId)
    .select()
    .single()
  if (error) throw error
  return data
}

// ── CHECKLIST ITEMS ──────────────────────────────────────────

export const updateChecklistItem = async (itemId, status) => {
  const { data, error } = await supabase
    .from('checklist_items')
    .update({ status })
    .eq('id', itemId)
    .select()
    .single()
  if (error) throw error
  return data
}

export const bulkUpdateChecklist = async (items) => {
  const updates = items.map(item =>
    supabase.from('checklist_items').update({ status: item.status }).eq('id', item.id)
  )
  await Promise.all(updates)
}

// ── CHECKLIST TEMPLATES ──────────────────────────────────────

export const fetchTemplates = async () => {
  const { data, error } = await supabase
    .from('checklist_templates')
    .select('*')
    .order('stage_type')
    .order('order_index')
  if (error) throw error
  return data || []
}

export const createTemplate = async (templateData) => {
  const { data, error } = await supabase
    .from('checklist_templates')
    .insert(templateData)
    .select()
    .single()
  if (error) throw error
  return data
}

export const deleteTemplate = async (templateId) => {
  const { error } = await supabase
    .from('checklist_templates')
    .delete()
    .eq('id', templateId)
  if (error) throw error
}

// ── PHOTOS ───────────────────────────────────────────────────

export const uploadPhoto = async (stageId, userId, file) => {
  const ext  = file.name.split('.').pop()
  const path = `${userId}/${stageId}/${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('stage-photos')
    .upload(path, file, { cacheControl: '3600', upsert: false })
  if (uploadError) throw uploadError

  const { data: urlData } = supabase.storage.from('stage-photos').getPublicUrl(path)

  const { data, error } = await supabase
    .from('stage_photos')
    .insert({ stage_id: stageId, storage_path: path, public_url: urlData.publicUrl, uploaded_by: userId })
    .select()
    .single()
  if (error) throw error
  return data
}

export const deletePhoto = async (photoId, storagePath) => {
  await supabase.storage.from('stage-photos').remove([storagePath])
  const { error } = await supabase.from('stage_photos').delete().eq('id', photoId)
  if (error) throw error
}

// ── INCIDENTS ────────────────────────────────────────────────

export const fetchIncidents = async () => {
  const { data, error } = await supabase
    .from('incidents')
    .select(`
      *,
      obras(name),
      stages(stage_type),
      profiles!incidents_assigned_to_fkey(full_name),
      creator:profiles!incidents_created_by_fkey(full_name)
    `)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export const createIncident = async (incidentData) => {
  const { data, error } = await supabase
    .from('incidents')
    .insert(incidentData)
    .select()
    .single()
  if (error) throw error
  return data
}

export const updateIncident = async (incidentId, updates) => {
  const { data, error } = await supabase
    .from('incidents')
    .update(updates)
    .eq('id', incidentId)
    .select()
    .single()
  if (error) throw error
  return data
}

// ── NOTIFICATIONS ────────────────────────────────────────────

export const fetchNotifications = async (userId) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return data || []
}

export const markNotificationRead = async (notificationId) => {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
  if (error) throw error
}

export const markAllNotificationsRead = async (userId) => {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false)
  if (error) throw error
}

export const createNotification = async (userId, type, title, body, relatedIds = {}) => {
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      title,
      body,
      ...relatedIds,
    })
  if (error) throw error
}

// ── USERS (for assignment dropdowns) ────────────────────────

export const fetchUsersByRole = async (role) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, role')
    .eq('role', role)
    .order('full_name')
  if (error) throw error
  return data || []
}

export const fetchAllUsers = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, role')
    .order('full_name')
  if (error) throw error
  return data || []
}
