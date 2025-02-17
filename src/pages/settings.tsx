import { SystemConfig } from "../components/settings/system-config";

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
      <SystemConfig />
    </div>
  );
}
