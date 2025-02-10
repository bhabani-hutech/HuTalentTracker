import { OnboardingList } from "../components/onboarding/onboarding-list";
import { OnboardingMetrics } from "../components/onboarding/onboarding-metrics";

export default function Onboarding() {
  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Employee Onboarding
        </h1>
        <p className="text-muted-foreground">
          Manage and track employee onboarding process
        </p>
      </div>
      <OnboardingMetrics />
      <OnboardingList />
    </div>
  );
}
