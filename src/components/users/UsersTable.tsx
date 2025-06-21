import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRow } from "./UserRow";
import { EmptyState } from "./EmptyState";

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

interface UsersTableProps {
  users: User[];
  actionLoadingStates: Record<string, boolean>;
  canManageUsers: boolean;
  onInviteClick: () => void;
  onEditRole: (user: User) => void;
  onDeleteUser: (user: User) => void;
}

export const UsersTable = ({ 
  users, 
  actionLoadingStates, 
  canManageUsers, 
  onInviteClick, 
  onEditRole, 
  onDeleteUser 
}: UsersTableProps) => {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Team Members ({users.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <EmptyState onInviteClick={onInviteClick} />
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
                  {canManageUsers && (
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    isLoading={actionLoadingStates[user.id]}
                    canManageUsers={canManageUsers}
                    onEditRole={onEditRole}
                    onDeleteUser={onDeleteUser}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
