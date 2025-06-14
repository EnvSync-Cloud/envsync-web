import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Key, RefreshCw, ShieldBan, ShieldCheck, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
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

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newKeyDescription, setNewKeyDescription] = useState("");
  const [showCreatedKeyModalOpen, setShowCreatedKeyModalOpen] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  const [selectedApiKey, setSelectedApiKey] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    description?: string;
    is_active?: boolean;
  }>({
    description: "",
    is_active: false,
  });

  const queryClient = useQueryClient();

  const { isLoading } = useQuery({
    queryKey: ["apiKeys"],
    queryFn: async () => {
      const keysData = await api.apiKeys.getAllApiKeys();
      const usersData = await api.users.getUsers();
      const usersMap = new Map(usersData.map((user) => [user.id, user]));
      const data = keysData.map((key) => ({
        ...key,
        created_by: {
          name: usersMap.get(key.user_id)?.full_name || "Unknown",
          email: usersMap.get(key.user_id)?.email || "Unknown",
        },
        last_used_at: key.last_used_at ? new Date(key.last_used_at) : null,
        created_at: new Date(key.created_at),
        updated_at: new Date(key.updated_at),
      }));
      setApiKeys(data);
      return data;
    },
  });

  // Mutation to create a new API key
  const createApiKey = useMutation({
    mutationFn: async (description: string) => {
      const data = await api.apiKeys.createApiKey({
        name: description,
        description: description || null,
      });

      setCreatedKey(data.key);
      return data.key;
    },
    onSuccess: () => {
      // Invalidate and refetch API keys
      queryClient.invalidateQueries({ queryKey: ["apiKeys"] });
    },
    onError: (error) => {
      console.error("Failed to create API key:", error);
      // You can add error toast notification here
    },
  });

  // Mutation for deleting api keys
  const deleteApiKeyMutation = useMutation({
    mutationFn: async (
      apiKeyId: string
    ) => {
      return await api.apiKeys.deleteApiKey(apiKeyId);
    },
    onSuccess: () => {
      console.log("API key deleted successfully");
      // Redirect user or handle post-deletion logic
      queryClient.invalidateQueries({ queryKey: ["apiKeys"] });
    },
    onError: (error) => {
      console.error("Failed to delete API key:", error);
    },
  });

  // Mutation to regenerate an API key
  const regenerateApiKeyMutation = useMutation({
    mutationFn: async (apiKeyId: string) => {
      const data = await api.apiKeys.regenerateApiKey(apiKeyId);
      setCreatedKey(data.newKey);
      return data.newKey;
    },
    onSuccess: () => {
      // Invalidate and refetch API keys
      queryClient.invalidateQueries({ queryKey: ["apiKeys"] });
    },
    onError: (error) => {
      console.error("Failed to regenerate API key:", error);
      // You can add error toast notification here
    },
  });

  // Mutation to update API key settings
  const updateApiKeySettings = useMutation({
    mutationFn: async (updateData: UpdateApiKeyRequest) => {
      return await api.apiKeys.updateApiKey(selectedApiKey, updateData);
    },
    onSuccess: () => {
      // Invalidate and refetch API keys
      queryClient.invalidateQueries({ queryKey: ["apiKeys"] });
    },
    onError: (error) => {
      console.error("Failed to update API key settings:", error);
      // You can add error toast notification here
    },
  });

  // Handle API key deletion
  const handleDeleteApiKey = () => {
    if (!selectedApiKey) return;

    if (window.confirm("Are you sure you want to delete this API key? This action cannot be undone.")) {
      deleteApiKeyMutation.mutate(selectedApiKey);
    }
  };

  // Handle disable API key actions if no key is selected
  const handleDisableApiKey = () => {
    if (!selectedApiKey) return;

    const updateData: UpdateApiKeyRequest = {
      is_active: false,
    };

    updateApiKeySettings.mutate(updateData);
  };

  // Handle enable API key actions if no key is selected
  const handleEnableApiKey = () => {
    if (!selectedApiKey) return;

    const updateData: UpdateApiKeyRequest = {
      is_active: true,
    };

    updateApiKeySettings.mutate(updateData);
  };

  const formatLastUsed = (lastUsedAt: Date | null) => {
    if (!lastUsedAt) return "Never";

    const now = new Date();
    const diffMs = now.getTime() - lastUsedAt.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const handleCreateKey = () => {
    console.log("Creating new API key with description:", newKeyDescription);

    createApiKey.mutate(newKeyDescription);

    setNewKeyDescription("");
    setIsCreateModalOpen(false);

    setShowCreatedKeyModalOpen(true);
  };

  const handleRegenerateKey = (keyId: string) => {
    console.log("Regenerating key:", keyId);

    regenerateApiKeyMutation.mutate(keyId);
    setShowCreatedKeyModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <div className="flex flex-col items-center space-y-4">
          <div className="size-12 border-4 border-t-electric_indigo-500 border-gray-700 rounded-full animate-spin"></div>
          <p className="text-gray-400">Loading your data...</p>
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
        <Dialog open={showCreatedKeyModalOpen} onOpenChange={setShowCreatedKeyModalOpen}>
          <DialogContent className="bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">API Key</DialogTitle>
              <DialogDescription className="text-gray-400">
                Your new API key has been created successfully. Make sure to copy it as you won't be able to see it again.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">API Key</Label>
                <Textarea
                  readOnly
                  value={createdKey || ""}
                  className="bg-gray-900 border-gray-700 text-white"
                  rows={3}
                />
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
                onClick={() => {
                  navigator.clipboard.writeText(createdKey || "");
                  alert("API key copied to clipboard!");
                }}
                className="bg-electric_indigo-500 hover:bg-electric_indigo-600 text-white"
              >
                Copy Key
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-electric_indigo-500 hover:bg-electric_indigo-600 text-white">
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
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-white border-gray-600 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateKey}
                className="bg-electric_indigo-500 hover:bg-electric_indigo-600 text-white"
              >
                Create Key
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
                      <code className="text-sm font-mono text-gray-300 bg-gray-900 px-2 py-1 rounded">
                        {apiKey.key}
                      </code>
                    </td>
                    <td className="py-4 px-4">
                      <Badge
                        className={`${apiKey.is_active
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
                    <td className="py-4 px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRegenerateKey(apiKey.id)}
                        className="text-white border-gray-600 hover:bg-gray-700"
                      >
                        <RefreshCw className="w-3 h-3 mr-2" />
                      </Button>
                      {apiKey.is_active && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedApiKey(apiKey.id);
                            handleDisableApiKey();
                          }}
                          className="text-white border-gray-600 hover:bg-gray-700"
                        >
                          <ShieldBan className="w-3 h-3 mr-2" />
                        </Button>
                      )}
                      {!apiKey.is_active && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedApiKey(apiKey.id);
                            handleEnableApiKey();
                          }}
                          className="text-white border-gray-600 hover:bg-gray-700"
                        >
                          <ShieldCheck className="w-3 h-3 mr-2" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedApiKey(apiKey.id);
                          handleDeleteApiKey();
                        }}
                        className="text-white border-gray-600 hover:bg-gray-700"
                      >
                        <Trash2 className="w-3 h-3 mr-2" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {apiKeys.length === 0 && (
            <div className="text-center py-8">
              <Key className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No API Keys</h3>
              <p className="text-gray-400 mb-4">
                Create your first API key to start using EnvSync services.
              </p>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-electric_indigo-500 hover:bg-electric_indigo-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create API Key
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiKeys;
