// IndexedDB utility for storing documents data
export interface DocumentData {
  id: number
  name: string
  category: string
  lastModified: string
  owner: string
  status: "Published" | "Draft"
  size: string
  created: string
  type: "pdf" | "docx" | "xlsx" | "png" | "figma" | "md" | "csv"
  content?: string
  tags?: string[]
  version?: number
}

class IndexedDBManager {
  private dbName = "DocuFlowDB"
  private version = 1
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => {
        console.error("IndexedDB failed to open")
        reject(request.error)
      }

      request.onsuccess = () => {
        this.db = request.result
        console.log("IndexedDB opened successfully")
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create documents store
        if (!db.objectStoreNames.contains("documents")) {
          const documentsStore = db.createObjectStore("documents", { keyPath: "id" })
          documentsStore.createIndex("category", "category", { unique: false })
          documentsStore.createIndex("owner", "owner", { unique: false })
          documentsStore.createIndex("status", "status", { unique: false })
          documentsStore.createIndex("type", "type", { unique: false })
          documentsStore.createIndex("created", "created", { unique: false })
        }

        // Create metadata store for sync info
        if (!db.objectStoreNames.contains("metadata")) {
          db.createObjectStore("metadata", { keyPath: "key" })
        }
      }
    })
  }

  async saveDocuments(documents: DocumentData[]): Promise<void> {
    if (!this.db) throw new Error("Database not initialized")

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["documents", "metadata"], "readwrite")
      const documentsStore = transaction.objectStore("documents")
      const metadataStore = transaction.objectStore("metadata")

      transaction.oncomplete = () => {
        console.log("Documents saved to IndexedDB")
        resolve()
      }

      transaction.onerror = () => {
        console.error("Failed to save documents")
        reject(transaction.error)
      }

      // Clear existing documents
      documentsStore.clear()

      // Add new documents
      documents.forEach((doc) => {
        documentsStore.add(doc)
      })

      // Update last sync timestamp
      metadataStore.put({
        key: "lastSync",
        value: new Date().toISOString(),
        documentsCount: documents.length,
      })
    })
  }

  async getDocuments(): Promise<DocumentData[]> {
    if (!this.db) throw new Error("Database not initialized")

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["documents"], "readonly")
      const store = transaction.objectStore("documents")
      const request = store.getAll()

      request.onsuccess = () => {
        resolve(request.result || [])
      }

      request.onerror = () => {
        console.error("Failed to get documents")
        reject(request.error)
      }
    })
  }

  async getMetadata(key: string): Promise<any> {
    if (!this.db) throw new Error("Database not initialized")

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["metadata"], "readonly")
      const store = transaction.objectStore("metadata")
      const request = store.get(key)

      request.onsuccess = () => {
        resolve(request.result?.value || null)
      }

      request.onerror = () => {
        reject(request.error)
      }
    })
  }

  async clearAll(): Promise<void> {
    if (!this.db) throw new Error("Database not initialized")

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["documents", "metadata"], "readwrite")

      transaction.oncomplete = () => {
        console.log("IndexedDB cleared")
        resolve()
      }

      transaction.onerror = () => {
        reject(transaction.error)
      }

      transaction.objectStore("documents").clear()
      transaction.objectStore("metadata").clear()
    })
  }
}

export const indexedDBManager = new IndexedDBManager()
