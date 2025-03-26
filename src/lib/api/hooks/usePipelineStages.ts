import { useQuery } from "@tanstack/react-query";
import { getPipelineStages, PipelineStage } from "../pipeline-stages";

export function usePipelineStages() {
  const {
    data: stages,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["pipeline-stages"],
    queryFn: getPipelineStages,
  });

  return {
    stages,
    isLoading,
    error,
  };
}
