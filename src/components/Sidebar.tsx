import { Database, Users, Key, Activity, Settings, Globe, LogOut, Menu, ChevronLeft } from "lucide-react";
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

interface SidebarProps {
  expanded: boolean;
  onToggle: () => void;
}

export const Sidebar = ({ expanded, onToggle }: SidebarProps) => {
  const { user, isLoading, token } = useAuth();
  const { pathname } = useLocation();
  
  // Move the early return after all hooks are called
  if (isLoading || !user) return null;

  const activeView = pathname.split("/")[1] || "applications";

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    const logoutUrl = `https://envsync.eu.auth0.com/oidc/logout?post_logout_redirect_uri=${encodeURIComponent(window.location.origin)}&id_token_hint=${token}`;
    window.location.href = logoutUrl;
  }

  return (
    <div className={`h-full bg-slate-800 border-r border-slate-700 flex flex-col transition-all duration-300 ease-in-out ${
      expanded ? 'w-64' : 'w-16'
    }`}>
      {/* Logo Section with Toggle */}
      <div className="p-4 flex-shrink-0 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="mx-auto w-15 h-15 rounded-xl flex items-center justify-center">
              <img src="/EnvSync.svg" alt="EnvSync Logo" className="w-20 h-20" />
            </div>
          </div>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            title={expanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {expanded ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <div key={item.id} className="relative group">
              <Link
                to={`/${item.id}`}
                className={cn(
                  "w-full flex items-center rounded-xl text-left transition-all duration-200 text-sm font-medium relative",
                  expanded ? "px-3 py-2.5 space-x-3" : "px-2 py-2.5 justify-center",
                  isActive
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                )}
                title={!expanded ? item.name : undefined}
              >
                <Icon className="size-5 flex-shrink-0" />
                {expanded && (
                  <span className="transition-opacity duration-300">
                    {item.name}
                  </span>
                )}
              </Link>
              
              {/* Tooltip for collapsed state */}
              {!expanded && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-700 text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 top-1/2 transform -translate-y-1/2">
                  {item.name}
                  <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-slate-700"></div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-slate-700 flex-shrink-0">
        <div className={`flex items-center transition-all duration-300 ${
          expanded ? 'space-x-3' : 'justify-center'
        }`}>
          <div className="w-8 h-8 bg-slate-700 rounded-xl flex items-center justify-center flex-shrink-0">
            {user.user.profile_picture_url ? (
              <img
                src={user.user.profile_picture_url}
                alt="User Avatar"
                className="w-full h-full rounded-xl object-cover"
              />
            ) : (
              <span className="text-white font-semibold text-sm">
                {user.user.full_name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            )}
          </div>
          
          {expanded && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.user.full_name ?? ""}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {user.user.email ?? ""}
              </p>
            </div>
          )}
          
          <div className="relative group">
            <button
              onClick={handleLogout}
              className={`p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors ${
                !expanded ? 'mt-2' : ''
              }`}
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
            
            {/* Logout tooltip for collapsed state */}
            {!expanded && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-slate-700 text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 top-1/2 transform -translate-y-1/2">
                Logout
                <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-slate-700"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
