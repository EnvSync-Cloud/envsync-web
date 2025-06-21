import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState, useCallback } from "react";
import { InviteUserModal } from "@/components/users/InviteUserModal";
import { EditRoleModal } from "@/components/users/EditRoleModal";
import { DeleteUserModal } from "@/components/users/DeleteUserModal";
import { UsersTable } from "@/components/users/UsersTable";
import { UsersLoadingPage } from "./loading";
import { UsersErrorPage } from "./error";
import { useUsers } from "@/hooks/useUsers";

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

export const Users = () => {
  const { user } = useAuth();
  const {
    users,
    roles,
    isLoading,
    error,
    selectedUserId,
    selectedUserName,
    emailAddress,
    selectedRoleId,
    formErrors,
    actionLoadingStates,
    setSelectedUserId,
    setSelectedUserName,
    setEmailAddress,
    setSelectedRoleId,
    setFormErrors,
    inviteUserMutation,
    deleteUserMutation,
    editUserRoleMutation,
    validateInviteForm,
    validateEditForm,
    resetInviteForm,
    resetEditForm,
    resetDeleteForm,
  } = useUsers();

  // Dialog states
  const [showInviteUserModalOpen, setShowInviteUserModalOpen] = useState(false);
  const [showEditRoleModalOpen, setShowEditRoleModalOpen] = useState(false);
  const [showDeleteUserModalOpen, setShowDeleteUserModalOpen] = useState(false);

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
  }, [setSelectedUserId, setSelectedUserName, setSelectedRoleId, setFormErrors]);

  const handleOpenDeleteModal = useCallback((user: User) => {
    setSelectedUserId(user.id);
    setSelectedUserName(user.name);
    setShowDeleteUserModalOpen(true);
  }, [setSelectedUserId, setSelectedUserName]);

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

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="size-12 border-4 border-t-emerald-500 border-slate-700 rounded-full animate-spin"></div>
          <div className="text-slate-400">Loading...</div>
        </div>
      </div>
    );
  }

  const { is_admin, is_master } = user.role;
  const canManageUsers = is_admin || is_master;

  if (isLoading) {
    return <UsersLoadingPage />;
  }

  if (error) {
    return <UsersErrorPage />;
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
        {canManageUsers && (
          <Button
            className="bg-electric_indigo-500 hover:bg-electric_indigo-600 text-white"
            onClick={() => setShowInviteUserModalOpen(true)}
            disabled={inviteUserMutation.isPending}
          >
            <Plus className="w-4 h-4 mr-2" />
            Invite Member
          </Button>
        )}
      </div>

      {/* Invite User Modal */}
      <InviteUserModal
        open={showInviteUserModalOpen}
        onOpenChange={setShowInviteUserModalOpen}
        emailAddress={emailAddress}
        setEmailAddress={setEmailAddress}
        selectedRoleId={selectedRoleId}
        setSelectedRoleId={setSelectedRoleId}
        roles={roles}
        formErrors={formErrors}
        isLoading={inviteUserMutation.isPending}
        onInvite={handleInviteUser}
        onClose={handleCloseInviteModal}
      />

      {/* Edit Role Modal */}
      <EditRoleModal
        open={showEditRoleModalOpen}
        onOpenChange={setShowEditRoleModalOpen}
        selectedUserName={selectedUserName}
        selectedRoleId={selectedRoleId}
        setSelectedRoleId={setSelectedRoleId}
        roles={roles}
        formErrors={formErrors}
        isLoading={editUserRoleMutation.isPending || (selectedUserId ? actionLoadingStates[selectedUserId] : false)}
        onSave={handleEditUserRole}
        onClose={handleCloseEditModal}
      />

      {/* Delete User Modal */}
      <DeleteUserModal
        open={showDeleteUserModalOpen}
        onOpenChange={setShowDeleteUserModalOpen}
        selectedUserName={selectedUserName}
        isLoading={deleteUserMutation.isPending || (selectedUserId ? actionLoadingStates[selectedUserId] : false)}
        onDelete={handleDeleteUser}
        onClose={handleCloseDeleteModal}
      />

      {/* Users Table */}
      <UsersTable
        users={users}
        actionLoadingStates={actionLoadingStates}
        canManageUsers={canManageUsers}
        onInviteClick={() => setShowInviteUserModalOpen(true)}
        onEditRole={handleOpenEditModal}
        onDeleteUser={handleOpenDeleteModal}
      />
    </div>
  );
};

export default Users;