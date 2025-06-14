import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Mail, MoreHorizontal, Shield, Crown, Eye, DollarSign, Code, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useState, useCallback } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface Role {
  id: string;
  name: string;
}

interface FormErrors {
  email?: string;
  role?: string;
}

export const Users = () => {
  const { api } = useAuth();
  const queryClient = useQueryClient();

  // State management
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>("");
  const [emailAddress, setEmailAddress] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Dialog states
  const [showInviteUserModalOpen, setShowInviteUserModalOpen] = useState(false);
  const [showEditRoleModalOpen, setShowEditRoleModalOpen] = useState(false);
  const [showDeleteUserModalOpen, setShowDeleteUserModalOpen] = useState(false);

  // Loading states for individual actions
  const [actionLoadingStates, setActionLoadingStates] = useState<Record<string, boolean>>({});

  // Fetch users and roles data
  const { data: { users = [], roles = [] } = {}, isLoading, error } = useQuery({
    queryKey: ["usersData"],
    queryFn: async () => {
      const [usersData, rolesData] = await Promise.all([
        api.users.getUsers(),
        api.roles.getAllRoles()
      ]);

      const processedUsers = usersData.map((user) => ({
        id: user.id,
        name: user.full_name,
        email: user.email,
        role: rolesData.find((role) => role.id === user.role_id)?.name || "Viewer",
        roleId: user.role_id,
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

      const processedRoles = rolesData.map((role) => ({
        id: role.id,
        name: role.name,
      }));

      return { users: processedUsers, roles: processedRoles };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });

  // Helper function to set loading state for individual actions
  const setActionLoading = useCallback((userId: string, loading: boolean) => {
    setActionLoadingStates(prev => ({ ...prev, [userId]: loading }));
  }, []);

  // Form validation
  const validateInviteForm = useCallback((): boolean => {
    const errors: FormErrors = {};

    if (!emailAddress.trim()) {
      errors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress)) {
      errors.email = "Please enter a valid email address";
    }

    if (!selectedRoleId) {
      errors.role = "Please select a role";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [emailAddress, selectedRoleId]);

  const validateEditForm = useCallback((): boolean => {
    const errors: FormErrors = {};

    if (!selectedRoleId) {
      errors.role = "Please select a role";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [selectedRoleId]);

  // Mutation to invite a user
  const inviteUserMutation = useMutation({
    mutationFn: async ({ email, role_id }: { email: string; role_id: string }) => {
      return await api.onboarding.createUserInvite({ email, role_id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usersData"] });
      resetInviteForm();
      setShowInviteUserModalOpen(false);
      console.log("User invited successfully");
      // You can add a success toast notification here
    },
    onError: (error) => {
      console.error("Error inviting user:", error);
      // You can add error toast notification here
    },
  });

  // Mutation to delete a user
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      setActionLoading(userId, true);
      return await api.users.deleteUser(userId);
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ["usersData"] });
      setShowDeleteUserModalOpen(false);
      setActionLoading(userId, false);
      console.log("User deleted successfully");
      // You can add a success toast notification here
    },
    onError: (error, userId) => {
      console.error("Error deleting user:", error);
      setActionLoading(userId, false);
      // You can add error toast notification here
    },
  });

  // Mutation to edit a user's role
  const editUserRoleMutation = useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      setActionLoading(userId, true);
      return await api.users.updateRole(userId, { role_id: roleId });
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["usersData"] });
      setShowEditRoleModalOpen(false);
      setActionLoading(userId, false);
      console.log("User role updated successfully");
      // You can add a success toast notification here
    },
    onError: (error, { userId }) => {
      console.error("Error editing user role:", error);
      setActionLoading(userId, false);
      // You can add error toast notification here
    },
  });

  // Helper functions
  const resetInviteForm = useCallback(() => {
    setEmailAddress("");
    setSelectedRoleId("");
    setFormErrors({});
  }, []);

  const resetEditForm = useCallback(() => {
    setSelectedUserId(null);
    setSelectedUserName("");
    setSelectedRoleId("");
    setFormErrors({});
  }, []);

  const resetDeleteForm = useCallback(() => {
    setSelectedUserId(null);
    setSelectedUserName("");
  }, []);

  // Event handlers
  const handleInviteUser = useCallback(() => {
    if (!validateInviteForm() || inviteUserMutation.isPending) return;

    inviteUserMutation.mutate({
      email: emailAddress.trim(),
      role_id: selectedRoleId,
    });
  }, [emailAddress, selectedRoleId, validateInviteForm, inviteUserMutation]);

  const handleDeleteUser = useCallback(() => {
    if (!selectedUserId || deleteUserMutation.isPending || actionLoadingStates[selectedUserId]) return;

    deleteUserMutation.mutate(selectedUserId);
  }, [selectedUserId, deleteUserMutation, actionLoadingStates]);

  const handleEditUserRole = useCallback(() => {
    if (!selectedUserId || !validateEditForm() || editUserRoleMutation.isPending || actionLoadingStates[selectedUserId]) return;

    editUserRoleMutation.mutate({
      userId: selectedUserId,
      roleId: selectedRoleId,
    });
  }, [selectedUserId, selectedRoleId, validateEditForm, editUserRoleMutation, actionLoadingStates]);

  const handleOpenEditModal = useCallback((user: User) => {
    setSelectedUserId(user.id);
    setSelectedUserName(user.name);
    setSelectedRoleId(user.roleId);
    setFormErrors({});
    setShowEditRoleModalOpen(true);
  }, []);

  const handleOpenDeleteModal = useCallback((user: User) => {
    setSelectedUserId(user.id);
    setSelectedUserName(user.name);
    setShowDeleteUserModalOpen(true);
  }, []);

  const handleCloseInviteModal = useCallback(() => {
    setShowInviteUserModalOpen(false);
    resetInviteForm();
  }, [resetInviteForm]);

  const handleCloseEditModal = useCallback(() => {
    setShowEditRoleModalOpen(false);
    resetEditForm();
  }, [resetEditForm]);

  const handleCloseDeleteModal = useCallback(() => {
    setShowDeleteUserModalOpen(false);
    resetDeleteForm();
  }, [resetDeleteForm]);

  // UI Helper functions
  const getRoleIcon = useCallback((role: string) => {
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
  }, []);

  const getRoleBadgeColor = useCallback((role: string) => {
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
  }, []);

  const getStatusBadgeColor = useCallback((status: string) => {
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
  }, []);

  // Loading state
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

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <div className="flex flex-col items-center space-y-4">
          <div className="text-red-500 text-xl">⚠️</div>
          <p className="text-gray-400">Failed to load team members</p>
          <Button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ["usersData"] })}
            className="bg-electric_indigo-500 hover:bg-electric_indigo-600 text-white"
          >
            Retry
          </Button>
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
          disabled={inviteUserMutation.isPending}
        >
          <Plus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {/* Invite User Modal */}
      <Dialog open={showInviteUserModalOpen} onOpenChange={setShowInviteUserModalOpen}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Invite Team Member</DialogTitle>
            <DialogDescription className="text-gray-400">
              Send an invitation to add a new member to your team.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email" className="text-white">
                Email Address *
              </Label>
              <Input
                id="invite-email"
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                className={`bg-gray-900 border-gray-700 text-white ${
                  formErrors.email ? 'border-red-500' : ''
                }`}
                placeholder="Enter email address"
                disabled={inviteUserMutation.isPending}
              />
              {formErrors.email && (
                <p className="text-red-400 text-sm">{formErrors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-role" className="text-white">
                Role *
              </Label>
              <Select
                value={selectedRoleId}
                onValueChange={setSelectedRoleId}
                disabled={inviteUserMutation.isPending}
              >
                <SelectTrigger className={`bg-gray-900 border-gray-700 text-white ${
                  formErrors.role ? 'border-red-500' : ''
                }`}>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id} className="text-white hover:bg-gray-700">
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(role.name)}
                        <span>{role.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.role && (
                <p className="text-red-400 text-sm">{formErrors.role}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseInviteModal}
              className="text-white border-gray-600 hover:bg-gray-700"
              disabled={inviteUserMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleInviteUser}
              className="bg-electric_indigo-500 hover:bg-electric_indigo-600 text-white"
              disabled={inviteUserMutation.isPending}
            >
              {inviteUserMutation.isPending ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Invitation
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Modal */}
      <Dialog open={showEditRoleModalOpen} onOpenChange={setShowEditRoleModalOpen}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Edit User Role</DialogTitle>
            <DialogDescription className="text-gray-400">
              Change the role for <strong className="text-white">{selectedUserName}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-role" className="text-white">
                Role *
              </Label>
              <Select
                value={selectedRoleId}
                onValueChange={setSelectedRoleId}
                disabled={editUserRoleMutation.isPending || (selectedUserId ? actionLoadingStates[selectedUserId] : false)}
              >
                <SelectTrigger className={`bg-gray-900 border-gray-700 text-white ${
                  formErrors.role ? 'border-red-500' : ''
                }`}>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id} className="text-white hover:bg-gray-700">
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(role.name)}
                        <span>{role.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.role && (
                <p className="text-red-400 text-sm">{formErrors.role}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseEditModal}
              className="text-white border-gray-600 hover:bg-gray-700"
              disabled={editUserRoleMutation.isPending || (selectedUserId ? actionLoadingStates[selectedUserId] : false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditUserRole}
              className="bg-electric_indigo-500 hover:bg-electric_indigo-600 text-white"
              disabled={editUserRoleMutation.isPending || (selectedUserId ? actionLoadingStates[selectedUserId] : false)}
            >
              {(editUserRoleMutation.isPending || (selectedUserId ? actionLoadingStates[selectedUserId] : false)) ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Modal */}
      <Dialog open={showDeleteUserModalOpen} onOpenChange={setShowDeleteUserModalOpen}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
              Remove Team Member
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to remove <strong className="text-white">{selectedUserName}</strong> from your team?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-200">
                <p className="font-medium mb-1">This will:</p>
                <ul className="list-disc list-inside space-y-1 text-red-300">
                  <li>Remove the user from your organization</li>
                  <li>Revoke all their access permissions</li>
                  <li>Invalidate their API keys and tokens</li>
                  <li>Remove them from all projects and environments</li>
                </ul>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseDeleteModal}
              className="text-white border-gray-600 hover:bg-gray-700"
              disabled={deleteUserMutation.isPending || (selectedUserId ? actionLoadingStates[selectedUserId] : false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleteUserMutation.isPending || (selectedUserId ? actionLoadingStates[selectedUserId] : false)}
            >
              {(deleteUserMutation.isPending || (selectedUserId ? actionLoadingStates[selectedUserId] : false)) ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove User"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Users Table */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Team Members ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No team members yet</h3>
              <p className="text-gray-400 mb-4">
                Invite your first team member to get started collaborating.
              </p>
              <Button
                onClick={() => setShowInviteUserModalOpen(true)}
                className="bg-electric_indigo-500 hover:bg-electric_indigo-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
            </div>
          ) : (
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
                      className="border-b border-gray-700 hover:bg-gray-750 transition-colors"
                    >
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
                              disabled={actionLoadingStates[user.id]}
                            >
                              {actionLoadingStates[user.id] ? (
                                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <MoreHorizontal className="w-4 h-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-gray-800 border-gray-700">
                            <DropdownMenuItem
                              className="text-white hover:bg-gray-700 cursor-pointer"
                              onClick={() => handleOpenEditModal(user)}
                            >
                              <Shield className="w-4 h-4 mr-2" />
                              Edit Role
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-400 hover:bg-gray-700 cursor-pointer"
                              onClick={() => handleOpenDeleteModal(user)}
                            >
                              <AlertTriangle className="w-4 h-4 mr-2" />
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Users;

