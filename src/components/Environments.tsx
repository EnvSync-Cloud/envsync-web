
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Eye, EyeOff, Copy, Edit, Trash2, Search, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Environments = () => {
  const [selectedProject, setSelectedProject] = useState("Frontend App");
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const projects = ["Frontend App", "Backend API", "Mobile App", "Data Pipeline"];
  const environments = ["Development", "Staging", "Production"];
  
  const envVars = [
    { 
      key: "DATABASE_URL", 
      values: {
        Development: "postgresql://localhost:5432/app_dev",
        Staging: "postgresql://staging-db:5432/app",
        Production: "postgresql://prod-db:5432/app"
      },
      sensitive: true 
    },
    { 
      key: "API_KEY", 
      values: {
        Development: "pk_test_123",
        Staging: "pk_staging_456", 
        Production: "pk_live_789"
      },
      sensitive: true 
    },
    { 
      key: "NODE_ENV", 
      values: {
        Development: "development",
        Staging: "staging",
        Production: "production"
      },
      sensitive: false 
    },
    { 
      key: "PORT", 
      values: {
        Development: "3000",
        Staging: "3000",
        Production: "8080"
      },
      sensitive: false 
    },
    { 
      key: "REDIS_URL", 
      values: {
        Development: "redis://localhost:6379",
        Staging: "redis://staging-redis:6379",
        Production: "redis://prod-redis:6379"
      },
      sensitive: true 
    },
  ];

  const toggleValueVisibility = (key: string, env: string) => {
    const toggleKey = `${key}-${env}`;
    setShowValues(prev => ({ ...prev, [toggleKey]: !prev[toggleKey] }));
  };

  const maskValue = (value: string) => "•".repeat(Math.min(value.length, 20));

  const filteredEnvVars = envVars.filter(envVar =>
    envVar.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Configs</h1>
          <p className="text-gray-400 mt-2">
            Manage environment variables across all environments
          </p>
        </div>
        <Button className="bg-electric_indigo-500 hover:bg-electric_indigo-600 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Secret
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-gray-400">Project</label>
          <select 
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-electric_indigo-500"
          >
            {projects.map(project => (
              <option key={project} value={project}>{project}</option>
            ))}
          </select>
        </div>
        
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-400">Search</label>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search secrets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 focus:border-electric_indigo-500 text-white placeholder-gray-400"
            />
          </div>
        </div>

        <div className="flex items-end">
          <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">
              {selectedProject}
            </CardTitle>
            <Badge variant="secondary" className="bg-gray-700 text-white">
              {filteredEnvVars.length} secrets
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Secret</th>
                  {environments.map(env => (
                    <th key={env} className="text-left py-3 px-4 text-gray-400 font-medium">{env}</th>
                  ))}
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnvVars.map((envVar, index) => (
                  <tr key={envVar.key} className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-medium text-electric_indigo-400">
                          {envVar.key}
                        </span>
                        {envVar.sensitive && (
                          <Badge variant="destructive" className="text-xs">
                            Sensitive
                          </Badge>
                        )}
                      </div>
                    </td>
                    {environments.map(env => (
                      <td key={env} className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 min-w-0">
                            <Input
                              value={showValues[`${envVar.key}-${env}`] ? envVar.values[env as keyof typeof envVar.values] : maskValue(envVar.values[env as keyof typeof envVar.values])}
                              readOnly
                              className="bg-gray-900 border-gray-600 font-mono text-sm text-white"
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleValueVisibility(envVar.key, env)}
                            className="text-gray-400 hover:text-white hover:bg-gray-700"
                          >
                            {showValues[`${envVar.key}-${env}`] ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                    ))}
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-700">
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-700">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300 hover:bg-gray-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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
