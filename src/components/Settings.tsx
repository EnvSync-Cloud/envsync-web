
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building, Globe, Users, Shield } from "lucide-react";

export const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-400 mt-2">
          Manage your organization settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Building className="w-5 h-5 text-purple-500" />
              <CardTitle>Organization Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="org-name">Organization Name</Label>
              <Input
                id="org-name"
                defaultValue="My Organization"
                className="bg-gray-900 border-gray-700"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-slug">Organization Slug</Label>
              <Input
                id="org-slug"
                defaultValue="my-organization"
                className="bg-gray-900 border-gray-700"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-website">Website</Label>
              <Input
                id="org-website"
                defaultValue="https://example.com"
                className="bg-gray-900 border-gray-700"
              />
            </div>
            <Button className="bg-purple-600 hover:bg-purple-700">
              Save Changes
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-purple-500" />
              <CardTitle>Security Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Two-Factor Authentication</h4>
                <p className="text-sm text-gray-400">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Button variant="outline" className="border-gray-600">
                Enable
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Session Timeout</h4>
                <p className="text-sm text-gray-400">
                  Automatically log out inactive users
                </p>
              </div>
              <select className="bg-gray-900 border border-gray-700 rounded px-3 py-1">
                <option>24 hours</option>
                <option>1 week</option>
                <option>1 month</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Audit Logging</h4>
                <p className="text-sm text-gray-400">
                  Track all organization activities
                </p>
              </div>
              <span className="text-green-400 text-sm">Enabled</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-purple-500" />
              <CardTitle>API Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <div className="flex space-x-2">
                <Input
                  id="api-key"
                  value="sk_live_••••••••••••••••••••••••••••••••"
                  readOnly
                  className="bg-gray-900 border-gray-700"
                />
                <Button variant="outline" className="border-gray-600">
                  Regenerate
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input
                id="webhook-url"
                placeholder="https://your-app.com/webhooks/envsync"
                className="bg-gray-900 border-gray-700"
              />
            </div>
            <Button className="bg-purple-600 hover:bg-purple-700">
              Save API Settings
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-500" />
              <CardTitle>Team Preferences</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Auto-invite Domain</h4>
                <p className="text-sm text-gray-400">
                  Automatically invite users with matching email domains
                </p>
              </div>
              <Input
                placeholder="@example.com"
                className="w-32 bg-gray-900 border-gray-700"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Default Role</h4>
                <p className="text-sm text-gray-400">
                  Default role for new team members
                </p>
              </div>
              <select className="bg-gray-900 border border-gray-700 rounded px-3 py-1">
                <option>Viewer</option>
                <option>Developer</option>
                <option>Admin</option>
              </select>
            </div>
            <Button className="bg-purple-600 hover:bg-purple-700">
              Save Preferences
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
