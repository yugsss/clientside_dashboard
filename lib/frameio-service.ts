interface FrameioProjectData {
  name: string
  description: string
  clientEmail: string
}

interface FrameioProject {
  id: string
  name: string
  description: string
  private: boolean
  team_id: string
  root_asset_id: string
  created_at: string
  updated_at: string
}

export async function createFrameioProject(data: FrameioProjectData): Promise<FrameioProject> {
  const response = await fetch(`${process.env.FRAMEIO_API_URL}/projects`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.FRAMEIO_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: data.name,
      description: data.description,
      private: true,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    console.error("Frame.io API error:", errorData)
    throw new Error(`Failed to create Frame.io project: ${response.status}`)
  }

  const project = await response.json()

  try {
    await inviteToFrameioProject(project.id, data.clientEmail, "viewer")
  } catch (error) {
    console.error("Failed to invite client to Frame.io project:", error)
    // Don't fail the entire project creation if invitation fails
  }

  return project
}

export async function getFrameioProject(projectId: string): Promise<FrameioProject> {
  const response = await fetch(`${process.env.FRAMEIO_API_URL}/projects/${projectId}`, {
    headers: {
      Authorization: `Bearer ${process.env.FRAMEIO_API_KEY}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to get Frame.io project: ${response.status}`)
  }

  return await response.json()
}

export async function uploadToFrameio(projectId: string, fileUrl: string, fileName: string) {
  const response = await fetch(`${process.env.FRAMEIO_API_URL}/assets`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.FRAMEIO_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      parent_id: projectId,
      name: fileName,
      type: "file",
      source: {
        url: fileUrl,
      },
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    console.error("Frame.io upload error:", errorData)
    throw new Error(`Failed to upload to Frame.io: ${response.status}`)
  }

  return await response.json()
}

export async function inviteToFrameioProject(
  projectId: string,
  email: string,
  role: "viewer" | "collaborator" | "editor" = "viewer",
) {
  const response = await fetch(`${process.env.FRAMEIO_API_URL}/projects/${projectId}/collaborators`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.FRAMEIO_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      role,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    console.error("Frame.io invitation error:", errorData)
    throw new Error(`Failed to invite user to Frame.io project: ${response.status}`)
  }

  return await response.json()
}

export async function getFrameioComments(assetId: string) {
  const response = await fetch(`${process.env.FRAMEIO_API_URL}/assets/${assetId}/comments`, {
    headers: {
      Authorization: `Bearer ${process.env.FRAMEIO_API_KEY}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to get Frame.io comments: ${response.status}`)
  }

  return await response.json()
}

export async function createFrameioComment(assetId: string, text: string, timestamp?: number, annotation?: any) {
  const response = await fetch(`${process.env.FRAMEIO_API_URL}/assets/${assetId}/comments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.FRAMEIO_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      timestamp,
      annotation,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    console.error("Frame.io comment error:", errorData)
    throw new Error(`Failed to create Frame.io comment: ${response.status}`)
  }

  return await response.json()
}

export async function updateFrameioComment(commentId: string, updates: { text?: string; resolved?: boolean }) {
  const response = await fetch(`${process.env.FRAMEIO_API_URL}/comments/${commentId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${process.env.FRAMEIO_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  })

  if (!response.ok) {
    const errorData = await response.json()
    console.error("Frame.io comment update error:", errorData)
    throw new Error(`Failed to update Frame.io comment: ${response.status}`)
  }

  return await response.json()
}

export async function deleteFrameioComment(commentId: string) {
  const response = await fetch(`${process.env.FRAMEIO_API_URL}/comments/${commentId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${process.env.FRAMEIO_API_KEY}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to delete Frame.io comment: ${response.status}`)
  }

  return true
}
