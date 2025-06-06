import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Mail, MoreHorizontal, Shield, Crown, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Users = () => {
  const users = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: "Admin",
      status: "active",
      lastSeen: "2 minutes ago",
      avatar: "JD",
      access: "Full access",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "Developer",
      status: "active",
      lastSeen: "1 hour ago",
      avatar: "JS",
      access: "Read & Write",
    },
    {
      id: "3",
      name: "Bob Wilson",
      email: "bob@example.com",
      role: "Viewer",
      status: "pending",
      lastSeen: "Never",
      avatar: "BW",
      access: "Read only",
    },
    {
      id: "4",
      name: "Alice Cooper",
      email: "alice@example.com",
      role: "Developer",
      status: "active",
      lastSeen: "2 days ago",
      avatar: "AC",
      access: "Read & Write",
    },
  ];

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Admin":
        return <Crown className="w-3 h-3" />;
      case "Developer":
        return <Shield className="w-3 h-3" />;
      case "Viewer":
        return <Eye className="w-3 h-3" />;
      default:
        return <Eye className="w-3 h-3" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-red-900 text-red-300 border-red-800";
      case "Developer":
        return "bg-electric_indigo-900 text-electric_indigo-300 border-electric_indigo-800";
      case "Viewer":
        return "bg-gray-700 text-gray-300 border-gray-600";
      default:
        return "bg-gray-700 text-gray-300 border-gray-600";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-900 text-green-300 border-green-800";
      case "pending":
        return "bg-yellow-900 text-yellow-300 border-yellow-800";
      case "inactive":
        return "bg-gray-700 text-gray-300 border-gray-600";
      default:
        return "bg-gray-700 text-gray-300 border-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Team</h1>
          <p className="text-gray-400 mt-2">
            Manage your team members and their access permissions
          </p>
        </div>
        <Button className="bg-electric_indigo-500 hover:bg-electric_indigo-600 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Member
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Role
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Access
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Last Seen
                  </th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-700 hover:bg-gray-750"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-electric_indigo-500 to-magenta-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {user.avatar}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-white">
                            {user.name}
                          </h3>
                          <div className="flex items-center space-x-1 text-sm text-gray-400">
                            <Mail className="w-3 h-3" />
                            <span>{user.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge
                        className={`${getRoleBadgeColor(user.role)} border`}
                      >
                        {getRoleIcon(user.role)}
                        <span className="ml-1">{user.role}</span>
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-300">
                        {user.access}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <Badge
                        className={`${getStatusBadgeColor(user.status)} border`}
                      >
                        {user.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-400">
                        {user.lastSeen}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-white hover:bg-gray-700"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-gray-800 border-gray-700">
                          <DropdownMenuItem className="text-white hover:bg-gray-700">
                            Edit Role
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-white hover:bg-gray-700">
                            Manage Access
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-white hover:bg-gray-700">
                            Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-white hover:bg-gray-700">
                            Resend Invite
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-400 hover:bg-gray-700">
                            Remove User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Users;
