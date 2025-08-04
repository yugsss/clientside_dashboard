import type { User, Project } from "../types"
import type { FrameioComment, FrameioAsset } from "./frameio"

// Demo Users with Frame.io v4 integration
export const demoUsers: User[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah@creativestudio.com",
    avatar: "/placeholder.svg?height=40&width=40&text=SJ",
    role: "client",
    company: "Creative Studio",
    plan: {
      id: "basic",
      name: "Basic Plan",
      price: 45,
      type: "per_video",
      features: ["One professional video edit", "48-hour turnaround", "2 rounds of revisions"],
      projectLimit: 1,
      projectsUsed: 0,
      activeProjects: 1,
      canRequestNewProject: false,
      maxRevisions: 2,
    },
    projects: [
      {
        id: "proj-1",
        title: "🎬 Product Launch Campaign - Frame.io v4",
        name: "🎬 Product Launch Campaign - Frame.io v4",
        description:
          "High-impact marketing video for our new product launch with advanced Frame.io v4 collaboration features including reactions, priority comments, and real-time analytics",
        status: "in_review",
        priority: "high",
        progress: 85,
        clientId: "1",
        frameioProjectId: "frameio-proj-v4-abc123",
        frameioAssetId: "frameio-asset-v4-xyz789",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        thumbnailUrl: "/placeholder.svg?height=180&width=320&text=🎬+Frame.io+v4+Project",
        duration: 120,
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-25T15:30:00Z",
        dueDate: "2024-02-01T17:00:00Z",
        deadline: "2024-02-01T17:00:00Z",
        revisions: 1,
        maxRevisions: 2,
        canApprove: true,
        canRequestRevision: true,
        assignedEditor: "James Wilson",
        tags: ["product-launch", "marketing", "high-priority", "frame-io-v4", "active"],
      },
      {
        id: "proj-2",
        title: "Brand Story Video",
        name: "Brand Story Video",
        description: "Emotional brand storytelling video for website",
        status: "completed",
        priority: "medium",
        progress: 100,
        clientId: "1",
        frameioProjectId: "frameio-proj-def456",
        frameioAssetId: "frameio-asset-uvw456",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        thumbnailUrl: "/placeholder.svg?height=180&width=320&text=Brand+Story",
        duration: 95,
        createdAt: "2024-01-10T09:00:00Z",
        updatedAt: "2024-01-18T14:20:00Z",
        completedAt: "2024-01-18T14:20:00Z",
        deadline: "2024-01-20T17:00:00Z",
        revisions: 0,
        maxRevisions: 2,
        canApprove: false,
        canRequestRevision: false,
        assignedEditor: "James Wilson",
        tags: ["brand", "storytelling", "completed"],
      },
    ],
    totalSpent: 90,
    memberSince: "Jan 2024",
    memberDays: 580,
  },
  {
    id: "2",
    name: "Mike Chen",
    email: "mike@example.com",
    avatar: "/placeholder.svg?height=40&width=40&text=MC",
    role: "client",
    company: "Tech Startup",
    plan: {
      id: "monthly_pass",
      name: "Monthly Pass Plan",
      price: 350,
      type: "monthly",
      features: ["10 videos per month", "48-hour turnaround per video", "2 rounds of revisions per video"],
      projectLimit: 10,
      projectsUsed: 7,
      activeProjects: 1,
      canRequestNewProject: false,
      monthlyReset: "2024-02-01T00:00:00Z",
      maxRevisions: 2,
    },
    projects: [
      {
        id: "proj-3",
        title: "Social Media Campaign",
        name: "Social Media Campaign",
        description: "Series of short videos for social media marketing",
        status: "in_progress",
        priority: "high",
        progress: 65,
        clientId: "2",
        frameioProjectId: "frameio-proj-ghi789",
        frameioAssetId: "frameio-asset-rst123",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        thumbnailUrl: "/placeholder.svg?height=180&width=320&text=Social+Campaign",
        duration: 30,
        createdAt: "2024-01-20T11:00:00Z",
        updatedAt: "2024-01-25T16:45:00Z",
        dueDate: "2024-02-05T17:00:00Z",
        deadline: "2024-02-05T17:00:00Z",
        revisions: 0,
        maxRevisions: 2,
        canApprove: false,
        canRequestRevision: false,
        assignedEditor: "Mike Editor",
        tags: ["social-media", "campaign"],
      },
    ],
    totalSpent: 350,
    memberSince: "Nov 2023",
    memberDays: 641,
  },
]

// Frame.io v4 Assets with enhanced features
export const demoFrameioAssets: FrameioAsset[] = [
  {
    id: "frameio-asset-v4-xyz789",
    name: "Product_Launch_Campaign_v3.mp4",
    type: "file",
    parent_id: "frameio-proj-v4-abc123",
    project_id: "frameio-proj-v4-abc123",
    creator_id: "editor-james",
    created_at: "2024-01-20T10:00:00Z",
    updated_at: "2024-01-25T15:30:00Z",

    // File properties
    filesize: 524288000, // 500MB
    filetype: "video/mp4",
    original_name: "Product_Launch_Campaign_Final.mp4",

    // Media properties
    width: 1920,
    height: 1080,
    duration: 120,
    fps: 24,
    codec: "h264",
    bitrate: 8000,

    // URLs
    original_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    download_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    streaming_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnail_url: "/placeholder.svg?height=180&width=320&text=🎬+Frame.io+v4+Thumb",
    proxy_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",

    // Processing
    processing_status: "completed",
    processing_progress: 100,
    transcoding_status: "completed",

    // Metadata
    metadata: {
      camera: "Sony FX6",
      lens: "24-70mm f/2.8",
      location: "Studio A",
      shoot_date: "2024-01-18",
      color_profile: "Rec.709",
      audio_channels: 2,
      audio_sample_rate: 48000,
    },

    // Checksums
    checksums: {
      md5: "d41d8cd98f00b204e9800998ecf8427e",
      sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    },

    // Analytics
    analytics: {
      view_count: 47,
      comment_count: 12,
      download_count: 3,
      last_viewed_at: "2024-01-25T14:20:00Z",
    },

    // Approval workflow
    approval_status: "pending",
  },
]

// Frame.io v4 Comments with enhanced features
export const demoFrameioComments: FrameioComment[] = [
  {
    id: "frameio-comment-v4-001",
    text: "The opening sequence looks fantastic! 🎬 However, can we make the logo appear 2 seconds earlier? I think it would have more impact that way. Also, the color grading in this section could be slightly warmer to match our brand guidelines.",
    asset_id: "frameio-asset-v4-xyz789",
    author: {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah@creativestudio.com",
      avatar_url: "/placeholder.svg?height=32&width=32&text=SJ",
    },
    created_at: "2024-01-24T14:30:00Z",
    updated_at: "2024-01-24T14:30:00Z",

    timestamp: 5,
    resolved: false,
    priority: "high",
    category: "Brand Guidelines",
    tags: ["logo", "color-grading", "brand"],
    mentions: ["editor-james"],

    reactions: {
      "👍": [{ id: "editor-james", name: "James Wilson", avatar_url: "/placeholder.svg?height=32&width=32&text=JW" }],
      "🎯": [{ id: "manager-lisa", name: "Lisa Chen", avatar_url: "/placeholder.svg?height=32&width=32&text=LC" }],
    },

    replies_count: 2,

    annotation: {
      type: "rectangle",
      coordinates: { x: 100, y: 50, width: 200, height: 100 },
      color: "#ff6b6b",
    },

    task: {
      assignee_id: "editor-james",
      due_date: "2024-01-26T17:00:00Z",
      status: "in_progress",
    },
  },
  {
    id: "frameio-comment-v4-002",
    text: "Thanks for the detailed feedback! I'll adjust the logo timing and warm up the color grading. The brand guidelines document you shared is really helpful. Should have the update ready by tomorrow morning. 💪",
    asset_id: "frameio-asset-v4-xyz789",
    author: {
      id: "editor-james",
      name: "James Wilson",
      email: "james@editstudio.com",
      avatar_url: "/placeholder.svg?height=32&width=32&text=JW",
    },
    created_at: "2024-01-24T15:15:00Z",
    updated_at: "2024-01-24T15:15:00Z",

    timestamp: 5,
    resolved: false,
    priority: "medium",
    category: "Response",
    tags: ["acknowledgment", "timeline"],
    mentions: ["sarah@creativestudio.com"],

    reactions: {
      "❤️": [{ id: "1", name: "Sarah Johnson", avatar_url: "/placeholder.svg?height=32&width=32&text=SJ" }],
      "🔥": [{ id: "manager-lisa", name: "Lisa Chen", avatar_url: "/placeholder.svg?height=32&width=32&text=LC" }],
    },

    replies_count: 0,
    parent_comment_id: "frameio-comment-v4-001",
  },
  {
    id: "frameio-comment-v4-003",
    text: "Perfect! This transition at 0:15 is exactly what we were looking for. The music sync is spot on and the pacing feels natural. This is approved! ✨🎉",
    asset_id: "frameio-asset-v4-xyz789",
    author: {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah@creativestudio.com",
      avatar_url: "/placeholder.svg?height=32&width=32&text=SJ",
    },
    created_at: "2024-01-24T16:00:00Z",
    updated_at: "2024-01-24T16:00:00Z",

    timestamp: 15,
    resolved: true,
    resolved_by: "1",
    resolved_at: "2024-01-24T16:00:00Z",
    priority: "low",
    category: "Approval",
    tags: ["approved", "music", "transition"],

    reactions: {
      "🎉": [
        { id: "editor-james", name: "James Wilson", avatar_url: "/placeholder.svg?height=32&width=32&text=JW" },
        { id: "manager-lisa", name: "Lisa Chen", avatar_url: "/placeholder.svg?height=32&width=32&text=LC" },
      ],
      "👏": [{ id: "editor-james", name: "James Wilson", avatar_url: "/placeholder.svg?height=32&width=32&text=JW" }],
      "✅": [{ id: "1", name: "Sarah Johnson", avatar_url: "/placeholder.svg?height=32&width=32&text=SJ" }],
    },

    replies_count: 1,

    annotation: {
      type: "point",
      coordinates: { x: 300, y: 200 },
      color: "#51cf66",
    },
  },
  {
    id: "frameio-comment-v4-004",
    text: "The product shots here are great, but could we add a subtle zoom effect to make them more dynamic? Something similar to what we discussed in our kickoff call. Also, can we try a different background music track for this section? 🎵",
    asset_id: "frameio-asset-v4-xyz789",
    author: {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah@creativestudio.com",
      avatar_url: "/placeholder.svg?height=32&width=32&text=SJ",
    },
    created_at: "2024-01-24T16:30:00Z",
    updated_at: "2024-01-24T16:30:00Z",

    timestamp: 45,
    resolved: false,
    priority: "urgent",
    category: "Product Shots",
    tags: ["zoom-effect", "music", "product-shots", "revision"],
    mentions: ["editor-james"],

    reactions: {
      "🤔": [{ id: "editor-james", name: "James Wilson", avatar_url: "/placeholder.svg?height=32&width=32&text=JW" }],
    },

    replies_count: 0,

    annotation: {
      type: "rectangle",
      coordinates: { x: 400, y: 300, width: 300, height: 200 },
      color: "#ff8787",
    },

    task: {
      assignee_id: "editor-james",
      due_date: "2024-01-25T12:00:00Z",
      status: "open",
    },
  },
  {
    id: "frameio-comment-v4-005",
    text: "Great work on this section! The pacing feels just right and the visual effects are clean. Sarah, once James implements your feedback on the earlier sections, I think we'll be ready for final approval. The client is going to love this! 🚀",
    asset_id: "frameio-asset-v4-xyz789",
    author: {
      id: "manager-lisa",
      name: "Lisa Chen",
      email: "lisa@editstudio.com",
      avatar_url: "/placeholder.svg?height=32&width=32&text=LC",
    },
    created_at: "2024-01-24T17:00:00Z",
    updated_at: "2024-01-24T17:00:00Z",

    timestamp: 60,
    resolved: true,
    resolved_by: "manager-lisa",
    resolved_at: "2024-01-24T17:00:00Z",
    priority: "low",
    category: "Project Management",
    tags: ["approval", "pacing", "vfx", "client-ready"],
    mentions: ["sarah@creativestudio.com", "editor-james"],

    reactions: {
      "🚀": [
        { id: "1", name: "Sarah Johnson", avatar_url: "/placeholder.svg?height=32&width=32&text=SJ" },
        { id: "editor-james", name: "James Wilson", avatar_url: "/placeholder.svg?height=32&width=32&text=JW" },
      ],
      "💯": [{ id: "editor-james", name: "James Wilson", avatar_url: "/placeholder.svg?height=32&width=32&text=JW" }],
    },

    replies_count: 0,
  },
]

// Demo Projects for all users
export const demoProjects: Project[] = demoUsers.flatMap((user) => user.projects || [])

// Export demoComments as an alias for demoFrameioComments for backward compatibility
export const demoComments = demoFrameioComments.map((comment) => ({
  id: comment.id,
  projectId: "proj-1",
  videoId: comment.asset_id,
  userId: comment.author.id,
  userName: comment.author.name,
  userRole: comment.author.id === "1" ? ("client" as const) : ("editor" as const),
  userAvatar: comment.author.avatar_url || "/placeholder.svg",
  content: comment.text,
  startTime: comment.timestamp,
  endTime: comment.timestamp ? comment.timestamp + 5 : undefined,
  timestamp: comment.timestamp || 0,
  createdAt: comment.created_at,
  updatedAt: comment.updated_at,
  resolved: comment.resolved,
  resolvedAt: comment.resolved_at,
  replies: [],
  type:
    comment.priority === "urgent" || comment.priority === "high"
      ? ("revision_request" as const)
      : comment.resolved
        ? ("approval" as const)
        : ("general" as const),
  priority: comment.priority || "medium",
}))
