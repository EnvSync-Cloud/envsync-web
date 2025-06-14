import { useAuth } from "@/hooks/useAuth";

export const Header = () => {
  const { user } = useAuth();
  
  return (
    <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Organization Info */}
        <div className="flex items-center space-x-3">
          {user?.org?.logo_url ? (
            <img 
              src={user.org.logo_url} 
              alt={`${user.org.name} logo`}
              className="w-8 h-8 rounded-lg object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-electric_indigo-500 to-magenta-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user?.org?.name?.charAt(0)?.toUpperCase() || 'O'}
              </span>
            </div>
          )}
          <div className="flex flex-col">
            <h1 className="text-white font-semibold text-lg">
              {user?.org?.name || 'Organization'}
            </h1>
            <span className="text-gray-400 text-xs">
              @{user?.org?.slug}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
