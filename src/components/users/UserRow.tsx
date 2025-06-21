import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Mail, 
  MoreHorizontal, 
  Shield, 
  AlertTriangle,
  Crown,
  DollarSign,
  Code,
  Eye
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  roleId: string;
  status: string;
  lastSeen: string;
  avatar: string;
}

interface UserRowProps {
  user: User;
  isLoading: boolean;
  canManageUsers: boolean;
  onEditRole: (user: User) => void;
  onDeleteUser: (user: User) => void;
}

export const UserRow = ({ 
  user, 
  isLoading, 
  canManageUsers, 
  onEditRole, 
  onDeleteUser 
}: UserRowProps) => {
  const getRoleIcon = (role: string) => {
    const roleLower = role.toLowerCase();

    if (roleLower.includes("org")) {
      return <Crown className="w-3 h-3" />;
    } else if (roleLower.includes("billing")) {
      return <DollarSign className="w-3 h-3" />;
    } else if (roleLower.includes("admin")) {
      return <Crown className="w-3 h-3" />;
    } else if (roleLower.includes("developer") || roleLower.includes("dev") || roleLower.includes("engineer")) {
      return <Code className="w-3 h-3" />;
    } else if (roleLower.includes("manager") || roleLower.includes("lead")) {
      return <Shield className="w-3 h-3" />;
    } else {
      return <Eye className="w-3 h-3" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const roleLower = role.toLowerCase();

    if (roleLower.includes("org")) {
      return "bg-red-900 text-red-300 border-red-800";
    } else if (roleLower.includes("billing")) {
      return "bg-yellow-900 text-yellow-300 border-yellow-800";
    } else if (roleLower.includes("admin")) {
      return "bg-electric_indigo-900 text-electric_indigo-300 border-electric_indigo-800";
    } else if (roleLower.includes("developer") || roleLower.includes("dev") || roleLower.includes("engineer")) {
      return "bg-electric_indigo-900 text-electric_indigo-300 border-electric_indigo-800";
    } else if (roleLower.includes("manager") || roleLower.includes("lead")) {
      return "bg-green-900 text-green-300 border-green-800";
    } else {
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
    <tr className="border-b border-gray-700 hover:bg-gray-750 transition-colors">
      <td className="py-4 px-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={`${user.name} profile`}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white text-sm font-medium">
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </span>
            )}
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
        <Badge className={`${getRoleBadgeColor(user.role)} border`}>
          {getRoleIcon(user.role)}
          <span className="ml-1">{user.role}</span>
        </Badge>
      </td>
      <td className="py-4 px-4">
        <Badge className={`${getStatusBadgeColor(user.status)} border`}>
          {user.status}
        </Badge>
      </td>
      <td className="py-4 px-4">
        <span className="text-sm text-gray-400">
          {user.lastSeen}
        </span>
      </td>
      {canManageUsers && (
        <td className="py-4 px-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white hover:bg-gray-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <MoreHorizontal className="w-4 h-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 border-gray-700">
              <DropdownMenuItem
                className="text-white hover:bg-gray-700 cursor-pointer"
                onClick={() => onEditRole(user)}
              >
                <Shield className="w-4 h-4 mr-2" />
                Edit Role
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-400 hover:bg-gray-700 cursor-pointer"
                onClick={() => onDeleteUser(user)}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Remove User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </td>
      )}
    </tr>
  );
};
