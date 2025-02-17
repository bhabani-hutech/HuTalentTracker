import { MasterDataSettings } from "../components/settings/master-data-settings";

interface masterDataProps {
  defaultTab?: string;
}

export default function MasterData({
  defaultTab = "general",
}: masterDataProps) {
  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">MasterData</h1>
        <p className="text-muted-foreground">
          Manage application masterdata and preferences
        </p>
      </div>
      <MasterDataSettings />
    </div>
  );
}
