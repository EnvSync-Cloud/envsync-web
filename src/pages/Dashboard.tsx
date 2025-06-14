import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Database,
  Users,
  FileText,
  Activity,
  Plus,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const Dashboard = () => {
  const { user } = useAuth();

  const stats = [
    {
      title: "Projects",
      value: "12",
      icon: Database,
      change: "+2 this month",
      color: "text-electric_indigo-500",
    },
    {
      title: "Configs",
      value: "48",
      icon: FileText,
      change: "Across all environments",
      color: "text-violet-500",
    },
    {
      title: "Secrets",
      value: "234",
      icon: Activity,
      change: "+18 this week",
      color: "text-veronica-500",
    },
    {
      title: "Team Members",
      value: "8",
      icon: Users,
      change: "2 pending invites",
      color: "text-magenta-500",
    },
  ];

  const recentProjects = [
    { name: "Frontend App", configs: 3, secrets: 24, updated: "2 hours ago" },
    { name: "Backend API", configs: 4, secrets: 18, updated: "1 day ago" },
    { name: "Mobile App", configs: 2, secrets: 12, updated: "3 days ago" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Welcome back, {user?.user.full_name ?? "User"}!
          </h1>
          <p className="text-gray-400 mt-2">
            Here's what's happening with your projects and environments.
          </p>
        </div>
        <Button className="bg-electric_indigo-500 hover:bg-electric_indigo-600 text-white">
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-400">
                  {stat.title}
                </CardTitle>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {stat.value}
                </div>
                <p className="text-xs text-gray-400 mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Recent Projects</CardTitle>
            <Button variant="ghost" className="text-gray-400 hover:text-white">
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProjects.map((project, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-900 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-electric_indigo-500 to-violet-500 rounded-lg flex items-center justify-center">
                      <Database className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{project.name}</h3>
                      <p className="text-sm text-gray-400">
                        {project.configs} configs • {project.secrets} secrets
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">
                      Updated {project.updated}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  action: "Secret updated",
                  details: "DATABASE_URL in Production",
                  time: "2 minutes ago",
                  user: "John Doe",
                },
                {
                  action: "Config created",
                  details: "Staging environment for Frontend App",
                  time: "1 hour ago",
                  user: "Jane Smith",
                },
                {
                  action: "Team member invited",
                  details: "developer@example.com",
                  time: "3 hours ago",
                  user: "Admin",
                },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-750 transition-colors"
                >
                  <div className="w-2 h-2 bg-electric_indigo-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">
                      {activity.action}
                    </p>
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
      </div>
    </div>
  );
};

export default Dashboard;
