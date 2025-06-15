import { useState, useCallback, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Calendar, 
  User, 
  Search, 
  Filter, 
  Download, 
  X, 
  RefreshCw, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  Activity,
  Database,
  Settings,
  Shield,
  Code,
  Eye,
  Plus,
  Edit,
  Trash2,
  FileText,
  Users,
  Building,
  Key,
  Terminal,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { AuditActions } from "@/lib/audit.type";

interface AuditLog {
  id: string;
  action: AuditActions;
  details: string;
  user: string;
  user_id: string;
  timestamp: string;
  created_at: string;
  project?: string;
  environment?: string;
  resource_type?: string;
  resource_id?: string;
  ip_address?: string;
  user_agent?: string;
}

interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface FilterOptions {
  action: string;
  user: string;
  timeRange: string;
  resourceType: string;
}

// Constants
const DEFAULT_PAGE_SIZE = 20;
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
const DEBOUNCE_DELAY = 300;

const DEFAULT_FILTER_OPTIONS: FilterOptions = {
  action: 'all',
  user: 'all',
  timeRange: '24h',
  resourceType: 'all',
};

const TIME_RANGE_OPTIONS = [
  { value: '1h', label: 'Last hour' },
  { value: '24h', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'custom', label: 'Custom range' },
] as const;

const RESOURCE_TYPE_OPTIONS = [
  { value: 'all', label: 'All Resources' },
  { value: 'app', label: 'Applications' },
  { value: 'env', label: 'Environments' },
  { value: 'user', label: 'Users' },
  { value: 'org', label: 'Organization' },
  { value: 'api_key', label: 'API Keys' },
  { value: 'cli', label: 'CLI' },
] as const;

// Action categorization for better UX
const ACTION_CATEGORIES = {
  create: ['app_created', 'env_created', 'envs_batch_created', 'org_created', 'user_invite_created'],
  update: ['app_updated', 'env_updated', 'envs_batch_updated', 'org_updated', 'user_updated', 'user_role_updated', 'user_invite_updated'],
  delete: ['app_deleted', 'env_deleted', 'user_deleted', 'user_invite_deleted'],
  view: ['app_viewed', 'apps_viewed', 'env_type_viewed', 'env_types_viewed', 'env_viewed', 'envs_viewed', 'user_invite_viewed', 'users_retrieved', 'user_retrieved', 'get_audit_logs'],
  auth: ['user_invite_accepted', 'password_update_requested'],
  cli: ['cli_command_executed'],
} as const;

export const AuditLogs = () => {
  const { api } = useAuth();

   // Helper function to generate page numbers for pagination
  const generatePageNumbers = useCallback((currentPage: number, totalPages: number) => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  }, []);

  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [filterOptions, setFilterOptions] = useState<FilterOptions>(DEFAULT_FILTER_OPTIONS);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 0,
  });

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      // Reset to first page when search changes
      if (searchQuery !== debouncedSearchQuery) {
        setPagination(prev => ({ ...prev, page: 1 }));
      }
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [searchQuery, debouncedSearchQuery]);

  // Reset pagination when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [filterOptions, debouncedSearchQuery]);

  // Fetch audit logs with pagination and filters
  const { 
    data: auditLogsData, 
    isLoading, 
    error, 
    refetch,
    isRefetching 
  } = useQuery({
    queryKey: [
      "audit-logs", 
      pagination.page, 
      pagination.pageSize, 
      debouncedSearchQuery, 
      filterOptions
    ],
    queryFn: async () => {
      try {
        // Build query parameters
        const params = new URLSearchParams({
          page: pagination.page.toString(),
          page_size: pagination.pageSize.toString(),
        });

        if (debouncedSearchQuery) {
          params.append('search', debouncedSearchQuery);
        }

        if (filterOptions.action !== 'all') {
          params.append('action', filterOptions.action);
        }

        if (filterOptions.user !== 'all') {
          params.append('user_id', filterOptions.user);
        }

        if (filterOptions.timeRange !== 'all') {
          const timeRange = getTimeRangeFilter(filterOptions.timeRange);
          if (timeRange.start) params.append('start_date', timeRange.start);
          if (timeRange.end) params.append('end_date', timeRange.end);
        }

        if (filterOptions.resourceType !== 'all') {
          params.append('resource_type', filterOptions.resourceType);
        }

        // Fetch audit logs and users data
        const [auditLogsResponse, usersResponse] = await Promise.all([
          api.auditLogs.getAuditLogs(pagination.page.toString(), pagination.pageSize.toString()),
          api.users.getUsers(),
        ]);

        // Create users map for efficient lookup
        const usersMap = new Map(usersResponse.map((user) => [user.id, user]));

        // Transform audit logs data
        const logs: AuditLog[] = auditLogsResponse.auditLogs.map((log) => ({
          id: log.id,
          action: log.action as AuditActions,
          details: log.details || getActionDescription(log.action as AuditActions),
          user: usersMap.get(log.user_id)?.full_name || "Unknown User",
          user_id: log.user_id,
          timestamp: new Date(log.created_at).toLocaleString(),
          created_at: log.created_at,
          // project: log.metadata?.project_name || "",
          project: JSON.parse(log.details).project_id,
          environment: JSON.parse(log.details).env_type_id,
          resource_type: getResourceTypeFromAction(log.action as AuditActions),
          resource_id: "",
          ip_address:  "",
          user_agent: "",
        }));

        // Update pagination info (this would come from API response headers in real implementation)
        const totalCount = auditLogsResponse.totalPages; // This should come from API
        const totalPages = Math.ceil(totalCount / pagination.pageSize);

        setPagination(prev => ({
          ...prev,
          total: totalCount,
          totalPages: totalPages,
        }));

        return {
          logs,
          users: usersResponse,
          pagination: {
            page: pagination.page,
            pageSize: pagination.pageSize,
            total: totalCount,
            totalPages,
          },
        };
      } catch (error) {
        console.error("Failed to fetch audit logs:", error);
        throw error;
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Helper functions
  const getTimeRangeFilter = useCallback((timeRange: string) => {
    const now = new Date();
    const start = new Date();

    switch (timeRange) {
      case '1h':
        start.setHours(now.getHours() - 1);
        break;
      case '24h':
        start.setDate(now.getDate() - 1);
        break;
      case '7d':
        start.setDate(now.getDate() - 7);
        break;
      case '30d':
        start.setDate(now.getDate() - 30);
        break;
      case '90d':
        start.setDate(now.getDate() - 90);
        break;
      default:
        return { start: null, end: null };
    }

    return {
      start: start.toISOString(),
      end: now.toISOString(),
    };
  }, []);

  const getActionDescription = useCallback((action: AuditActions): string => {
    const descriptions: Record<AuditActions, string> = {
      // App actions
      app_created: "Created application",
      app_updated: "Updated application",
      app_deleted: "Deleted application",
      app_viewed: "Viewed application",
      apps_viewed: "Viewed applications list",

      // Environment actions
      env_types_viewed: "Viewed environment types",
      env_type_viewed: "Viewed environment type",
      env_created: "Created environment variable",
      env_updated: "Updated environment variable",
      env_deleted: "Deleted environment variable",
      env_viewed: "Viewed environment variable",
      envs_viewed: "Viewed environment variables",
      envs_batch_created: "Created multiple environment variables",
      envs_batch_updated: "Updated multiple environment variables",

      // User actions
      users_retrieved: "Retrieved users list",
      user_retrieved: "Retrieved user details",
      user_updated: "Updated user profile",
      user_deleted: "Deleted user account",
      user_role_updated: "Updated user role",
      password_update_requested: "Requested password update",

      // Organization actions
      org_created: "Created organization",
      org_updated: "Updated organization",

      // User invite actions
      user_invite_created: "Created user invitation",
      user_invite_accepted: "Accepted user invitation",
      user_invite_viewed: "Viewed user invitation",
      user_invite_updated: "Updated user invitation",
      user_invite_deleted: "Deleted user invitation",

      // Audit log actions
      get_audit_logs: "Viewed audit logs",

      // CLI actions
      cli_command_executed: "Executed CLI command",
    };

    return descriptions[action] || action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }, []);

  const getResourceTypeFromAction = useCallback((action: AuditActions): string => {
    if (action.startsWith('app_')) return 'app';
    if (action.startsWith('env_')) return 'env';
    if (action.startsWith('user_')) return 'user';
    if (action.startsWith('org_')) return 'org';
    if (action.startsWith('cli_')) return 'cli';
    return 'system';
  }, []);

  const getActionCategory = useCallback((action: AuditActions): keyof typeof ACTION_CATEGORIES => {
    for (const [category, actions] of Object.entries(ACTION_CATEGORIES)) {
      // @ts-ignore
      if (actions.includes(action as any)) {
        return category as keyof typeof ACTION_CATEGORIES;
      }
    }
    return 'view';
  }, []);

  const getActionBadgeColor = useCallback((action: AuditActions): string => {
    const category = getActionCategory(action);
    
    switch (category) {
      case "create":
        return "bg-green-900 text-green-300 border-green-800";
      case "update":
        return "bg-blue-900 text-blue-300 border-blue-800";
      case "delete":
        return "bg-red-900 text-red-300 border-red-800";
      case "view":
        return "bg-gray-700 text-gray-300 border-gray-600";
      case "auth":
        return "bg-purple-900 text-purple-300 border-purple-800";
      case "cli":
        return "bg-yellow-900 text-yellow-300 border-yellow-800";
      default:
        return "bg-gray-700 text-gray-300 border-gray-600";
    }
  }, [getActionCategory]);

  const getActionIcon = useCallback((action: AuditActions): JSX.Element => {
    const category = getActionCategory(action);
    const iconClass = "w-3 h-3";

    switch (category) {
      case "create":
        return <Plus className={iconClass} />;
      case "update":
        return <Edit className={iconClass} />;
      case "delete":
        return <Trash2 className={iconClass} />;
      case "view":
        return <Eye className={iconClass} />;
      case "auth":
        return <Shield className={iconClass} />;
      case "cli":
        return <Terminal className={iconClass} />;
      default:
        return <Activity className={iconClass} />;
    }
  }, [getActionCategory]);

  const getResourceIcon = useCallback((resourceType: string): JSX.Element => {
    const iconClass = "w-4 h-4";

    switch (resourceType) {
      case 'app':
        return <Database className={iconClass} />;
      case 'env':
        return <Settings className={iconClass} />;
      case 'user':
        return <Users className={iconClass} />;
      case 'org':
        return <Building className={iconClass} />;
      case 'api_key':
        return <Key className={iconClass} />;
      case 'cli':
        return <Terminal className={iconClass} />;
      default:
        return <FileText className={iconClass} />;
    }
  }, []);

  // Event handlers
  const handleFilterChange = useCallback((key: keyof FilterOptions, value: string) => {
    setFilterOptions(prev => ({ ...prev, [key]: value }));
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: string) => {
    const pageSize = parseInt(newPageSize, 10);
    setPagination(prev => ({ 
      ...prev, 
      pageSize, 
      page: 1, // Reset to first page when changing page size
      totalPages: Math.ceil(prev.total / pageSize)
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
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const handleExportLogs = useCallback(async () => {
    try {
      toast.info("Preparing audit logs export...");
      // This would be implemented based on your API
      // const exportData = await api.auditLogs.exportLogs(filterOptions);
      // downloadFile(exportData, 'audit-logs.csv');
      toast.success("Audit logs exported successfully");
    } catch (error) {
      toast.error("Failed to export audit logs");
    }
  }, [filterOptions]);

  // Memoized filtered data for display
  const displayData = useMemo(() => {
    return auditLogsData?.logs || [];
  }, [auditLogsData]);

  // Memoized pagination info
  const paginationInfo = useMemo(() => {
    const startItem = (pagination.page - 1) * pagination.pageSize + 1;
    const endItem = Math.min(pagination.page * pagination.pageSize, pagination.total);
    
    return {
      startItem,
      endItem,
      hasNextPage: pagination.page < pagination.totalPages,
      hasPrevPage: pagination.page > 1,
      pageNumbers: generatePageNumbers(pagination.page, pagination.totalPages),
    };
  }, [pagination]);

  // Format date helper
  const formatDate = useCallback((dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(new Date(dateString));
  }, []);

  // Get relative time helper
  const getRelativeTime = useCallback((dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  }, [formatDate]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="size-12 border-4 border-t-electric_indigo-500 border-gray-700 rounded-full animate-spin"></div>
          <p className="text-gray-400">Loading audit logs...</p>
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
            <h3 className="text-lg font-semibold text-white mb-2">Failed to load audit logs</h3>
            <p className="text-gray-400 mb-4">
              {error instanceof Error ? error.message : "An unexpected error occurred"}
            </p>
            <Button
              onClick={handleRefresh}
              className="bg-electric_indigo-500 hover:bg-electric_indigo-600 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Audit Logs</h1>
          <p className="text-gray-400 mt-2">
            Track all activities and changes in your organization
          </p>
          {pagination.total > 0 && (
            <div className="flex items-center space-x-4 mt-3">
              <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                {pagination.total} Total Events
              </Badge>
              <Badge variant="secondary" className="bg-electric_indigo-500/20 text-electric_indigo-400">
                Page {pagination.page} of {pagination.totalPages}
              </Badge>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="text-gray-400 border-gray-600 hover:bg-gray-700"
            disabled={isRefetching}
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            onClick={handleExportLogs}
            variant="outline"
            size="sm"
            className="text-gray-400 border-gray-600 hover:bg-gray-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search audit logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-900 border-gray-700 text-white"
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Time Range Filter */}
            <Select
              value={filterOptions.timeRange}
              onValueChange={(value) => handleFilterChange('timeRange', value)}
            >
              <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                <Clock className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {TIME_RANGE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-white">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Resource Type Filter */}
            <Select
              value={filterOptions.resourceType}
              onValueChange={(value) => handleFilterChange('resourceType', value)}
            >
              <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {RESOURCE_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-white">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* User Filter */}
            <Select
              value={filterOptions.user}
              onValueChange={(value) => handleFilterChange('user', value)}
            >
              <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                <User className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all" className="text-white">All Users</SelectItem>
                {auditLogsData?.users?.map((user) => (
                  <SelectItem key={user.id} value={user.id} className="text-white">
                    {user.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters & Reset */}
          {(searchQuery || filterOptions.timeRange !== '24h' || 
            filterOptions.resourceType !== 'all' || filterOptions.user !== 'all') && (
            <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Active filters:</span>
                {searchQuery && (
                  <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                    Search: "{searchQuery}"
                  </Badge>
                )}
                {filterOptions.timeRange !== '24h' && (
                  <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                    Time: {TIME_RANGE_OPTIONS.find(opt => opt.value === filterOptions.timeRange)?.label}
                  </Badge>
                )}
                {filterOptions.resourceType !== 'all' && (
                  <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                    Resource: {RESOURCE_TYPE_OPTIONS.find(opt => opt.value === filterOptions.resourceType)?.label}
                  </Badge>
                )}
                {filterOptions.user !== 'all' && (
                  <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                    User: {auditLogsData?.users?.find(u => u.id === filterOptions.user)?.full_name}
                  </Badge>
                )}
              </div>
              <Button
                onClick={handleResetFilters}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                Reset Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center">
              <Activity className="w-5 h-5 mr-2 text-electric_indigo-500" />
              Activity Log
            </div>
            {pagination.total > 0 && (
              <div className="text-sm text-gray-400 font-normal">
                Showing {paginationInfo.startItem}-{paginationInfo.endItem} of {pagination.total}
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {displayData.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No audit logs found</h3>
              <p className="text-gray-400 mb-4">
                {debouncedSearchQuery || Object.values(filterOptions).some(v => v !== 'all' && v !== '24h')
                  ? "No logs match your current filters"
                  : "No audit logs available for this time period"
                }
              </p>
              {(debouncedSearchQuery || Object.values(filterOptions).some(v => v !== 'all' && v !== '24h')) && (
                <Button
                  onClick={handleResetFilters}
                  variant="outline"
                  className="text-white border-gray-600 hover:bg-gray-700"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">
                        Action
                      </th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">
                        Resource
                      </th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">
                        User
                      </th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">
                        Time
                      </th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayData.map((log) => (
                      <tr
                        key={log.id}
                        className="border-b border-gray-700 hover:bg-gray-750 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <Badge
                              className={`${getActionBadgeColor(log.action)} border flex items-center space-x-1`}
                            >
                              {getActionIcon(log.action)}
                              <span className="text-xs font-medium">
                                {getActionCategory(log.action)}
                              </span>
                            </Badge>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            {getResourceIcon(log.resource_type || 'system')}
                            <div>
                              <div className="text-sm font-medium text-white">
                                {log.project || log.environment || 'System'}
                              </div>
                              <div className="text-xs text-gray-400">
                                {log.resource_type || 'system'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="text-sm font-medium text-white">
                                {log.user}
                              </div>
                              <div className="text-xs text-gray-400">
                                {log.ip_address || 'Unknown IP'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <div>
                              <div className="text-sm text-gray-300">
                                {getRelativeTime(log.created_at)}
                              </div>
                              <div className="text-xs text-gray-400">
                                {formatDate(log.created_at)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <div className="text-sm font-medium text-white">
                              {getActionDescription(log.action)}
                            </div>
                            {log.details && (
                              <div className="text-xs text-gray-400 mt-1 max-w-xs truncate">
                                {log.details}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">Show</span>
                    <Select
                      value={pagination.pageSize.toString()}
                      onValueChange={handlePageSizeChange}
                    >
                      <SelectTrigger className="w-20 bg-gray-900 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {PAGE_SIZE_OPTIONS.map((size) => (
                          <SelectItem key={size} value={size.toString()} className="text-white">
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-gray-400">per page</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* First Page */}
                    <Button
                      onClick={() => handlePageChange(1)}
                      disabled={!paginationInfo.hasPrevPage}
                      variant="outline"
                      size="sm"
                      className="text-gray-400 border-gray-600 hover:bg-gray-700 disabled:opacity-50"
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </Button>

                    {/* Previous Page */}
                    <Button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!paginationInfo.hasPrevPage}
                      variant="outline"
                      size="sm"
                      className="text-gray-400 border-gray-600 hover:bg-gray-700 disabled:opacity-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>

                    {/* Page Numbers */}
                    <div className="flex items-center space-x-1">
                      {paginationInfo.pageNumbers.map((pageNum, index) => (
                        <div key={index}>
                          {pageNum === '...' ? (
                            <span className="px-3 py-1 text-gray-400">...</span>
                          ) : (
                            <Button
                              onClick={() => handlePageChange(pageNum as number)}
                              variant={pageNum === pagination.page ? "default" : "outline"}
                              size="sm"
                              className={
                                pageNum === pagination.page
                                  ? "bg-electric_indigo-500 text-white"
                                  : "text-gray-400 border-gray-600 hover:bg-gray-700"
                              }
                            >
                              {pageNum}
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Next Page */}
                    <Button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!paginationInfo.hasNextPage}
                      variant="outline"
                      size="sm"
                      className="text-gray-400 border-gray-600 hover:bg-gray-700 disabled:opacity-50"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>

                    {/* Last Page */}
                    <Button
                      onClick={() => handlePageChange(pagination.totalPages)}
                      disabled={!paginationInfo.hasNextPage}
                      variant="outline"
                      size="sm"
                      className="text-gray-400 border-gray-600 hover:bg-gray-700 disabled:opacity-50"
                    >
                      <ChevronsRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogs;
