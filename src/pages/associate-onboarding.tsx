import { AssociateList } from "../components/associate-onboarding/list";
import { AssociateMetrics } from "../components/associate-onboarding/metrics";
import { DocumentManagement } from "../components/associate-onboarding/document-management";

export default function AssociateOnboarding() {
  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Associate Onboarding
        </h1>
        <p className="text-muted-foreground">
          Manage and track associate onboarding process
        </p>
      </div>
      <AssociateMetrics />
      <AssociateList />
    </div>
  );
}
