import { create } from 'zustand'
import { openDB } from 'idb'

const DB_NAME    = 'lihuel-offline'
const STORE_NAME = 'sync-queue'
const DB_VERSION = 1

let dbPromise = null

const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
          store.createIndex('type', 'type', { unique: false })
          store.createIndex('createdAt', 'createdAt', { unique: false })
        }
      },
    })
  }
  return dbPromise
}

const useSyncStore = create((set, get) => ({
  isOnline: navigator.onLine,
  queue:    [],
  syncing:  false,

  setOnline: (online) => set({ isOnline: online }),

  // Add item to offline queue
  enqueue: async (type, payload) => {
    const db   = await getDB()
    const item = { type, payload, createdAt: Date.now(), retries: 0 }
    const id   = await db.add(STORE_NAME, item)
    const all  = await db.getAll(STORE_NAME)
    set({ queue: all })
    return id
  },

  // Load queue from IndexedDB
  loadQueue: async () => {
    const db  = await getDB()
    const all = await db.getAll(STORE_NAME)
    set({ queue: all })
    return all
  },

  // Remove processed item
  dequeue: async (id) => {
    const db = await getDB()
    await db.delete(STORE_NAME, id)
    const all = await db.getAll(STORE_NAME)
    set({ queue: all })
  },

  // Clear entire queue
  clearQueue: async () => {
    const db = await getDB()
    await db.clear(STORE_NAME)
    set({ queue: [] })
  },

  queueCount: () => get().queue.length,
}))

// Listen to online/offline events
window.addEventListener('online',  () => useSyncStore.getState().setOnline(true))
window.addEventListener('offline', () => useSyncStore.getState().setOnline(false))

export default useSyncStore
