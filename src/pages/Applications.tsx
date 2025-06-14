import { useState, useCallback, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Database,
  MoreHorizontal,
  Trash2,
  Search,
  X,
  AlertTriangle,
  RefreshCw,
  Settings,
  Eye,
  Calendar,
  Filter,
  SortAsc,
  SortDesc,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NewProjectModal } from "@/components/NewProjectModal";
import { ProjectEnvironments } from "@/components/ProjectEnvironments";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface App {
  id: string;
  org_id: string;
  name: string;
  description: string;
  metadata: Record<string, any>;
  status?: string;
  created_at: Date;
  updated_at: Date;
  env_count?: number;
  secret_count?: number;
}

interface FilterOptions {
  status: string;
  sortBy: 'name' | 'created_at' | 'updated_at';
  sortOrder: 'asc' | 'desc';
}

// Constants
const DEFAULT_FILTER_OPTIONS: FilterOptions = {
  status: 'all',
  sortBy: 'updated_at',
  sortOrder: 'desc',
};

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
] as const;

const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'created_at', label: 'Created Date' },
  { value: 'updated_at', label: 'Last Updated' },
] as const;

const DEBOUNCE_DELAY = 300;

export const Applications = () => {
  const { api } = useAuth();
  const queryClient = useQueryClient();

  // UI State
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [filterOptions, setFilterOptions] = useState<FilterOptions>(DEFAULT_FILTER_OPTIONS);

  // Modal States
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<App | null>(null);

  // Loading states for individual actions
  const [actionLoadingStates, setActionLoadingStates] = useState<Record<string, boolean>>({});

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Helper function to set loading state for individual actions
  const setActionLoading = useCallback((projectId: string, loading: boolean) => {
    setActionLoadingStates(prev => ({ ...prev, [projectId]: loading }));
  }, []);

  // Fetch applications with enhanced error handling
  const { 
    data: applications = [], 
    isLoading, 
    error, 
    refetch,
    isRefetching 
  } = useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      try {
        const response = await api.applications.getApps();

        // Enhanced data mapping with additional metadata
        const apps: App[] = response.map((app) => ({
          id: app.id,
          org_id: app.org_id,
          name: app.name,
          description: app.description || "",
          metadata: app.metadata || {},
          status: "active", // You might want to get this from the API
          created_at: new Date(app.created_at),
          updated_at: new Date(app.updated_at),
          env_count: app.metadata?.env_count || 0,
          secret_count: app.metadata?.secret_count || 0,
        }));

        return apps;
      } catch (error) {
        console.error("Failed to fetch applications:", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Delete project mutation with optimistic updates
  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      setActionLoading(projectId, true);
      return await api.applications.deleteApp(projectId);
    },
    onMutate: async (projectId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["applications"] });

      // Snapshot the previous value
      const previousApps = queryClient.getQueryData<App[]>(["applications"]);

      // Optimistically update to the new value
      if (previousApps) {
        queryClient.setQueryData<App[]>(
          ["applications"],
          previousApps.filter((app) => app.id !== projectId)
        );
      }

      return { previousApps };
    },
    onSuccess: (_, projectId) => {
      toast.success("Project deleted successfully");
      setActionLoading(projectId, false);
      setShowDeleteDialog(false);
      setProjectToDelete(null);
    },
    onError: (error: any, projectId, context) => {
      // Rollback on error
      if (context?.previousApps) {
        queryClient.setQueryData(["applications"], context.previousApps);
      }
      
      const message = error?.response?.data?.message || error.message || "Failed to delete project";
      toast.error(message);
      setActionLoading(projectId, false);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });

  // Event handlers
  const handleProjectClick = useCallback((projectId: string) => {
    setSelectedProjectId(projectId);
  }, []);

  const handleDeleteProject = useCallback((project: App) => {
    setProjectToDelete(project);
    setShowDeleteDialog(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!projectToDelete) return;
    deleteProjectMutation.mutate(projectToDelete.id);
  }, [projectToDelete, deleteProjectMutation]);

  const handleCloseDeleteDialog = useCallback(() => {
    setShowDeleteDialog(false);
    setProjectToDelete(null);
  }, []);

  const handleFilterChange = useCallback((key: keyof FilterOptions, value: string) => {
    setFilterOptions(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSortOrderToggle = useCallback(() => {
    setFilterOptions(prev => ({
      ...prev,
      sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilterOptions(DEFAULT_FILTER_OPTIONS);
    setSearchQuery("");
  }, []);

  // Memoized filtered and sorted applications
  const filteredAndSortedApplications = useMemo(() => {
    let filtered = applications;

    // Apply search filter
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(app =>
        app.name.toLowerCase().includes(query) ||
        app.description.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (filterOptions.status !== 'all') {
      filtered = filtered.filter(app => app.status === filterOptions.status);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (filterOptions.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'created_at':
          aValue = a.created_at.getTime();
          bValue = b.created_at.getTime();
          break;
        case 'updated_at':
          aValue = a.updated_at.getTime();
          bValue = b.updated_at.getTime();
          break;
        default:
          return 0;
      }

      if (filterOptions.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [applications, debouncedSearchQuery, filterOptions]);

  // Memoized statistics
  const statistics = useMemo(() => {
    return {
      total: applications.length,
      active: applications.filter(app => app.status === 'active').length,
      inactive: applications.filter(app => app.status === 'inactive').length,
      filtered: filteredAndSortedApplications.length,
    };
  }, [applications, filteredAndSortedApplications]);

  // Format date helper
  const formatDate = useCallback((date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }, []);

  // Get relative time helper
  const getRelativeTime = useCallback((date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(date);
  }, [formatDate]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="size-12 border-4 border-t-emerald-500 border-slate-700 rounded-full animate-spin"></div>
          <div className="text-slate-400">Loading your projects...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400" />
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Failed to load projects</h3>
            <p className="text-slate-400 mb-4">
              {error instanceof Error ? error.message : "An unexpected error occurred"}
            </p>
            <div className="flex space-x-2">
              <Button
                onClick={handleRefresh}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button
                onClick={() => setShowNewProjectModal(true)}
                variant="outline"
                className="text-white border-slate-600 hover:bg-slate-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show project environments if a project is selected
  if (selectedProjectId) {
    return (
      <ProjectEnvironments
        projectNameId={selectedProjectId}
        onBack={() => setSelectedProjectId(null)}
      />
    );
  }

  // Empty state
  if (!isLoading && applications.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-blue-400 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
            <Database className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No projects yet</h3>
          <p className="text-slate-400 mb-6">
            Create your first project to start managing environment variables and configurations.
          </p>
          <Button
            onClick={() => setShowNewProjectModal(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Project
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
                    <h1 className="text-3xl font-bold text-white">Projects</h1>
          <p className="text-slate-400 mt-2">
            Manage your applications and their configurations
          </p>
          {/* Statistics */}
          <div className="flex items-center space-x-4 mt-3">
            <Badge variant="secondary" className="bg-slate-700 text-slate-300">
              {statistics.total} Total
            </Badge>
            <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400">
              {statistics.active} Active
            </Badge>
            {statistics.inactive > 0 && (
              <Badge variant="secondary" className="bg-slate-600 text-slate-300">
                {statistics.inactive} Inactive
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="text-slate-400 border-slate-600 hover:bg-slate-700"
            disabled={isRefetching}
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            onClick={() => setShowNewProjectModal(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Project
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search projects by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-900 border-slate-700 text-white"
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Status Filter */}
            <div className="w-full lg:w-48">
              <Select
                value={filterOptions.status}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-white">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort Options */}
            <div className="w-full lg:w-48">
              <Select
                value={filterOptions.sortBy}
                onValueChange={(value) => handleFilterChange('sortBy', value)}
              >
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-white">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort Order Toggle */}
            <Button
              onClick={handleSortOrderToggle}
              variant="outline"
              size="sm"
              className="text-slate-400 border-slate-600 hover:bg-slate-700"
              title={`Sort ${filterOptions.sortOrder === 'asc' ? 'ascending' : 'descending'}`}
            >
              {filterOptions.sortOrder === 'asc' ? (
                <SortAsc className="w-4 h-4" />
              ) : (
                <SortDesc className="w-4 h-4" />
              )}
            </Button>

            {/* Reset Filters */}
            {(searchQuery || filterOptions.status !== 'all' || 
              filterOptions.sortBy !== 'updated_at' || filterOptions.sortOrder !== 'desc') && (
              <Button
                onClick={handleResetFilters}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white"
              >
                Reset
              </Button>
            )}
          </div>

          {/* Results Summary */}
          {(debouncedSearchQuery || filterOptions.status !== 'all') && (
            <div className="mt-4 pt-4 border-t border-slate-700">
              <p className="text-sm text-slate-400">
                Showing {statistics.filtered} of {statistics.total} projects
                {debouncedSearchQuery && (
                  <span> matching "{debouncedSearchQuery}"</span>
                )}
                {filterOptions.status !== 'all' && (
                  <span> with status "{filterOptions.status}"</span>
                )}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Projects Grid */}
      {filteredAndSortedApplications.length === 0 && (debouncedSearchQuery || filterOptions.status !== 'all') ? (
        // No results for current filters
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center max-w-md">
            <Search className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No projects found</h3>
            <p className="text-slate-400 mb-4">
              {debouncedSearchQuery 
                ? `No projects match "${debouncedSearchQuery}"`
                : `No projects with status "${filterOptions.status}"`
              }
            </p>
            <Button
              onClick={handleResetFilters}
              variant="outline"
              className="text-white border-slate-600 hover:bg-slate-700"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedApplications.map((app) => (
            <Card
              key={app.id}
              className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-all duration-200 group cursor-pointer hover:shadow-lg hover:shadow-emerald-500/5 rounded-xl hover:border-slate-600"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div
                    className="flex items-center space-x-3 flex-1"
                    onClick={() => handleProjectClick(app.id)}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-blue-400 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
                      <Database className="w-6 h-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg text-white truncate">
                        {app.name}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge
                          className={`text-xs ${
                            app.status === "active"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-slate-700 text-slate-300 border border-slate-600"
                          }`}
                        >
                          {app.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-white hover:bg-slate-700 rounded-xl flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-slate-800 border-slate-700 rounded-xl">
                      <DropdownMenuItem
                        className="text-white hover:bg-slate-700 rounded-xl cursor-pointer"
                        onClick={() => handleProjectClick(app.id)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-white hover:bg-slate-700 rounded-xl cursor-pointer"
                        onClick={() => handleProjectClick(app.id)}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Manage
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-slate-700" />
                      <DropdownMenuItem
                        className="text-red-400 hover:bg-slate-700 rounded-xl cursor-pointer"
                        onClick={() => handleDeleteProject(app)}
                        disabled={actionLoadingStates[app.id]}
                      >
                        {actionLoadingStates[app.id] ? (
                          <div className="w-4 h-4 mr-2 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 mr-2" />
                        )}
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent onClick={() => handleProjectClick(app.id)}>
                <p className="text-slate-400 text-sm mb-6 line-clamp-2">
                  {app.description || "No description provided"}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-3 bg-slate-900 rounded-xl border border-slate-700">
                    <div className="text-2xl font-bold text-white">
                      {app.env_count}
                    </div>
                    <div className="text-xs text-slate-400">Configs</div>
                  </div>
                  <div className="text-center p-3 bg-slate-900 rounded-xl border border-slate-700">
                    <div className="text-2xl font-bold text-white">
                      {app.secret_count}
                    </div>
                    <div className="text-xs text-slate-400">Secrets</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      Created
                    </span>
                    <span className="text-slate-300" title={formatDate(app.created_at)}>
                      {getRelativeTime(app.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Last updated</span>
                    <span className="text-slate-300" title={formatDate(app.updated_at)}>
                      {getRelativeTime(app.updated_at)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Project</DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to delete "{projectToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mt-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-red-400 font-medium text-sm">Warning</h4>
                <p className="text-red-300 text-sm mt-1">
                  This will permanently delete the project and all associated environment variables, 
                  configurations, and data. This action cannot be undone.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={handleCloseDeleteDialog}
              className="text-white border-slate-600 hover:bg-slate-700"
              disabled={deleteProjectMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleteProjectMutation.isPending}
            >
              {deleteProjectMutation.isPending ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Project
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Project Modal */}
      <NewProjectModal
        isOpen={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
      />
    </div>
  );
};

export default Applications;

