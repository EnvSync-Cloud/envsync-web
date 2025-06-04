
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Activity } from "lucide-react";

export const AuditLogs = () => {
  const auditLogs = [
    {
      id: "1",
      action: "Environment Variable Updated",
      details: "DATABASE_URL updated in Production environment for Frontend App",
      user: "John Doe",
      timestamp: "2024-01-15 14:30:22",
      type: "update",
    },
    {
      id: "2",
      action: "User Invited",
      details: "Invited developer@example.com with Developer role",
      user: "Jane Smith",
      timestamp: "2024-01-15 13:45:10",
      type: "create",
    },
    {
      id: "3",
      action: "Application Created",
      details: "Created new application: Mobile App",
      user: "Admin",
      timestamp: "2024-01-15 12:15:33",
      type: "create",
    },
    {
      id: "4",
      action: "Environment Variable Deleted",
      details: "Removed LEGACY_API_KEY from Staging environment",
      user: "John Doe",
      timestamp: "2024-01-15 11:20:45",
      type: "delete",
    },
    {
      id: "5",
      action: "User Role Changed",
      details: "Changed Bob Wilson's role from Viewer to Developer",
      user: "Jane Smith",
      timestamp: "2024-01-15 10:30:12",
      type: "update",
    },
  ];

  const getActionBadgeColor = (type: string) => {
    switch (type) {
      case "create":
        return "bg-green-900 text-green-300";
      case "update":
        return "bg-blue-900 text-blue-300";
      case "delete":
        return "bg-red-900 text-red-300";
      default:
        return "bg-gray-700 text-gray-300";
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case "create":
        return "✓";
      case "update":
        return "⟳";
      case "delete":
        return "✕";
      default:
        return "•";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <p className="text-gray-400 mt-2">
          Track all activities and changes in your organization
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        <select className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500">
          <option>All Actions</option>
          <option>Creates</option>
          <option>Updates</option>
          <option>Deletes</option>
        </select>
        
        <select className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500">
          <option>All Users</option>
          <option>John Doe</option>
          <option>Jane Smith</option>
          <option>Admin</option>
        </select>
        
        <select className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500">
          <option>Last 24 hours</option>
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>Custom range</option>
        </select>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {auditLogs.map((log) => (
              <div 
                key={log.id}
                className="flex items-start space-x-4 p-4 bg-gray-900 rounded-lg border border-gray-700"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getActionBadgeColor(log.type)}`}>
                  {getActionIcon(log.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{log.action}</h3>
                    <Badge className={getActionBadgeColor(log.type)}>
                      {log.type}
                    </Badge>
                  </div>
                  <p className="text-gray-400 text-sm mt-1">{log.details}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{log.user}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{log.timestamp}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
