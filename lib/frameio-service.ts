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
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.FRAMEIO_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: data.name,
      description: data.description,
      private: true
    })
  })
  
  if (!response.ok) {
    throw new Error('Failed to create Frame.io project')
  }
  
  return await response.json()
}

export async function getFrameioProject(projectId: string): Promise<FrameioProject> {
  const response = await fetch(`${process.env.FRAMEIO_API_URL}/projects/${projectId}`, {
    headers: {
      'Authorization': `Bearer ${process.env.FRAMEIO_API_KEY}`
    }
  })
  
  if (!response.ok) {
    throw new Error('Failed to get Frame.io project')
  }
  
  return await response.json()
}

export async function uploadToFrameio(projectId: string, fileUrl: string, fileName: string) {
  const response = await fetch(`${process.env.FRAMEIO_API_URL}/assets`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.FRAMEIO_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      parent_id: projectId,
      name: fileName,
      type: 'file',
      source: {
        url: fileUrl
      }
    })
  })
  
  if (!response.ok) {
    throw new Error('Failed to upload to Frame.io')
  }
  
  return await response.json()
}
