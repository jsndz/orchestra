import { useMutation } from "@tanstack/react-query";
import { analyze } from "../api/tasks";
import { useAppStore } from "../store/useAppStore";

export type AnalysisVariables = { type: string; from?: string; to?: string };

export function useAnalysis() {
  const setAnalysis = useAppStore((s) => s.setAnalysis);
  const setError = useAppStore((s) => s.setError);

  return useMutation({
    mutationFn: (variables: AnalysisVariables) =>
      analyze(variables.type, { from: variables.from, to: variables.to }),
    onSuccess: (data, variables) => {
      setAnalysis(variables.type, data);
      
      setError(null);
    },
    onError: () => {
      setError("Analysis failed");
      setAnalysis(null, null);
    },
  });
}