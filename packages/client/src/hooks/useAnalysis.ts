import { useMutation } from "@tanstack/react-query";
import { analyze } from "@/api/tasks";

export type AnalysisVariables = { type: string; from?: string; to?: string };

export function useAnalysis() {
  return useMutation({
    mutationFn: (variables: AnalysisVariables) =>
      analyze(variables.type, { from: variables.from, to: variables.to }),
  });
}