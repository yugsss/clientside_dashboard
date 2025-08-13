import { Video, FileVideo, Upload, Settings, LogOut, BarChart3, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

const navItems = [
  { icon: Video, label: "Projects", color: "text-blue-600" },
  { icon: FileVideo, label: "Video Library", color: "text-gray-600" },
  { icon: Upload, label: "Upload", color: "text-gray-600" },
  { icon: BarChart3, label: "Analytics", color: "text-gray-600" },
  { icon: Users, label: "Team", color: "text-gray-600" },
  { icon: Settings, label: "Settings", color: "text-gray-600" },
]

export function SidebarNav() {
  return (
    <div className="w-64 p-4 border-r h-screen">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <Video className="w-5 h-5 text-white" />
        </div>
        <span className="font-semibold">EDIT LOBBY</span>
      </div>
      <nav className="space-y-2">
        {navItems.map((item, index) => (
          <Button key={index} variant="ghost" className={`w-full justify-start ${item.color}`}>
            <item.icon className="mr-2 h-4 w-4" />
            {item.label}
          </Button>
        ))}
      </nav>
      <Button variant="ghost" className="w-full justify-start mt-auto text-gray-600 absolute bottom-4">
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </div>
  )
}
