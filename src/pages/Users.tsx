import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Mail, MoreHorizontal, Shield, Crown, Eye, DollarSign, Code } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastSeen: string;
  avatar: string;
}

interface Role {
  id: string;
  name: string;
}

export const Users = () => {
  const { api } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  const [emailAddress, setEmailAddress] = useState("");

  const [showInviteUserModalOpen, setShowInviteUserModalOpen] = useState(false);
  const [showEditRoleModalOpen, setShowEditRoleModalOpen] = useState(false);
  const [showDeleteUserModalOpen, setShowDeleteUserModalOpen] = useState(false);

  const queryClient = useQueryClient();

  const { isLoading } = useQuery({
    queryKey: ["usersData"],
    queryFn: async () => {
      const usersData = await api.users.getUsers();
      const rolesData = await api.roles.getAllRoles();

      const data = usersData.map((user) => ({
        id: user.id,
        name: user.full_name,
        email: user.email,
        role: rolesData.find((role) => role.id === user.role_id)?.name || "Viewer",
        status: user.is_active ? "active" : "inactive",
        lastSeen: new Date(user.updated_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        avatar: user.profile_picture_url,
      }));

      setUsers(data);
      setRoles(rolesData.map((role) => ({
        id: role.id,
        name: role.name,
      })));

      queryClient.setQueryData(["usersData"], data);

      return data;
    },
  });

  // Mutation to invite a user
  const { mutate: inviteUser } = useMutation({
    mutationFn: async (
      {
        email,
        role,
      } : {
      email: string;
      role: string;
      }
    ) => {
      return await api.onboarding.createUserInvite({
        email,
        role_id: role,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["usersData"],
      });
      setEmailAddress("");
      setShowInviteUserModalOpen(false);
    },
    onError: (error) => {
      console.error("Error inviting user:", error);
      alert("Failed to invite user. Please try again.");
    },
  });

  // Mutation to delete a user
  const { mutate: deleteUser } = useMutation({
    mutationFn: async (userId: string) => {
      return await api.users.deleteUser(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["usersData"],
      });
      setShowDeleteUserModalOpen(false);
    },
    onError: (error) => {
      console.error("Error deleting user:", error);
      alert("Failed to delete user. Please try again.");
    },
  });

  // Mutation to edit a user's role
  const { mutate: editUserRole } = useMutation({
    mutationFn: async (
      {
        userId,
        roleId
      } : {
        userId: string;
        roleId: string;
      }
    ) => {
      return await api.users.updateRole(userId, {
        role_id: roleId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["usersData"],
      });
      setShowEditRoleModalOpen(false);
    },
    onError: (error) => {
      console.error("Error editing user role:", error);
      alert("Failed to edit user role. Please try again.");
    },
  });

  const getRoleIcon = (role: string) => {
    role = role.toLowerCase();

    if (role.includes("org")) {
      return <Crown className="w-3 h-3" />;
    }
    else if (role.includes("billing")) {
      return <DollarSign className="w-3 h-3" />;
    }
    else if (role.includes("admin")) {
      return <Crown className="w-3 h-3" />;
    }
    else if (role.includes("developer") || role.includes("dev") || role.includes("engineer")) {
      return <Code className="w-3 h-3" />;
    }
    else if (role.includes("manager") || role.includes("lead")) {
      return <Shield className="w-3 h-3" />;
    }
    else if (role.includes("viewer") || role.includes("read")) {
      return <Eye className="w-3 h-3" />;
    }
    else {
      return <Eye className="w-3 h-3" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    role = role.toLowerCase();

    if (role.includes("org")) {
      return "bg-red-900 text-red-300 border-red-800";
    }
    else if (role.includes("billing")) {
      return "bg-yellow-900 text-yellow-300 border-yellow-800";
    }
    else if (role.includes("admin")) {
      return "bg-electric_indigo-900 text-electric_indigo-300 border-electric_indigo-800";
    }
    else if (role.includes("developer") || role.includes("dev") || role.includes("engineer")) {
      return "bg-electric_indigo-900 text-electric_indigo-300 border-electric_indigo-800";
    }
    else if (role.includes("manager") || role.includes("lead")) {
      return "bg-green-900 text-green-300 border-green-800";
    }
    else if (role.includes("viewer") || role.includes("read")) {
      return "bg-gray-700 text-gray-300 border-gray-600";
    }
    else {
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

  const handleInviteUser = async () => {
    if (!emailAddress) {
      alert("Please enter an email address.");
      return;
    }

    // Here you would typically call an API to invite the user
    // For now, we'll just log the email address
    console.log(`Inviting user with email: ${emailAddress}`);

    // Simulate API call
    await inviteUser({
      email: emailAddress,
      role: selectedRoleId
    });

    // Reset the email address and close the modal
    setEmailAddress("");
    setShowInviteUserModalOpen(false);
  }

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Are you sure you want to remove this user?")) {
      await deleteUser(userId);
    }
  };

  const handleEditUserRole = async (userId: string, roleId: string) => {
    await editUserRole({
      userId,
      roleId,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <div className="flex flex-col items-center space-y-4">
          <div className="size-12 border-4 border-t-electric_indigo-500 border-gray-700 rounded-full animate-spin"></div>
          <p className="text-gray-400">Loading team members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Team</h1>
          <p className="text-gray-400 mt-2">
            Manage your team members and their access permissions
          </p>
        </div>
        <Button
          className="bg-electric_indigo-500 hover:bg-electric_indigo-600 text-white"
          onClick={() => setShowInviteUserModalOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </div>

      <Dialog open={showInviteUserModalOpen} onOpenChange={setShowInviteUserModalOpen}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Invite User</DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter the email address of the user you want to invite to your team.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white">Email Address</Label>
              <Textarea
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                className="bg-gray-900 border-gray-700 text-white"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Role</Label>
              <select
                className="bg-gray-900 border-gray-700 text-white w-full p-2 rounded"
                defaultValue="Viewer"
                onChange={(e) => setSelectedRoleId(
                  roles.find(role => role.id === e.target.value)?.id
                )}
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowInviteUserModalOpen(false)}
              className="text-white border-gray-600 hover:bg-gray-700"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                handleInviteUser();
                setShowInviteUserModalOpen(false);
              }}
              className="bg-electric_indigo-500 hover:bg-electric_indigo-600 text-white"
            >
              Invite User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditRoleModalOpen} onOpenChange={setShowEditRoleModalOpen}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Edit User Role</DialogTitle>
            <DialogDescription className="text-gray-400">
              Change the role of the user.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white">Role</Label>
              <select
                className="bg-gray-900 border-gray-700 text-white w-full p-2 rounded"
                defaultValue="Viewer"
                onChange={(e) => setSelectedRoleId(
                  roles.find(role => role.id === e.target.value)?.id
                )}
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditRoleModalOpen(false)}
              className="text-white border-gray-600 hover:bg-gray-700"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                handleEditUserRole(selectedUserId, selectedRoleId);
                setShowEditRoleModalOpen(false);
              }}
              className="bg-electric_indigo-500 hover:bg-electric_indigo-600 text-white"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteUserModalOpen} onOpenChange={setShowDeleteUserModalOpen}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Delete User</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete this user?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteUserModalOpen(false)}
              className="text-white border-gray-600 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                handleDeleteUser(selectedUserId);
                setShowDeleteUserModalOpen(false);
              }}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                        <img 
                          src={user.avatar} 
                          alt={`${user.name} profile`}
                          className="w-8 h-8 rounded-lg object-cover"
                        />
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
                          <DropdownMenuItem
                            className="text-white hover:bg-gray-700"
                            onClick={() => {
                              setSelectedUserId(user.id);
                              setShowEditRoleModalOpen(true);
                            }}
                          >
                            Edit Role
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-400 hover:bg-gray-700"
                            onClick={() => {
                              setSelectedUserId(user.id);
                              setShowDeleteUserModalOpen(true);
                            }}
                          >
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
