
import { Database, Users, Key, Activity, Settings, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const navigation = [
  { id: "applications", name: "Projects", icon: Database },
  { id: "users", name: "Team", icon: Users },
  { id: "apikeys", name: "API Keys", icon: Key },
  { id: "audit", name: "Activity", icon: Activity },
  { id: "settings", name: "Account", icon: Settings },
  { id: "organisation", name: "Organisation", icon: Globe },
];

export const Sidebar = () => {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) return null;

  const { pathname } = useLocation();
  const activeView = pathname.split("/")[1] || "applications";

  return (
    <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-blue-400 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">E</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">EnvSync</span>
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
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                  : "text-slate-300 hover:bg-slate-700 hover:text-white"
              )}
            >
              <Icon className="size-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center space-x-3 mt-4">
          <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
            {user.user.profile_picture_url ? (
              <img
                src={user.user.profile_picture_url}
                alt="User Avatar"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-white font-semibold text-sm">
                {user.user.full_name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">{user.user.full_name ?? ""}</p>
            <p className="text-xs text-slate-400">{user.user.email ?? ""}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
