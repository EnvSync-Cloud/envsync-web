import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Plus, 
  RefreshCw, 
  Upload, 
  Download,
  Settings,
  Database
} from "lucide-react";

interface ProjectEnvironmentsHeaderProps {
  projectName: string;
  totalVariables: number;
  totalSecrets: number;
  environmentTypes: number;
  canEdit: boolean;
  isRefetching: boolean;
  onBack: () => void;
  onRefresh: () => void;
  onAddVariable: () => void;
  onBulkImport: () => void;
  onExport: () => void;
  onManageEnvironments: () => void;
}

export const ProjectEnvironmentsHeader = ({
  projectName,
  totalVariables,
  totalSecrets,
  environmentTypes,
  canEdit,
  isRefetching,
  onBack,
  onRefresh,
  onAddVariable,
  onBulkImport,
  onExport,
  onManageEnvironments,
}: ProjectEnvironmentsHeaderProps) => {
  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center space-x-3">
        <Button
          onClick={onBack}
          variant="ghost"
          size="sm"
          className="text-slate-400 hover:text-white hover:bg-slate-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Button>
        <span className="text-slate-500">/</span>
        <span className="text-slate-300">{projectName}</span>
        <span className="text-slate-500">/</span>
        <span className="text-white font-medium">Environments</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-blue-400 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{projectName}</h1>
              <p className="text-slate-400">Environment Variables & Configuration</p>
            </div>
          </div>
          
          {/* Statistics */}
          <div className="flex items-center space-x-4 mt-3">
            <Badge variant="secondary" className="bg-slate-700 text-slate-300">
              {totalVariables} Variables
            </Badge>
            <Badge variant="secondary" className="bg-slate-700 text-slate-300">
              {totalSecrets} Secrets
            </Badge>
            <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400">
              {environmentTypes} Environments
            </Badge>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          <Button
            onClick={onRefresh}
            variant="outline"
            size="sm"
            className="text-slate-400 border-slate-600 hover:bg-slate-700"
            disabled={isRefetching}
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
          </Button>

          <Button
            onClick={onExport}
            variant="outline"
            size="sm"
            className="text-slate-400 border-slate-600 hover:bg-slate-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>

          {canEdit && (
            <>
              <Button
                onClick={onManageEnvironments}
                variant="outline"
                size="sm"
                className="text-slate-400 border-slate-600 hover:bg-slate-700"
              >
                <Settings className="w-4 h-4 mr-2" />
                Manage Environments
              </Button>

              <Button
                onClick={onBulkImport}
                variant="outline"
                className="text-white border-slate-600 hover:bg-slate-700"
              >
                <Upload className="w-4 h-4 mr-2" />
                Bulk Import
              </Button>

              <Button
                onClick={onAddVariable}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Variable
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
