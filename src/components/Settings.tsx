
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building, Globe, Users, Shield, Key, Bell, Trash2 } from "lucide-react";

export const Settings = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Workspace Settings</h1>
        <p className="text-gray-400 mt-2">
          Manage your workspace configuration and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Building className="w-5 h-5 text-electric_indigo-500" />
              <CardTitle className="text-white">Workspace Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workspace-name" className="text-white">Workspace Name</Label>
              <Input
                id="workspace-name"
                defaultValue="Personal Workspace"
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workspace-slug" className="text-white">Workspace Slug</Label>
              <Input
                id="workspace-slug"
                defaultValue="personal-workspace"
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workspace-description" className="text-white">Description</Label>
              <Input
                id="workspace-description"
                placeholder="Describe your workspace..."
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>
            <Button className="bg-electric_indigo-500 hover:bg-electric_indigo-600 text-white">
              Save Changes
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-electric_indigo-500" />
              <CardTitle className="text-white">Security</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-white">Two-Factor Authentication</h4>
                <p className="text-sm text-gray-400">
                  Add an extra layer of security
                </p>
              </div>
              <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                Enable
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-white">Session Timeout</h4>
                <p className="text-sm text-gray-400">
                  Auto-logout inactive users
                </p>
              </div>
              <select className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white">
                <option>24 hours</option>
                <option>1 week</option>
                <option>1 month</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-white">Activity Logging</h4>
                <p className="text-sm text-gray-400">
                  Track all workspace activities
                </p>
              </div>
              <span className="text-green-400 text-sm font-medium">Enabled</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Key className="w-5 h-5 text-electric_indigo-500" />
              <CardTitle className="text-white">API Access</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key" className="text-white">Service Token</Label>
              <div className="flex space-x-2">
                <Input
                  id="api-key"
                  value="dp.st.prod.••••••••••••••••••••••••••••••••"
                  readOnly
                  className="bg-gray-900 border-gray-700 text-white"
                />
                <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                  Copy
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="webhook-url" className="text-white">Webhook URL</Label>
              <Input
                id="webhook-url"
                placeholder="https://your-app.com/webhooks/envsync"
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>
            <Button className="bg-electric_indigo-500 hover:bg-electric_indigo-600 text-white">
              Regenerate Token
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-electric_indigo-500" />
              <CardTitle className="text-white">Notifications</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-white">Email Notifications</h4>
                <p className="text-sm text-gray-400">
                  Receive updates via email
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-electric_indigo-500"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-white">Slack Integration</h4>
                <p className="text-sm text-gray-400">
                  Send alerts to Slack
                </p>
              </div>
              <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                Connect
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-white">Digest Frequency</h4>
                <p className="text-sm text-gray-400">
                  Weekly activity summary
                </p>
              </div>
              <select className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white">
                <option>Weekly</option>
                <option>Daily</option>
                <option>Monthly</option>
                <option>Never</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-800 border-red-900 border">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Trash2 className="w-5 h-5 text-red-500" />
            <CardTitle className="text-red-400">Danger Zone</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">Delete Workspace</h4>
              <p className="text-sm text-gray-400">
                Permanently delete this workspace and all its data
              </p>
            </div>
            <Button variant="destructive" className="bg-red-600 hover:bg-red-700 text-white">
              Delete Workspace
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
