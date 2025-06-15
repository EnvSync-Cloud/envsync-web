import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Key, RefreshCw, ShieldBan, ShieldCheck, Trash2, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UpdateApiKeyRequest } from "@envsync-cloud/envsync-ts-sdk";

interface ApiKey {
  id: string;
  org_id: string;
  user_id: string;
  key: string;
  description?: string | null;
  is_active: boolean;
  last_used_at?: Date | null;
  created_at: Date;
  updated_at: Date;
  created_by?: {
    name: string;
    email: string;
  };
}

export const ApiKeys = () => {
  const { api } = useAuth();
  const queryClient = useQueryClient();

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showCreatedKeyModalOpen, setShowCreatedKeyModalOpen] = useState(false);
  const [newKeyDescription, setNewKeyDescription] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  // Loading states for individual actions
  const [actionLoadingStates, setActionLoadingStates] = useState<Record<string, boolean>>({});

  // Fetch API keys with users data
  const { data: apiKeys = [], isLoading, error } = useQuery({
    queryKey: ["apiKeys"],
    queryFn: async () => {
      const [keysData, usersData] = await Promise.all([
        api.apiKeys.getAllApiKeys(),
        api.users.getUsers()
      ]);
      
      const usersMap = new Map(usersData.map((user) => [user.id, user]));
      
      return keysData.map((key) => ({
        ...key,
        created_by: {
          name: usersMap.get(key.user_id)?.full_name || "Unknown",
          email: usersMap.get(key.user_id)?.email || "Unknown",
        },
        last_used_at: key.last_used_at ? new Date(key.last_used_at) : null,
        created_at: new Date(key.created_at),
        updated_at: new Date(key.updated_at),
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });

  // Helper function to set loading state for individual actions
  const setActionLoading = useCallback((keyId: string, loading: boolean) => {
    setActionLoadingStates(prev => ({ ...prev, [keyId]: loading }));
  }, []);

  // Mutation to create a new API key
  const createApiKeyMutation = useMutation({
    mutationFn: async (description: string) => {
      const data = await api.apiKeys.createApiKey({
        name: description || "Untitled API Key",
        description: description || null,
      });
      return data;
    },
    onSuccess: (data) => {
      setCreatedKey(data.key);
      queryClient.invalidateQueries({ queryKey: ["apiKeys"] });
      setNewKeyDescription("");
      setIsCreateModalOpen(false);
      setShowCreatedKeyModalOpen(true);
    },
    onError: (error) => {
      console.error("Failed to create API key:", error);
      alert("Failed to create API key. Please try again.");
    },
  });

  // Mutation for deleting API keys
  const deleteApiKeyMutation = useMutation({
    mutationFn: async (apiKeyId: string) => {
      setActionLoading(apiKeyId, true);
      return await api.apiKeys.deleteApiKey(apiKeyId);
    },
    onSuccess: (_, apiKeyId) => {
      queryClient.invalidateQueries({ queryKey: ["apiKeys"] });
      setActionLoading(apiKeyId, false);
    },
    onError: (error, apiKeyId) => {
      console.error("Failed to delete API key:", error);
      alert("Failed to delete API key. Please try again.");
      setActionLoading(apiKeyId, false);
    },
  });

  // Mutation to regenerate an API key
  const regenerateApiKeyMutation = useMutation({
    mutationFn: async (apiKeyId: string) => {
      setActionLoading(apiKeyId, true);
      const data = await api.apiKeys.regenerateApiKey(apiKeyId);
      return data;
    },
    onSuccess: (data, apiKeyId) => {
      setCreatedKey(data.newKey);
      queryClient.invalidateQueries({ queryKey: ["apiKeys"] });
      setShowCreatedKeyModalOpen(true);
      setActionLoading(apiKeyId, false);
    },
    onError: (error, apiKeyId) => {
      console.error("Failed to regenerate API key:", error);
      alert("Failed to regenerate API key. Please try again.");
      setActionLoading(apiKeyId, false);
    },
  });

  // Mutation to update API key settings
  const updateApiKeyMutation = useMutation({
    mutationFn: async ({ apiKeyId, updateData }: { apiKeyId: string; updateData: UpdateApiKeyRequest }) => {
      setActionLoading(apiKeyId, true);
      return await api.apiKeys.updateApiKey(apiKeyId, updateData);
    },
    onSuccess: (_, { apiKeyId }) => {
      queryClient.invalidateQueries({ queryKey: ["apiKeys"] });
      setActionLoading(apiKeyId, false);
    },
    onError: (error, { apiKeyId }) => {
      console.error("Failed to update API key:", error);
      alert("Failed to update API key. Please try again.");
      setActionLoading(apiKeyId, false);
    },
  });

  // Action handlers
  const handleCreateKey = useCallback(() => {
    if (createApiKeyMutation.isPending) return;
    createApiKeyMutation.mutate(newKeyDescription);
  }, [newKeyDescription, createApiKeyMutation]);

  const handleDeleteApiKey = useCallback((apiKeyId: string) => {
    if (actionLoadingStates[apiKeyId] || deleteApiKeyMutation.isPending) return;
    
    if (window.confirm("Are you sure you want to delete this API key? This action cannot be undone.")) {
      deleteApiKeyMutation.mutate(apiKeyId);
    }
  }, [actionLoadingStates, deleteApiKeyMutation]);

  const handleRegenerateKey = useCallback((apiKeyId: string) => {
    if (actionLoadingStates[apiKeyId] || regenerateApiKeyMutation.isPending) return;
    regenerateApiKeyMutation.mutate(apiKeyId);
  }, [actionLoadingStates, regenerateApiKeyMutation]);

  const handleToggleApiKey = useCallback((apiKeyId: string, isActive: boolean) => {
    if (actionLoadingStates[apiKeyId] || updateApiKeyMutation.isPending) return;
    
    updateApiKeyMutation.mutate({
      apiKeyId,
      updateData: { is_active: !isActive }
    });
  }, [actionLoadingStates, updateApiKeyMutation]);

  const handleCopyKey = useCallback(async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      alert("API key copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      alert("Failed to copy to clipboard. Please copy manually.");
    }
  }, []);

  const formatLastUsed = useCallback((lastUsedAt: Date | null) => {
    if (!lastUsedAt) return "Never";

    const now = new Date();
    const diffMs = now.getTime() - lastUsedAt.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <div className="flex flex-col items-center space-y-4">
          <div className="size-12 border-4 border-t-electric_indigo-500 border-gray-700 rounded-full animate-spin"></div>
          <p className="text-gray-400">Loading your API keys...</p>
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
          <p className="text-gray-400">Failed to load API keys</p>
          <Button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ["apiKeys"] })}
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
          <h1 className="text-3xl font-bold text-white">API Keys</h1>
          <p className="text-gray-400 mt-2">
            Manage your API keys for accessing EnvSync services
          </p>
        </div>

        {/* Created Key Modal */}
        <Dialog open={showCreatedKeyModalOpen} onOpenChange={setShowCreatedKeyModalOpen}>
          <DialogContent className="bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">API Key Created</DialogTitle>
              <DialogDescription className="text-gray-400">
                Your new API key has been created successfully. Make sure to copy it as you won't be able to see it again.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">API Key</Label>
                <div className="relative">
                  <Textarea
                    readOnly
                    value={createdKey || ""}
                    className="bg-gray-900 border-gray-700 text-white pr-12"
                    rows={3}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2 h-8 w-8 p-0"
                    onClick={() => handleCopyKey(createdKey || "")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowCreatedKeyModalOpen(false)}
                className="text-white border-gray-600 hover:bg-gray-700"
              >
                Close
              </Button>
              <Button
                onClick={() => handleCopyKey(createdKey || "")}
                className="bg-electric_indigo-500 hover:bg-electric_indigo-600 text-white"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Key
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create API Key Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-electric_indigo-500 hover:bg-electric_indigo-600 text-white"
              disabled={createApiKeyMutation.isPending}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Create New API Key</DialogTitle>
              <DialogDescription className="text-gray-400">
                Create a new API key for your organization. Make sure to copy it as you won't be able to see it again.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Enter a description for this API key..."
                  value={newKeyDescription}
                  onChange={(e) => setNewKeyDescription(e.target.value)}
                  className="bg-gray-900 border-gray-700 text-white"
                  disabled={createApiKeyMutation.isPending}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-white border-gray-600 hover:bg-gray-700"
                disabled={createApiKeyMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateKey}
                className="bg-electric_indigo-500 hover:bg-electric_indigo-600 text-white"
                disabled={createApiKeyMutation.isPending}
              >
                {createApiKeyMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Key"
                )}
              </Button>
                        </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Key className="w-5 h-5 mr-2 text-electric_indigo-500" />
            API Keys
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Description
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    API Key
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Last Used
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Created
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Created by
                  </th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {apiKeys.map((apiKey) => (
                  <tr
                    key={apiKey.id}
                    className="border-b border-gray-700 hover:bg-gray-750"
                  >
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-white">
                          {apiKey.description || "Untitled"}
                        </span>
                        <span className="text-xs text-gray-400">
                          ID: {apiKey.id}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <code className="text-sm font-mono text-gray-300 bg-gray-900 px-2 py-1 rounded">
                          {`${apiKey.key.substring(0, 8)}...${apiKey.key.substring(apiKey.key.length - 8)}`}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                          onClick={() => handleCopyKey(apiKey.key)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge
                        className={`${
                          apiKey.is_active
                            ? "bg-green-900 text-green-300 border-green-800"
                            : "bg-gray-700 text-gray-300 border-gray-600"
                        } border`}
                      >
                        {apiKey.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-400">
                        {formatLastUsed(apiKey.last_used_at)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-400">
                        {apiKey.created_at.toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-white">
                          {apiKey.created_by?.name || "Unknown"}
                        </span>
                        <span className="text-xs text-gray-400">
                          {apiKey.created_by?.email}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRegenerateKey(apiKey.id)}
                          disabled={actionLoadingStates[apiKey.id] || regenerateApiKeyMutation.isPending}
                          className="text-white border-gray-600 hover:bg-gray-700"
                          title="Regenerate API Key"
                        >
                          {actionLoadingStates[apiKey.id] ? (
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <RefreshCw className="w-3 h-3" />
                          )}
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleApiKey(apiKey.id, apiKey.is_active)}
                          disabled={actionLoadingStates[apiKey.id] || updateApiKeyMutation.isPending}
                          className="text-white border-gray-600 hover:bg-gray-700"
                          title={apiKey.is_active ? "Disable API Key" : "Enable API Key"}
                        >
                          {actionLoadingStates[apiKey.id] ? (
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : apiKey.is_active ? (
                            <ShieldBan className="w-3 h-3" />
                          ) : (
                            <ShieldCheck className="w-3 h-3" />
                          )}
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteApiKey(apiKey.id)}
                          disabled={actionLoadingStates[apiKey.id] || deleteApiKeyMutation.isPending}
                          className="text-red-400 border-red-600 hover:bg-red-900/20 hover:text-red-300"
                          title="Delete API Key"
                        >
                          {actionLoadingStates[apiKey.id] ? (
                            <div className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {apiKeys.length === 0 && (
            <div className="text-center py-12">
              <Key className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">No API Keys</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Create your first API key to start using EnvSync services. API keys allow you to authenticate and access our APIs programmatically.
              </p>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-electric_indigo-500 hover:bg-electric_indigo-600 text-white"
                disabled={createApiKeyMutation.isPending}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First API Key
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiKeys;
