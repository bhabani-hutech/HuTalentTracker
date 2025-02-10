import { UserManagement } from "../components/settings/user-management";
import { SystemConfig } from "../components/settings/system-config";
import { MasterDataSettings } from "../components/settings/master-data-settings";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";

interface SettingsProps {
  defaultTab?: string;
}

export default function Settings({ defaultTab = "general" }: SettingsProps) {
  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage application settings and preferences
        </p>
      </div>
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="system">System Configuration</TabsTrigger>
          <TabsTrigger value="master">Master Data</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <UserManagement />
        </TabsContent>
        <TabsContent value="system">
          <SystemConfig />
        </TabsContent>
        <TabsContent value="master">
          <MasterDataSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
