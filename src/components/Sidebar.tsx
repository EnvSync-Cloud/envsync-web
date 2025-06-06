import { Home, Settings, Users, Database, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";

const navigation = [
  { id: "dashboard", name: "Dashboard", icon: Home },
  { id: "applications", name: "Projects", icon: Database },
  { id: "users", name: "Team", icon: Users },
  { id: "audit", name: "Activity", icon: Activity },
  { id: "settings", name: "Account", icon: Settings },
];

export const Sidebar = () => {
  const { pathname } = useLocation();
  const activeView = pathname.split("/")[1] || "dashboard";

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-electric_indigo-500 to-magenta-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">E</span>
          </div>
          <span className="text-xl font-bold text-white">EnvSync</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              to={`/${item.id}`}
              className={cn(
                "w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-colors text-sm font-medium",
                activeView === item.id
                  ? "bg-electric_indigo-500 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              <Icon className="size-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center space-x-3 mt-4">
          <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-medium">JD</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">John Doe</p>
            <p className="text-xs text-gray-400">john@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};
