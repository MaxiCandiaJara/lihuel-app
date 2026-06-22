import { useEffect, useRef } from 'react'
import useSyncStore from '../store/syncStore'
import { submitStage, bulkUpdateChecklist } from '../services/api'
import useAuthStore from '../store/authStore'

const useOfflineSync = () => {
  const { isOnline, queue, loadQueue, dequeue } = useSyncStore()
  const { user } = useAuthStore()
  const syncingRef = useRef(false)

  useEffect(() => {
    loadQueue()
  }, [loadQueue])

  useEffect(() => {
    if (isOnline && queue.length > 0 && !syncingRef.current && user) {
      processQueue()
    }
  }, [isOnline, queue.length, user])

  const processQueue = async () => {
    if (syncingRef.current) return
    syncingRef.current = true

    const items = [...queue]
    for (const item of items) {
      try {
        await processItem(item)
        await dequeue(item.id)
      } catch (err) {
        console.error('Sync failed for item:', item, err)
        // Leave in queue for retry
      }
    }
    syncingRef.current = false
  }

  const processItem = async (item) => {
    switch (item.type) {
      case 'submit_stage':
        await submitStage(item.payload.stageId, item.payload.observations, item.payload.userId)
        break
      case 'update_checklist':
        await bulkUpdateChecklist(item.payload.items)
        break
      default:
        console.warn('Unknown sync item type:', item.type)
    }
  }

  return { isOnline, pendingCount: queue.length }
}

export default useOfflineSync
