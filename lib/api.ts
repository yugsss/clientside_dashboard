// API service for fetching documents
import type { DocumentData } from "./indexeddb"

class DocumentsAPI {
  private baseUrl = "/api/documents" // This would be your actual API endpoint

  // Simulate API call with dummy data
  async fetchDocuments(): Promise<DocumentData[]> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Generate dummy data that matches our interface
    const dummyDocuments: DocumentData[] = [
      {
        id: 1,
        name: "Project Proposal.pdf",
        category: "Business",
        lastModified: "2 hours ago",
        owner: "John Doe",
        status: "Published",
        size: "2.4 MB",
        created: "2024-01-10",
        type: "pdf",
        content: "Project proposal content...",
        tags: ["business", "proposal"],
        version: 1,
      },
      {
        id: 2,
        name: "Marketing Strategy.docx",
        category: "Marketing",
        lastModified: "1 day ago",
        owner: "Jane Smith",
        status: "Draft",
        size: "1.8 MB",
        created: "2024-01-09",
        type: "docx",
        content: "Marketing strategy content...",
        tags: ["marketing", "strategy"],
        version: 2,
      },
      {
        id: 3,
        name: "Financial Report Q3.xlsx",
        category: "Finance",
        lastModified: "3 days ago",
        owner: "Mike Johnson",
        status: "Published",
        size: "3.2 MB",
        created: "2024-01-07",
        type: "xlsx",
        content: "Financial data...",
        tags: ["finance", "quarterly"],
        version: 1,
      },
      // Generate more dummy data
      ...Array.from({ length: 97 }, (_, i) => ({
        id: i + 4,
        name: `Document ${i + 4}.${["pdf", "docx", "xlsx", "png"][i % 4]}`,
        category: ["Business", "Marketing", "Finance", "Research", "Design", "Technical"][i % 6],
        lastModified: `${Math.floor(Math.random() * 30) + 1} days ago`,
        owner: ["John Doe", "Jane Smith", "Mike Johnson", "Sarah Wilson", "Alex Chen", "David Kim"][i % 6],
        status: (Math.random() > 0.5 ? "Published" : "Draft") as "Published" | "Draft",
        size: `${(Math.random() * 10 + 0.5).toFixed(1)} MB`,
        created: `2023-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
        type: ["pdf", "docx", "xlsx", "png", "figma", "md", "csv"][i % 7] as DocumentData["type"],
        content: `Content for document ${i + 4}`,
        tags: [`tag${i % 5}`, `category${i % 3}`],
        version: Math.floor(Math.random() * 5) + 1,
      })),
    ]

    return dummyDocuments
  }

  async fetchDocument(id: number): Promise<DocumentData | null> {
    // Simulate API call for single document
    await new Promise((resolve) => setTimeout(resolve, 500))

    const documents = await this.fetchDocuments()
    return documents.find((doc) => doc.id === id) || null
  }

  async updateDocument(id: number, updates: Partial<DocumentData>): Promise<DocumentData> {
    // Simulate API call for updating document
    await new Promise((resolve) => setTimeout(resolve, 800))

    const documents = await this.fetchDocuments()
    const document = documents.find((doc) => doc.id === id)

    if (!document) {
      throw new Error("Document not found")
    }

    return { ...document, ...updates, lastModified: "Just now" }
  }

  async deleteDocument(id: number): Promise<void> {
    // Simulate API call for deleting document
    await new Promise((resolve) => setTimeout(resolve, 600))
    console.log(`Document ${id} deleted`)
  }

  async createDocument(document: Omit<DocumentData, "id">): Promise<DocumentData> {
    // Simulate API call for creating document
    await new Promise((resolve) => setTimeout(resolve, 700))

    return {
      ...document,
      id: Date.now(), // Simple ID generation for demo
      created: new Date().toISOString().split("T")[0],
      lastModified: "Just now",
    }
  }
}

export const documentsAPI = new DocumentsAPI()
