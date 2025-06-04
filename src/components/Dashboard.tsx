
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Users, FileText, Activity } from "lucide-react";

export const Dashboard = () => {
  const stats = [
    {
      title: "Applications",
      value: "12",
      icon: Database,
      change: "+2 this month",
      color: "text-blue-500",
    },
    {
      title: "Environment Types",
      value: "4",
      icon: FileText,
      change: "Production, Staging, Dev, Test",
      color: "text-green-500",
    },
    {
      title: "Total Variables",
      value: "234",
      icon: Activity,
      change: "+18 this week",
      color: "text-electric_indigo-500",
    },
    {
      title: "Team Members",
      value: "8",
      icon: Users,
      change: "2 pending invites",
      color: "text-magenta-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-400 mt-2">
          Welcome back! Here's what's happening with your environments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  {stat.title}
                </CardTitle>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-gray-400 mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  action: "Environment variable updated",
                  details: "DATABASE_URL in Production",
                  time: "2 minutes ago",
                  user: "John Doe",
                },
                {
                  action: "New application created",
                  details: "Frontend App",
                  time: "1 hour ago",
                  user: "Jane Smith",
                },
                {
                  action: "User invited",
                  details: "developer@example.com",
                  time: "3 hours ago",
                  user: "Admin",
                },
              ].map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-electric_indigo-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-gray-400">{activity.details}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.time} by {activity.user}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-4 bg-electric_indigo-500 hover:bg-electric_indigo-600 rounded-lg transition-colors text-white">
                <Database className="w-6 h-6 mb-2" />
                <p className="text-sm font-medium">New App</p>
              </button>
              <button className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white">
                <FileText className="w-6 h-6 mb-2" />
                <p className="text-sm font-medium">Environment</p>
              </button>
              <button className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white">
                <Users className="w-6 h-6 mb-2" />
                <p className="text-sm font-medium">Invite User</p>
              </button>
              <button className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white">
                <Activity className="w-6 h-6 mb-2" />
                <p className="text-sm font-medium">View Logs</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
