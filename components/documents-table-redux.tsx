"use client"

import { useEffect, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { VirtualizedDataTable } from "./virtualized-data-table"
import { DocumentView } from "./document-view"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Eye, FileText, ImageIcon, FileSpreadsheet, RefreshCw } from "lucide-react"
import { useDocumentsStore } from "../stores/documents-store"
import type { DocumentData } from "../lib/indexeddb"

const getFileIcon = (type: string) => {
  switch (type) {
    case "pdf":
    case "docx":
    case "md":
      return <FileText className="h-4 w-4 text-blue-600" />
    case "xlsx":
    case "csv":
      return <FileSpreadsheet className="h-4 w-4 text-green-600" />
    case "png":
    case "figma":
      return <ImageIcon className="h-4 w-4 text-purple-600" />
    default:
      return <FileText className="h-4 w-4 text-gray-600" />
  }
}

export function DocumentsTableRedux() {
  // Zustand store
  const {
    documents,
    loading,
    error,
    lastSync,
    initialized,
    syncInProgress,
    initializeFromIndexedDB,
    syncWithAPI,
    deleteDocument,
    clearError,
  } = useDocumentsStore()

  // Document view state
  const [selectedDocument, setSelectedDocument] = useState<DocumentData | null>(null)
  const [isDocumentViewOpen, setIsDocumentViewOpen] = useState(false)

  // Initialize data on component mount
  useEffect(() => {
    if (!initialized) {
      initializeFromIndexedDB()
    }
  }, [initialized, initializeFromIndexedDB])

  // Auto-sync with API if no recent sync or on first load
  useEffect(() => {
    if (initialized && documents.length === 0) {
      syncWithAPI()
    }
  }, [initialized, documents.length, syncWithAPI])

  const handleSync = () => {
    syncWithAPI()
  }

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this document?")) {
      deleteDocument(id)
    }
  }

  const handleRowClick = (document: DocumentData) => {
    setSelectedDocument(document)
    setIsDocumentViewOpen(true)
  }

  const handleCloseDocumentView = () => {
    setIsDocumentViewOpen(false)
    setSelectedDocument(null)
  }

  const handleEditDocument = (document: DocumentData) => {
    console.log("Edit document:", document)
    // Implement edit functionality
  }

  const handleShareDocument = (document: DocumentData) => {
    console.log("Share document:", document)
    // Implement share functionality
  }

  const columns: ColumnDef<DocumentData>[] = [
    {
      accessorKey: "name",
      header: "Document Name",
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          {getFileIcon(row.original.type)}
          <span className="font-medium text-foreground">{row.getValue("name")}</span>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
          {row.getValue("category")}
        </Badge>
      ),
    },
    {
      accessorKey: "lastModified",
      header: "Last Modified",
      cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("lastModified")}</div>,
    },
    {
      accessorKey: "owner",
      header: "Owner",
      cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("owner")}</div>,
    },
    {
      accessorKey: "size",
      header: "Size",
      cell: ({ row }) => <div className="text-muted-foreground text-right">{row.getValue("size")}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <Badge
            variant={status === "Published" ? "default" : "secondary"}
            className={
              status === "Published" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
            }
          >
            {status}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-card border-border">
            <DropdownMenuItem
              className="text-sm text-foreground hover:bg-secondary/50"
              onClick={() => handleRowClick(row.original)}
            >
              <Eye className="mr-3 h-4 w-4" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-sm text-foreground hover:bg-secondary/50"
              onClick={() => handleEditDocument(row.original)}
            >
              <Edit className="mr-3 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-sm text-destructive hover:bg-destructive/10"
              onClick={() => handleDelete(row.original.id)}
            >
              <Trash2 className="mr-3 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-destructive">Error loading documents</h3>
              <p className="text-sm text-destructive/80 mt-1">{error}</p>
            </div>
            <Button variant="outline" size="sm" onClick={clearError}>
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-foreground">Documents</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {documents.length} documents loaded
              {lastSync && <span className="ml-2">• Last synced: {new Date(lastSync).toLocaleString()}</span>}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={syncInProgress}
            className="bg-card border-border text-foreground"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${syncInProgress ? "animate-spin" : ""}`} />
            {syncInProgress ? "Syncing..." : "Sync"}
          </Button>
        </div>

        {loading && !initialized ? (
          <div className="flex items-center justify-center h-64 bg-card border border-border rounded-lg">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Loading documents...</p>
            </div>
          </div>
        ) : (
          <VirtualizedDataTable
            columns={columns}
            data={documents}
            searchPlaceholder="Search documents..."
            pageSize={15}
            enableSearch={true}
            enableSorting={true}
            enablePagination={true}
            onRowClick={handleRowClick}
          />
        )}
      </div>

      {/* Document View Modal */}
      <DocumentView
        document={selectedDocument}
        isOpen={isDocumentViewOpen}
        onClose={handleCloseDocumentView}
        onEdit={handleEditDocument}
        onDelete={handleDelete}
        onShare={handleShareDocument}
      />
    </>
  )
}
