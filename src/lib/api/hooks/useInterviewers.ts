import { useQuery } from "@tanstack/react-query";
import { getInterviewers } from "../users";

export function useInterviewers() {
  return useQuery({
    queryKey: ["interviewers"],
    queryFn: getInterviewers,
  });
}
